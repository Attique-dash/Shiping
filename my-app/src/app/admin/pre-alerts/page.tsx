import Link from "next/link";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function PreAlertsPage() {
  // Build absolute base URL for server runtime
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/admin/pre-alerts`, { cache: "no-store" });
  let data: any[] = [];
  try {
    const json = await res.json();
    data = Array.isArray(json?.pre_alerts) ? json.pre_alerts : Array.isArray(json?.items) ? json.items : Array.isArray(json) ? json : [];
  } catch {}

  // Status color mapping
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered") || s.includes("completed")) return "bg-green-100 text-green-800 border-green-200";
    if (s.includes("transit") || s.includes("progress")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (s.includes("pending") || s.includes("awaiting")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (s.includes("delayed") || s.includes("issue")) return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Carrier icon/badge
  const getCarrierBadge = (carrier: string) => {
    const c = carrier?.toUpperCase() || "N/A";
    return c;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        {/* Invoice-Style Header */}
<header className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-[#0f4d8a] via-[#0e447d] to-[#0d3d70] p-6 text-white shadow-2xl">
  <div className="absolute inset-0 bg-white/10" />

  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    {/* Left Section */}
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v4H3V3zm0 6h18v4H3V9zm0 6h18v4H3v-4z" />
          </svg>
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-blue-100">
            Shipment Notifications
          </p>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            Pre-Alerts Dashboard
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Monitor incoming shipment notifications in real-time
          </p>
        </div>
      </div>

      {/* Info Badges */}
      <div className="flex flex-wrap gap-3 text-xs text-blue-100">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
          Total: <strong>{data.length}</strong>
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
          In Transit: <strong>{data.filter(p => p.status?.toLowerCase().includes("transit")).length}</strong>
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
          Delivered: <strong>{data.filter(p => p.status?.toLowerCase().includes("delivered")).length}</strong>
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
          Pending: <strong>{data.filter(p => p.status?.toLowerCase().includes("pending")).length}</strong>
        </span>
      </div>
    </div>

    {/* Right Button */}
    <Link
      href="/admin"
      className="flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-semibold shadow-lg shadow-blue-900/30 transition hover:bg-white/25 hover:shadow-xl hover:scale-105 active:scale-95 backdrop-blur"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Dashboard
    </Link>
  </div>
</header>


        {/* Main Table Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Card Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-[#0f4d8a]/5 to-[#E67919]/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-[#0f4d8a] to-[#E67919] p-2">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Incoming Shipments</h2>
                <p className="text-sm text-gray-600">All active pre-alert notifications</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tracking Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Origin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expected Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-gray-100 p-4">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">No pre-alerts available</p>
                          <p className="mt-1 text-sm text-gray-500">There are no incoming shipments at this time</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {data.map((p: any, i: number) => (
                  <tr 
                    key={p._id || i} 
                    className="transition-colors hover:bg-gradient-to-r hover:from-[#0f4d8a]/5 hover:to-[#E67919]/5"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f4d8a]/10 to-[#E67919]/10">
                          <svg className="h-5 w-5 text-[#0f4d8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {p.trackingNumber}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-[#0f4d8a]/10 px-2.5 py-1 text-xs font-medium text-[#0f4d8a]">
                        {getCarrierBadge(p.carrier)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {p.origin || "-"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {p.expectedDate ? new Date(p.expectedDate).toLocaleDateString() : "-"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {data.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{data.length}</span> pre-alert{data.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}