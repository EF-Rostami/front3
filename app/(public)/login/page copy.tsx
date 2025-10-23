"use client";

import { useAuthStore } from "@/app/stores/auth.store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserRole } from "@/app/types/auth.types";
import Link from "next/link";

    const roleRoutes: Record<string, string> = {
    admin: '/admin',
    teacher: '/teacher',
    student: '/student',
    parent: '/parent'
  };
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Access store values
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storedRole = useAuthStore((state) => state.selectedRole);
  const saveSelectedRole = useAuthStore((state) => state.setSelectedRole);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  

  // Auto-redirect with smooth transition
  useEffect(() => {
    if (!hasHydrated) return;

    if (isAuthenticated && user && storedRole) {
      const route = roleRoutes[storedRole];
      if (route) {
        console.log('🔄 Auto-redirecting to:', route);
        setIsRedirecting(true);
        // Redirect after fade animation
        setTimeout(() => router.push(route), 300);
      }
    }
  }, [hasHydrated, isAuthenticated, user, storedRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password);
      const roles = user.roles ?? [];

      if (roles.length === 0) {
        toast.error('No valid role assigned. Please contact admin.');
        setIsLoading(false);
        return;
      }

      if (roles.length === 1) {
        const role = roles[0];
        const route = roleRoutes[role];
        if (route) {
          saveSelectedRole(role as UserRole);
          toast.success('Login successful!');
          router.push(route);
        } else {
          toast.error('Invalid role configuration.');
          setIsLoading(false);
        }
      } else {
        setAvailableRoles(roles);
        setIsLoading(false);
        toast.info('Please select a role to continue.');
      }
    } catch (error: unknown) {
      setIsLoading(false);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  const handleRoleSelect = () => {
    if (!selectedRole) {
      toast.error('Please choose a role.');
      return;
    }
    const route = roleRoutes[selectedRole];
    if (!route) {
      toast.error('Invalid role selected.');
      return;
    }
    
    saveSelectedRole(selectedRole as UserRole);
    toast.success(`Continuing as ${selectedRole}`);
    router.push(route);
  };

  // Redirecting overlay with fade
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 animate-fade-in">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 mt-6 text-lg font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Role selection screen
  if (availableRoles.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 animate-fade-in">
        <div className="bg-white shadow-lg rounded-lg p-6 w-96 space-y-4">
          <h1 className="text-2xl font-bold text-center">Select Your Role</h1>
          
          <div className="space-y-2">
            {availableRoles.map((role) => (
              <label key={role} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="capitalize">{role}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleRoleSelect}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Login form - Always renders immediately (optimistic rendering)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      
      <div className="text-sm text-right">
        <Link
          href="auth/forgot-password"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
    </div>
  );
}