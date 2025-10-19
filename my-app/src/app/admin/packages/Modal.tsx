"use client";

import React from "react";

export default function Modal({ open, title, onClose, children, footer }: { open: boolean; title?: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-medium text-gray-800">{title}</div>
          <button onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100">✕</button>
        </div>
        <div className="p-4">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2 border-t px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}
