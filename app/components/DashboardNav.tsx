// app/components/DashboardNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth.store";

interface NavItem {
  label: string;
  href: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: "DASHBOARD", href: "/admin", roles: ["admin"] },
  { label: "DASHBOARD", href: "/teacher", roles: ["teacher"] },
  { label: "DASHBOARD", href: "/student", roles: ["student"] },
  { label: "DASHBOARD", href: "/parent", roles: ["parent"] },
  { label: "NOTEN", href: "/student/grades", roles: ["student"] },
  { label: "ANWESENHEIT", href: "/student/attendance", roles: ["student"] },
  { label: "GEBÜHREN", href: "/student/fees", roles: ["student"] },
  { label: "KLASSEN", href: "/teacher/classes", roles: ["teacher"] },
  { label: "NOTEN", href: "/teacher/grades", roles: ["teacher"] },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { selectedRole } = useAuthStore();

  // Filter nav items based on current role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(selectedRole || "")
  );

  // Group by base path to avoid duplicates
  const uniqueNavItems = filteredNavItems.reduce((acc, item) => {
    const existing = acc.find(i => i.href === item.href);
    if (!existing) {
      acc.push(item);
    }
    return acc;
  }, [] as NavItem[]);

  return (
    <nav className="border-2 border-black bg-white">
      <div className="border-b-2 border-black bg-gray-50 p-4">
        <h3 className="font-bold text-black uppercase tracking-wide text-sm">
          Navigation
        </h3>
      </div>
      <div className="divide-y-2 divide-gray-200">
        {uniqueNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block w-full text-left p-4 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-gray-50 text-black"
                  : "text-black hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

