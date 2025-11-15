// src/components/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out using NextAuth
      await signOut({
        redirect: false,
      });
      
      // Redirect to login page
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={className || "w-full rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"}
    >
      {isLoading ? "Logging out..." : (children || "Logout")}
    </button>
  );
}