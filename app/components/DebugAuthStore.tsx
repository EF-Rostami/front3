// components/DebugAuthStore.tsx
"use client";

import { useAuthStore } from "@/app/stores/auth.store";
import { useEffect, useState } from "react";

export function DebugAuthStore() {
  // Access all store properties using selector pattern
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const selectedRole = useAuthStore((state) => state.selectedRole);
  
  // Check if methods exist
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setSelectedRole = useAuthStore((state) => state.setSelectedRole);
  const clearSelectedRole = useAuthStore((state) => state.clearSelectedRole);
   const [visible, setVisible] = useState<boolean>(false);
  
  // Keyboard toggle (Ctrl + D)
  useEffect(() => {
    const toggleDebugger = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", toggleDebugger);
    return () => window.removeEventListener("keydown", toggleDebugger);
  }, []);

  if (!visible) return null; // don’t render when hidden

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-2xl text-xs max-w-md z-50 border-2 border-green-500">
      <h3 className="font-bold mb-2 text-green-400 text-sm">🔍 Auth Store Debug</h3>
      <div className="space-y-2">
        <div className="bg-gray-800 p-2 rounded">
          <strong className="text-yellow-400">Authentication:</strong>
          <div className="pl-2 mt-1">
            <div>✓ isAuthenticated: <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>{String(isAuthenticated)}</span></div>
            <div>✓ isLoading: <span className={isLoading ? "text-yellow-400" : "text-gray-400"}>{String(isLoading)}</span></div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-2 rounded">
          <strong className="text-blue-400">Selected Role:</strong>
          <div className="pl-2 mt-1">
            <div className={selectedRole ? "text-green-400" : "text-red-400"}>
              {selectedRole || "null (❌ NOT SET)"}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-2 rounded">
          <strong className="text-purple-400">User:</strong>
          {user ? (
            <div className="pl-2 mt-1 space-y-1">
              <div>ID: {user.id}</div>
              <div>Email: {user.email}</div>
              <div>Name: {user.first_name} {user.last_name}</div>
              <div className="text-green-400">Roles: [{user.roles.join(', ')}]</div>
            </div>
          ) : (
            <div className="pl-2 mt-1 text-red-400">null (Not logged in)</div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-900 p-2 rounded">
            <strong className="text-red-400">Error:</strong>
            <div className="pl-2 mt-1 text-red-300">{error}</div>
          </div>
        )}
        
        <div className="bg-gray-800 p-2 rounded">
          <strong className="text-orange-400">Methods Available:</strong>
          <div className="pl-2 mt-1 grid grid-cols-2 gap-1 text-xs">
            <div>✓ login: {typeof login}</div>
            <div>✓ logout: {typeof logout}</div>
            <div>✓ setSelectedRole: {typeof setSelectedRole}</div>
            <div>✓ clearSelectedRole: {typeof clearSelectedRole}</div>
          </div>
        </div>

        <div className="bg-gray-800 p-2 rounded">
          <strong className="text-pink-400">localStorage Check:</strong>
          <div className="pl-2 mt-1">
            <button
              onClick={() => {
                const stored = localStorage.getItem('auth-store');
                if (stored) {
                  console.log('📦 localStorage auth-store:', JSON.parse(stored));
                  alert('Check console for localStorage data');
                } else {
                  alert('No auth-store in localStorage');
                }
              }}
              className="bg-pink-600 hover:bg-pink-700 px-2 py-1 rounded text-xs"
            >
              View localStorage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { DebugAuthStore } from '@/app/components/DebugAuthStore';
// <DebugAuthStore />