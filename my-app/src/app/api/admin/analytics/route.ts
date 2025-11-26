// my-app/src/app/api/admin/analytics/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Package } from "@/models/Package";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";
import { getAuthFromRequest } from "@/lib/rbac";

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export async function GET(req: Request) {
  console.log('Analytics endpoint called');
  const payload = await getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    console.log('Unauthorized access attempt');
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log('Connecting to database...');
  try {
    await dbConnect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ error: "Database connection error" }, { status: 500 });
  }

  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "all";
  console.log('Date range:', range);

  // Calculate date range
  const now = new Date();
  const startDate = new Date(0); // Start from the beginning of time to get all data
  
  console.log('Querying data with start date:', startDate);
  
  switch (range) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  // Previous period for comparison
  const diff = now.getTime() - startDate.getTime();
  const previousStart = new Date(startDate.getTime() - diff);
  const previousEnd = new Date(startDate.getTime());

  try {
    // Log collection counts for debugging
    try {
      const packageCount = await Package.countDocuments({});
      const userCount = await User.countDocuments({});
      const paymentCount = await Payment.countDocuments({});
      
      console.log('Collection counts:', {
        packages: packageCount,
        users: userCount,
        payments: paymentCount
      });
    } catch (err) {
      console.error('Error getting collection counts:', err);
    }

    // Current period metrics
    console.log('Starting analytics queries...');
    const [
      currentPackages,
      previousPackages,
      currentCustomers,
      previousCustomers,
      revenueAgg,
      previousRevenueAgg,
      packagesByStatus,
      packagesByBranch,
      topCustomersData
    ] = await Promise.all([
      // Current packages
      Package.countDocuments({ 
        createdAt: { $gte: startDate }, 
        status: { $ne: "Deleted" } 
      }),
      // Previous packages
      Package.countDocuments({ 
        createdAt: { $gte: previousStart, $lt: previousEnd }, 
        status: { $ne: "Deleted" } 
      }),
      // Current customers
      User.countDocuments({ 
        role: "customer", 
        createdAt: { $gte: startDate } 
      }),
      // Previous customers
      User.countDocuments({ 
        role: "customer", 
        createdAt: { $gte: previousStart, $lt: previousEnd } 
      }),
      // Current revenue
      Payment.aggregate([
        { $match: { 
          status: "captured", 
          createdAt: { $gte: startDate } 
        }},
        { $group: { _id: null, total: { $sum: "$amount" } }}
      ]),
      // Previous revenue
      Payment.aggregate([
        { $match: { 
          status: "captured", 
          createdAt: { $gte: previousStart, $lt: previousEnd } 
        }},
        { $group: { _id: null, total: { $sum: "$amount" } }}
      ]),
      // Packages by status
      Package.aggregate([
        { $match: { status: { $ne: "Deleted" }, createdAt: { $gte: startDate } }},
        { $group: { _id: "$status", count: { $sum: 1 }}},
        { $sort: { count: -1 }}
      ]),
      // Packages by branch
      Package.aggregate([
        { $match: { status: { $ne: "Deleted" }, createdAt: { $gte: startDate }, branch: { $exists: true, $ne: null }}},
        { $group: { _id: "$branch", count: { $sum: 1 }}},
        { $sort: { count: -1 }},
        { $limit: 10 }
      ]),
      // Top customers
      Package.aggregate([
        { $match: { status: { $ne: "Deleted" }, createdAt: { $gte: startDate }}},
        { $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customerData"
        }},
        { $unwind: "$customerData" },
        { $group: {
          _id: "$customer",
          name: { $first: { $concat: ["$customerData.firstName", " ", "$customerData.lastName"] }},
          packages: { $sum: 1 },
          totalWeight: { $sum: "$weight" }
        }},
        { $sort: { packages: -1 }},
        { $limit: 10 }
      ])
    ]);

    console.log('Analytics query results:', {
      currentPackages,
      previousPackages,
      currentCustomers,
      previousCustomers,
      revenueAgg,
      previousRevenueAgg,
      packagesByStatus,
      packagesByBranch,
      topCustomersData
    });

    const currentRevenue = revenueAgg[0]?.total || 0;
    const previousRevenue = previousRevenueAgg[0]?.total || 0;
    
    console.log('Processed values:', {
      currentRevenue,
      previousRevenue,
      currentPackages,
      previousPackages,
      currentCustomers,
      previousCustomers
    });

    // Calculate growth percentages
    const packagesGrowth = previousPackages > 0 
      ? ((currentPackages - previousPackages) / previousPackages * 100).toFixed(1)
      : 100;
    
    const customersGrowth = previousCustomers > 0
      ? ((currentCustomers - previousCustomers) / previousCustomers * 100).toFixed(1)
      : 100;
    
    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : 100;

    const avgValue = currentPackages > 0 ? currentRevenue / currentPackages : 0;
    const previousAvgValue = previousPackages > 0 ? previousRevenue / previousPackages : 0;
    const valueGrowth = previousAvgValue > 0
      ? ((avgValue - previousAvgValue) / previousAvgValue * 100).toFixed(1)
      : 100;

    // Format packages by status
    const totalPackagesForStatus = packagesByStatus.reduce((sum, item) => sum + item.count, 0);
    const formattedPackagesByStatus = packagesByStatus.map(item => ({
      status: item._id,
      count: item.count,
      percentage: totalPackagesForStatus > 0 
        ? ((item.count / totalPackagesForStatus) * 100).toFixed(1)
        : 0
    }));

    // Revenue by month (last 6 months)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const [monthRevenue, monthPackages] = await Promise.all([
        Payment.aggregate([
          { $match: { 
            status: "captured", 
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }},
          { $group: { _id: null, total: { $sum: "$amount" }}}
        ]),
        Package.countDocuments({
          createdAt: { $gte: monthStart, $lte: monthEnd },
          status: { $ne: "Deleted" }
        })
      ]);

      revenueByMonth.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue[0]?.total || 0,
        packages: monthPackages
      });
    }

    // Mock revenue for top customers (you should join with actual payment data)
    const topCustomers = topCustomersData.map(c => ({
      name: c.name || 'Unknown',
      packages: c.packages,
      revenue: c.packages * 50 // Mock: Replace with actual revenue calculation
    }));

    // Recent Activity - Get recent packages, payments, and customer registrations
    const [recentPackages, recentPayments, recentCustomers] = await Promise.all([
      Package.find({ status: { $ne: "Deleted" } })
        .select("trackingNumber status createdAt")
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
      Payment.find({ status: "captured" })
        .select("amount createdAt")
        .sort({ createdAt: -1 })
        .limit(2)
        .lean(),
      User.find({ role: "customer" })
        .select("firstName lastName createdAt")
        .sort({ createdAt: -1 })
        .limit(2)
        .lean()
    ]);

    const recentActivity = [
      ...recentPackages.map((p: any) => ({
        title: 'New package received',
        desc: `Package ${p.trackingNumber} has been received`,
        time: formatTimeAgo(p.createdAt),
        timestamp: new Date(p.createdAt).getTime(),
        icon: 'Package',
        color: 'blue'
      })),
      ...recentPayments.map((p: any) => ({
        title: 'Payment processed',
        desc: `Payment of ${formatCurrency(p.amount)} received`,
        time: formatTimeAgo(p.createdAt),
        timestamp: new Date(p.createdAt).getTime(),
        icon: 'CreditCard',
        color: 'green'
      })),
      ...recentCustomers.map((c: any) => ({
        title: 'New customer registered',
        desc: `${c.firstName || ''} ${c.lastName || ''} joined the platform`.trim(),
        time: formatTimeAgo(c.createdAt),
        timestamp: new Date(c.createdAt).getTime(),
        icon: 'Users',
        color: 'purple'
      }))
    ]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 4);

    const response = {
      overview: {
        totalRevenue: currentRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
        totalPackages: currentPackages,
        packagesGrowth: parseFloat(packagesGrowth),
        totalCustomers: currentCustomers,
        customersGrowth: parseFloat(customersGrowth),
        averageValue: avgValue,
        valueGrowth: parseFloat(valueGrowth)
      },
      packagesByStatus: formattedPackagesByStatus,
      revenueByMonth,
      topCustomers,
      packagesByBranch: packagesByBranch.map(b => ({
        branch: b._id || 'Unknown',
        count: b.count
      })),
      recentActivity
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}