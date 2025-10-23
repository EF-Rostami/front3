import Link from "next/link";
import {
  AcademicCapIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  BookOpenIcon,
  MusicalNoteIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

export default function AboutSchool() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Our School</h1>
          <p className="text-lg md:text-xl">Shaping futures through quality education since 1980</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 space-y-16">

          {/* Our History */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our History</h2>
            <p className="mb-2">
              Founded in 1980, our school has a rich history of academic excellence and community service.
              What began as a small institution with just a few classrooms has grown into a comprehensive
              educational facility serving hundreds of students from diverse backgrounds.
            </p>
            <p>
              Throughout the years, we have maintained our commitment to providing a nurturing environment
              where students can develop their intellectual, social, and physical abilities.
            </p>
          </div>

          {/* Our Mission */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-2">
              Our mission is to provide a stimulating learning environment that encourages all students to realize
              their full potential, both academically and personally. We are committed to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fostering excellence in education</li>
              <li>Developing critical thinking and problem-solving skills</li>
              <li>Encouraging creativity and innovation</li>
              <li>Promoting ethical behavior and social responsibility</li>
              <li>Preparing students for the challenges of an increasingly global society</li>
            </ul>
          </div>

          {/* Our Vision */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="mb-2">We envision a school community where:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Students are engaged, curious, and excited about learning</li>
              <li>Teachers are passionate, innovative, and dedicated to student success</li>
              <li>Parents are valued partners in the educational process</li>
              <li>Diversity is celebrated and respected</li>
              <li>Each individual feels safe, supported, and challenged to grow</li>
            </ul>
          </div>

          {/* Facilities */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Facilities</h2>
            <p className="mb-6">Our school features modern facilities designed to enhance the learning experience:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow">
                <AcademicCapIcon className="h-10 w-10 text-blue-600 mb-2"/>
                <p>State-of-the-art science laboratories</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow">
                <ComputerDesktopIcon className="h-10 w-10 text-blue-600 mb-2"/>
                <p>Computer labs with the latest technology</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow">
                <UserGroupIcon className="h-10 w-10 text-blue-600 mb-2"/>
                <p>Well-equipped gymnasium and sports fields</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow">
                <BookOpenIcon className="h-10 w-10 text-blue-600 mb-2"/>
                <p>Extensive library with digital resources</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow">
                <MusicalNoteIcon className="h-10 w-10 text-blue-600 mb-2"/>
                <p>Music and arts studios</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow">
                <SunIcon className="h-10 w-10 text-blue-600 mb-2"/>
                <p>Green spaces and ecological areas</p>
              </div>
            </div>
          </div>

          {/* Leadership Team */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Leadership Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="h-24 w-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">Dr. James Wilson</h3>
                <p className="text-blue-600 mb-2">Principal</p>
                <p>With over 20 years of experience in education, Dr. Wilson leads our school with vision and dedication.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="h-24 w-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">Ms. Elizabeth Chen</h3>
                <p className="text-blue-600 mb-2">Vice Principal, Academics</p>
                <p>Ms. Chen ensures our academic programs maintain the highest standards of excellence.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="h-24 w-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">Mr. Robert Johnson</h3>
                <p className="text-blue-600 mb-2">Vice Principal, Student Affairs</p>
                <p>Mr. Johnson oversees student development, activities, and welfare.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center space-y-4">
          <h2 className="text-3xl font-bold">Experience Our School Community</h2>
          <p>We invite you to learn more about our programs and visit our campus.</p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
            <Link href="/contact" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Schedule a Visit
            </Link>
            <Link href="/contact" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
              Request Information
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
