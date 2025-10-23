/* eslint-disable @typescript-eslint/no-unused-vars */
// app/components/Alert.tsx
"use client";

import { ReactNode } from "react";

interface AlertProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "info" | "warning" | "error" | "success";
}

export function Alert({ title, message, action, variant = "info" }: AlertProps) {
  const variantClasses = {
    info: "border-blue-600 bg-blue-50 text-blue-800",
    warning: "border-yellow-600 bg-yellow-50 text-yellow-800",
    error: "border-red-600 bg-red-50 text-red-800",
    success: "border-green-600 bg-green-50 text-green-800",
  };

  const buttonClasses = {
    info: "border-blue-600 text-blue-600 hover:bg-blue-600",
    warning: "border-yellow-600 text-yellow-600 hover:bg-yellow-600",
    error: "border-red-600 text-red-600 hover:bg-red-600",
    success: "border-green-600 text-green-600 hover:bg-green-600",
  };

  return (
    <div className={`border-2 p-6 ${variantClasses[variant]}`}>
      <h3 className="font-bold mb-2 uppercase">
        {variant === "warning" && "⚠ "}
        {variant === "error" && "❌ "}
        {variant === "success" && "✓ "}
        {title}
      </h3>
      <p className="mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={`px-4 py-2 border-2 font-semibold hover:text-white transition-colors ${buttonClasses[variant]}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

