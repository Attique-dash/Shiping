"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
  Home,
  Package,
  FileText,
  CreditCard,
  MessageSquare,
  Bell,
  Archive,
  User,
  Menu,
  X,
  ChevronRight,
  UserCog,
  Mail,
  LogOut
} from "lucide-react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Customer dashboard overview",
      color: "from-blue-500 to-blue-600",
    },
    {
      href: "/customer/profile",
      label: "Profile",
      icon: User,
      description: "View and update your profile",
      color: "from-green-500 to-green-600",
    },
    {
      href: "/customer/packages",
      label: "Packages",
      icon: Package,
      description: "View and track your packages",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      href: "/customer/bills",
      label: "Bills",
      icon: FileText,
      description: "View and manage your bills",
      color: "from-pink-500 to-pink-600",
    },
    {
      href: "/customer/payments",
      label: "Payments",
      icon: CreditCard,
      description: "Make and track payments",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      href: "/customer/messages",
      label: "Messages",
      icon: MessageSquare,
      description: "View and send messages",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      href: "/customer/contact",
      label: "Contact Us",
      icon: Mail,
      description: "Get in touch with support",
      color: "from-orange-500 to-orange-600",
    },
    {
      href: "/customer/pre-alerts",
      label: "Pre-Alerts",
      icon: Bell,
      description: "Manage your shipment notifications",
      color: "from-red-500 to-red-600",
    },
    {
      href: "/customer/archives",
      label: "Archives",
      icon: Archive,
      description: "View archived items",
      color: "from-gray-500 to-gray-600",
    },
  ];

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <div className="h-screen w-full overflow-x-hidden bg-gray-50 text-gray-900">
      <div className="flex h-full w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 h-screen bg-gradient-to-b from-[#0f4d8a] via-[#0e447d] to-[#0d3d70] text-white shadow-2xl overflow-hidden flex-col">
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
                  Customer Portal
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
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
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer with Logout button */}
          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="relative flex-1 h-full overflow-y-auto bg-gray-50">
          {/* Mobile header */}
          <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur lg:hidden">
            <div className="relative flex items-center justify-between px-3 py-2">
              <div className="flex items-center">
                <Image src="/images/Logo.png" alt="Clean J Shipping" width={70} height={36} />
              </div>
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-900">
                Clean J Shipping
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
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute left-0 top-0 h-full w-72 transform bg-gradient-to-b from-[#0f4d8a] via-[#0e447d] to-[#0d3d70] text-white shadow-2xl flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 backdrop-blur-sm">
                      <Image src="/images/Logo.png" alt="Clean J Shipping" width={36} height={36} />
                    </div>
                    <div className="text-sm font-semibold">Customer Portal</div>
                  </div>
                  <button
                    aria-label="Close sidebar"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 ring-white/20 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="flex-1 space-y-1 p-4 overflow-y-auto pr-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-white/15 text-white shadow-lg backdrop-blur-sm"
                            : "text-blue-100 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} shadow-md`}>
                          <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-white/10 p-4">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
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