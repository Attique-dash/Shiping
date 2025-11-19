// src/app/customer/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, TrendingUp, FileText, Bell, ChevronRight, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Stats {
  totalPackages: number;
  activeShipments: number;
  pendingBills: number;
  unreadMessages: number;
}

interface PackageData {
  id: string;
  status: string;
  tracking_number?: string;
  destination?: string;
  [key: string]: any;
}

interface BillData {
  id: string;
  payment_status: string;
  [key: string]: any;
}

export default function CustomerDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalPackages: 0,
    activeShipments: 0,
    pendingBills: 0,
    unreadMessages: 0,
  });
  const [recentPackages, setRecentPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Load packages
      const packagesRes = await fetch("/api/customer/packages");
      const packagesData = await packagesRes.json();
      const packages = packagesData?.packages || [];
      
      // Load bills
      const billsRes = await fetch("/api/customer/bills");
      const billsData = await billsRes.json();
      const bills = billsData?.bills || [];
      
      setStats({
        totalPackages: packages.length,
        activeShipments: packages.filter((p: PackageData) => 
          p.status === 'in_transit' || p.status === 'ready_for_pickup'
        ).length,
        pendingBills: bills.filter((b: BillData) => 
          b.payment_status === 'submitted' || b.payment_status === 'none'
        ).length,
        unreadMessages: 0,
      });

      // Set recent packages (latest 3)
      setRecentPackages(packages.slice(0, 3));
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'delivered':
        return {
          label: 'Delivered',
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'in_transit':
        return {
          label: 'In Transit',
          icon: TrendingUp,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      case 'ready_for_pickup':
        return {
          label: 'Ready',
          icon: AlertCircle,
          bgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-100 text-orange-800'
        };
      default:
        return {
          label: 'Processing',
          icon: Clock,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#0f4d8a] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0f4d8a]">
                Welcome back, {session?.user?.name || 'Customer'}!
              </h1>
              <p className="mt-2 text-gray-600">
                Here's what's happening with your shipments today
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <Clock className="h-4 w-4 text-[#E67919]" />
              <span className="text-sm text-gray-600">Last updated: Just now</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Packages"
            value={stats.totalPackages}
            icon={Package}
            gradient="from-[#0f4d8a] to-[#1e6bb8]"
            href="/customer/packages"
            trend="+12%"
          />
          <StatCard
            title="Active Shipments"
            value={stats.activeShipments}
            icon={TrendingUp}
            gradient="from-[#E67919] to-[#f59e42]"
            href="/customer/packages"
            trend={`${stats.activeShipments} Active`}
          />
          <StatCard
            title="Pending Bills"
            value={stats.pendingBills}
            icon={FileText}
            gradient="from-[#0891b2] to-[#06b6d4]"
            href="/customer/bills"
            trend={stats.pendingBills > 0 ? "Due soon" : "All clear"}
          />
          <StatCard
            title="Messages"
            value={stats.unreadMessages}
            icon={Bell}
            gradient="from-[#7c3aed] to-[#9333ea]"
            href="/customer/messages"
            trend={stats.unreadMessages > 0 ? "New" : "No new"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Packages */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#0f4d8a] to-[#1e6bb8]">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Recent Packages
              </h3>
            </div>
            <div className="p-6">
              {recentPackages.length > 0 ? (
                <div className="space-y-4">
                  {recentPackages.map((pkg) => {
                    const statusInfo = getStatusInfo(pkg.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div
                        key={pkg.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-all duration-200 border border-gray-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
                            <StatusIcon className={`h-5 w-5 ${statusInfo.iconColor}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {pkg.tracking_number || pkg.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {pkg.destination || 'Destination not set'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.badgeColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No packages found</p>
                  <p className="text-sm text-gray-400 mt-1">Your packages will appear here</p>
                </div>
              )}
              <Link
                href="/customer/packages"
                className="mt-6 w-full py-3 bg-gradient-to-r from-[#0f4d8a] to-[#1e6bb8] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              >
                View All Packages
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#E67919] to-[#f59e42]">
              <h3 className="text-lg font-semibold text-white">
                Quick Actions
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <QuickActionButton
                  href="/customer/packages"
                  icon={Package}
                  title="View Packages"
                  description="Track shipments"
                  color="blue"
                />
                <QuickActionButton
                  href="/customer/bills"
                  icon={FileText}
                  title="Pay Bills"
                  description="Manage payments"
                  color="orange"
                />
                <QuickActionButton
                  href="/customer/contact"
                  icon={Bell}
                  title="Contact Support"
                  description="Get help"
                  color="cyan"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 bg-gradient-to-r from-[#0f4d8a] via-[#1e6bb8] to-[#E67919] rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Need help with shipping?</h3>
              <p className="text-blue-100">Our support team is available 24/7 to assist you</p>
            </div>
            <Link
              href="/customer/contact"
              className="bg-white text-[#0f4d8a] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  href,
  trend,
}: {
  title: string;
  value: number;
  icon: any;
  gradient: string;
  href: string;
  trend: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white overflow-hidden shadow-lg rounded-2xl hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {trend}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
    </Link>
  );
}

function QuickActionButton({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-[#0f4d8a] group-hover:bg-blue-100',
    orange: 'bg-orange-50 text-[#E67919] group-hover:bg-orange-100',
    cyan: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100',
  };

  return (
    <Link
      href={href}
      className="group flex items-center p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
    >
      <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]} transition-colors duration-200`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
    </Link>
  );
}