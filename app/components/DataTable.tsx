// app/components/DataTable.tsx
"use client";

import { ReactNode } from "react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = "Keine Daten verfügbar"
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="border-2 border-black p-8 text-center">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-black">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`p-4 text-${column.align || "left"} text-xs font-bold text-black uppercase`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-200">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {columns.map((column, colIdx) => {
                  const value = row[column.key as keyof T];
                  return (
                    <td
                      key={colIdx}
                      className={`p-4 text-${column.align || "left"}`}
                    >
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

