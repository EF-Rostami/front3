"use client";

import { useEffect, useState } from "react";

type Availability = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
};

export default function AvailableSlots() {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/appointments/available", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load slots");
      const data: Availability[] = await res.json();
      setSlots(data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch available slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const book = async (id: number) => {
    try {
      const res = await fetch("http://localhost:8000/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ availability_id: id }),
      });
      if (!res.ok) throw new Error("Booking failed");
      alert("Appointment booked!");
      await loadSlots(); // refresh slots
    } catch (err) {
      console.error(err);
      alert("Could not book appointment");
    }
  };

  if (loading) return <p>Loading available slots...</p>;
  if (!slots.length) return <p>No available slots right now.</p>;

  return (
    <div className="space-y-4">
      {slots.map((s: Availability) => {
        const start = new Date(`${s.date}T${s.start_time}`);
        const end = new Date(`${s.date}T${s.end_time}`);
        return (
          <div
            key={s.id}
            className="flex items-center justify-between border-2 border-gray-200 p-3 rounded hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-black">
              {start.toLocaleDateString("de-DE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
              {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button
              onClick={() => book(s.id)}
              className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Buchen
            </button>
          </div>
        );
      })}
    </div>
  );
}
