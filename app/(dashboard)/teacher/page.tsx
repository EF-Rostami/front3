// app/teacher/page.tsx - Connected Teacher Dashboard
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { RoleSwitcher } from "@/app/components/RoleSwitcher";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TeacherProfile {
  id: number;
  firstName: string;
  lastName: string;
  employee_number: string;
  subject_specialization: string | null;
}

interface Class {
  id: number;
  name: string;
  grade_level: string;
  room_number: string;
  student_count: number;
  max_students: number;
}

interface Course {
  id: number;
  name: string;
  code: string;
  class_name: string;
  academic_year: string;
}

export default function TeacherPage() {
  const { user, getFullName, logout, selectedRole } = useAuthStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const gradeLevels: Record<string, string> = {
    vorschule: "Vorschule",
    klasse_1: "Klasse 1",
    klasse_2: "Klasse 2",
    klasse_3: "Klasse 3",
    klasse_4: "Klasse 4",
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // Get teacher profile
      const profileRes = await fetch('/api/teachers/me', {
        credentials: 'include',
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setTeacherProfile(profileData);

        // Get teacher's classes
        const classesRes = await fetch(`/api/teachers/${profileData.id}/classes`, {
          credentials: 'include',
        });
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setMyClasses(classesData);
        }

        // Get teacher's courses
        const coursesRes = await fetch(`/api/teachers/${profileData.id}/courses`, {
          credentials: 'include',
        });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setMyCourses(coursesData);
        }
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock today's schedule (you can enhance this by fetching from backend)
  const todaySchedule = myClasses.slice(0, 3).map((cls, idx) => ({
    time: ['08:00 - 09:30', '10:00 - 11:30', '14:00 - 15:30'][idx] || '08:00 - 09:30',
    class: cls.name,
    room: cls.room_number || 'N/A',
    status: idx === 0 ? 'completed' : idx === 1 ? 'current' : 'upcoming'
  }));

  const pendingTasks = [
    { task: "Noten für Klassenarbeit eintragen", due: "Fällig in 2 Tagen", priority: "high" },
    { task: "Stundenplan für nächste Woche vorbereiten", due: "Fällig in 3 Tagen", priority: "medium" },
    { task: "Anwesenheitsbericht abgeben", due: "Fällig heute", priority: "high" },
    { task: "Hausaufgaben überprüfen", due: "Fällig in 5 Tagen", priority: "low" },
  ];

  const totalStudents = myClasses.reduce((sum, cls) => sum + cls.student_count, 0);

  return (
    <RoleGuard allowedRoles={['teacher']}>
      <div className="min-h-screen bg-white">
        {/* Classic Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  LEHRERPORTAL
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Willkommen zurück, {getFullName()}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Aktuelle Rolle</p>
                  <p className="text-sm font-bold text-black capitalize">{selectedRole}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors"
                >
                  ABMELDEN
                </button>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="max-w-7xl mx-auto px-6 py-12 text-center">
            <p className="text-gray-600">Laden...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <aside className="lg:col-span-1">
                {/* Role Switcher */}
                {user && user.roles.length > 1 && (
                  <div className="mb-6">
                    <RoleSwitcher />
                  </div>
                )}

                {/* Quick Stats */}
                <div className="border-2 border-black bg-white mb-6">
                  <div className="border-b-2 border-black bg-gray-50 p-4">
                    <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                      Schnellübersicht
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Meine Klassen</p>
                      <p className="text-2xl font-bold text-black">{myClasses.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Gesamt Schüler</p>
                      <p className="text-2xl font-bold text-black">{totalStudents}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Meine Kurse</p>
                      <p className="text-2xl font-bold text-black">{myCourses.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Offene Aufgaben</p>
                      <p className="text-2xl font-bold text-black">{pendingTasks.length}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="border-2 border-black bg-white">
                  <div className="border-b-2 border-black bg-gray-50 p-4">
                    <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                      Navigation
                    </h3>
                  </div>
                  <div className="divide-y-2 divide-gray-200">
                    <Link href="/teacher" className="block w-full text-left p-4 text-sm font-semibold text-black bg-gray-50">
                      DASHBOARD
                    </Link>
                    <Link href="/teacher/classes" className="block w-full text-left p-4 text-sm font-semibold text-black hover:bg-gray-50 transition-colors">
                      MEINE KLASSEN
                    </Link>
                    <Link href="/teacher/grades" className="block w-full text-left p-4 text-sm font-semibold text-black hover:bg-gray-50 transition-colors">
                      NOTEN
                    </Link>
                    <Link href="/teacher/resources" className="block w-full text-left p-4 text-sm font-semibold text-black hover:bg-gray-50 transition-colors">
                      RESSOURCEN
                    </Link>
                  </div>
                </nav>
              </aside>

              {/* Main Content */}
              <main className="lg:col-span-3">
                {/* Today's Schedule */}
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                    Heutiger Stundenplan
                  </h2>
                  {todaySchedule.length === 0 ? (
                    <div className="border-2 border-black p-8 text-center">
                      <p className="text-gray-600">Keine Klassen für heute</p>
                    </div>
                  ) : (
                    <div className="border-2 border-black bg-white">
                      {todaySchedule.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-4 border-b-2 border-gray-200 last:border-b-0 ${
                            item.status === "current" ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-center min-w-[100px]">
                                <p className="text-xs text-gray-500 uppercase">Zeit</p>
                                <p className="font-bold text-black text-sm">{item.time}</p>
                              </div>
                              <div className="border-l-2 border-black pl-4">
                                <p className="font-bold text-black">{item.class}</p>
                                <p className="text-sm text-gray-600">{item.room}</p>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-bold uppercase ${
                                item.status === "completed"
                                  ? "bg-gray-200 text-gray-700"
                                  : item.status === "current"
                                  ? "bg-black text-white"
                                  : "border-2 border-black text-black"
                              }`}
                            >
                              {item.status === "completed" ? "ERLEDIGT" : item.status === "current" ? "AKTUELL" : "ANSTEHEND"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* My Classes */}
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-black uppercase tracking-wide border-b-2 border-black pb-2 flex-1">
                      Meine Klassen
                    </h2>
                    <Link 
                      href="/teacher/classes"
                      className="text-sm font-semibold text-black hover:underline uppercase tracking-wide ml-4"
                    >
                      Alle anzeigen →
                    </Link>
                  </div>
                  {myClasses.length === 0 ? (
                    <div className="border-2 border-black p-8 text-center">
                      <p className="text-gray-600 mb-2">Keine Klassen zugewiesen</p>
                      <p className="text-sm text-gray-500">Kontaktieren Sie den Administrator</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myClasses.slice(0, 4).map((cls) => (
                        <div key={cls.id} className="border-2 border-black bg-white p-6 hover:bg-gray-50 transition-colors">
                          <h3 className="font-bold text-black text-lg mb-3">{cls.name}</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Klassenstufe:</span>
                              <span className="font-semibold text-black">
                                {gradeLevels[cls.grade_level] || cls.grade_level}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Schüler:</span>
                              <span className="font-semibold text-black">
                                {cls.student_count} / {cls.max_students}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Raum:</span>
                              <span className="font-semibold text-black">{cls.room_number || 'N/A'}</span>
                            </div>
                          </div>
                          <Link
                            href={`/teacher/classes/${cls.id}`}
                            className="block w-full mt-4 py-2 text-center border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors uppercase text-sm"
                          >
                            Details anzeigen
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Pending Tasks */}
                <section>
                  <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                    Offene Aufgaben
                  </h2>
                  <div className="border-2 border-black bg-white divide-y-2 divide-gray-200">
                    {pendingTasks.map((item, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              className="mt-1 w-4 h-4 border-2 border-black"
                            />
                            <div>
                              <p className="font-semibold text-black">{item.task}</p>
                              <p className="text-sm text-gray-600 mt-1">{item.due}</p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-bold uppercase ${
                              item.priority === "high"
                                ? "bg-black text-white"
                                : item.priority === "medium"
                                ? "border-2 border-black text-black"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {item.priority === "high" ? "HOCH" : item.priority === "medium" ? "MITTEL" : "NIEDRIG"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </main>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}