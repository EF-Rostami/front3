// ============================================
// Optional: Role Switcher Component
// components/RoleSwitcher.tsx
// ============================================
"use client";

import { useAuthStore } from "@/app/stores/auth.store";
import { useRouter } from "next/navigation";
import { UserRole } from "@/app/types/auth.types";

const roleRoutes: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent'
};

export function RoleSwitcher() {
  const router = useRouter();
  const { user, selectedRole, setSelectedRole } = useAuthStore();

  // Don't show if user has only one role
  if (!user || user.roles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = (role: string) => {
    setSelectedRole(role as UserRole);
    const route = roleRoutes[role];
    if (route) {
      router.push(route);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Switch Role</h3>
      <div className="space-y-2">
        {user.roles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className={`w-full text-left px-4 py-2 rounded transition ${
              selectedRole === role
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="capitalize">{role}</span>
            {selectedRole === role && (
              <span className="ml-2 text-xs">✓ Active</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}