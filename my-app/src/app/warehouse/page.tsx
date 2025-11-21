"use client";

import Link from "next/link";
import { User, Package, FileText, Users } from "lucide-react";

export default function WarehouseDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#0f4d8a] to-[#0a3d6e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#E67919] rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Warehouse Dashboard</h1>
          </div>
          <p className="text-blue-100 text-lg">Quick access to core warehouse operations and management tools.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard label="Active Packages" value="1,234" color="blue" />
          <StatCard label="Pending Manifests" value="45" color="orange" />
          <StatCard label="Total Customers" value="892" color="blue" />
          <StatCard label="Today's Shipments" value="67" color="orange" />
        </div>

        {/* Action Cards */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ActionCard 
            title="Account" 
            href="/warehouse/account" 
            desc="View and edit your profile, branch, and password."
            icon={<User className="w-6 h-6" />}
            color="blue"
          />
          <ActionCard 
            title="Packages" 
            href="/warehouse/packages" 
            desc="Add, update, or delete packages."
            icon={<Package className="w-6 h-6" />}
            color="orange"
          />
          <ActionCard 
            title="Manifests" 
            href="/warehouse/manifests" 
            desc="Create or update shipment manifests."
            icon={<FileText className="w-6 h-6" />}
            color="blue"
          />
          <ActionCard 
            title="Customers" 
            href="/warehouse/customers" 
            desc="Search customers and manage records."
            icon={<Users className="w-6 h-6" />}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "blue" | "orange" }) {
  const bgColor = color === "blue" ? "bg-[#0f4d8a]" : "bg-[#E67919]";
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center bg-opacity-10`}>
          <div className={`w-2 h-2 ${bgColor} rounded-full`}></div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ 
  title, 
  desc, 
  href, 
  icon, 
  color 
}: { 
  title: string; 
  desc: string; 
  href: string; 
  icon: React.ReactNode;
  color: "blue" | "orange";
}) {
  const iconBgColor = color === "blue" ? "bg-[#0f4d8a]" : "bg-[#E67919]";
  const hoverBorderColor = color === "blue" ? "hover:border-[#0f4d8a]" : "hover:border-[#E67919]";
  const hoverShadowColor = color === "blue" ? "hover:shadow-[#0f4d8a]/20" : "hover:shadow-[#E67919]/20";
  
  return (
    <Link 
      href={href} 
      className={`group block rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg ${hoverBorderColor} ${hoverShadowColor} hover:-translate-y-1`}
    >
      <div className="flex items-start gap-4">
        <div className={`${iconBgColor} rounded-lg p-3 text-white transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#0f4d8a] transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
        </div>
      </div>
      
      {/* Hover Arrow Indicator */}
      <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-[#0f4d8a] transition-colors">
        <span>Access now</span>
        <svg 
          className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}