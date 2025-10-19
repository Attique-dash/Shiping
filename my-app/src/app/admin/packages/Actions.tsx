"use client";

import { useState } from "react";
import Modal from "./Modal";

type UpdatePayload = {
  id: string;
  status?: string;
  weight?: number;
  description?: string;
  branch?: string;
  length?: number;
  width?: number;
  height?: number;
};

type Props = {
  id: string;
  trackingNumber: string;
  status?: string;
  weight?: number;
  description?: string;
  branch?: string;
  length?: number;
  width?: number;
  height?: number;
};

export default function Actions(props: Props) {
  const { id, trackingNumber } = props;
  const [loading, setLoading] = useState<null | "edit" | "delete">(null);
  const [open, setOpen] = useState(false);

  const [status, setStatus] = useState<string>(props.status || "");
  const [weight, setWeight] = useState<string>(props.weight != null ? String(props.weight) : "");
  const [description, setDescription] = useState<string>(props.description || "");
  const [branch, setBranch] = useState<string>(props.branch || "");
  const [length, setLength] = useState<string>(props.length != null ? String(props.length) : "");
  const [width, setWidth] = useState<string>(props.width != null ? String(props.width) : "");
  const [height, setHeight] = useState<string>(props.height != null ? String(props.height) : "");

  async function submitEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload: UpdatePayload = { id };
    if (status.trim()) payload.status = status.trim();
    if (weight.trim()) payload.weight = Number(weight);
    if (description.trim()) payload.description = description.trim();
    if (branch.trim()) payload.branch = branch.trim();
    if (length.trim()) payload.length = Number(length);
    if (width.trim()) payload.width = Number(width);
    if (height.trim()) payload.height = Number(height);

    if (Object.keys(payload).length <= 1) {
      setOpen(false);
      return; // nothing to update
    }

    setLoading("edit");
    try {
      const res = await fetch("/api/admin/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(`Update failed: ${j.error || res.statusText}`);
        return;
      }
      alert("Package updated.");
      location.reload();
    } finally {
      setLoading(null);
      setOpen(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(`Permanently delete package ${trackingNumber}? This action cannot be undone.`)) return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/packages?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(`Delete failed: ${j.error || res.statusText}`);
        return;
      }
      alert("Package deleted.");
      location.reload();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setOpen(true)} disabled={loading !== null} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">
        Edit
      </button>
      <button onClick={onDelete} disabled={loading !== null} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">
        {loading === "delete" ? "Deleting..." : "Delete"}
      </button>

      <Modal open={open} title={`Edit ${trackingNumber}`} onClose={() => setOpen(false)}
        footer={(
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md border px-3 py-2 text-sm">Cancel</button>
            <button form={`edit-${id}`} type="submit" disabled={loading === "edit"} className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-50">
              {loading === "edit" ? "Saving..." : "Save"}
            </button>
          </>
        )}
      >
        <form id={`edit-${id}`} onSubmit={submitEdit} className="grid grid-cols-2 gap-3">
          <div className="flex flex-col col-span-2">
            <label className="text-xs text-gray-600">Status</label>
            <input value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border px-3 py-2 text-sm" placeholder="At Warehouse / In Transit / Delivered" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Weight (kg)</label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.01" className="rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Branch</label>
            <input value={branch} onChange={(e) => setBranch(e.target.value)} className="rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-xs text-gray-600">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Length (cm)</label>
            <input value={length} onChange={(e) => setLength(e.target.value)} type="number" step="1" className="rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Width (cm)</label>
            <input value={width} onChange={(e) => setWidth(e.target.value)} type="number" step="1" className="rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Height (cm)</label>
            <input value={height} onChange={(e) => setHeight(e.target.value)} type="number" step="1" className="rounded-md border px-3 py-2 text-sm" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
