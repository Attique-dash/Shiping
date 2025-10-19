"use client";

import { useState } from "react";
import Modal from "./Modal";

export default function AddForm() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const payload: Record<string, unknown> = {
      tracking_number: String(data.get("tracking_number") || "").trim(),
      user_code: String(data.get("user_code") || "").trim(),
    };
    const weight = String(data.get("weight") || "").trim();
    const description = String(data.get("description") || "").trim();
    const branch = String(data.get("branch") || "").trim();
    if (weight) payload["weight"] = Number(weight);
    if (description) payload["description"] = description;
    if (branch) payload["branch"] = branch;

    if (!payload["tracking_number"] || !payload["user_code"]) {
      alert("tracking_number and user_code are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(`Create failed: ${j.error || res.statusText}`);
        return;
      }
      alert("Package created.");
      setOpen(false);
      form.reset();
      location.reload();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md bg-[#0f4d8a] px-3 py-2 text-sm font-medium text-white hover:bg-[#0e447d]">
        Add Package
      </button>
      <Modal open={open} title="Add Package" onClose={() => setOpen(false)}
        footer={(
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md border px-3 py-2 text-sm">Cancel</button>
            <button form="add-pkg-form" type="submit" disabled={submitting} className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-50">
              {submitting ? "Saving..." : "Save"}
            </button>
          </>
        )}
      >
        <form id="add-pkg-form" onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
          <div className="flex flex-col col-span-2">
            <label className="text-xs text-gray-600">Tracking #</label>
            <input name="tracking_number" required className="rounded-md border px-3 py-2 text-sm" placeholder="TRK123" />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-xs text-gray-600">User Code</label>
            <input name="user_code" required className="rounded-md border px-3 py-2 text-sm" placeholder="CUS123" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Weight (kg)</label>
            <input name="weight" type="number" step="0.01" className="rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Branch</label>
            <input name="branch" className="rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-xs text-gray-600">Description</label>
            <input name="description" className="rounded-md border px-3 py-2 text-sm" />
          </div>
        </form>
      </Modal>
    </>
  );
}
