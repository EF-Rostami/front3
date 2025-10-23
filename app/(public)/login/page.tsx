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

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent'
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setTimeout(() => router.push(route), 300);
      }
    }
  }, [hasHydrated, isAuthenticated, user, storedRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);
      const roles = user.roles ?? [];

      if (roles.length === 0) {
        toast.error('No valid role assigned. Please contact your administrator.');
        setIsLoading(false);
        return;
      }

      if (roles.length === 1) {
        const role = roles[0];
        const route = roleRoutes[role];
        if (route) {
          saveSelectedRole(role as UserRole);
          toast.success(`Welcome back!`);
          setIsRedirecting(true);
          setTimeout(() => router.push(route), 300);
        } else {
          toast.error('Invalid role configuration.');
          setIsLoading(false);
        }
      } else {
        // Multiple roles - show selection
        setAvailableRoles(roles);
        setIsLoading(false);
        toast.info('Please select your role to continue.');
      }
    } catch (error: unknown) {
      setIsLoading(false);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Login failed. Please check your credentials and try again.');
      }
    }
  };

  const handleRoleSelect = () => {
    if (!selectedRole) {
      toast.error('Please select a role to continue.');
      return;
    }
    
    const route = roleRoutes[selectedRole];
    if (!route) {
      toast.error('Invalid role selected.');
      return;
    }
    
    saveSelectedRole(selectedRole as UserRole);
    toast.success(`Continuing as ${roleLabels[selectedRole] || selectedRole}`);
    setIsRedirecting(true);
    setTimeout(() => router.push(route), 300);
  };

  // Redirecting overlay
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center z-50 animate-fade-in">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-700 mt-6 text-lg font-medium">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Role selection screen
  if (availableRoles.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 animate-fade-in px-4">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Select Your Role</h1>
            <p className="text-gray-600 mt-2">Choose how you want to continue</p>
          </div>
          
          <div className="space-y-3">
            {availableRoles.map((role) => (
              <label 
                key={role} 
                className={`flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  selectedRole === role 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-5 h-5 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-lg font-medium text-gray-800">
                  {roleLabels[role] || role}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handleRoleSelect}
            disabled={!selectedRole}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
          >
            Continue
          </button>

          <button
            onClick={() => {
              setAvailableRoles([]);
              setSelectedRole("");
            }}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 animate-fade-in px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 transition"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 transition">
            Sign up
          </Link>
        </div> */}
      </div>
    </div>
  );
}