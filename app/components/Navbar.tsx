"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChevronDown, Menu, X } from "lucide-react";
import Image from 'next/image';
import { useAuthStore } from "@/app/stores/auth.store";


type UserRole = "admin" | "teacher" | "student" | "parent" | null;

interface NavbarProps {
  
  userRole: UserRole;
}

const Navbar = ({  userRole }: NavbarProps) => {
  // const { isAuthenticated } = useAuthStore();
  const { logout, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const router = useRouter();

  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

    const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!isAuthenticated) return "/login";

    switch (userRole) {
      case "admin":
        return "/admin/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "student":
        return "/student/dashboard";
      case "parent":
        return "/parent/dashboard";
      default:
        return "/login";
    }
  };

  const menuItems = [
    {
      title: "About",
      hasSubmenu: true,
      submenu: [
        { title: "About School", path: "/about/aboutSchool" },
        { title: "Faculty & Staff", path: "/about/facultyAndStaff" },
        { title: "Alumni", path: "/about/alumni" },
      ],
    },
    {
      title: "Admission",
      hasSubmenu: true,
      submenu: [
        { title: "Request Info", path: "/admission/requestInfo" },
        { title: "Campus Visit", path: "/admission/campusVisit" },
        { title: "Register Your Child", path: "/admission/register" },
      ],
    },
    {
      title: "Learning",
      hasSubmenu: true,
      submenu: [
        { title: "Programs", path: "/learning/programs" },
        { title: "After Hours", path: "/learning/afterHours" },
        { title: "Athletics", path: "/learning/athletics" },
      ],
    },
    {
      title: "News & Events",
      hasSubmenu: true,
      submenu: [
        { title: "News", path: "/newsAndEvents/news" },
        { title: "Events", path: "/newsAndEvents/events" },
      ],
    },
    { title: "Contact", path: "/contact", hasSubmenu: false },
  ];

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <Image
              src="/images/school_logo.png"
              alt="App Logo"
              width={120}
              height={50}
              priority
            />
            <span>School Management</span>
          </Link>


          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {menuItems.map((item, index) =>
              item.hasSubmenu ? (
                <div key={index} className="relative group">
                  <button className="flex items-center hover:text-gray-300">
                    {item.title}
                    <ChevronDown className="ml-1 w-4 h-4" />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute left-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.submenu?.map((sub, i) => (
                      <Link
                        key={i}
                        href={sub.path}
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={index}
                  href={item.path!}
                  className="hover:text-gray-300"
                >
                  {item.title}
                </Link>
              )
            )}
          </div>

         {/* Auth Buttons */}
          <div className="hidden md:flex space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md"
              >
                Login
              </Link>
            )}
          </div>
          {/* Mobile Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-700 px-4 py-3 space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(index)}
                    className="flex items-center justify-between w-full text-left py-2 hover:text-gray-300"
                  >
                    {item.title}
                    <ChevronDown
                      className={`ml-2 w-4 h-4 transition-transform ${
                        openDropdown === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === index && (
                    <div className="ml-4 space-y-1">
                      {item.submenu?.map((sub, i) => (
                        <Link
                          key={i}
                          href={sub.path}
                          className="block px-2 py-1 hover:bg-gray-600 rounded"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.path!}
                  className="block py-2 hover:text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile Auth */}
          <div className="pt-4 border-t border-gray-600">
            {isAuthenticated ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="block bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-md mb-2 text-center"
                >
                  Dashboard
                </Link>
                <Link
                  href="/"
                  onClick={handleLogout}
                  className="block bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-center"
                >
                  Logout
                  
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="block bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-center"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
