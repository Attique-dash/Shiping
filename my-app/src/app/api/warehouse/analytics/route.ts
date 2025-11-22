// src/app/api/warehouse/analytics/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Package } from "@/models/Package";
import { User } from "@/models/User";
import { isWarehouseAuthorized } from "@/lib/rbac";

export async function GET(req: Request) {
  if (!isWarehouseAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total packages by status
  const statusCounts = await Package.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // Today's statistics
  const todayStats = await Package.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfToday }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalWeight: { $sum: "$weight" }
      }
    }
  ]);

  // Weekly trend
  const weeklyTrend = await Package.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfWeek }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Monthly statistics
  const monthlyStats = await Package.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        delivered: {
          $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] }
        },
        inTransit: {
          $sum: { $cond: [{ $eq: ["$status", "In Transit"] }, 1, 0] }
        }
      }
    }
  ]);

  // Top customers
  const topCustomers = await Package.aggregate([
    {
      $group: {
        _id: "$userCode",
        packageCount: { $sum: 1 },
        totalWeight: { $sum: "$weight" }
      }
    },
    { $sort: { packageCount: -1 } },
    { $limit: 10 }
  ]);

  // Total customers
  const totalCustomers = await User.countDocuments({ role: "customer" });

  return NextResponse.json({
    statusCounts: statusCounts.reduce((acc, item) => {
      acc[item._id || "Unknown"] = item.count;
      return acc;
    }, {} as Record<string, number>),
    today: {
      packages: todayStats[0]?.total || 0,
      weight: todayStats[0]?.totalWeight || 0
    },
    weeklyTrend,
    monthly: {
      total: monthlyStats[0]?.total || 0,
      delivered: monthlyStats[0]?.delivered || 0,
      inTransit: monthlyStats[0]?.inTransit || 0
    },
    topCustomers,
    totalCustomers
  });
}