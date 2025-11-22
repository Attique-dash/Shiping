"use client";

import { useState } from "react";
import { Search, Filter, Download, Package, Calendar, User, Loader2 } from "lucide-react";

type PackageResult = {
  trackingNumber: string;
  userCode: string;
  status: string;
  weight?: number;
  shipper?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  branch?: string;
  manifestId?: string;
};

export default function WarehouseSearchPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [userCode, setUserCode] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [results, setResults] = useState<PackageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  async function handleSearch(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (status) params.set("status", status);
      if (userCode) params.set("userCode", userCode);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      params.set("page", page.toString());
      params.set("limit", "50");

      const r = await fetch(`/api/warehouse/packages/search?${params.toString()}`);
      const data = await r.json();
      
      if (r.ok) {
        setResults(data.packages || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (results.length === 0) return;
    
    const headers = ["Tracking Number", "User Code", "Status", "Weight", "Shipper", "Description", "Created", "Branch"];
    const rows = results.map(r => [
      r.trackingNumber,
      r.userCode,
      r.status,
      r.weight?.toString() || "",
      r.shipper || "",
      r.description || "",
      new Date(r.createdAt).toLocaleDateString(),
      r.branch || ""
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `packages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f4d8a] to-[#0a3d6e] text-white mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#E67919] rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Advanced Package Search</h1>
              <p className="text-blue-100 mt-1">Search and filter packages with multiple criteria</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Search Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#E67919]" />
            <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent"
                placeholder="Tracking, description, shipper..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="At Warehouse">At Warehouse</option>
                <option value="In Transit">In Transit</option>
                <option value="At Local Port">At Local Port</option>
                <option value="Delivered">Delivered</option>
                <option value="Unknown">Unknown</option>
                <option value="Deleted">Deleted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Code
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent"
                placeholder="Customer code"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSearch(1)}
              disabled={loading}
              className="flex items-center gap-2 bg-[#0f4d8a] hover:bg-[#0a3d6e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>

            <button
              onClick={() => {
                setQuery("");
                setStatus("");
                setUserCode("");
                setDateFrom("");
                setDateTo("");
                setResults([]);
              }}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>

            {results.length > 0 && (
              <button
                onClick={exportToCSV}
                className="ml-auto flex items-center gap-2 bg-[#E67919] hover:bg-[#d66e15] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0f4d8a] to-[#0a3d6e] px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Search Results</h2>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-white text-sm font-medium">
                  {pagination.total} packages found
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tracking</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Shipper</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((pkg) => (
                    <tr key={pkg.trackingNumber} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="font-mono font-bold text-[#0f4d8a]">{pkg.trackingNumber}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{pkg.userCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pkg.status === "Delivered" ? "bg-green-100 text-green-800" :
                          pkg.status === "In Transit" ? "bg-blue-100 text-blue-800" :
                          pkg.status === "At Local Port" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {pkg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{pkg.weight ? `${pkg.weight} kg` : "-"}</td>
                      <td className="px-6 py-4 text-sm">{pkg.shipper || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(pkg.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSearch(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleSearch(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || loading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && results.length === 0 && (query || status || userCode || dateFrom || dateTo) && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}