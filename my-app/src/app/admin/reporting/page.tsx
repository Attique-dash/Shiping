"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from "lucide-react";

type AnalyticsData = {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalPackages: number;
    packagesGrowth: number;
    totalCustomers: number;
    customersGrowth: number;
    averageValue: number;
    valueGrowth: number;
  };
  packagesByStatus: Array<{ status: string; count: number; percentage: number }>;
  revenueByMonth: Array<{ month: string; revenue: number; packages: number }>;
  topCustomers: Array<{ name: string; packages: number; revenue: number }>;
  packagesByBranch: Array<{ branch: string; count: number }>;
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 animate-spin text-[#0f4d8a]" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0f4d8a] to-[#E67919] bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Detailed business insights and performance metrics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            <button 
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={`$${data.overview.totalRevenue.toLocaleString()}`}
            growth={data.overview.revenueGrowth}
            icon={DollarSign}
            color="from-green-500 to-green-600"
          />
          <MetricCard
            title="Total Packages"
            value={data.overview.totalPackages.toLocaleString()}
            growth={data.overview.packagesGrowth}
            icon={Package}
            color="from-[#0f4d8a] to-blue-600"
          />
          <MetricCard
            title="Total Customers"
            value={data.overview.totalCustomers.toLocaleString()}
            growth={data.overview.customersGrowth}
            icon={Users}
            color="from-[#E67919] to-orange-600"
          />
          <MetricCard
            title="Average Order Value"
            value={`$${data.overview.averageValue.toFixed(2)}`}
            growth={data.overview.valueGrowth}
            icon={TrendingUp}
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {data.revenueByMonth.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium text-slate-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0f4d8a] to-[#E67919] rounded-lg transition-all"
                        style={{ 
                          width: `${(item.revenue / Math.max(...data.revenueByMonth.map(m => m.revenue))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-sm font-semibold text-slate-800 text-right">
                    ${item.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Status Distribution */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Package Status</h3>
              <PieChart className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {data.packagesByStatus.map((item, idx) => {
                const colors = [
                  'from-green-500 to-green-600',
                  'from-blue-500 to-blue-600',
                  'from-orange-500 to-orange-600',
                  'from-purple-500 to-purple-600'
                ];
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[idx % colors.length]}`} />
                      <span className="text-sm font-medium text-slate-700">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-800">{item.count}</span>
                      <span className="text-xs text-slate-500 w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Top Customers</h3>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {data.topCustomers.map((customer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f4d8a] to-[#E67919] flex items-center justify-center text-white font-semibold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{customer.name}</div>
                      <div className="text-xs text-slate-500">{customer.packages} packages</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">${customer.revenue.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Packages by Branch */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Packages by Branch</h3>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {data.packagesByBranch.map((branch, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium text-slate-600">{branch.branch}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#E67919] to-orange-600 rounded-lg transition-all"
                        style={{ 
                          width: `${(branch.count / Math.max(...data.packagesByBranch.map(b => b.count))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-slate-800 text-right">
                    {branch.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  growth, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string; 
  growth: number; 
  icon: any; 
  color: string;
}) {
  const isPositive = growth >= 0;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(growth)}%
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-slate-600 mb-1">{title}</div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
      </div>
    </div>
  );
}