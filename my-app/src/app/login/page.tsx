"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data: any = null;
      const ct = res.headers.get("content-type") || "";
      try {
        data = ct.includes("application/json") ? await res.json() : await res.text();
      } catch {
        data = null;
      }
      if (!res.ok) {
        const msg = typeof data === "string" && data ? data : data?.error || data?.message || "Login failed";
        throw new Error(msg);
      }
      router.push(redirect);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[80vh] grid place-items-center overflow-hidden bg-[radial-gradient(1200px_500px_at_50%_-10%,#172437_0%,#0d1623_60%,#0b1320_100%)]">
      <div className="absolute inset-0 bg-[url('/city-blur.png')] bg-cover bg-center opacity-20" aria-hidden></div>
      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,.35)]">
          {/* Left logo panel */}
          <div className="hidden md:flex flex-col items-center justify-center gap-4 p-10 text-white bg-gradient-to-br from-white/5 to-white/0">
            <img src="/logo.svg" alt="Tasoko" className="h-20 w-20 drop-shadow-[0_0_12px_#29d3ff]" />
            <div className="text-center">
              <div className="text-2xl font-semibold tracking-wide">TASOKO</div>
              <div className="text-sm uppercase tracking-widest text-[#7ee3ff]">Courier</div>
            </div>
          </div>

          {/* Right form card */}
          <div className="p-8 md:p-10 text-white">
            <div className="mx-auto w-full max-w-sm">
              <h1 className="mb-6 text-center text-2xl font-semibold">Customer Login</h1>
              <div className="rounded-xl border border-[#29d3ff]/40 bg-white/5 p-5 shadow-inner">
                <form onSubmit={onSubmit} className="space-y-3">
                  <input
                    className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none placeholder:text-white/70 focus:ring-2 focus:ring-[#29d3ff]"
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <input
                    className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none placeholder:text-white/70 focus:ring-2 focus:ring-[#29d3ff]"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    disabled={loading}
                    className="w-full rounded-md bg-[#29d3ff] px-4 py-2 font-semibold text-black hover:bg-[#12c6f7] disabled:opacity-50"
                  >
                    {loading ? "Signing in..." : "Log In"}
                  </button>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <a href="#" className="hover:underline">Forgot Password?</a>
                    <a href="/register" className="hover:underline">Sign Up</a>
                  </div>
                </form>
              </div>
              {message && <p className="mt-3 text-center text-sm text-red-300">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
