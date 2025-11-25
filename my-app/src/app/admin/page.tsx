// src/app/admin/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useApi } from '@/hooks/useApi';
import AuthenticatedRoute from '@/components/AuthenticatedRoute';
import { 
  Download, 
  Mail, 
  Activity, 
  FileText, 
  TrendingUp,
  Package,
  Users,
  DollarSign,
  BarChart3,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Bell,
  Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isConnected, lastMessage, emitEvent } = useWebSocket();
  
  // Example of using the useApi hook
  const { 
    data: stats, 
    error: statsError, 
    isLoading: statsLoading, 
    fetchData: fetchStats 
  } = useApi('/api/admin/analytics', {
    onSuccess: (data) => console.log('Stats loaded:', data),
    onError: (error) => console.error('Error loading stats:', error)
  });

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage?.type === 'stats_updated') {
      fetchStats();
    }
  }, [lastMessage, fetchStats]);

  // Refresh stats
  const handleRefresh = () => {
    fetchStats();
    emitEvent('refresh_stats', {});
  };

  return (
    <AuthenticatedRoute requiredRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className={`h-3 w-3 rounded-full mr-2 ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={statsLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tabs */}
          <div className="mb-6 overflow-x-auto">
            <nav className="flex space-x-1 sm:space-x-4" aria-label="Tabs">
              {['overview', 'packages', 'customers', 'reports', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            {statsLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            ) : statsError ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      Error loading dashboard data: {statsError.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Example stat card */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Packages
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">
                                {stats?.totalPackages || 0}
                              </div>
                              {stats?.packageChange && (
                                <div
                                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                                    stats.packageChange >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {stats.packageChange >= 0 ? (
                                    <span className="text-green-500">↑</span>
                                  ) : (
                                    <span className="text-red-500">↓</span>
                                  )}
                                  <span className="sr-only">
                                    {stats.packageChange >= 0
                                      ? 'Increased by'
                                      : 'Decreased by'}{' '}
                                  </span>
                                  {Math.abs(stats.packageChange)}%
                                </div>
                              )}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                      <div className="text-sm">
                        <a
                          href="#"
                          className="font-medium text-indigo-700 hover:text-indigo-900"
                        >
                          View all
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Add more stat cards here */}
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Activity
                    </h3>
                  </div>
                  <div className="bg-white overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {stats?.recentActivity?.map((activity: any, index: number) => (
                        <li key={index} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center">
                            <div className="min-w-0 flex-1 flex items-center">
                              <div className="min-w-0 flex-1 md:grid md:grid-cols-2 md:gap-4">
                                <div>
                                  <p className="text-sm font-medium text-indigo-600 truncate">
                                    {activity.title}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500">
                                    <span className="truncate">{activity.description}</span>
                                  </p>
                                </div>
                                <div className="hidden md:block">
                                  <div>
                                    <p className="text-sm text-gray-900">
                                      {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                    <p
                                      className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        activity.status === 'success'
                                          ? 'bg-green-100 text-green-800'
                                          : activity.status === 'warning'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {activity.status}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <svg
                                className="h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
};

export default AdminDashboard;