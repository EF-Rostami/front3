// components/AuthLoading.tsx
"use client";

export function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="relative">
          {/* Spinner */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
          
          {/* Pulsing inner circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <p className="text-gray-600 mt-6 text-lg font-medium">Loading...</p>
        <p className="text-gray-400 mt-2 text-sm">Please wait</p>
      </div>
    </div>
  );
}

// Optional: Skeleton loader version
export function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="h-10 bg-gray-300 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-8 animate-pulse"></div>
        
        {/* Content skeleton */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}