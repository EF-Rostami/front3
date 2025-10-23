
import React from "react";

export default function AfterHoursActivities() {
  const activities = [
    {
      title: "Art & Craft Workshops",
      icon: "🎨",
      description: "Spark creativity with hands-on projects in painting, drawing, and crafting.",
      color: "bg-blue-600 text-white",
    },
    {
      title: "Sports & Fitness Clubs",
      icon: "⚽",
      description: "Stay active with soccer, basketball, yoga, and more.",
      color: "bg-green-600 text-white",
    },
    {
      title: "Music & Dance Classes",
      icon: "🎵",
      description: "Discover rhythm through music lessons and dance sessions.",
      color: "bg-yellow-400 text-gray-900",
    },
    {
      title: "Coding & Robotics",
      icon: "🤖",
      description: "Develop problem-solving skills through fun tech-based activities.",
      color: "bg-teal-500 text-white",
    },
    {
      title: "Homework Help & Study Sessions",
      icon: "📚",
      description: "Receive academic support from dedicated teachers.",
      color: "bg-gray-600 text-white",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">🌟 After Hours Activities</h2>
          <p className="text-center text-gray-700 text-lg md:text-xl max-w-3xl mx-auto">
            Our After Hours Activities program offers students a variety of engaging and enriching opportunities beyond the regular school day. These activities promote personal growth, creativity, and physical well-being in a safe and supportive environment.
          </p>
        </div>

        {/* Available Activities */}
        <div>
          <h3 className="text-center text-2xl font-semibold my-6">Available Activities Include:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity, idx) => (
              <div key={idx} className="shadow-lg rounded-xl overflow-hidden flex flex-col h-full hover:shadow-2xl transition">
                <div className={`p-4 text-center font-semibold text-lg ${activity.color}`}>
                  {activity.icon} {activity.title}
                </div>
                <div className="p-6 flex-grow flex items-center justify-center">
                  <p className="text-gray-700 text-center">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-gray-700 text-lg md:text-xl">
          These programs aim to balance fun with learning, ensuring students end their day feeling accomplished and happy! 😊
        </p>
      </div>
    </div>
  );
}
