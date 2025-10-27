"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/app/stores/auth.store";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonUrl?: string;
  backButtonText?: string;
}

const LogoutButton = ({ onClick, className }: { onClick: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors text-sm ${className}`}
  >
    ABMELDEN
  </button>
);

export default function DashboardHeader({
  title,
  subtitle,
  showBackButton = false,
  backButtonUrl = "/admin",
  backButtonText = "← Zurück zum Dashboard",
}: DashboardHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fullName = useMemo(() => {
    if (!user) return "User";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/school_logo.png"
                alt="School Logo"
                width={120}
                height={50}
                priority
                className="h-10 w-auto"
              />
              <span className="hidden sm:inline text-lg font-bold text-gray-900">
                School Management
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop user info & logout */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <LogoutButton onClick={handleLogout} />
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              <div className="pb-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
              </div>
              <LogoutButton onClick={handleLogout} className="w-full" />
            </div>
          </div>
        )}
      </nav>

      {/* Page Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              {showBackButton && (
                <Link
                  href={backButtonUrl}
                  className="text-sm text-gray-600 hover:text-black mb-2 inline-flex items-center group"
                >
                  <svg
                    className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {backButtonText}
                </Link>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>

            {/* Desktop logout button (optional) */}
            {/* {!showBackButton && <LogoutButton onClick={handleLogout} className="hidden sm:block self-start sm:self-center" />} */}
          </div>
        </div>
      </header>
    </>
  );
}
