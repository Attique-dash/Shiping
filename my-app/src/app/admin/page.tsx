"use client";
import { useState, useEffect } from 'react';
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

// Complete Admin Dashboard Component
export default function CompleteAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // WebSocket Connection (disabled for now - requires Socket.io server setup)
  useEffect(() => {
    // WebSocket will be enabled when Socket.io server is properly configured
    // For now, using polling instead
    const interval = setInterval(() => {
      loadStats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRealtimeUpdate = (data) => {
    console.log('Real-time update:', data);
    // Handle different update types
    switch(data.type) {
      case 'package_update':
        // Refresh package data
        loadStats();
        break;
      case 'payment_received':
        // Show notification
        showNotification('Payment received', 'success');
        loadStats();
        break;
      default:
        break;
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      if (!res.ok) {
        throw new Error('Failed to load stats');
      }
      const data = await res.json();
      setStats(data);
      setWsConnected(true); // Set as connected when data loads successfully
    } catch (error) {
      console.error('Error loading stats:', error);
      setWsConnected(false);
      // Set fallback data to prevent crashes
      setStats({
        totalPackages: 0,
        newToday: 0,
        pendingAlerts: 0,
        revenueToday: 0,
        recentActivity: [],
        stats: {
          totalCustomers: 0,
          activeStaff: 0,
          weeklyPackages: 0,
          weeklyRevenue: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const showNotification = (message, type = 'info') => {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    } text-white z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0f4d8a] to-[#E67919] bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Complete business management system</p>
          </div>
          <div className="flex items-center gap-3">
            {/* WebSocket Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <Activity className={`w-4 h-4 ${wsConnected ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">
                {wsConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'export', label: 'Export Data', icon: Download },
            { id: 'emails', label: 'Email System', icon: Mail },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'reports', label: 'Advanced Reports', icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#0f4d8a] to-[#E67919] text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'export' && <ExportTab />}
          {activeTab === 'emails' && <EmailsTab />}
          {activeTab === 'invoices' && <InvoicesTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0f4d8a]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Business Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Packages"
          value={stats?.totalPackages || 0}
          change="+12%"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Users}
          label="Total Customers"
          value={stats?.stats?.totalCustomers || 0}
          change="+8%"
          color="from-green-500 to-green-600"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue Today"
          value={`${(stats?.revenueToday || 0).toFixed(2)}`}
          change="+15%"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={Bell}
          label="Pending Alerts"
          value={stats?.pendingAlerts || 0}
          change={stats?.pendingAlerts > 0 ? 'Action needed' : 'All clear'}
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {stats.recentActivity?.slice(0, 5).map((activity, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <Activity className="w-4 h-4 text-[#0f4d8a]" />
              <span className="flex-1 text-sm text-slate-700">{activity.text}</span>
              <span className="text-xs text-slate-500">
                {new Date(activity.time).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export Tab Component
function ExportTab() {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState('packages');
  const [format, setFormat] = useState('excel');

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/reports/${exportType}?format=${format}`);
      
      if (format === 'csv') {
        const csv = await response.text();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        // Use ExportService to generate Excel
        const { ExportService } = await import('@/lib/export-service');
        ExportService.toExcel(
          data.rows,
          `${exportType}-${new Date().toISOString().split('T')[0]}`
        );
      }
      
      alert('Export completed successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Export Data</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Data Type
          </label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-2 focus:border-[#0f4d8a] focus:outline-none"
          >
            <option value="packages">Packages</option>
            <option value="customers">Customers</option>
            <option value="transactions">Transactions</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-2 focus:border-[#0f4d8a] focus:outline-none"
          >
            <option value="excel">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#0f4d8a] to-[#E67919] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {exporting ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Export Data
          </>
        )}
      </button>

      {/* Quick Export Buttons */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Exports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['packages', 'customers', 'transactions'].map(type => (
            <button
              key={type}
              onClick={() => {
                setExportType(type);
                setTimeout(handleExport, 100);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-[#0f4d8a] text-[#0f4d8a] hover:bg-[#0f4d8a] hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Export {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Emails Tab Component
function EmailsTab() {
  const [sending, setSending] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    body: '',
    type: 'custom'
  });

  const sendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.body) {
      alert('Please fill all fields');
      return;
    }

    setSending(true);
    try {
      // Use email service
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_code: emailData.to,
          subject: emailData.subject,
          body: emailData.body
        })
      });

      if (response.ok) {
        alert('Email sent successfully!');
        setEmailData({ to: '', subject: '', body: '', type: 'custom' });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email error:', error);
      alert('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Email System</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Customer Code
          </label>
          <input
            type="text"
            value={emailData.to}
            onChange={(e) => setEmailData({...emailData, to: e.target.value})}
            placeholder="Enter customer code"
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-2 focus:border-[#0f4d8a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={emailData.subject}
            onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
            placeholder="Email subject"
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-2 focus:border-[#0f4d8a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Message
          </label>
          <textarea
            value={emailData.body}
            onChange={(e) => setEmailData({...emailData, body: e.target.value})}
            placeholder="Enter your message..."
            rows={6}
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-2 focus:border-[#0f4d8a] focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={sendEmail}
          disabled={sending}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#0f4d8a] to-[#E67919] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {sending ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Email
            </>
          )}
        </button>
      </div>

      {/* Email Templates */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Package Arrival', subject: 'Your package has arrived', body: 'Your package has been received at our warehouse.' },
            { label: 'Ready for Pickup', subject: 'Package ready for pickup', body: 'Your package is ready for collection.' },
            { label: 'Payment Reminder', subject: 'Payment due', body: 'This is a reminder about your pending payment.' },
            { label: 'Invoice Sent', subject: 'New invoice', body: 'Please find your invoice attached.' }
          ].map((template, idx) => (
            <button
              key={idx}
              onClick={() => setEmailData({...emailData, subject: template.subject, body: template.body})}
              className="text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-[#0f4d8a] hover:bg-slate-50 transition-colors"
            >
              <div className="font-medium text-slate-800">{template.label}</div>
              <div className="text-sm text-slate-600 truncate">{template.body}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Invoices Tab Component
function InvoicesTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Invoice Management</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Invoice Generator Available</h3>
            <p className="text-sm text-blue-700 mt-1">
              The complete invoice generator is available at <code className="bg-blue-100 px-2 py-0.5 rounded">/admin/invoices/generator</code>
            </p>
            <a
              href="/admin/invoices/generator"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Go to Invoice Generator
            </a>
          </div>
        </div>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-sm text-green-700 font-medium">Paid Invoices</div>
          <div className="text-3xl font-bold text-green-900 mt-1">45</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="text-sm text-yellow-700 font-medium">Pending Invoices</div>
          <div className="text-3xl font-bold text-yellow-900 mt-1">12</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-sm text-blue-700 font-medium">Total Revenue</div>
          <div className="text-3xl font-bold text-blue-900 mt-1">$45,230</div>
        </div>
      </div>
    </div>
  );
}

// Reports Tab Component
function ReportsTab() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('summary');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=30d`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Report error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Advanced Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-2 focus:border-[#0f4d8a] focus:outline-none"
          >
            <option value="summary">Summary Report</option>
            <option value="revenue">Revenue Analysis</option>
            <option value="packages">Package Analytics</option>
            <option value="customers">Customer Insights</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-2 focus:border-[#0f4d8a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-2 focus:border-[#0f4d8a] focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={generateReport}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#0f4d8a] to-[#E67919] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <BarChart3 className="w-5 h-5" />
            Generate Report
          </>
        )}
      </button>

      {/* Report Results */}
      {reportData && (
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Report Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${reportData.overview?.totalRevenue || 0}`}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={Package}
              label="Total Packages"
              value={reportData.overview?.totalPackages || 0}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={Users}
              label="Total Customers"
              value={reportData.overview?.totalCustomers || 0}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue Growth"
              value={`${reportData.overview?.revenueGrowth || 0}%`}
              color="from-orange-500 to-orange-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, change, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            change.includes('+') ? 'bg-green-100 text-green-700' :
            change.includes('-') ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-sm text-slate-600 font-medium">{label}</div>
      <div className="text-3xl font-bold text-slate-800 mt-1">{value}</div>
    </div>
  );
}