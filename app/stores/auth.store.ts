// stores/auth.store.ts
"use client";

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, UserRole } from '@/app/types/auth.types';
import { apiClient } from '@/app/lib/api-client';

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  selectedRole: UserRole | null;
  _hasHydrated: boolean; // ✅ Add to state
}

// Auth store interface with all methods
interface AuthStore extends AuthState {
  // Hydration
  setHasHydrated: (state: boolean) => void;
  
  // Actions
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  setSelectedRole: (role: UserRole) => void;
  clearSelectedRole: () => void;
  
  // Helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  getUserRoles: () => string[];
  getFullName: () => string;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        selectedRole: null,
        _hasHydrated: false,

        // Hydration setter
        setHasHydrated: (state: boolean) => {
          set({ _hasHydrated: state });
        },

        // Actions
        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
              credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || data.detail || 'Login failed');
            }

            if (!data.user) {
              throw new Error('No user data received');
            }

            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Start proactive refresh after successful login
            apiClient.startProactiveRefresh();

            return data.user;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            // Stop proactive refresh on logout
            apiClient.stopProactiveRefresh();
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              selectedRole: null,
            });
          }
        },

        logoutAll: async () => {
          set({ isLoading: true });
          
          try {
            await fetch('/api/auth/logout-all', {
              method: 'POST',
              credentials: 'include',
            });
          } catch (error) {
            console.error('Logout all error:', error);
          } finally {
            // Stop proactive refresh on logout all
            apiClient.stopProactiveRefresh();
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              selectedRole: null,
            });
          }
        },

        refreshToken: async () => {
          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            });

            if (!response.ok) {
              throw new Error('Token refresh failed');
            }

            const data = await response.json();
            
            if (data.user) {
              set({
                user: data.user,
                isAuthenticated: true,
                error: null,
                selectedRole: null,
              });
            }
          } catch (error) {
            console.error('Token refresh error:', error);
            set({
              user: null,
              isAuthenticated: false,
            });
          }
        },

        checkAuth: async () => {
          set({ isLoading: true });
          
          try {
            const response = await fetch('/api/auth/me', {
              credentials: 'include',
            });
            
            if (!response.ok) {
              throw Error('Not authenticated');
            }

            const data = await response.json();
            
            if (data.user) {
              set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              
              // Start proactive refresh if user is authenticated
              apiClient.startProactiveRefresh();
            }
          } catch (error) {
            console.error("Auth check failed:", error);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        updateUser: (userData: Partial<User>) => {
          const { user } = get();
          if (user) {
            set({ user: { ...user, ...userData } });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        // Set selected role
        setSelectedRole: (role: UserRole) => {
          console.log('🎯 Setting selected role:', role);
          set({ selectedRole: role });
        },

        // Clear selected role
        clearSelectedRole: () => {
          console.log('🗑️ Clearing selected role');
          set({ selectedRole: null });
        },

        // Helper methods - roles are now simple strings
        hasRole: (roleName: UserRole) => {
          const { user } = get();
          return user?.roles?.includes(roleName) ?? false;
        },

        hasAnyRole: (roleNames: UserRole[]) => {
          const { user } = get();
          return roleNames.some(role => user?.roles?.includes(role)) ?? false;
        },

        getUserRoles: () => {
          const { user } = get();
          return user?.roles ?? [];
        },

        getFullName: () => {
          const { user } = get();
          if (!user) return '';
          return `${user.first_name} ${user.last_name}`.trim();
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          selectedRole: state.selectedRole,
        }),
        onRehydrateStorage: () => (state) => {
          // Called after hydration is complete
          state?.setHasHydrated(true);
        },
      }
    ),
    { name: 'auth-store' }
  )
);

// Utility hook for role-based access
export const useRequireAuth = (requiredRoles?: UserRole[]) => {
  const { user, isAuthenticated, hasAnyRole, isLoading } = useAuthStore();
  
  const hasAccess = !isLoading && isAuthenticated && (
    !requiredRoles || 
    requiredRoles.length === 0 || 
    hasAnyRole(requiredRoles)
  );
  
  return {
    user,
    isAuthenticated,
    hasAccess,
    isLoading,
  };
};

// Initialize auth check on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}