// app/(public)/about/Alumni/page.tsx
import Image from "next/image";

const alumniList = [
  { name: "Carl Benz", year: "1950", img: "/images/alumni/Benz.jpg" },
  { name: "Konrad Zuse", year: "1960", img: "/images/alumni/Zuce.jpg" },
  { name: "Alumni Name", year: "Graduation Year and Achievements", img: "/images/alumni/placeholder.jpg" },
  { name: "Alumni Name", year: "Graduation Year and Achievements", img: "/images/alumni/placeholder.jpg" },
  { name: "Alumni Name", year: "Graduation Year and Achievements", img: "/images/alumni/placeholder.jpg" },
  { name: "Alumni Name", year: "Graduation Year and Achievements", img: "/images/alumni/placeholder.jpg" },
];

export default function Alumni() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-center mb-8">Alumni</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Alumni Achievements</h2>
          <p className="text-gray-700 leading-relaxed">
            At ABC Elementary School, we are proud of the accomplishments of our alumni, who continue to make a positive impact in their communities and beyond. From their early days in our classrooms, they have carried forward the values and skills nurtured during their time with us.
            <br /><br />
            Our alumni excel in diverse fields, including academics, arts, sports, and leadership. Many have gone on to achieve success in middle school, high school, and higher education, demonstrating a strong foundation built during their formative years at our school.
            <br /><br />
            We celebrate the accomplishments of our former students and cherish the connections we maintain with them. Through alumni events, newsletters, and social media, we strive to keep our alumni engaged with the school community, offering opportunities to share their stories, mentor current students, and give back to their alma mater.
            <br /><br />
            Our alumni are an enduring source of pride and inspiration, exemplifying the mission of ABC Elementary School: to empower individuals to succeed and make a difference. We are honored to have played a role in shaping their journeys and look forward to seeing the extraordinary things they will continue to achieve.
            <br /><br />
            If you are an alumnus of ABC Elementary School, we would love to hear from you! Share your story and stay connected as a valued member of our school family. As follow, we share some of our famous members of our Alumni:
          </p>
        </section>

        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {alumniList.map((alumni, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden text-center">
                <div className="relative w-full h-40">
                  <Image
                    src={alumni.img}
                    alt={alumni.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h5 className="font-semibold text-gray-800">{alumni.name}</h5>
                  <p className="text-gray-500 text-sm">{alumni.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
