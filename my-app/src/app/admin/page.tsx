// src/app/admin/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, Users, DollarSign, TrendingUp, RefreshCw, AlertCircle,
  Clock, Truck, BarChart3, Calendar, ArrowUpRight, ArrowDownRight, 
  Activity, ChevronRight, Eye, FileText, Bell, Zap, TrendingDown,
  ShoppingBag, CreditCard, Layers, PieChart, Download, Filter
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import charts for better performance
const RevenueChart = dynamic(
  () => import('@/components/charts/RevenueChart').then(mod => mod.RevenueChart),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    )
  }
);

const StatusPieChart = dynamic(
  () => import('@/components/charts/StatusPieChart').then(mod => mod.StatusPieChart),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    )
  }
);

interface DashboardStats {
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
  packagesByStatus: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    packages: number;
  }>;
  topCustomers: Array<{
    name: string;
    packages: number;
    revenue: number;
  }>;
  packagesByBranch: Array<{
    branch: string;
    count: number;
  }>;
}

const AdminDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers'>('overview');
  const [timeRange, setTimeRange] = useState('30d');

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading && !stats) {
    return <LoadingState />;
  }

  if (error && !stats) {
    return <ErrorState error={error} onRetry={fetchStats} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Title & Welcome */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/50">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                    Dashboard
                  </h1>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex rounded-lg bg-white p-1 shadow-md ring-1 ring-gray-200">
                {['7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <button
                onClick={fetchStats}
                disabled={isLoading}
                className="group flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 font-medium text-gray-700 shadow-md ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
              { id: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> },
              { id: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md ring-2 ring-blue-600/20'
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.overview.totalRevenue || 0)}
            change={stats?.overview.revenueGrowth || 0}
            icon={<DollarSign className="h-6 w-6" />}
            gradient="from-emerald-500 to-teal-600"
            trend="up"
          />
          <StatCard
            title="Total Packages"
            value={stats?.overview.totalPackages.toLocaleString() || '0'}
            change={stats?.overview.packagesGrowth || 0}
            icon={<Package className="h-6 w-6" />}
            gradient="from-blue-500 to-cyan-600"
            trend="up"
          />
          <StatCard
            title="Total Customers"
            value={stats?.overview.totalCustomers.toLocaleString() || '0'}
            change={stats?.overview.customersGrowth || 0}
            icon={<Users className="h-6 w-6" />}
            gradient="from-purple-500 to-pink-600"
            trend="up"
          />
          <StatCard
            title="Avg. Order Value"
            value={formatCurrency(stats?.overview.averageValue || 0)}
            change={stats?.overview.valueGrowth || 0}
            icon={<TrendingUp className="h-6 w-6" />}
            gradient="from-orange-500 to-red-600"
            trend="up"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart Card */}
            <div className="group overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 transition-all hover:shadow-2xl">
              <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Revenue Overview</h3>
                    <p className="mt-1 text-sm text-gray-600">Monthly performance tracking</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-3 w-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></span>
                      <span className="text-gray-700">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                      <span className="text-gray-700">Packages</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <RevenueChart data={stats?.revenueByMonth || []} />
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <QuickActionCard
                title="New Package"
                description="Add package to system"
                icon={<Package className="h-5 w-5" />}
                color="blue"
                onClick={() => router.push('/admin/packages')}
              />
              <QuickActionCard
                title="Generate Invoice"
                description="Create new invoice"
                icon={<FileText className="h-5 w-5" />}
                color="purple"
                onClick={() => router.push('/admin/invoices/generate')}
              />
            </div>

            {/* Recent Activity Card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View All
                    <ChevronRight className="ml-1 inline h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { 
                    title: 'New package received', 
                    desc: 'Package #TRK-1001 has been received at warehouse', 
                    time: '2 hours ago',
                    icon: Package,
                    color: 'blue'
                  },
                  { 
                    title: 'Payment processed', 
                    desc: 'Payment of $250.00 received from John Doe', 
                    time: '4 hours ago',
                    icon: CreditCard,
                    color: 'green'
                  },
                  { 
                    title: 'New customer registered', 
                    desc: 'Sarah Johnson joined the platform', 
                    time: '5 hours ago',
                    icon: Users,
                    color: 'purple'
                  },
                  { 
                    title: 'Invoice generated', 
                    desc: 'Invoice #INV-2024-001 created', 
                    time: '6 hours ago',
                    icon: FileText,
                    color: 'orange'
                  },
                ].map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Packages by Status Card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
              <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Package Status</h3>
                    <p className="mt-1 text-sm text-gray-600">Current distribution</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <PieChart className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-64 mb-4">
                  <StatusPieChart data={stats?.packagesByStatus || []} />
                </div>
                <div className="space-y-3">
                  {stats?.packagesByStatus.slice(0, 4).map((item, index) => (
                    <div key={item.status} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full shadow-lg"
                          style={{ 
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4] 
                          }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{item.status}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{item.count}</p>
                        <p className="text-xs text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Customers Card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
              <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Top Customers</h3>
                    <p className="mt-1 text-sm text-gray-600">Highest revenue</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {stats?.topCustomers.slice(0, 5).map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 transition-all hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${
                        ['from-blue-500 to-cyan-600', 'from-purple-500 to-pink-600', 'from-orange-500 to-red-600'][index % 3]
                      } text-white shadow-lg`}>
                        <span className="text-lg font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">
                          <ShoppingBag className="inline h-3 w-3 mr-1" />
                          {customer.packages} packages
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        {formatCurrency(customer.revenue)}
                      </p>
                      <button className="mt-1 text-xs text-blue-600 hover:text-blue-700">
                        View <ChevronRight className="inline h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Mini Cards */}
            <div className="grid grid-cols-2 gap-4">
              <MiniStatCard
                label="In Transit"
                value="48"
                icon={<Truck className="h-4 w-4" />}
                color="blue"
              />
              <MiniStatCard
                label="Delivered"
                value="234"
                icon={<Package className="h-4 w-4" />}
                color="green"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ Helper Components ============

const LoadingState = () => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
    <div className="text-center">
      <div className="relative mx-auto h-24 w-24">
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75"></div>
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl">
          <BarChart3 className="h-10 w-10 text-white animate-pulse" />
        </div>
      </div>
      <p className="mt-6 text-xl font-semibold text-gray-700">Loading Dashboard...</p>
      <p className="mt-2 text-sm text-gray-500">Fetching your data</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 p-4">
    <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-gray-200">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
        <AlertCircle className="h-8 w-8 text-white" />
      </div>
      <h3 className="mt-4 text-2xl font-bold text-gray-900">Oops! Something went wrong</h3>
      <p className="mt-2 text-sm text-gray-600">{error}</p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl"
      >
        <RefreshCw className="h-5 w-5" />
        Try Again
      </button>
    </div>
  </div>
);

