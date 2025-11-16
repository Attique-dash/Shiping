"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type User = { 
  firstName: string; 
  lastName: string; 
  email: string; 
  role: string; 
  userCode: string 
} | null;

type Package = {
  trackingNumber: string;
  status: string;
  userCode: string;
  description?: string;
  weight?: number;
  shipper?: string;
  updatedAt?: string;
};

type TrackHistory = { 
  status: string; 
  at: string; 
  note?: string 
};

type TrackResult = {
  trackingNumber: string;
  status: string;
  userCode: string;
  weight?: number;
  shipper?: string;
  description?: string;
  currentLocation?: string;
  dimensions?: { 
    length?: number; 
    width?: number; 
    height?: number 
  };
  entryDate?: string;
  updatedAt?: string;
  serviceTypeId?: string;
  serviceTypeName?: string;
  externalStatusLabel?: string;
  history?: TrackHistory[];
} | null;

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const params = useSearchParams();
  
  // All hooks must be called before any conditional returns
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<User>(null);
  const [pkgs, setPkgs] = useState<Package[]>([]);
  const [tracking, setTracking] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackResult, setTrackResult] = useState<TrackResult>(null);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const role = session.user.role as string | undefined;
      
      // Redirect if not a customer
      if (role === 'admin') {
        router.replace('/admin');
        return;
      } else if (role === 'warehouse') {
        router.replace('/warehouse');
        return;
      }
    }
  }, [status, session, router]);

  // Fetch user profile
  useEffect(() => {
    if (status !== 'authenticated') return;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMe(d?.user ?? null))
      .catch(() => setMe(null));
  }, [status]);

  // Fetch packages
  useEffect(() => {
    if (status !== 'authenticated') return;

    fetch("/api/customer/packages", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (r.ok) {
          const list = Array.isArray(data?.packages) ? data.packages : [];
          const mapped: Package[] = list.map((p: any) => ({
            trackingNumber: String(p.tracking_number || p.trackingNumber || ""),
            status: String(p.status || ""),
            userCode: String(p.userCode || ""),
            description: p.description,
            weight: typeof p.weight_kg === "number" ? p.weight_kg : (typeof p.weight === "number" ? p.weight : undefined),
            shipper: p.shipper,
            updatedAt: p.updated_at || p.updatedAt,
          }));
          setPkgs(mapped);
        }
      })
      .catch(() => {});
  }, [status]);

  // Initialize tracking from query parameter if present
  useEffect(() => {
    if (!mounted) return;
    
    const q = params.get("tracking");
    if (q) setTracking(q);
  }, [mounted, params]);

  // Memoized selected package
  const selected = useMemo(() => {
    if (!tracking) return pkgs[0];
    return pkgs.find((p) => p.trackingNumber.toLowerCase() === tracking.trim().toLowerCase()) || pkgs[0];
  }, [pkgs, tracking]);

  // Calculate step index
  function stepIndex(status?: string) {
    if (!status) return 0;
    const key = status.replace(/_/g, " ").trim().toLowerCase();
    
    if (key.includes("delivered")) return 2;
    if (key.includes("in transit")) return 1;
    if (key.includes("ready for pickup") || key.includes("local port")) return 1;
    if (key.includes("at warehouse") || key.includes("processing") || key.includes("received") || key.includes("pending") || key.includes("unknown")) return 0;
    if (key.includes("ready")) return 1;
    
    return 0;
  }

  const activeStep = stepIndex((trackResult?.status || selected?.status));

  // Track package lookup
  async function doTrackLookup() {
    const t = tracking.trim();
    if (!t) return;
    
    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);
    
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(t)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Not found");
      setTrackResult(data as TrackResult);
    } catch (e) {
      setTrackError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setTrackLoading(false);
    }
  }

  // Show loading state while checking authentication
  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status !== 'authenticated') {
    return null;
  }

  // Don't render if wrong role
  const role = session?.user?.role as string | undefined;
  if (role !== 'customer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Welcome Card */}
          {me && (
            <div className="rounded-xl border bg-white px-6 py-4 shadow-sm">
              <div className="text-sm text-gray-600">Welcome back,</div>
              <div className="text-lg font-semibold">
                {me.firstName} {me.lastName}
              </div>
            </div>
          )}

          {/* Track Box */}
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Track Your Package</h2>
            </div>
            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1fr_auto]">
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && doTrackLookup()}
                placeholder="Enter Tracking Number"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="h-[44px] rounded-md bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={doTrackLookup}
                disabled={trackLoading || !tracking.trim()}
              >
                {trackLoading ? "Searching..." : "Track"}
              </button>
            </div>
            
            {trackError && (
              <div className="px-6 pb-4">
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {trackError}
                </div>
              </div>
            )}

            {/* Step Indicator */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between">
                {["Processing", "In Transit", "Delivered"].map((label, i) => (
                  <div key={label} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                          i <= activeStep 
                            ? "bg-blue-600 text-white" 
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="mt-2 text-xs text-gray-600">{label}</span>
                    </div>
                    {i < 2 && (
                      <div
                        className={`mx-2 h-1 flex-1 rounded transition-colors ${
                          i < activeStep ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Package Details */}
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="font-medium">Package Details</h3>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
                  View Full History
                </button>
                <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
                  Report an Issue
                </button>
              </div>
            </div>

            {(trackResult || selected) ? (
              <div className="grid gap-6 p-6 md:grid-cols-2">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Tracking</dt>
                    <dd className="font-medium">
                      {(trackResult?.trackingNumber) || selected?.trackingNumber || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Status</dt>
                    <dd className="capitalize">
                      {((trackResult?.status) || selected?.status || "-").replace(/_/g, " ")}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Updated</dt>
                    <dd>
                      {trackResult?.updatedAt 
                        ? new Date(trackResult.updatedAt).toLocaleString() 
                        : (selected?.updatedAt 
                          ? new Date(selected.updatedAt).toLocaleString() 
                          : "-")}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Shipper</dt>
                    <dd>{(trackResult?.shipper) || selected?.shipper || "-"}</dd>
                  </div>
                </dl>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">User Code</dt>
                    <dd>{(trackResult?.userCode) || selected?.userCode || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Weight</dt>
                    <dd>
                      {(typeof trackResult?.weight === "number" 
                        ? trackResult?.weight 
                        : selected?.weight) 
                          ? `${(trackResult?.weight || selected?.weight)} kg` 
                          : "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Description</dt>
                    <dd className="text-right max-w-xs truncate">
                      {(trackResult?.description) || selected?.description || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Location</dt>
                    <dd>{trackResult?.currentLocation ?? "-"}</dd>
                  </div>
                  {trackResult?.dimensions && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Dimensions</dt>
                      <dd>
                        {[
                          trackResult.dimensions.length, 
                          trackResult.dimensions.width, 
                          trackResult.dimensions.height
                        ]
                          .filter((v) => typeof v === "number")
                          .join(" × ") || "-"} cm
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-600">
                  No package selected. Enter a tracking number above to view details.
                </p>
              </div>
            )}

            {/* History Section */}
            {trackResult?.history && trackResult.history.length > 0 && (
              <div className="border-t px-6 py-4">
                <h4 className="text-sm font-medium mb-4">Tracking History</h4>
                <div className="space-y-3">
                  {trackResult.history.map((h, idx) => (
                    <div key={idx} className="flex gap-4 text-sm">
                      <div className="text-gray-500 min-w-[140px]">
                        {new Date(h.at).toLocaleString()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium capitalize">
                          {h.status.replace(/_/g, " ")}
                        </div>
                        {h.note && (
                          <div className="text-gray-600 text-xs mt-1">
                            {h.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* All Packages List */}
          {pkgs.length > 0 && (
            <section className="rounded-xl border bg-white shadow-sm">
              <div className="border-b px-6 py-4">
                <h3 className="font-medium">Your Recent Packages</h3>
              </div>
              <div className="divide-y">
                {pkgs.slice(0, 5).map((pkg) => (
                  <div
                    key={pkg.trackingNumber}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setTracking(pkg.trackingNumber)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {pkg.trackingNumber}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {pkg.description || "No description"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 capitalize">
                          {pkg.status.replace(/_/g, " ")}
                        </div>
                        {pkg.weight && (
                          <div className="text-xs text-gray-500 mt-1">
                            {pkg.weight} kg
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}