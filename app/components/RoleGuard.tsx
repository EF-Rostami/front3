// components/RoleGuard.tsx
"use client";

import { useAuthStore } from "@/app/stores/auth.store";
import { UserRole } from "@/app/types/auth.types";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * RoleGuard - Protects routes based on user roles
 * 
 * Usage:
 * <RoleGuard allowedRoles={['admin', 'teacher']}>
 *   <YourProtectedContent />
 * </RoleGuard>
 */
export function RoleGuard({ children, allowedRoles, redirectTo = '/login' }: RoleGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasAnyRole, user, selectedRole, setHasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for loading to complete
    if (!setHasHydrated || isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      console.log('🔒 Not authenticated, redirecting to login');
      router.push(redirectTo);
      return;
    }

    // No role selected - redirect to login for role selection
    if (!selectedRole) {
      console.log('⚠️ No role selected, redirecting to login');
      router.push(redirectTo);
      return;
    }

    // Role not allowed — redirect-Check if user has required role
    if (!hasAnyRole(allowedRoles)) {
      console.log('❌ Insufficient permissions, redirecting');
      router.push(redirectTo);
      return;
    }

    console.log('✅ Access granted for role:', selectedRole);
  }, [isAuthenticated, isLoading, hasAnyRole, allowedRoles, router, redirectTo, user, selectedRole, setHasHydrated]);

  // Show loading state
  if (!setHasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or no access
  if (!isAuthenticated || !user || !selectedRole || !hasAnyRole(allowedRoles)) {
    return null; // Will redirect in useEffect
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Quick role guard HOC for page-level protection
 */
export function withRoleGuard(Component: React.ComponentType, allowedRoles: UserRole[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function GuardedComponent(props: any) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}