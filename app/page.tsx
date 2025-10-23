"use client";

import Link from "next/link";
import "@/app/styles/Home.css";

export default function Home(){

  return (
    <div className="public-home-page">
      {/* Hero section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our School</h1>
          <p className="hero-subtitle">Educating and inspiring the leaders of tomorrow</p>
          <div className="hero-cta">
            <Link href="/about/aboutSchool" className="btn primary">Learn More</Link>
            <Link href="/contact" className="btn secondary">Contact Us</Link>
            <Link href="/admission/register" className="btn secondary">Register Your Child</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Our School?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="feature-card p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="feature-icon text-4xl mb-4">🎓</div>
            <h3 className="font-semibold text-lg mb-2">Excellence in Education</h3>
            <p>Our curriculum is designed to challenge and inspire students to reach their full potential.</p>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="feature-icon text-4xl mb-4">👩‍🏫</div>
            <h3 className="font-semibold text-lg mb-2">Dedicated Faculty</h3>
            <p>Our teachers are experienced professionals committed to student success.</p>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="feature-icon text-4xl mb-4">⚽</div>
            <h3 className="font-semibold text-lg mb-2">Extracurricular Activities</h3>
            <p>We offer a wide range of activities to develop well-rounded individuals.</p>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="feature-icon text-4xl mb-4">🧠</div>
            <h3 className="font-semibold text-lg mb-2">Personalized Learning</h3>
            <p>We recognize that each student has unique needs and learning styles.</p>
          </div>
        </div>
      </section>



      {/* Call to Action */}
      <section className="cta-section">
        <h2 className="text-3xl font-bold mb-4">Ready to Join Our School?</h2>
        <p className="mb-6">Start your journey with us today and experience excellence in education.</p>
        <div className="space-x-4">
          <Link href="/contact" className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
            Request Information
          </Link>
          <Link href="/learning/programs" className="bg-blue-800 px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition">
            Learn More
          </Link>
        </div>
      </section>
    </div>
  );
}
