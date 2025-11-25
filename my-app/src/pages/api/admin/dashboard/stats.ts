// src/pages/api/admin/dashboard/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check authorization (admin role required)
  if (session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    // Get counts for dashboard stats
    const [
      totalPackages,
      newToday,
      pendingAlerts,
      revenueToday,
      recentActivity,
      totalCustomers,
      activeStaff,
      weeklyPackages,
      weeklyRevenue,
    ] = await Promise.all([
      // Total packages
      prisma.package.count(),
      
      // New packages today
      prisma.package.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      
      // Pending alerts
      prisma.alert.count({
        where: { status: 'PENDING' },
      }),
      
      // Today's revenue (example - adjust based on your schema)
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'PAYMENT',
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      
      // Recent activity
      prisma.activityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      
      // Total customers
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
      
      // Active staff
      prisma.user.count({
        where: { 
          role: 'STAFF',
          lastActiveAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000), // Active in last 30 minutes
          },
        },
      }),
      
      // Weekly packages
      prisma.package.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      
      // Weekly revenue
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'PAYMENT',
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Calculate percentage changes (example - you might want to compare with previous period)
    const packageChange = 12; // Example: 12% increase from last period
    const revenueChange = 8; // Example: 8% increase from last period

    res.status(200).json({
      totalPackages,
      newToday,
      pendingAlerts,
      revenueToday: revenueToday._sum.amount || 0,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        title: activity.action,
        description: activity.details,
        timestamp: activity.createdAt,
        status: activity.status?.toLowerCase() || 'info',
      })),
      stats: {
        totalCustomers,
        activeStaff,
        weeklyPackages,
        weeklyRevenue: weeklyRevenue._sum.amount || 0,
      },
      packageChange,
      revenueChange,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}