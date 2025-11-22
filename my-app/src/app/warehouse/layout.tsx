"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
  Home,
  Package,
  FileText,
  Plug,
  Users,
  ChevronRight,
  Menu,
  X,
  Search,
  Upload,
  
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      href: "/warehouse",
      label: "Dashboard",
      icon: Home,
      description: "Warehouse dashboard with analytics",
      color: "from-blue-500 to-blue-600",
    },
    {
      href: "/warehouse/packages",
      label: "Packages",
      icon: Package,
      description: "Manage warehouse packages",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      href: "/warehouse/search",
      label: "Search",
      icon: Search,
      description: "Advanced package search",
      color: "from-purple-500 to-purple-600",
    },
    {
      href: "/warehouse/bulk-upload",
      label: "Bulk Upload",
      icon: Upload,
      description: "Upload multiple packages",
      color: "from-green-500 to-green-600",
    },
    {
      href: "/warehouse/manifests",
      label: "Manifests",
      icon: FileText,
      description: "View and manage manifests",
      color: "from-pink-500 to-pink-600",
    },
    {
      href: "/warehouse/customers",
      label: "Customers",
      icon: Users,
      description: "Customer management",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      href: "/warehouse/integrations",
      label: "Integrations",
      icon: Plug,
      description: "API integrations",
      color: "from-orange-500 to-orange-600",
    },
    {
      href: "/warehouse/reports",
      label: "Report",
      icon: Plug,
      description: "API integrations",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="h-screen w-full overflow-x-hidden bg-gray-50 text-gray-900">
      <div className="flex h-full w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 h-screen bg-gradient-to-b from-[#0f4d8a] via-[#0e447d] to-[#0d3d70] text-white shadow-2xl overflow-hidden flex-col">
          {/* Header */}
          <div className="border-b border-white/10 bg-gradient-to-r from-[#0e447d] to-[#0c3a6b] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10 backdrop-blur-sm">
                <Image
                  src="/images/Logo.png"
                  alt="Clean J Shipping"
                  width={40}
                  height={40}
                  className="h-10 w-12 object-contain"
                />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight">
                  Clean J Shipping
                </div>
                <div className="text-xs text-amber-400 font-medium">
                  Warehouse Portal
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-white/10 overscroll-contain">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/warehouse"
                  ? pathname === "/warehouse"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white/15 text-white shadow-lg backdrop-blur-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                  title={item.description}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${
                      item.color
                    } shadow-md transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <>
                      <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-lg" />
                      <ChevronRight className="h-4 w-4 text-white" />
                    </>
                  )}
                  {!isActive && (
                    <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-white/10 p-4">
            <form action="/api/auth/logout" method="POST">
              <LogoutButton />
            </form>
          </div>
          <div className="mt-3 px-4 text-xs text-white/40">
            Powered by Tasoko
          </div>
        </aside>

        <div className="relative flex-1 h-full overflow-y-auto bg-gray-50">
          {/* Mobile header */}
          <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur md:hidden">
            <div className="relative flex items-center justify-between px-3 py-2">
              <div className="flex items-center">
                <Image
                  src="/images/Logo.png"
                  alt="Clean J Shipping"
                  width={70}
                  height={36}
                />
              </div>
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-900">
                Warehouse Portal
              </div>
              <button
                aria-label="Open sidebar"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md ring-1 ring-gray-200 hover:bg-gray-50"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute left-0 top-0 h-full w-72 transform bg-gradient-to-b from-[#0f4d8a] via-[#0e447d] to-[#0d3d70] text-white shadow-2xl transition-transform">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 backdrop-blur-sm">
                      <Image
                        src="/images/Logo.png"
                        alt="Clean J Shipping"
                        width={36}
                        height={36}
                      />
                    </div>
                    <div className="text-sm font-semibold">Warehouse Portal</div>
                  </div>
                  <button
                    aria-label="Close sidebar"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 ring-white/20 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="space-y-1 p-4 overflow-y-auto h-[calc(100vh-200px)] pr-2 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-white/10 overscroll-contain">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/warehouse"
                        ? pathname === "/warehouse"
                        : pathname === item.href ||
                          pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-white/15 text-white shadow-lg backdrop-blur-sm"
                            : "text-blue-100 hover:bg-white/10 hover:text-white"
                        }`}
                        title={item.description}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} shadow-md`}
                        >
                          <Icon
                            className="h-5 w-5 text-white"
                            strokeWidth={2.5}
                          />
                        </div>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-white/10 p-4">
                  <form action="/api/auth/logout" method="POST">
                    <LogoutButton />
                  </form>
                </div>
                <div className="mt-3 px-4 text-xs text-white/40">
                  Powered by Tasoko
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-full">
            <div className="mx-auto w-full max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}