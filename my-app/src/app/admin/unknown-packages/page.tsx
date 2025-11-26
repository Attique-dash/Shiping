"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock, Filter, Loader2, Package, RefreshCw, Search, User } from "lucide-react";
import { AdminLoading } from "@/components/admin/AdminLoading";

type UnknownPackage = {
  tracking_number: string;
  user_code: string | null;
  status: string;
  description: string | null;
  created_at: string | null;
};

type ApiResponse = {
  packages: UnknownPackage[];
  total_count: number;
};

export default function UnknownPackagesPage() {
  const [items, setItems] = useState<UnknownPackage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>("");

  const loadPackages = async (opts?: { silent?: boolean }) => {
    if (opts?.silent) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());

    try {
      const res = await fetch(`/api/admin/packages/unknown?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json()) as ApiResponse | { error?: string };
      if (!res.ok || !("packages" in data)) {
        throw new Error("error" in data && data.error ? data.error : "Failed to load unknown packages");
      }
      setItems(data.packages);
      setTotalCount(data.total_count);
      setLastRefreshTime(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load unknown packages");
      setItems([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const unknownStatus = items.filter((i) => i.status === "Unknown").length;
    const noCustomer = items.filter((i) => !i.user_code || i.user_code === "").length;
    const recent24h = items.filter((i) => {
      if (!i.created_at) return false;
      const diff = Date.now() - new Date(i.created_at).getTime();
      return diff < 24 * 60 * 60 * 1000;
    }).length;
    return { unknownStatus, noCustomer, recent24h };
  }, [items]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.12) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
       {/* Invoice-style Header */}
<header className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-[#0f4d8a] via-[#0e447d] to-[#0d3d70] p-6 text-white shadow-2xl mb-8">
  <div className="absolute inset-0 bg-white/10" />

  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    {/* Left Side */}
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Package className="h-7 w-7" />
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-blue-100">Package Review</p>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">Unknown Packages</h1>
          <p className="mt-1 text-sm text-blue-100">
            Packages requiring manual review and assignment
          </p>
        </div>
      </div>

      {/* Stats Badges */}
      <div className="flex flex-wrap gap-3 text-xs text-blue-100">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
          <AlertCircle className="h-3 w-3" />
          {totalCount} Total
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
          <Clock className="h-3 w-3" />
          {stats.recent24h} New (24h)
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
          <User className="h-3 w-3" />
          {stats.noCustomer} No Customer
        </span>
      </div>
    </div>

    {/* Right Actions */}
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => loadPackages({ silent: true })}
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
    </div>
  </div>
</header>


        {/* Filters + Stats */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row">
          <div className="flex-1 space-y-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      loadPackages();
                    }
                  }}
                  placeholder="Search by tracking number, user code, or description..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-base text-gray-900 shadow-sm outline-none ring-0 transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#0f4d8a] focus:ring-2 focus:ring-[#0f4d8a]/20"
                />
              </div>
              <button
                type="button"
                onClick={() => loadPackages()}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <Filter className="h-4 w-4" />
                Apply search
              </button>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Showing up to 500 most recent unknown packages from the API.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Unknown status"
              value={stats.unknownStatus}
              description="Status marked as Unknown"
              tone="blue"
            />
            <StatCard
              label="No customer"
              value={stats.noCustomer}
              description="Missing user code"
              tone="orange"
            />
            <StatCard
              label="New in 24h"
              value={stats.recent24h}
              description="Recently created"
              tone="green"
            />
          </div>
        </div>

        {/* Table / list */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Package className="h-6 w-6 text-[#0f4d8a]" />
              <span>Unknown package details</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last refresh: {lastRefreshTime || "Never"}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16">
              <AdminLoading message="Loading packages..." />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-base text-red-600">
              <AlertCircle className="h-7 w-7" />
              <p>{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-base text-gray-500">
              <Package className="h-12 w-12 text-gray-300" />
              <p>No unknown packages found</p>
              <p className="text-sm text-gray-400">All packages are currently assigned and have valid status.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold uppercase tracking-wide text-gray-600">
                      <th className="px-6 py-4 text-left">Tracking number</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">User code</th>
                      <th className="px-6 py-4 text-left">Description</th>
                      <th className="px-6 py-4 text-left">Created at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((p) => (
                      <tr key={p.tracking_number} className="hover:bg-blue-50/40">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#E67919]"></span>
                            <span className="font-semibold text-base text-gray-900">{p.tracking_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-semibold text-yellow-800 ring-1 ring-yellow-200">
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.user_code ? (
                            <span className="inline-flex items-center rounded-lg bg-[#0f4d8a]/10 px-3 py-1.5 text-sm font-medium text-[#0f4d8a] ring-1 ring-[#0f4d8a]/20">
                              <User className="mr-1.5 h-4 w-4" />
                              {p.user_code}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="line-clamp-2 text-sm text-gray-700">
                            {p.description || <span className="italic text-gray-400">No description</span>}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {p.created_at ? (
                            <>
                              <div>{new Date(p.created_at).toLocaleDateString()}</div>
                              <div className="text-gray-500">{new Date(p.created_at).toLocaleTimeString()}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                {items.map((p) => (
                  <div key={p.tracking_number} className="space-y-3 px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#E67919]"></span>
                        <span className="text-base font-semibold text-gray-900">{p.tracking_number}</span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-800 ring-1 ring-yellow-200">
                        {p.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gray-400" />
                        {p.user_code || <span className="text-red-600">Not assigned</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      {p.description || <span className="italic text-gray-400">No description</span>}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:px-6">
                <span>
                  Showing <span className="font-semibold text-gray-900">{items.length}</span> of{" "}
                  <span className="font-semibold text-gray-900">{totalCount}</span> packages
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type StatTone = "blue" | "orange" | "green";

function StatCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: number;
  description: string;
  tone: StatTone;
}) {
  const colorMap: Record<StatTone, string> = {
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/30 text-blue-700",
    orange: "from-orange-500/10 to-orange-500/5 border-orange-500/30 text-orange-700",
    green: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 text-emerald-700",
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-gradient-to-br p-4 text-sm shadow-sm ${colorMap[tone]} backdrop-blur`}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </div>
      <p className="mt-1 text-xs text-gray-700/80">{description}</p>
    </div>
  );
}
