"use client";

import { useEffect } from "react";

/**
 * Automatically pings your Render backend to wake it up.
 * Place this at the top of your layout or main page.
 */
export default function WakeBackend() {
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const healthEndpoint = process.env.NEXT_PUBLIC_BACKEND_HEALTH_ENDPOINT || "/";

    if (!backendUrl) {
      console.warn("⚠️ Backend URL not defined in .env.local");
      return;
    }

    const wakeBackend = async () => {
      try {
        const fullUrl = `${backendUrl}${healthEndpoint}`;
        console.log("🌐 Waking backend:", fullUrl);

        const response = await fetch(fullUrl, {
          method: "GET",
          headers: { "Cache-Control": "no-cache" },
        });

        if (response.ok) {
          console.log("✅ Backend is awake!");
        } else {
          console.warn("⚠️ Backend responded but not OK:", response.status);
        }
      } catch (error) {
        console.error("❌ Error waking backend:", error);
      }
    };

    wakeBackend();
  }, []);

  return null;
}
