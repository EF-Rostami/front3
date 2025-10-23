// app/components/QuickStats.tsx
"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({ label, value, subtitle, variant = "default" }: StatCardProps) {
  const colorClasses = {
    default: "border-black bg-white text-black",
    success: "border-green-600 bg-green-50 text-green-800",
    warning: "border-yellow-600 bg-yellow-50 text-yellow-800",
    danger: "border-red-600 bg-red-50 text-red-800",
  };

  const textColorClasses = {
    default: "text-gray-500",
    success: "text-green-700",
    warning: "text-yellow-700",
    danger: "text-red-700",
  };

  return (
    <div className={`border-2 p-6 ${colorClasses[variant]}`}>
      <p className={`text-xs uppercase mb-2 ${textColorClasses[variant]}`}>
        {label}
      </p>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && (
        <p className={`text-xs mt-2 ${textColorClasses[variant]}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

