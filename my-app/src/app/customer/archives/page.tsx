"use client";

import { useEffect, useState } from "react";
import { Package, FileText, MessageSquare, Download, Eye, Calendar, DollarSign } from "lucide-react";

type ArchivedPackage = {
  tracking_number: string;
  description?: string;
  status: string;
  last_updated?: string;
};

type ArchivedBill = {
  tracking_number: string;
  description?: string;
  invoice_number?: string;
  invoice_date?: string;
  currency?: string;
  amount_due: number;
  payment_status: string;
  document_url?: string;
  last_updated?: string;
};

type ArchivedMessage = {
  subject?: string | null;
  body: string;
  sender: string;
  created_at?: string;
};

export default function CustomerArchivesPage() {
  const [packages, setPackages] = useState<ArchivedPackage[]>([]);
  const [bills, setBills] = useState<ArchivedBill[]>([]);
  const [messages, setMessages] = useState<ArchivedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'bills' | 'messages'>('packages');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/archives", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load archives");
      setPackages(Array.isArray(data?.packages) ? data.packages : []);
      setBills(Array.isArray(data?.bills) ? data.bills : []);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('delivered') || s.includes('completed')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('transit') || s.includes('processing')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (s.includes('pending')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPaymentStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('paid') || s.includes('completed')) return 'bg-emerald-100 text-emerald-700';
    if (s.includes('pending')) return 'bg-amber-100 text-amber-700';
    if (s.includes('overdue')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f4d8a] via-[#1565a8] to-[#0891b2] p-8 shadow-xl">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 h-64 w-64 rounded-full bg-[#E67919]/20 blur-3xl"></div>
            <div className="relative">
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Archived Records</h1>
              <p className="mt-2 text-blue-100">View and manage your historical data</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="group cursor-pointer rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Packages</p>
                <p className="mt-2 text-3xl font-bold text-[#0f4d8a]">{packages.length}</p>
              </div>
              <div className="rounded-full bg-gradient-to-br from-[#0f4d8a] to-[#0891b2] p-3">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="group cursor-pointer rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="mt-2 text-3xl font-bold text-[#E67919]">{bills.length}</p>
              </div>
              <div className="rounded-full bg-gradient-to-br from-[#E67919] to-[#f59e0b] p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="group cursor-pointer rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="mt-2 text-3xl font-bold text-[#0891b2]">{messages.length}</p>
              </div>
              <div className="rounded-full bg-gradient-to-br from-[#0891b2] to-[#06b6d4] p-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-md">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'packages'
                  ? 'border-b-2 border-[#0f4d8a] bg-blue-50 text-[#0f4d8a]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Package className="h-4 w-4" />
              Packages
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'bills'
                  ? 'border-b-2 border-[#E67919] bg-orange-50 text-[#E67919]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              Bills
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'border-b-2 border-[#0891b2] bg-cyan-50 text-[#0891b2]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Messages
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-[#0f4d8a] to-[#1565a8]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">Tracking Number</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">Description</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">Last Updated</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="flex items-center justify-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0f4d8a]"></div>
                              <span className="ml-3 text-gray-600">Loading packages...</span>
                            </div>
                          </td>
                        </tr>
                      ) : packages.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            <Package className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-2">No completed packages found</p>
                          </td>
                        </tr>
                      ) : (
                        packages.map((p) => (
                          <tr key={p.tracking_number} className="transition-colors hover:bg-blue-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f4d8a] to-[#0891b2]">
                                  <Package className="h-5 w-5 text-white" />
                                </div>
                                <span className="ml-3 font-mono text-sm font-semibold text-gray-900">{p.tracking_number}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{p.description || '-'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(p.status)}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                {p.last_updated ? new Date(p.last_updated).toLocaleString() : '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <a
                                href={`/customer/packages?tracking=${encodeURIComponent(p.tracking_number)}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0f4d8a] to-[#1565a8] px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bills Tab */}
            {activeTab === 'bills' && (
              <div className="grid gap-6 sm:grid-cols-2">
                {loading ? (
                  <div className="col-span-2 flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#E67919]"></div>
                    <span className="ml-3 text-gray-600">Loading bills...</span>
                  </div>
                ) : bills.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2">No bills found</p>
                  </div>
                ) : (
                  bills.map((b) => (
                    <div
                      key={`${b.tracking_number}-${b.invoice_number || 'doc'}`}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-[#E67919]/10 to-[#f59e0b]/10 blur-2xl"></div>
                      <div className="relative">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#E67919] to-[#f59e0b]">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Invoice {b.invoice_number || 'N/A'}</h3>
                              <p className="text-sm text-gray-500">{b.invoice_date ? new Date(b.invoice_date).toLocaleDateString() : '-'}</p>
                            </div>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusColor(b.payment_status)}`}>
                            {b.payment_status.replaceAll('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 p-4">
                          <DollarSign className="h-5 w-5 text-[#E67919]" />
                          <span className="text-2xl font-bold text-gray-900">
                            {(b.amount_due || 0).toLocaleString(undefined, { style: 'currency', currency: b.currency || 'USD' })}
                          </span>
                        </div>

                        {b.document_url ? (
                          <a
                            href={b.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#E67919] to-[#f59e0b] px-4 py-3 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-400"
                          >
                            No PDF Available
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0891b2]"></div>
                    <span className="ml-3 text-gray-600">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2">No messages found</p>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div
                      key={idx}
                      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all hover:shadow-xl hover:border-[#0891b2]"
                    >
                      <div className="border-l-4 border-[#0891b2] p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0891b2] to-[#06b6d4]">
                              <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{m.subject || 'Support Team'}</h3>
                              <p className="mt-1 text-sm text-gray-600">
                                From: <span className="font-medium text-[#0891b2]">{m.sender}</span>
                              </p>
                              <p className="mt-1 flex items-center text-xs text-gray-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                {m.created_at ? new Date(m.created_at).toLocaleString() : '-'}
                              </p>
                              <p className="mt-3 line-clamp-2 text-sm text-gray-700">{m.body}</p>
                            </div>
                          </div>
                          <a
                            href="/customer/messages"
                            className="flex-shrink-0 rounded-lg border-2 border-[#0891b2] bg-white px-4 py-2 text-sm font-medium text-[#0891b2] transition-all hover:bg-[#0891b2] hover:text-white"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}