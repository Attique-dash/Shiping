"use client";

import { Loader2 } from "lucide-react";

interface AdminLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function AdminLoading({ message = "Loading...", fullScreen = false }: AdminLoadingProps) {
  const containerClass = fullScreen
    ? "flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/20"
    : "flex items-center justify-center py-20";

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#0f4d8a] opacity-20"></div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0f4d8a] to-[#0e447d] shadow-lg">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-700">{message}</p>
          <p className="mt-1 text-sm text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    </div>
  );
}

