"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { AdminLoading } from "@/components/admin/AdminLoading";
import SharedModal from "@/components/admin/SharedModal";
import AddButton from "@/components/admin/AddButton";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import countryList from "react-select-country-list";
import CountryFlag from "react-country-flag";
import { components, SingleValueProps, OptionProps } from "react-select";

type CountryOption = { value: string; label: string };

type Customer = {
  _id: string;
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  branch?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  status?: string;
  emailVerified?: boolean;
  accountType?: string;
  serviceTypeIDs?: string[];
  createdAt?: string;
};

type ApiCustomer = {
  customer_id: string;
  full_name?: string;
  email: string;
  userCode?: string;
  address?: { street?: string; city?: string; state?: string; zip_code?: string; country?: string };
  phone?: string;
  branch?: string;
  serviceTypeIDs?: string[];
  email_verified?: boolean;
  account_status?: string;
  account_type?: string;
  member_since?: string;
};

export default function CustomersPageClient() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "active" | "inactive">("all");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showMessage, setShowMessage] = useState<{ userCode: string; name: string } | null>(null);
  const [messageForm, setMessageForm] = useState({ subject: "", body: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; customer: Customer | null }>({ open: false, customer: null });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "JM",
    status: "Active",
    emailVerified: "Yes",
    accountType: "Basic",
    branch: "",
    serviceTypeIDs: "",
  });

  const countryOptions: CountryOption[] = useMemo(() => countryList().getData() as CountryOption[], []);
  const ReactSelect = useMemo(() => dynamic(() => import("react-select"), { ssr: false }) as unknown as React.ComponentType<any>, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.customers)
        ? (data.customers as ApiCustomer[]).map((it) => {
            const name: string = it.full_name || "";
            const parts = String(name).trim().split(/\s+/);
            const lastName = parts.length > 1 ? String(parts.pop()) : "";
            const firstName = parts.join(" ");
            return {
              _id: it.customer_id,
              userCode: it.userCode || "",
              firstName,
              lastName,
              email: it.email,
              phone: it.phone || "",
              branch: it.branch || it.address?.city || "",
              street: it.address?.street || "",
              city: it.address?.city || "",
              state: it.address?.state || "",
              zip: it.address?.zip_code || "",
              country: it.address?.country || "",
              status: it.account_status || "active",
              emailVerified: Boolean(it.email_verified),
              accountType: it.account_type || "Basic",
              serviceTypeIDs: it.serviceTypeIDs || [],
              createdAt: it.member_since,
            } as Customer;
          })
        : [];
      setItems(arr);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      status: "Active",
      emailVerified: "Yes",
      branch: "",
      serviceTypeIDs: "",
    });
    setShowForm(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setForm({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone || "",
      password: "",
      street: c.street || "",
      city: c.city || "",
      state: c.state || "",
      zip: c.zip || "",
      country: c.country || "",
      status: c.status || "Active",
      emailVerified: (c.emailVerified ? "Yes" : "No") as "Yes" | "No",
      branch: c.branch || "",
      serviceTypeIDs: (c.serviceTypeIDs || []).join(","),
    });
    setShowForm(true);
  }

  const filtered = items.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.userCode.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
    );
  });

  const filteredByStatus = filtered
    .filter((c) => {
      if (statusFilter === "verified") return Boolean(c.emailVerified);
      if (statusFilter === "pending") return !c.emailVerified;
      return true;
    })
    .filter((c) => {
      if (typeFilter === "active") return (c.status || "active").toLowerCase() === "active";
      if (typeFilter === "inactive") return (c.status || "active").toLowerCase() === "inactive";
      return true;
    });

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const body: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      branch: form.branch || undefined,
      address: {
        street: form.street || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zip: form.zip || undefined,
        country: form.country || undefined,
      },
      status: form.status,
      emailVerified: form.emailVerified === "Yes",
      serviceTypeIDs: form.serviceTypeIDs
        ? form.serviceTypeIDs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    };
    if (!editing) body.password = form.password;
    if (editing) {
      body.id = editing._id;
      if (form.password) body.password = form.password;
    }
    const res = await fetch("/api/admin/customers", {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data?.error || data?.message || "Request failed";
      if (typeof errorMsg === 'object' && errorMsg.fieldErrors) {
        alert(`Validation error: ${JSON.stringify(errorMsg.fieldErrors)}`);
      } else {
        alert(errorMsg);
      }
      return;
    }
    setShowForm(false);
    await load();
  }

  function openDelete(c: Customer) {
    setDeleteConfirm({ open: true, customer: c });
  }

  async function deleteItem() {
    if (!deleteConfirm.customer) return;
    const id = deleteConfirm.customer._id;
    const res = await fetch("/api/admin/customers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Delete failed");
      return;
    }
    setDeleteConfirm({ open: false, customer: null });
    await load();
  }

  const stats = {
    total: items.length,
    verified: items.filter((c) => c.emailVerified).length,
    active: items.filter((c) => (c.status || "active").toLowerCase() === "active").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <header className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-[#0f4d8a] via-[#0e447d] to-[#0d3d70] p-6 text-white shadow-2xl mb-8">
  <div className="absolute inset-0 bg-white/10" />

  <div className="relative flex flex-col gap-6">
    
    {/* Top Row */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
          Customer Management
        </h1>
        <p className="mt-1 text-sm text-blue-100">
          Manage and monitor all your customers
        </p>
      </div>

      {/* Add Customer Button */}
      <AddButton onClick={openAdd} label="Add Customer" className="bg-white/15 text-white hover:bg-white/25" />
    </div>

    {/* Stats Cards inside header */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {/* Total Customers */}
      <div className="group relative overflow-hidden rounded-xl bg-white/10 p-5 shadow-md backdrop-blur">
        <div className="relative flex items-center gap-4">
          <div className="rounded-lg bg-white/20 p-3">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-blue-100">Total Customers</p>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Verified */}
      <div className="group relative overflow-hidden rounded-xl bg-green-500/20 p-5 shadow-md backdrop-blur">
        <div className="relative flex items-center gap-4">
          <div className="rounded-lg bg-white/20 p-3">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-green-100">Verified</p>
            <p className="mt-1 text-2xl font-bold">{stats.verified}</p>
          </div>
        </div>
      </div>

      {/* Active */}
      <div className="group relative overflow-hidden rounded-xl bg-orange-500/20 p-5 shadow-md backdrop-blur">
        <div className="relative flex items-center gap-4">
          <div className="rounded-lg bg-white/20 p-3">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-orange-100">Active</p>
            <p className="mt-1 text-2xl font-bold">{stats.active}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</header>


        {/* Search and Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                placeholder="Search by name, email, or user code..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "verified" | "pending")}
                >
                  <option value="all">All</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value.toLowerCase() as "all" | "active" | "inactive")}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Customer Cards */}
        <div className="grid gap-4 lg:grid-cols-2">
          {loading ? (
            <div className="lg:col-span-2">
              <AdminLoading message="Loading customers..." />
            </div>
          ) : filteredByStatus.length === 0 ? (
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-12 text-center shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900">No customers found</p>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredByStatus.map((c) => {
              const name = `${c.firstName} ${c.lastName}`.trim();
              const verified = Boolean(c.emailVerified);
              const isActive = (c.status || "active").toLowerCase() === "active";
              const memberSince = c.createdAt
                ? new Date(c.createdAt).toLocaleString("default", { month: "short", year: "numeric" })
                : undefined;

              return (
                <div
                  key={c._id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-xl hover:border-[#0f4d8a]/30"
                >
                  <div
                    className={`absolute left-0 top-0 h-full w-1 ${
                      verified ? "bg-gradient-to-b from-green-400 to-green-600" : "bg-gradient-to-b from-yellow-400 to-yellow-600"
                    }`}
                  />

                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0f4d8a] to-[#E67919] text-white font-semibold">
                          {name ? name.charAt(0).toUpperCase() : c.userCode.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{name || c.userCode}</h3>
                          <p className="text-xs text-gray-500">ID: {c.userCode}</p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          verified
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        {verified ? (
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {verified ? "Verified" : "Pending"}
                      </span>
                    </div>

                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{c.email}</span>
                      </div>

                      {c.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {c.phone}
                        </div>
                      )}

                      {c.branch && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {c.branch}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                          <span className="text-xs text-gray-600">
                            {(c.status || "active").charAt(0).toUpperCase() + (c.status || "active").slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            {c.accountType || "Basic"}
                          </span>
                          {memberSince && <span className="text-xs text-gray-500">{memberSince}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f4d8a] bg-white px-3 py-1.5 text-xs font-medium text-[#0f4d8a] transition-all hover:bg-[#0f4d8a] hover:text-white"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setShowMessage({ userCode: c.userCode, name: `${c.firstName} ${c.lastName}`.trim() || c.userCode });
                          setMessageForm({ subject: "", body: "" });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E67919] bg-white px-3 py-1.5 text-xs font-medium text-[#E67919] transition-all hover:bg-[#E67919] hover:text-white"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Message
                      </button>

                      <button
                        onClick={() => openDelete(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-600 hover:text-white"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {showForm && (
        <SharedModal
          open={showForm}
          title={editing ? "Edit Customer" : "Add New Customer"}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    if (editing) openDelete(editing);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-600 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  Delete Customer
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  const formEl = document.querySelector('form');
                  if (formEl) {
                    formEl.requestSubmit();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0f4d8a] to-[#0f4d8a]/90 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editing ? "Update Customer" : "Create Customer"}
              </button>
            </>
          }
        >
          <form onSubmit={submitForm} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-[#0f4d8a]/10 p-1.5">
                    <svg className="h-4 w-4 text-[#0f4d8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Personal Details</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">First Name *</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="John"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Last Name *</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-700">Email *</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="john.doe@example.com"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-[#E67919]/10 p-1.5">
                    <svg className="h-4 w-4 text-[#E67919]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Address Information</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-700">Street</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="123 Main Street"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">City</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="New York"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">State</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="NY"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">ZIP Code</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="10001"
                      value={form.zip}
                      onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Country</label>
                    <ReactSelect
                      classNamePrefix="country"
                      options={countryOptions}
                      placeholder="Select country..."
                      isSearchable
                      value={countryOptions.find((o) => o.value === form.country) || null}
                      onChange={(opt: CountryOption | null) => setForm({ ...form, country: (opt?.value) || "JM" })}
                      components={{
                        Option: (props: OptionProps<CountryOption>) => (
                          <components.Option {...props}>
                            <div className="flex items-center gap-2">
                              <CountryFlag svg countryCode={props.data.value} style={{ width: 18, height: 12 }} />
                              <span>{props.data.label}</span>
                  </div>
                          </components.Option>
                        ),
                        SingleValue: (props: SingleValueProps<CountryOption>) => (
                          <components.SingleValue {...props}>
                            <div className="flex items-center gap-2">
                              <CountryFlag svg countryCode={props.data.value} style={{ width: 18, height: 12 }} />
                              <span>{props.data.label}</span>
                            </div>
                          </components.SingleValue>
                        ),
                      }}
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        control: (base) => ({
                          ...base,
                          minHeight: "38px",
                          borderColor: "#d1d5db",
                          "&:hover": { borderColor: "#0f4d8a" },
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-purple-100 p-1.5">
                    <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Account Settings</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Account Status</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Email Verified</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      value={form.emailVerified}
                      onChange={(e) => setForm({ ...form, emailVerified: e.target.value as "Yes" | "No" })}
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-green-100 p-1.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Additional Settings</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {!editing && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Password *</label>
                      <input
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                        placeholder="Enter password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  {editing && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">New Password (Optional)</label>
                      <input
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                        placeholder="Leave blank to keep current"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Branch</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="Branch name"
                      value={form.branch}
                      onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-700">Service Type IDs</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0f4d8a] focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]/20"
                      placeholder="service1, service2, service3"
                      value={form.serviceTypeIDs}
                      onChange={(e) => setForm({ ...form, serviceTypeIDs: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-gray-500">Comma-separated list of service type IDs</p>
                  </div>
                </div>
              </div>
            </form>
        </SharedModal>
      )}

      {/* Message Modal */}
      {showMessage && (
        <SharedModal
          open={!!showMessage}
          title="Send Message"
          onClose={() => setShowMessage(null)}
          footer={
            <>
                <button
                  type="button"
                onClick={() => setShowMessage(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                type="submit"
                form="message-form"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#E67919] to-[#E67919]/90 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                Send Message
                </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium text-gray-700">To: {showMessage.name}</p>
              <p className="text-xs text-gray-500">User Code: {showMessage.userCode}</p>
            </div>
            <form
              id="message-form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!showMessage.userCode || !messageForm.body.trim()) {
                  alert("User code and message body are required");
                  return;
                }
                const res = await fetch("/api/admin/messages", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: 'include',
                  body: JSON.stringify({
                    user_code: showMessage.userCode,
                    subject: messageForm.subject.trim() || undefined,
                    body: messageForm.body.trim(),
                  }),
                });
                const j = await res.json().catch(() => ({}));
                if (!res.ok) {
                  alert(j?.error || j?.message || "Failed to send message");
                  return;
                }
                alert("Message sent successfully!");
                setShowMessage(null);
                setMessageForm({ subject: "", body: "" });
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Subject (Optional)</label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#E67919] focus:outline-none focus:ring-2 focus:ring-[#E67919]/20"
                  placeholder="Message subject"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Message *</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#E67919] focus:outline-none focus:ring-2 focus:ring-[#E67919]/20 resize-none"
                  placeholder="Write your message here..."
                  rows={6}
                  value={messageForm.body}
                  onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
                  required
                />
              </div>
            </form>
          </div>
        </SharedModal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, customer: null })}
        onConfirm={deleteItem}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone and will permanently remove all associated data."
        itemName={deleteConfirm.customer ? `${deleteConfirm.customer.firstName} ${deleteConfirm.customer.lastName} (${deleteConfirm.customer.userCode})` : undefined}
      />
    </div>
  );
}