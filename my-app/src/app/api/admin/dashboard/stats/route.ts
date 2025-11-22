// my-app/src/app/api/admin/dashboard/stats/route.ts - Enhanced Version
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import { Package } from "@/models/Package";
import { PreAlert } from "@/models/PreAlert";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Parallel data fetching for better performance
    const [
      totalPackages,
      newToday,
      pendingAlerts,
      revenueAgg,
      recentPackages,
      recentPayments,
      preAlerts,
      customerCount,
      activeStaff,
    ] = await Promise.all([
      // Total packages (excluding deleted)
      Package.countDocuments({ status: { $ne: "Deleted" } }),
      
      // New packages today
      Package.countDocuments({ 
        createdAt: { $gte: startOfToday, $lte: endOfToday },
        status: { $ne: "Deleted" }
      }),
      
      // Pending pre-alerts
      PreAlert.countDocuments({ status: "submitted" }),
      
      // Revenue today
      Payment.aggregate([
        { 
          $match: { 
            status: "captured", 
            createdAt: { $gte: startOfToday, $lte: endOfToday } 
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } }}
      ]),
      
      // Recent packages
      Package.find({ status: { $ne: "Deleted" } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("trackingNumber createdAt status userCode")
        .lean(),
      
      // Recent payments
      Payment.find({ status: "captured" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("amount userCode createdAt")
        .lean(),
      
      // Pre-alerts list
      PreAlert.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select("trackingNumber status createdAt")
        .lean(),
      
      // Total customers
      User.countDocuments({ role: "customer" }),
      
      // Active staff
      User.countDocuments({ role: { $in: ["admin", "warehouse"] } }),
    ]);

    const revenueToday = revenueAgg[0]?.total || 0;

    // Format recent activity with better categorization
    const recentActivity = [
      ...recentPackages.map((pkg) => ({
        time: pkg.createdAt?.toISOString() || new Date().toISOString(),
        text: `Package ${pkg.trackingNumber} ${pkg.status || 'created'}`,
        right: pkg.userCode,
        type: 'package'
      })),
      ...recentPayments.map((pay) => ({
        time: pay.createdAt?.toISOString() || new Date().toISOString(),
        text: `Payment received: $${pay.amount.toFixed(2)}`,
        right: pay.userCode,
        type: 'payment'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
     .slice(0, 10);

    // Calculate statistics for the week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [weeklyPackages, weeklyRevenue] = await Promise.all([
      Package.countDocuments({ 
        createdAt: { $gte: startOfWeek },
        status: { $ne: "Deleted" }
      }),
      Payment.aggregate([
        { 
          $match: { 
            status: "captured", 
            createdAt: { $gte: startOfWeek }
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } }}
      ]),
    ]);

    return NextResponse.json({
      totalPackages,
      newToday,
      pendingAlerts,
      revenueToday,
      recentActivity,
      preAlerts: preAlerts.map(p => ({
        trackingNumber: p.trackingNumber,
        status: p.status || 'submitted',
        createdAt: p.createdAt?.toISOString() || new Date().toISOString()
      })),
      // Additional stats
      stats: {
        totalCustomers: customerCount,
        activeStaff,
        weeklyPackages,
        weeklyRevenue: weeklyRevenue[0]?.total || 0,
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}