const StatCard = ({ title, value, change, icon, gradient, trend }: any) => {
  const isPositive = change >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200 transition-all hover:shadow-2xl hover:-translate-y-1">
      {/* Gradient Background */}
      <div className={`absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-3xl transition-all group-hover:opacity-20`}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg transition-transform group-hover:scale-110`}>
            <div className="text-white">{icon}</div>
          </div>
          <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-2 text-xs text-gray-500">vs last period</p>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ title, desc, time, icon: Icon, color }: any) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-emerald-500 to-teal-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600',
  };

  return (
    <div className="flex items-start gap-4 p-4 transition-all hover:bg-gray-50">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-sm text-gray-600 truncate">{desc}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {time}
        </p>
      </div>
      <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

const QuickActionCard = ({ title, description, icon, color, onClick }: any) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600',
  };

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-white p-6 text-left shadow-lg ring-1 ring-gray-200 transition-all hover:shadow-2xl hover:-translate-y-1"
    >
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-full bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-10 blur-2xl transition-all group-hover:opacity-20`}></div>
      <div className="relative">
        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-lg transition-transform group-hover:scale-110`}>
          <div className="text-white">{icon}</div>
        </div>
        <h4 className="font-bold text-gray-900">{title}</h4>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        <ChevronRight className="mt-2 h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-gray-600" />
      </div>
    </button>
  );
};

const MiniStatCard = ({ label, value, icon, color }: any) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-emerald-500 to-teal-600',
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-200">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}>
          <div className="text-white">{icon}</div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
};

export default AdminDashboard;