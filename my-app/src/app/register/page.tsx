"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    password: "",
    confirmPassword: "",
    adress: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ type: "error" | "success"; msg: string } | null>(null);

  function validate(): string | null {
    if (!/^\d{11}$/.test(form.phoneNo)) return "Phone number must be exactly 11 digits";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!form.agree) return "You must agree to Terms & Privacy";
    return null;
  }

  useEffect(() => {
    if (error) {
      setShowToast({ type: "error", msg: error });
      const t = setTimeout(() => setShowToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      setShowToast({ type: "success", msg: success });
      const t = setTimeout(() => setShowToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [success]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) {
      setLoading(false);
      setError(v);
      return;
    }
    try {
      // Send alternative schema that backend supports
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNo: form.phoneNo.trim(),
        password: form.password,
        adress: form.adress.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip_code: form.zip_code.trim(),
        country: form.country.trim(),
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Registration failed");
      setSuccess("Registration successful. You can now login.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#FAF4ED] flex items-center"
      style={{ backgroundImage: "url('/images/airplane.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
    >
      {/* Toast top-center */}
      {showToast && (
        <div className={`fixed left-1/2 top-4 z-[80] -translate-x-1/2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-lg ${showToast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {showToast.msg}
        </div>
      )}

                <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 md:py-10">
<div className="mx-auto grid w-full grid-cols-1 items-stretch gap-0 overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/5 sm:max-w-3xl md:max-w-6xl lg:max-w-7xl md:grid-cols-7">
{/* Left: illustrative image */}
  <div className="hidden md:block relative bg-white md:col-span-3 h-full">
    <div className="relative h-48 sm:h-56 md:h-full overflow-hidden">
    <Image
        src="/images/auth.png"
        alt="Authentication"
        fill
        priority
        className="object-cover"
      />
  </div>
</div>


          {/* Right: form */}
  <div className="border-t md:border-t-0 md:border-l border-orange-200 bg-white px-6 py-6 md:col-span-4">
            <div className="mx-auto w-full">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0E7893]">Create your account</h1>
              <p className="mt-1 text-sm text-[#E67919]">Fill in your details to get started.</p>
              <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-x-5 lg:gap-x-6">
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              placeholder="Address"
              value={form.adress}
              onChange={(e) => setForm({ ...form, adress: e.target.value })}
              required
            />
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              placeholder="Phone Number"
              value={form.phoneNo}
              onChange={(e) => setForm({ ...form, phoneNo: e.target.value })}
              required
            />
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              placeholder="State / Province"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
            />
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              placeholder="Zip / Postal Code"
              value={form.zip_code}
              onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
              required
            />
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
            <input
              className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              required
            />

            <label className="col-span-1 md:col-span-2 lg:col-span-3 mt-2 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => setForm({ ...form, agree: e.target.checked })}
              />
              I agree to the Terms & Conditions and Privacy Policy
            </label>

            {error && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
            )}
            {success && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">{success}</div>
            )}

            <button
              disabled={loading}
              className="col-span-1 cursor-pointer md:col-span-2 lg:col-span-3 mt-2 w-full rounded-md bg-[#E67919] py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-[#0E7893] disabled:opacity-60"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-700">
            Already have an account? <Link href="/login" className="text-[#0E7893] hover:underline">Log in</Link>
          </div>
        </div>
      </div>
      {/* end grid */}
    </div>
  </div>
  </div>
  );
}
