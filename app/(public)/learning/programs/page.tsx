
import React from "react";

export default function AcademicPrograms() {
  const programs = [
    {
      title: "Academic Excellence Program",
      icon: "📘",
      description:
        "Our Academic Excellence Program focuses on core subjects such as Mathematics, Science, English, and Social Studies. We aim to foster critical thinking, creativity, and a love for learning through engaging and age-appropriate lessons.",
    },
    {
      title: "Creative Arts Program",
      icon: "🎨",
      description:
        "Our Creative Arts Program encourages students to express themselves through visual arts, music, and drama. Students explore various art forms, helping them develop confidence and creativity.",
    },
    {
      title: "Physical Education & Sports",
      icon: "🏅",
      description:
        "Physical health is a priority at our school. Our Physical Education program promotes teamwork, discipline, and an active lifestyle through a variety of sports and fitness activities.",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-12">🎓 Our Academic Programs</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition duration-300 h-full flex flex-col"
            >
              <h2 className="text-2xl font-semibold text-center mb-4">{program.icon} {program.title}</h2>
              <p className="text-gray-700 flex-grow">{program.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
