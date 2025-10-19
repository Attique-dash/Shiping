"use client";

import { useEffect, useMemo, useState } from "react";

type Payment = {
  _id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  gatewayId?: string;
  reference?: string;
  trackingNumber?: string;
  createdAt?: string;
};

type CustomerBill = {
  amount_due: number;
  currency?: string;
};

export default function CustomerPaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Card panel
  const [form, setForm] = useState({ amount: "", currency: "USD", method: "visa", reference: "", tracking_number: "", cardNumber: "", cardholder: "", exp: "", cvc: "" });
  // Billing panel
  const [billing, setBilling] = useState({ fullName: "", address: "", city: "", state: "", zip: "", sameAsShipping: true });
  // Bills (to compute due)
  const [bills, setBills] = useState<CustomerBill[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/payments", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load payments");
      setItems(Array.isArray(data?.payments) ? data.payments : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(() => {
      load();
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Load bills to compute outstanding amount
  useEffect(() => {
    fetch("/api/customer/bills", { cache: "no-store" })
      .then(async (r) => {
        const d: { bills?: CustomerBill[]; error?: string } = await r.json();
        if (!r.ok) throw new Error(d?.error || "Failed to load bills");
        const list: CustomerBill[] = Array.isArray(d?.bills) ? d.bills : [];
        setBills(list.map((b) => ({ amount_due: Number(b.amount_due) || 0, currency: b.currency || "USD" })));
        const total = list.reduce((s: number, b) => s + (Number(b.amount_due) || 0), 0);
        // Pre-fill amount
        const detectedCurrency = list.find((b) => Boolean(b.currency))?.currency;
        setForm((f) => ({ ...f, amount: total ? String(total) : f.amount, currency: detectedCurrency || f.currency }));
      })
      .catch(() => {});
  }, []);

  const totalDue = useMemo(() => bills.reduce((s, b) => s + (Number(b.amount_due) || 0), 0), [bills]);
  const ccy = useMemo(() => bills.find((b) => b.currency)?.currency || form.currency || "USD", [bills, form.currency]);

  function validateCardNumber(number: string): boolean {
    const digits = (number || "").replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]!, 10);
      if (Number.isNaN(digit)) return false;
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  function validateExpiry(exp: string): boolean {
    const match = (exp || "").match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1]!, 10);
    const year = parseInt("20" + match[2], 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const startOfMonthAfterNow = new Date(now.getFullYear(), now.getMonth(), 1);
    const expDate = new Date(year, month - 1, 1);
    return expDate >= startOfMonthAfterNow;
  }

  function validateCVC(cvc: string): boolean {
    return /^\d{3,4}$/.test(cvc || "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.method === "visa" || form.method === "mastercard" || form.method === "amex") {
      if (!validateCardNumber(form.cardNumber)) {
        setError("Invalid card number");
        return;
      }
      if (!validateExpiry(form.exp)) {
        setError("Invalid or expired card");
        return;
      }
      if (!validateCVC(form.cvc)) {
        setError("Invalid CVC");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/customer/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(form.amount || totalDue || 0),
          currency: ccy,
          method: form.method,
          reference: form.reference || undefined,
          tracking_number: form.tracking_number || undefined,
          billing,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Payment failed");
      setForm({ amount: "", currency: ccy, method: "visa", reference: "", tracking_number: "", cardNumber: "", cardholder: "", exp: "", cvc: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Complete Your Payment</h1>
      </div>

      {/* Three columns */}
      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-3">
        {/* Order Summary */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Order Summary</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Outstanding Invoices</span>
              <span className="font-medium">{totalDue.toLocaleString(undefined, { style: "currency", currency: ccy })}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Shipping Fees</span>
              <span className="font-medium">{(0).toLocaleString(undefined, { style: "currency", currency: ccy })}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Taxes</span>
              <span className="font-medium">{(0).toLocaleString(undefined, { style: "currency", currency: ccy })}</span>
            </li>
          </ul>
          <div className="mt-4 border-t pt-3 text-sm">
            TOTAL AMOUNT DUE: <span className="font-semibold">{Number(form.amount || totalDue || 0).toLocaleString(undefined, { style: "currency", currency: ccy })}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Payment</div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-700">Method</label>
              <select className="rounded-md border px-3 py-2" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">AmEx</option>
                <option value="bank">Bank</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>
            <input className="w-full rounded-md border px-3 py-2" placeholder="Card Number" value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} inputMode="numeric" />
            <input className="w-full rounded-md border px-3 py-2" placeholder="Cardholder Name" value={form.cardholder} onChange={(e) => setForm({ ...form, cardholder: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-md border px-3 py-2" placeholder="Expiration (MM/YY)" value={form.exp} onChange={(e) => setForm({ ...form, exp: e.target.value })} />
              <input className="rounded-md border px-3 py-2" placeholder="CVC" value={form.cvc} onChange={(e) => setForm({ ...form, cvc: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-md border px-3 py-2" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <select className="rounded-md border px-3 py-2" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <input className="w-full rounded-md border px-3 py-2" placeholder="Reference (optional)" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            <input className="w-full rounded-md border px-3 py-2" placeholder="Tracking Number (optional)" value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} />
            <button disabled={saving} className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Processing..." : "Process Payment"}</button>
          </div>
        </div>

        {/* Billing info */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Billing Information</div>
          <div className="space-y-3">
            <input className="w-full rounded-md border px-3 py-2" placeholder="Full Name" value={billing.fullName} onChange={(e) => setBilling({ ...billing, fullName: e.target.value })} />
            <input className="w-full rounded-md border px-3 py-2" placeholder="Address" value={billing.address} onChange={(e) => setBilling({ ...billing, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-md border px-3 py-2" placeholder="City" value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} />
              <input className="rounded-md border px-3 py-2" placeholder="State/Province" value={billing.state} onChange={(e) => setBilling({ ...billing, state: e.target.value })} />
            </div>
            <input className="w-full rounded-md border px-3 py-2" placeholder="ZIP/Postal Code" value={billing.zip} onChange={(e) => setBilling({ ...billing, zip: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={billing.sameAsShipping} onChange={(e) => setBilling({ ...billing, sameAsShipping: e.target.checked })} />
              Same as shipping address
            </label>
          </div>
        </div>
      </form>

      {/* History table */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Currency</th>
              <th className="px-3 py-2 text-left">Method</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Gateway ID</th>
              <th className="px-3 py-2 text-left">Reference</th>
              <th className="px-3 py-2 text-left">Tracking</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-4" colSpan={8}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-3 py-4" colSpan={8}>No payments</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p._id}>
                  <td className="px-3 py-2">{p.amount.toFixed(2)}</td>
                  <td className="px-3 py-2">{p.currency}</td>
                  <td className="px-3 py-2 uppercase">{p.method}</td>
                  <td className="px-3 py-2 capitalize">{p.status}</td>
                  <td className="px-3 py-2">{p.gatewayId || '-'}</td>
                  <td className="px-3 py-2">{p.reference || '-'}</td>
                  <td className="px-3 py-2">{p.trackingNumber || '-'}</td>
                  <td className="px-3 py-2">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
