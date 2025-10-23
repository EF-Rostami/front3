"use client";
import { useEffect, useState } from "react";

type Appointment = {
  id: number;
  parent_id: number;
  scheduled_time: string;
  status: string;
};

export default function TeacherAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/appointments/teacher/2")
      .then(res => res.json())
      .then(setAppointments);
  }, []);

  const confirm = async (id: number) => {
    await fetch(`http://localhost:8000/appointments/confirm/${id}`, { method: "PATCH" });
  };

  return (
    <div>
      {appointments.map(a => (
        <div key={a.id}>
          <span>Parent: {a.parent_id}</span>
          <span>Status: {a.status}</span>
          <button onClick={() => confirm(a.id)}>Confirm</button>
        </div>
      ))}
    </div>
  );
}
