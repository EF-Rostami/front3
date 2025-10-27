"use client";

import Link from "next/link";
import "@/app/styles/Home.css";
import HomeLayout from "./(public)/layout";

export default function Home(){

  return (
    <HomeLayout>
    <div className="public-home-page">
      {/* Hero section */}
      <section className="hero-section">
        <div className="hero-content px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl">Welcome to Our School!</h1>
          <p className="hero-subtitle text-base sm:text-lg lg:text-xl">
            Educating and inspiring the leaders of tomorrow
          </p>
          <div className="hero-cta flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link 
              href="/about/aboutSchool" 
              className="btn primary w-full sm:w-auto text-center px-6 py-3"
            >
              Learn More
            </Link>
            <Link 
              href="/contact" 
              className="btn secondary w-full sm:w-auto text-center px-6 py-3"
            >
              Contact Us
            </Link>
            <Link 
              href="/admission/register" 
              className="btn secondary w-full sm:w-auto text-center px-6 py-3"
            >
              Register Your Child
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
          Why Choose Our School?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="feature-card p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="feature-icon text-4xl mb-4">🎓</div>
            <h3 className="font-semibold text-lg mb-2">Excellence in Education</h3>
            <p className="text-sm sm:text-base">
              Our curriculum is designed to challenge and inspire students to reach their full potential.
            </p>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="feature-icon text-4xl mb-4">👩‍🏫</div>
            <h3 className="font-semibold text-lg mb-2">Dedicated Faculty</h3>
            <p className="text-sm sm:text-base">
              Our teachers are experienced professionals committed to student success.
            </p>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="feature-icon text-4xl mb-4">⚽</div>
            <h3 className="font-semibold text-lg mb-2">Extracurricular Activities</h3>
            <p className="text-sm sm:text-base">
              We offer a wide range of activities to develop well-rounded individuals.
            </p>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="feature-icon text-4xl mb-4">🧠</div>
            <h3 className="font-semibold text-lg mb-2">Personalized Learning</h3>
            <p className="text-sm sm:text-base">
              We recognize that each student has unique needs and learning styles.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Ready to Join Our School?
        </h2>
        <p className="mb-6 text-base sm:text-lg max-w-2xl mx-auto">
          Start your journey with us today and experience excellence in education.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link 
            href="/contact" 
            className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition w-full sm:w-auto text-center"
          >
            Request Information
          </Link>
          <Link 
            href="/learning/programs" 
            className="bg-blue-800 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition w-full sm:w-auto text-center"
          >
            Learn More
          </Link>
        </div>
      </section>
    </div>
    </HomeLayout>
  );
}