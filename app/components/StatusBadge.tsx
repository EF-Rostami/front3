// app/components/StatusBadge.tsx
"use client";

interface StatusBadgeProps {
  status: string;
  type?: "attendance" | "payment" | "general";
}

export function StatusBadge({ status, type = "general" }: StatusBadgeProps) {
  const attendanceColors: Record<string, string> = {
    present: "bg-green-100 text-green-800 border-green-800",
    absent: "bg-red-100 text-red-800 border-red-800",
    late: "bg-yellow-100 text-yellow-800 border-yellow-800",
    excused: "bg-blue-100 text-blue-800 border-blue-800",
  };

  const paymentColors: Record<string, string> = {
    paid: "bg-green-100 text-green-800 border-green-600",
    unpaid: "bg-red-100 text-red-800 border-red-600",
    overdue: "bg-red-100 text-red-800 border-red-600",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-600",
  };

  const generalColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-800",
    inactive: "bg-gray-100 text-gray-800 border-gray-800",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-800",
  };

  const colorMap = {
    attendance: attendanceColors,
    payment: paymentColors,
    general: generalColors,
  };

  const colors = colorMap[type];
  const colorClass = colors[status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-800";

  return (
    <span className={`inline-block px-3 py-1 text-xs font-bold border-2 ${colorClass}`}>
      {status.toUpperCase()}
    </span>
  );
}

