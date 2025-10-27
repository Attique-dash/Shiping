"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const tracking = params.get("tracking") || "";

  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // If already authenticated, bounce out of login immediately
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) {
          const role = d.user.role as string | undefined;
          if (role === "admin") window.location.replace("/admin");
          else if (role === "warehouse") window.location.replace("/warehouse");
          else window.location.replace("/dashboard");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (error) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(t);
    }
  }, [error]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Login failed");

      const role = data?.user?.role as string | undefined;
      if (role === "admin") {
        window.location.assign("/admin");
      } else if (role === "warehouse") {
        window.location.assign("/warehouse");
      } else {
        const to = redirect && redirect !== "/" ? redirect : "/dashboard";
        const url = tracking ? `${to}?tracking=${encodeURIComponent(tracking)}` : to;
        window.location.assign(url);
      }
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
        <div className="fixed left-1/2 top-4 z-[80] -translate-x-1/2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {error}
        </div>
      )}

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 md:py-20">
        <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-0 overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/5 sm:max-w-3xl md:max-w-5xl md:grid-cols-2">
          {/* Left: illustrative image */}
          <div className="hidden md:block relative bg-white h-full">
            <div className="relative h-48 sm:h-56 md:h-full overflow-hidden">
              <Image src="/images/auth.png" alt="Authentication" fill priority className="object-cover" />
            </div>
          </div>

          {/* Right: form */}
          <div className="border-t md:border-t-0 md:border-l border-orange-200 bg-white px-6 py-8">
            <div className="mx-auto w-full max-w-sm">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0E7893]">Welcome Back!</h1>
              <p className="mt-1 text-sm text-[#E67919]">Please enter your details to sign in.</p>
              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                <input
                  className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <input
                  className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919]"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                  />
                  Remember me
                  <a href="#" className="ml-auto text-[#0E7893] hover:underline">Forgot Password?</a>
                </label>
                <button
                  disabled={loading}
                  className="w-full rounded-md cursor-pointer bg-[#E67919] py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-[#0E7893] disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "LOGIN"}
                </button>
              </form>
              <div className="mt-4 text-center text-sm text-gray-700">
                Don&apos;t have your account? <Link href="/register" className="text-[#0E7893] hover:underline">Register now</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
