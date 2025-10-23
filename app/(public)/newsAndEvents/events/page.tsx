// app/(public)/about/SchoolEvents/page.tsx
"use client";

import Link from "next/link";

const eventsList = [
  {
    title: "School's Football Champion",
    date: "March 30, 2025 | 14:00 PM - 16:00 PM",
    description:
      "Join us for fantastic football match. Admission is free for all families and guests.",
    href: "#",
  },
  {
    title: "Choir Performance",
    date: "April 24, 2025 | 17:00 PM - 19:00 PM",
    description:
      "Join us for an evening filled with musical performances by our talented students. Admission is free for all families and guests.",
    href: "#",
  },
  {
    title: "Summer Fest",
    date: "July 19, 2025 | 13:00 PM - 17:00 PM",
    description: "Admission is free for all families and guests.",
    href: "#",
  },
  {
    title: "🎨 Art Exhibition",
    date: "March 5, 2025 | 10:00 AM - 2:00 PM",
    description:
      "Experience creativity at our annual Art Exhibition, featuring works by students from all grade levels. Open to families and community members.",
    href: "#",
  },
  {
    title: "🏃‍♂️ Spring Sports Day",
    date: "March 12, 2025 | 9:00 AM - 3:00 PM",
    description:
      "Students will compete in various athletic events promoting teamwork and physical fitness. Parents are welcome to cheer on their children!",
    href: "#",
  },
  {
    title: "📖 Family Reading Night",
    date: "March 20, 2025 | 6:00 PM - 8:00 PM",
    description:
      "An evening dedicated to the love of reading! Bring your favorite book and join us for storytelling and fun reading activities.",
    href: "#",
  },
  {
    title: "🎶 Spring Music Concert",
    date: "March 28, 2025 | 7:00 PM - 9:00 PM",
    description:
      "Join us for an evening filled with musical performances by our talented students. Admission is free for all families and guests.",
    href: "#",
  },
];

export default function SchoolEvents() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-6">📅 Upcoming School Events</h2>
        <p className="text-center text-gray-700 mb-10">
          Join us for our exciting upcoming events! Mark your calendars and be part of the fun and learning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventsList.map((event, idx) => (
            <div key={idx} className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h5 className="text-xl font-semibold mb-2">{event.title}</h5>
                <h6 className="text-gray-500 text-sm mb-3">{event.date}</h6>
                <p className="text-gray-700 mb-4">{event.description}</p>
              </div>
              <Link
                href={event.href}
                className="self-start bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-gray-700 text-lg">
          Don’t miss out on these memorable events! 🎉
        </p>
      </div>
    </div>
  );
}
