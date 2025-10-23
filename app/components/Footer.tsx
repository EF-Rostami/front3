// /* eslint-disable react/jsx-no-undef */
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";


const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-2">
              School Management System
            </h3>
            <p>Providing quality education and efficient management.</p>
            {/* Social Icons */}
            <div className="flex space-x-4 mt-4">
              <Link href="https://twitter.com" target="_blank" className="hover:text-white transition">
                <Twitter size={20} />
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="hover:text-white transition">
                <Linkedin size={20} />
              </Link>
              <Link href="https://github.com" target="_blank" className="hover:text-white transition">
                <Github size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about/aboutSchool" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-2">Contact Us</h3>
            <p>
              Email:{" "}
              <a href="mailto:e.fallahrostami@gmail.com" className="hover:text-white transition">
                e.fallahrostami@gmail.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a href="tel:+4917672870165" className="hover:text-white transition">
                +49 176 728 70165
              </a>
            </p>
            <p>Address: Frankfurt am Main</p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} School Management System. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
