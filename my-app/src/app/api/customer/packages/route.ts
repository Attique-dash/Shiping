import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/rbac";

function toUiStatus(status: string): "in_transit" | "ready_for_pickup" | "delivered" | "pending" {
  switch (status) {
    case "in_transit":
      return "in_transit";
    case "delivered":
      return "delivered";
    case "out_for_delivery":
      return "ready_for_pickup";
    case "pending":
    case "picked_up":
    default:
      return "pending";
  }
}

export async function GET(req: Request) {
  const payload = getAuthFromRequest(req);
  if (!payload || payload.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's packages
    const packages = await prisma.package.findMany({
      where: {
        userId: payload.id,
        status: { not: "failed" }
      },
      include: {
        audits: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 200
    });

    const total_packages = await prisma.package.count({
      where: {
        userId: payload.id,
        status: { not: "failed" }
      }
    });

    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      tracking_number: pkg.trackingNumber,
      description: pkg.itemDescription || undefined,
      status: toUiStatus(pkg.status),
      current_location: pkg.currentLocation || undefined,
      estimated_delivery: pkg.estimatedDelivery?.toISOString().slice(0, 10),
      weight: pkg.weight,
      weight_kg: pkg.weight,
      updated_at: pkg.updatedAt.toISOString(),
    }));

    return NextResponse.json({ 
      packages: formattedPackages, 
      total_packages 
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
