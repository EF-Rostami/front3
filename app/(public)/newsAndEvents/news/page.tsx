// app/(public)/about/SchoolNews/page.tsx
"use client";

import Link from "next/link";

const newsList = [
  {
    title: "🎓 Annual Science Fair a Resounding Success!",
    date: "February 20, 2025",
    description:
      "Our students showcased innovative projects during this year's Science Fair. Congratulations to all participants for their hard work and creativity!",
    href: "#",
  },
  {
    title: "🏆 Soccer Team Wins Regional Championship!",
    date: "February 15, 2025",
    description:
      "Congratulations to our school's soccer team for winning the regional championship! Your dedication and teamwork are truly inspiring.",
    href: "#",
  },
  {
    title: "📚 Book Fair Coming Next Week",
    date: "February 10, 2025",
    description:
      "Don’t miss out on our annual Book Fair! Explore a wide variety of books and foster a love for reading in our students.",
    href: "#",
  },
  {
    title: "🎭 Drama Club Presents Spring Play",
    date: "February 5, 2025",
    description:
      "Join us for an evening of entertainment as our Drama Club performs their annual spring play. Tickets are available at the school office.",
    href: "#",
  },
];

export default function SchoolNews() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-6">📰 Latest School News</h2>
        <p className="text-center text-gray-700 mb-10">
          Stay updated with the latest happenings, announcements, and achievements at our school!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsList.map((news, idx) => (
            <div key={idx} className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h5 className="text-xl font-semibold mb-2">{news.title}</h5>
                <h6 className="text-gray-500 text-sm mb-3">{news.date}</h6>
                <p className="text-gray-700 mb-4">{news.description}</p>
              </div>
              <Link
                href={news.href}
                className="self-start bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Read More
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-gray-700 text-lg">
          Stay tuned for more updates and exciting news! 🌟
        </p>
      </div>
    </div>
  );
}
