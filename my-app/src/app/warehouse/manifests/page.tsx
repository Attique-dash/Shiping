"use client";

import { useState } from "react";
import { Package, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function WarehouseManifestsPage() {
  const [form, setForm] = useState({ manifestId: "", description: "", data: "{}" });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    let parsed: unknown = undefined;
    try {
      parsed = form.data ? JSON.parse(form.data) : undefined;
    } catch {
      setMsg("Manifest data must be valid JSON");
      setMsgType("error");
      setLoading(false);
      return;
    }
    const r = await fetch("/api/warehouse/manifests/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        manifestId: form.manifestId.trim(), 
        description: form.description || undefined, 
        data: parsed 
      }),
    });
    const d = await r.json();
    const isSuccess = r.ok;
    setMsgType(isSuccess ? "success" : "error");
    setMsg(isSuccess ? "Manifest saved successfully" : (typeof d?.error === "string" ? d.error : "Failed to save manifest"));
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f4d8a] via-[#0a3a6b] to-[#062844] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#E67919] rounded-lg shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Warehouse Manifests</h1>
              <p className="text-blue-200 text-sm mt-1">Manage and update your warehouse manifest records</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#0f4d8a] to-[#0a3a6b] px-8 py-6 border-b-4 border-[#E67919]">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E67919]" />
              <h2 className="text-xl font-semibold text-white">Create or Update Manifest</h2>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 space-y-6">
            {/* Input Fields Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Manifest ID <span className="text-[#E67919]">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:border-[#0f4d8a] focus:ring-2 focus:ring-[#0f4d8a] focus:ring-opacity-20 transition-all outline-none"
                  placeholder="e.g., MNF-2024-001"
                  value={form.manifestId}
                  onChange={(e) => setForm({ ...form, manifestId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:border-[#0f4d8a] focus:ring-2 focus:ring-[#0f4d8a] focus:ring-opacity-20 transition-all outline-none"
                  placeholder="Brief description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            {/* JSON Data Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Manifest Data (JSON Format)
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-800 focus:border-[#0f4d8a] focus:ring-2 focus:ring-[#0f4d8a] focus:ring-opacity-20 transition-all outline-none resize-none"
                placeholder='{"packages": ["TRK001", "TRK002"], "shipDate": "2024-11-21"}'
                rows={6}
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Enter valid JSON data for the manifest</p>
            </div>

            {/* Message Alert */}
            {msg && (
              <div className={`flex items-start gap-3 p-4 rounded-lg ${
                msgType === "success" 
                  ? "bg-green-50 border-2 border-green-200" 
                  : "bg-red-50 border-2 border-red-200"
              }`}>
                {msgType === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <span className={`text-sm font-medium ${
                  msgType === "success" ? "text-green-800" : "text-red-800"
                }`}>
                  {msg}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E67919] to-[#d46a0f] text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Save Manifest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            All manifest data is securely stored and validated
          </p>
        </div>
      </div>
    </div>
  );
}