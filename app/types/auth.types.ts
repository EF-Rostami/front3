// types/auth.types.ts

/**
 * User role types - simple string values
 */
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

/**
 * User object returned from backend
 * Roles are now a simple array of strings
 */
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  roles: string[]; // ✅ Fixed: Simple string array
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Token response from backend
 */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * API response wrapper for user data
 */
export interface UserResponse {
  user: User;
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Session info
 */
export interface SessionInfo {
  active_sessions: number;
  device_info: string[];
}