// app/(public)/about/Athletics/page.tsx
import React from "react";

export default function Athletics() {
  const sportsTeams = [
    { name: "Soccer Team", icon: "⚽", description: "Develops teamwork and strategic thinking while staying active on the field." },
    { name: "Basketball Team", icon: "🏀", description: "Focuses on agility, coordination, and sportsmanship." },
    { name: "Tennis Club", icon: "🎾", description: "Encourages individual skill-building and healthy competition." },
    { name: "Track & Field Team", icon: "🏃", description: "Promotes endurance, speed, and perseverance through various events." },
    { name: "Volleyball Team", icon: "🏐", description: "Builds communication and collaboration through team play." },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6 space-y-12">

        {/* Athletics Overview */}
        <section id="athletics" className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">🏃‍♀️ Athletics</h2>
          <p className="text-gray-700">
            At our elementary school, we believe that athletics play an essential role in promoting physical health, teamwork, and discipline. Our athletics program encourages students to participate in a variety of sports and physical activities that foster lifelong fitness habits and sportsmanship.
          </p>
          <p className="text-gray-700">
            With a focus on both individual and team sports, students develop coordination, confidence, and a positive attitude toward healthy competition. Regular physical education classes and after-school practices ensure that every student has the opportunity to engage and thrive.
          </p>
        </section>

        {/* Sports Teams */}
        <section id="sports-teams" className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">🏆 Our Sports Teams</h2>
          <p className="text-gray-700">
            We take pride in our school’s vibrant sports culture! Our teams compete in local tournaments and foster an inclusive environment where every student is encouraged to join and excel. Participation helps build character, leadership, and school spirit.
          </p>

          <ul className="space-y-4 list-disc list-inside text-gray-700">
            {sportsTeams.map((team, idx) => (
              <li key={idx}>
                <strong>{team.icon} {team.name}:</strong> {team.description}
              </li>
            ))}
          </ul>

          <p className="text-gray-700">
            Students interested in joining can speak with their physical education teacher or visit the athletics office for more information. Let’s get moving and make lasting memories through sports!
          </p>
        </section>

      </div>
    </div>
  );
}
