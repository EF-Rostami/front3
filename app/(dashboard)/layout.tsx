"use client";

import React, { useState } from "react";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import DashboardHeader from "../components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const pathname = usePathname();

  // Sidebar links
  // const links = [
  //   { title: "Dashboard", href: "/dashboard", icon: "🏠" },
  //   { title: "Students", href: "/dashboard/students", icon: "👤" },
  //   { title: "Teachers", href: "/dashboard/teachers", icon: "👨‍🏫" },
  //   { title: "Classes", href: "/dashboard/classes", icon: "🏫" },
  //   { title: "Courses", href: "/dashboard/courses", icon: "📚" },
  //   { title: "Attendance", href: "/dashboard/attendance", icon: "🗓️" },
  //   { title: "Fees", href: "/dashboard/fees", icon: "💰" },
  //   { title: "Reports", href: "/dashboard/reports", icon: "📈" },
  // ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {/* <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 sm:static sm:flex-shrink-0`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200 font-bold text-lg">
          Dashboard
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
                pathname === link.href ? "bg-gray-200" : ""
              }`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.title}
            </Link>
          ))}
        </nav>
      </aside> */}

      {/* Main content */}
      <div className="flex-1 flex flex-col sm:ml-64">
        {/* Header */}
        {/* <DashboardHeader
          title="Dashboard"
          showBackButton={false}
          backButtonUrl="/dashboard"
          backButtonText="Zurück"
        >
          {/* Optional: pass extra props if needed */}
        {/* </DashboardHeader> */} *

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Hamburger toggle for mobile (inside header) */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow sm:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          className="h-6 w-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </div>
  );
}
