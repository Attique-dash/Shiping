// src/app/customer/bills/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FileText, DollarSign, Calendar, CheckCircle, XCircle, Clock, ExternalLink, CreditCard, RefreshCw, Loader2, TrendingUp } from "lucide-react";

type Bill = {
  tracking_number: string;
  description?: string;
  invoice_number?: string;
  invoice_date?: string;
  currency?: string;
  amount_due: number;
  payment_status: "submitted" | "reviewed" | "rejected" | "none";
  document_url?: string;
  last_updated?: string;
};

export default function CustomerBillsPage() {
  const [items, setItems] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("USD");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/bills", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load bills");
      const list: Bill[] = Array.isArray(data?.bills) ? data.bills : [];
      setItems(list);
      const ccy = list.find((b: Bill) => b.currency)?.currency || "USD";
      setCurrency(ccy);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalDue = items.reduce((s, it) => s + (Number(it.amount_due) || 0), 0);
  const pendingBills = items.filter(b => b.payment_status === 'submitted' || b.payment_status === 'none');
  const reviewedBills = items.filter(b => b.payment_status === 'reviewed');
  const rejectedBills = items.filter(b => b.payment_status === 'rejected');

  function getStatusInfo(status: Bill["payment_status"]) {
    switch (status) {
      case "reviewed":
        return {
          label: "Reviewed",
          icon: CheckCircle,
          bgColor: "bg-green-100 text-green-800 border-green-200",
          iconColor: "text-green-600",
        };
      case "submitted":
        return {
          label: "Submitted",
          icon: Clock,
          bgColor: "bg-blue-100 text-blue-800 border-blue-200",
          iconColor: "text-blue-600",
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          bgColor: "bg-red-100 text-red-800 border-red-200",
          iconColor: "text-red-600",
        };
      default:
        return {
          label: "Pending",
          icon: Clock,
          bgColor: "bg-orange-100 text-orange-800 border-orange-200",
          iconColor: "text-orange-600",
        };
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#0f4d8a] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-[#E67919] to-[#f59e42] rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0f4d8a]">Bills & Payments</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your invoices and payments
                </p>
              </div>
            </div>
            <button
              onClick={() => load()}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#0f4d8a] to-[#1e6bb8] text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Due */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#E67919] to-[#f59e42] rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Balance Due</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalDue.toLocaleString(undefined, { style: 'currency', currency })}
            </p>
            <div className="mt-2 h-1 bg-gradient-to-r from-[#E67919] to-[#f59e42]"></div>
          </div>

          {/* Pending Bills */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#0891b2] to-[#06b6d4] rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pending Bills</p>
            <p className="text-2xl font-bold text-gray-900">{pendingBills.length}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-[#0891b2] to-[#06b6d4]"></div>
          </div>

          {/* Reviewed Bills */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Approved
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Reviewed Bills</p>
            <p className="text-2xl font-bold text-gray-900">{reviewedBills.length}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
          </div>

          {/* Rejected Bills */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Rejected
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Rejected Bills</p>
            <p className="text-2xl font-bold text-gray-900">{rejectedBills.length}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Bills Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bills found</h3>
              <p className="text-sm text-gray-500">Your bills and invoices will appear here</p>
            </div>
          ) : (
            items.map((bill) => {
              const statusInfo = getStatusInfo(bill.payment_status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={`${bill.tracking_number}-${bill.invoice_number || 'doc'}`}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-[#0f4d8a] to-[#1e6bb8] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Invoice #{bill.invoice_number || 'N/A'}
                          </p>
                          <p className="text-xs text-blue-100">
                            {bill.invoice_date 
                              ? new Date(bill.invoice_date).toLocaleDateString()
                              : 'Date not set'}
                          </p>
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg ${statusInfo.bgColor.split(' ')[0]}`}>
                        <StatusIcon className={`h-5 w-5 ${statusInfo.iconColor}`} />
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Amount */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Amount Due</span>
                      <span className="text-2xl font-bold text-[#E67919]">
                        {(bill.amount_due || 0).toLocaleString(undefined, { 
                          style: 'currency', 
                          currency: bill.currency || currency 
                        })}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Status</span>
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.bgColor}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Tracking */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Tracking</span>
                      <span className="text-sm font-mono text-gray-900">{bill.tracking_number}</span>
                    </div>

                    {/* Description */}
                    {bill.description && (
                      <div className="pt-2">
                        <span className="text-xs font-medium text-gray-500 block mb-1">Description</span>
                        <p className="text-sm text-gray-700">{bill.description}</p>
                      </div>
                    )}

                    {/* Last Updated */}
                    {bill.last_updated && (
                      <div className="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <Calendar className="h-3 w-3 mr-1" />
                        Updated: {new Date(bill.last_updated).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center justify-between space-x-2">
                      {bill.document_url ? (
                        <a
                          href={bill.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border-2 border-[#0891b2] text-[#0891b2] rounded-lg hover:bg-cyan-50 transition-all text-sm font-medium"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </a>
                      ) : (
                        <div className="flex-1 inline-flex items-center justify-center px-4 py-2 border-2 border-gray-300 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          No Document
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Make Payment CTA */}
        {items.length > 0 && (
          <div className="bg-gradient-to-r from-[#0f4d8a] via-[#1e6bb8] to-[#E67919] rounded-2xl p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Ready to pay your bills?</h3>
                </div>
                <p className="text-blue-100 ml-14">
                  Total amount due: {totalDue.toLocaleString(undefined, { style: 'currency', currency })}
                </p>
              </div>
              <a
                href="/customer/payments"
                className="inline-flex items-center space-x-2 bg-white text-[#0f4d8a] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CreditCard className="h-5 w-5" />
                <span>Make Payment</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}