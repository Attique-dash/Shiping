import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";
import { adminCreateCustomerSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const payload = getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const status = (url.searchParams.get("status") || "").trim();
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const per_page = Math.min(Math.max(parseInt(url.searchParams.get("per_page") || "20", 10), 1), 100);

    const where: any = {};
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (status === "active" || status === "inactive") {
      where.isActive = status === "active";
    }

    const [customers, total_count] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          packages: {
            select: { id: true },
            where: { status: { not: "failed" } }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * per_page,
        take: per_page
      }),
      prisma.user.count({ where })
    ]);

    const result = customers.map(u => ({
      customer_id: u.id,
      full_name: u.name,
      email: u.email,
      phone: u.phone || undefined,
      address: u.address ? {
        street: u.address,
        city: u.city || undefined,
        state: u.state || undefined,
        zip_code: u.zipCode || undefined,
        country: u.country || undefined,
      } : undefined,
      email_verified: u.isVerified,
      account_status: u.isActive ? "active" : "inactive",
      package_count: u.packages.length,
      member_since: u.createdAt.toISOString(),
    }));

    return NextResponse.json({ customers: result, total_count, page, per_page });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const payload = getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = adminCreateCustomerSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { full_name, email, password, phone, address } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    
    const created = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: full_name,
        phone,
        address: address?.street,
        city: address?.city,
        state: address?.state,
        zipCode: address?.zip_code,
        country: address?.country,
        isActive: true,
        isVerified: false
      }
    });

    return NextResponse.json({ 
      ok: true, 
      id: created.id 
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const payload = getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { id, password, full_name, address, ...rest } = raw as any;
    
    const updateData: any = { ...rest };
    
    if (full_name) {
      updateData.name = full_name;
    }
    
    if (address) {
      updateData.address = address.street;
      updateData.city = address.city;
      updateData.state = address.state;
      updateData.zipCode = address.zip_code;
      updateData.country = address.country;
    }
    
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const payload = getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { id } = raw as { id: string };

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
