"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  Loader2,
  Package,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { AdminLoading } from "@/components/admin/AdminLoading";

type Invoice = {
  _id: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  currency: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
};

type InvoiceResponse = {
  data: Invoice[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
};

const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<InvoiceResponse["pagination"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const pageSize = 10;

  const fetchInvoices = async (opts?: { page?: number; silent?: boolean }) => {
    const targetPage = opts?.page ?? page;
    if (!opts?.silent) {
      setIsLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    params.set("limit", String(pageSize));
    if (statusFilter) params.set("status", statusFilter);
    if (searchTerm) params.set("search", searchTerm.trim());
    if (dateFrom) params.set("startDate", dateFrom);
    if (dateTo) params.set("endDate", dateTo);

    try {
      const res = await fetch(`/api/admin/invoices?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data: InvoiceResponse | { error?: string } = await res.json();
      if (!res.ok || !("data" in data)) {
        throw new Error((data as any)?.error || "Failed to load invoices");
      }
      setInvoices(data.data);
      setPagination(data.pagination);
      setPage(data.pagination.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load invoices");
      setInvoices([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const totalInvoices = pagination?.total || 0;
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidAmount = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const outstanding = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
    const paidCount = invoices.filter((i) => i.status === "paid").length;

    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      outstanding,
      paidRatio: totalInvoices ? Math.round((paidCount / totalInvoices) * 100) : 0,
    };
  }, [invoices, pagination]);

  const hasFilters = !!statusFilter || !!searchTerm || !!dateFrom || !!dateTo;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.12) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <header className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-[#0f4d8a] via-[#0e447d] to-[#0d3d70] p-6 text-white shadow-2xl">
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-widest text-blue-100">Billing</p>
                  <h1 className="text-3xl font-bold leading-tight md:text-4xl">Invoices</h1>
                  <p className="mt-1 text-sm text-blue-100">Monitor and manage all customer invoices</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-blue-100">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  <Activity className="h-3 w-3" />
                  {stats.totalInvoices.toLocaleString()} invoices
                </span>
                {hasFilters && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                    <Filter className="h-3 w-3" />
                    Filters active
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => fetchInvoices({ page: 1, silent: true })}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold shadow-lg shadow-blue-900/30 transition hover:bg-white/25 disabled:opacity-60"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {refreshing ? "Refreshing..." : "Refresh Data"}
              </button>
              <a
                href="/admin/invoices/generator"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#0f4d8a] shadow-lg shadow-blue-900/20 transition hover:bg-blue-50"
              >
                <FileText className="h-4 w-4" />
                New Invoice
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniStatCard
            icon={FileText}
            label="Total Invoices"
            value={stats.totalInvoices.toLocaleString()}
            helper="Across all statuses"
          />
          <MiniStatCard
            icon={DollarSign}
            label="Amount (Page)"
            value={formatCurrency(stats.totalAmount)}
            helper="Sum of listed invoices"
          />
          <MiniStatCard
            icon={CheckCircle2}
            label="Paid"
            value={formatCurrency(stats.paidAmount)}
            helper={`${stats.paidRatio}% of invoices paid`}
          />
          <MiniStatCard
            icon={AlertCircle}
            label="Outstanding"
            value={formatCurrency(stats.outstanding)}
            helper="Remaining balance due"
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-100 sm:p-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchInvoices({ page: 1 });
                    }
                  }}
                  placeholder="Search by invoice, customer, email..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 shadow-sm outline-none ring-0 transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#0f4d8a] focus:ring-2 focus:ring-[#0f4d8a]/20"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 pr-8 text-xs font-medium text-gray-700 shadow-sm outline-none ring-0 transition hover:border-gray-300 focus:border-[#0f4d8a] focus:ring-2 focus:ring-[#0f4d8a]/20"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="h-4 w-4" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="max-w-[130px] rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-[#0f4d8a] focus:ring-1 focus:ring-[#0f4d8a]/20"
                />
                <span>–</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="max-w-[130px] rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-[#0f4d8a] focus:ring-1 focus:ring-[#0f4d8a]/20"
                />
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("");
                    setSearchTerm("");
                    setDateFrom("");
                    setDateTo("");
                    setPage(1);
                    fetchInvoices({ page: 1 });
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100">
            {isLoading ? (
              <div className="py-16">
                <AdminLoading message="Loading invoices..." />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-red-600">
                <AlertCircle className="h-6 w-6" />
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => fetchInvoices({ page: 1 })}
                  className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  Try again
                </button>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-sm text-gray-500">
                <FileText className="h-10 w-10 text-gray-300" />
                <p>No invoices found</p>
                <p className="text-xs text-gray-400">
                  {hasFilters ? "Try changing filters or clearing your search." : "Create your first invoice to get started."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left sm:px-6">Invoice</th>
                      <th className="hidden px-4 py-3 text-left md:table-cell sm:px-6">Customer</th>
                      <th className="hidden px-4 py-3 text-left lg:table-cell sm:px-6">Dates</th>
                      <th className="px-4 py-3 text-right sm:px-6">Amount</th>
                      <th className="hidden px-4 py-3 text-right md:table-cell sm:px-6">Paid</th>
                      <th className="px-4 py-3 text-right sm:px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{inv.invoiceNumber}</p>
                              <p className="flex items-center gap-1 text-xs text-gray-500">
                                <Package className="h-3 w-3" />
                                {inv.customer?.id || "Customer ID"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 align-middle md:table-cell sm:px-6">
                          <div className="text-sm font-medium text-gray-900">{inv.customer?.name || "—"}</div>
                          <div className="text-xs text-gray-500">{inv.customer?.email}</div>
                        </td>
                        <td className="hidden px-4 py-3 align-middle text-xs text-gray-600 lg:table-cell sm:px-6">
                          <div className="flex flex-col">
                            <span>Issue: {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "—"}</span>
                            <span>Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right align-middle sm:px-6">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(inv.total, inv.currency || "USD")}
                          </div>
                          <div className="text-xs text-gray-500">Balance: {formatCurrency(inv.balanceDue, inv.currency || "USD")}</div>
                        </td>
                        <td className="hidden px-4 py-3 text-right align-middle md:table-cell sm:px-6">
                          <span className="text-xs text-gray-600">
                            {formatCurrency(inv.amountPaid, inv.currency || "USD")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right align-middle sm:px-6">
                          <span
                            className={`inline-flex items-center justify-end gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              STATUS_COLORS[inv.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {inv.status === "paid" && <CheckCircle2 className="h-3 w-3" />}
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 sm:flex-row">
              <div>
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || isLoading}
                  onClick={() => fetchInvoices({ page: pagination.page - 1 })}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages || isLoading}
                  onClick={() => fetchInvoices({ page: pagination.page + 1 })}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MiniStatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-3xl" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-xl font-bold text-gray-900">{value}</p>
          {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}


