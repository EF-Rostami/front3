"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth.store";

/**
 * ZustandDebugger:
 * A lightweight debug overlay for inspecting Zustand store state.
 * 
 * 🔹 Press Ctrl + D to toggle visibility.
 * 🔹 Logs store history over time (snapshots).
 * 🔹 Automatically updates whenever the Zustand store changes.
 */
export const ZustandDebugger: React.FC = () => {
  const storeState = useAuthStore(); // full store snapshot
  const [history, setHistory] = useState<unknown[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  // Listen for Zustand store changes
  useEffect(() => {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      // Avoid pushing duplicate state snapshots
      if (JSON.stringify(last) !== JSON.stringify(storeState)) {
        return [...prev, storeState];
      }
      return prev;
    });
  }, [storeState]);

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
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        background: "#1e1e1e",
        color: "#fff",
        padding: "10px",
        fontSize: "12px",
        maxHeight: "300px",
        overflowY: "auto",
        zIndex: 9999,
        width: "350px",
        borderTopLeftRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <strong>Zustand Store Debugger</strong>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: "transparent",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
          title="Hide Debugger (Ctrl+D)"
        >
          ✕
        </button>
      </div>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(history, null, 2)}
      </pre>
    </div>
  );
};
