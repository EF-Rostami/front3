import Image from "next/image";

export default function FacultyAndStaff() {
  return (
    <div className="container mx-auto px-4 py-8">

        <section className="bg-blue-600 text-white py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Faculty and Staff</h1>
          <p className="text-lg md:text-xl">Shaping futures through quality education since 1980</p>
        </div>
      </section>
      

      <section>
        <h2 className="text-2xl font-semibold mb-4">Meet Our Team</h2>
        <p className="mb-6 leading-relaxed">
          At ABC Elementary School, our faculty and staff are the heart of our school community. Each member of our team is dedicated to creating a safe, supportive, and inspiring learning environment for our students. <br />
          <br />
          Our <strong>teachers</strong> are passionate, highly qualified professionals who bring creativity, expertise, and care to the classroom. They are committed to fostering a love of learning, tailoring instruction to meet individual student needs, and empowering every child to achieve their best.
          <br />
          <br />
          Supporting our teachers are our <strong>paraprofessionals</strong> and <strong>teaching assistants</strong>, who work closely with students to provide additional guidance and encouragement. Their dedication ensures that all students have the tools they need to thrive academically and socially.
          <br />
          <br />
          Our <strong>administrative staff</strong> plays a vital role in the daily operations of our school, ensuring that everything runs smoothly. From welcoming families at the front office to coordinating school events, they are always ready to assist and support our community.
          <br />
          <br />
          We are fortunate to have a team of <strong>specialists</strong> who enrich our curriculum. This includes art, music, and physical education teachers, as well as counselors and special education staff who address the diverse needs of our students.
          <br />
          <br />
          Additionally, our <strong>custodial and maintenance team</strong> ensures that our school remains a clean, safe, and welcoming space for everyone.
          <br />
          <br />
          Together, our faculty and staff are dedicated to helping every child succeed, not just academically but also emotionally and socially. Their teamwork and commitment make ABC Elementary School a place where students feel valued, supported, and ready to shine.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Staff member 1 */}
          <div className="card shadow-lg rounded-lg overflow-hidden">
            <Image
              src="/images/staff/lennon.jpg"
              alt="Mr. John Lennon"
              width={400}
              height={300}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h5 className="text-lg font-semibold">Mr. John Lennon</h5>
              <p className="text-gray-600">School Director</p>
            </div>
          </div>

          {/* Staff member 2 */}
          <div className="card shadow-lg rounded-lg overflow-hidden">
            <Image
              src="/images/staff/einstein.jpg"
              alt="Mr. Albert Einstein"
              width={400}
              height={300}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h5 className="text-lg font-semibold">Mr. Albert Einstein</h5>
              <p className="text-gray-600">Head of Physics Group</p>
            </div>
          </div>

          {/* Staff member 3 */}
          <div className="card shadow-lg rounded-lg overflow-hidden">
            <Image
              src="/images/staff/dali.jpg"
              alt="Mr. Salvador Dalí"
              width={400}
              height={300}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h5 className="text-lg font-semibold">Mr. Salvador Dalí</h5>
              <p className="text-gray-600">Head of Art Group</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
