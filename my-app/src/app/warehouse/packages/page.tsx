"use client";

import { useEffect, useRef, useState } from "react";
import { generateTrackingNumber } from "@/lib/tracking";
import { Package, RefreshCw, Edit, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function WarehousePackagesPage() {
  // Add package form
  const [add, setAdd] = useState({ trackingNumber: "", userCode: "", weight: "", shipper: "", description: "", entryDate: new Date().toISOString().slice(0, 10) });
  const [tnExists, setTnExists] = useState<boolean | null>(null);
  const [tnChecking, setTnChecking] = useState(false);
  const checkTimer = useRef<number | null>(null);
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Update status form
  const [upd, setUpd] = useState({ trackingNumber: "", status: "At Warehouse", note: "", weight: "", shipper: "", userCode: "", manifestId: "", description: "" });
  const [updMsg, setUpdMsg] = useState<string | null>(null);
  const [updLoading, setUpdLoading] = useState(false);

  // Delete form
  const [del, setDel] = useState({ trackingNumber: "" });
  const [delMsg, setDelMsg] = useState<string | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  function toMessage(err: unknown, fallback: string) {
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const e = err as {
        error?: unknown;
        formErrors?: unknown;
        fieldErrors?: Record<string, unknown> | unknown;
        message?: unknown;
      };
      if (typeof e.error !== "undefined") return toMessage(e.error, fallback);
      if (Array.isArray(e.formErrors) && e.formErrors.length) return e.formErrors.join(", ");
      if (e.fieldErrors && typeof e.fieldErrors === "object") {
        const fe = e.fieldErrors as Record<string, unknown>;
        const msgs: string[] = [];
        for (const k in fe) {
          const v = fe[k];
          if (Array.isArray(v)) msgs.push(`${k}: ${(v as unknown[]).join("; ")}`);
        }
        if (msgs.length) return msgs.join(" | ");
      }
      if (typeof e.message !== "undefined") return String(e.message);
    }
    return fallback;
  }

  function refreshTracking() {
    const v = generateTrackingNumber("TAS");
    setAdd((s) => ({ ...s, trackingNumber: v }));
    void checkExists(v);
  }

  async function checkExists(tracking: string) {
    const t = tracking.trim();
    if (!t) { setTnExists(null); return; }
    setTnChecking(true);
    try {
      const r = await fetch(`/api/warehouse/packages/exist?tracking=${encodeURIComponent(t)}`, { cache: "no-store" });
      const d = await r.json();
      setTnExists(Boolean(d?.exists));
    } catch {
      setTnExists(null);
    } finally {
      setTnChecking(false);
    }
  }

  useEffect(() => {
    if (!add.trackingNumber) {
      const v = generateTrackingNumber("TAS");
      setAdd((s) => ({ ...s, trackingNumber: v }));
      void checkExists(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddMsg(null);
    if (tnExists) {
      setAddMsg("Tracking number already exists. Click Refresh to generate a new one.");
      setAddLoading(false);
      return;
    }
    const payload = {
      trackingNumber: add.trackingNumber.trim(),
      userCode: add.userCode.trim(),
      weight: add.weight ? Number(add.weight) : undefined,
      shipper: add.shipper || undefined,
      description: add.description || undefined,
      entryDate: add.entryDate ? new Date(add.entryDate).toISOString() : undefined,
    };
    const r = await fetch("/api/warehouse/packages/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json();
    setAddMsg(r.ok ? "Package saved" : toMessage(d, "Failed to add package"));
    if (r.ok) {
      const next = generateTrackingNumber("TAS");
      setAdd({ trackingNumber: next, userCode: "", weight: "", shipper: "", description: "", entryDate: new Date().toISOString().slice(0, 10) });
      setTnExists(null);
      void checkExists(next);
    }
    setAddLoading(false);
  }

  async function onUpd(e: React.FormEvent) {
    e.preventDefault();
    setUpdLoading(true);
    setUpdMsg(null);
    const payload = {
      trackingNumber: upd.trackingNumber.trim(),
      status: upd.status,
      note: upd.note || undefined,
      weight: upd.weight ? Number(upd.weight) : undefined,
      shipper: upd.shipper || undefined,
      userCode: upd.userCode || undefined,
      manifestId: upd.manifestId || undefined,
      description: upd.description || undefined,
    };
    const r = await fetch("/api/warehouse/packages/update-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json();
    setUpdMsg(r.ok ? "Package updated" : toMessage(d, "Failed to update package"));
    setUpdLoading(false);
  }

  async function onDel(e: React.FormEvent) {
    e.preventDefault();
    setDelLoading(true);
    setDelMsg(null);
    const r = await fetch("/api/warehouse/packages/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackingNumber: del.trackingNumber.trim() }) });
    const d = await r.json();
    setDelMsg(r.ok ? "Package deleted" : toMessage(d, "Failed to delete package"));
    if (r.ok) setDel({ trackingNumber: "" });
    setDelLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f4d8a] to-[#0a3d6e] text-white mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#E67919] rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Package Management</h1>
              <p className="text-blue-100 mt-1">Add, update, and manage warehouse packages</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Add Package Section */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f4d8a] to-[#0a3d6e] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Add New Package</h2>
            </div>
          </div>
          
          <form className="p-6 space-y-5" onSubmit={onAdd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      className={`w-full border-2 rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent ${
                        tnExists ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Auto-generated tracking number"
                      value={add.trackingNumber}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\s+/g, "").slice(0, 10);
                        const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
                        const numbers = "23456789";
                        const alnum = letters + numbers;
                        const pick = () => alnum[Math.floor(Math.random() * alnum.length)];
                        if (v.startsWith("-")) v = pick() + v.slice(1);
                        if (v.endsWith("-")) v = v.slice(0, -1) + pick();
                        setAdd({ ...add, trackingNumber: v });
                        if (checkTimer.current) window.clearTimeout(checkTimer.current);
                        checkTimer.current = window.setTimeout(() => { void checkExists(v); }, 300);
                      }}
                      required
                    />
                    {tnChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <button 
                    type="button" 
                    onClick={refreshTracking} 
                    className="flex items-center gap-2 bg-[#E67919] hover:bg-[#d66e15] text-white rounded-lg px-4 py-2.5 transition-colors font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
                {tnExists && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Tracking number already exists. Click Refresh to generate a new one.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Code *</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent transition-colors" 
                  placeholder="Enter customer code" 
                  value={add.userCode} 
                  onChange={(e) => setAdd({ ...add, userCode: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent transition-colors" 
                  placeholder="0.00" 
                  type="number"
                  step="0.01"
                  value={add.weight} 
                  onChange={(e) => setAdd({ ...add, weight: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipper</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent transition-colors" 
                  placeholder="Shipper name" 
                  value={add.shipper} 
                  onChange={(e) => setAdd({ ...add, shipper: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entry Date</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent transition-colors" 
                  type="date" 
                  value={add.entryDate} 
                  onChange={(e) => setAdd({ ...add, entryDate: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent transition-colors" 
                placeholder="Package description" 
                value={add.description} 
                onChange={(e) => setAdd({ ...add, description: e.target.value })} 
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button 
                disabled={addLoading || !!tnExists || !add.trackingNumber} 
                className="flex items-center gap-2 bg-[#0f4d8a] hover:bg-[#0a3d6e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 transition-colors font-semibold"
              >
                {addLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Add Package
                  </>
                )}
              </button>
              {addMsg && (
                <div className={`flex items-center gap-2 text-sm font-medium ${addMsg.includes("saved") ? "text-green-600" : "text-red-600"}`}>
                  {addMsg.includes("saved") ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{addMsg}</span>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Update Status Section */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#E67919] to-[#d66e15] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Update Package Status</h2>
            </div>
          </div>
          
          <form className="p-6 space-y-5" onSubmit={onUpd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number *</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent transition-colors" 
                  placeholder="Enter tracking number" 
                  value={upd.trackingNumber} 
                  onChange={(e) => setUpd({ ...upd, trackingNumber: e.target.value })} 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent transition-colors bg-white" 
                  value={upd.status} 
                  onChange={(e) => setUpd({ ...upd, status: e.target.value })}
                >
                  {["Unknown", "At Warehouse", "In Transit", "At Local Port", "Delivered", "Deleted"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent transition-colors" 
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={upd.weight} 
                  onChange={(e) => setUpd({ ...upd, weight: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipper</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent transition-colors" 
                  placeholder="Shipper name" 
                  value={upd.shipper} 
                  onChange={(e) => setUpd({ ...upd, shipper: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Code</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent transition-colors" 
                  placeholder="Customer code" 
                  value={upd.userCode} 
                  onChange={(e) => setUpd({ ...upd, userCode: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent transition-colors" 
                  placeholder="Optional note" 
                  value={upd.note} 
                  onChange={(e) => setUpd({ ...upd, note: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manifest ID</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent transition-colors" 
                  placeholder="Optional manifest ID" 
                  value={upd.manifestId} 
                  onChange={(e) => setUpd({ ...upd, manifestId: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent transition-colors" 
                  placeholder="Optional description" 
                  value={upd.description} 
                  onChange={(e) => setUpd({ ...upd, description: e.target.value })} 
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button 
                disabled={updLoading} 
                className="flex items-center gap-2 bg-[#E67919] hover:bg-[#d66e15] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 transition-colors font-semibold"
              >
                {updLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5" />
                    Update Status
                  </>
                )}
              </button>
              {updMsg && (
                <div className={`flex items-center gap-2 text-sm font-medium ${updMsg.includes("updated") ? "text-green-600" : "text-red-600"}`}>
                  {updMsg.includes("updated") ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{updMsg}</span>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Delete Package Section */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Delete Package</h2>
            </div>
          </div>
          
          <form className="p-6 space-y-5" onSubmit={onDel}>
            <div className="max-w-2xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number *</label>
              <input 
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
                placeholder="Enter tracking number to delete" 
                value={del.trackingNumber} 
                onChange={(e) => setDel({ trackingNumber: e.target.value })} 
                required 
              />
            </div>

            <div className="flex items-center gap-4">
              <button 
                disabled={delLoading} 
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 transition-colors font-semibold"
              >
                {delLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete Package
                  </>
                )}
              </button>
              {delMsg && (
                <div className={`flex items-center gap-2 text-sm font-medium ${delMsg.includes("deleted") ? "text-green-600" : "text-red-600"}`}>
                  {delMsg.includes("deleted") ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{delMsg}</span>
                </div>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}