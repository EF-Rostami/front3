// app/teacher/classes/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Class {
  id: number;
  name: string;
  grade_level: string;
  room_number: string;
  student_count: number;
  max_students: number;
  academic_year: string;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const gradeLevels: Record<string, string> = {
    vorschule: "Vorschule",
    klasse_1: "Klasse 1",
    klasse_2: "Klasse 2",
    klasse_3: "Klasse 3",
    klasse_4: "Klasse 4",
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const profileRes = await fetch('/api/teachers/me', {
        credentials: 'include',
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const classesRes = await fetch(`/api/teachers/${profileData.id}/classes`, {
          credentials: 'include',
        });
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData);
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['teacher']}>
      <div className="min-h-screen bg-white">
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/teacher" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
                  ← Zurück zum Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  MEINE KLASSEN
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600 text-lg mb-2">Keine Klassen zugewiesen</p>
              <p className="text-sm text-gray-500">Kontaktieren Sie den Administrator</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div key={cls.id} className="border-2 border-black bg-white hover:bg-gray-50 transition-colors">
                  <div className="border-b-2 border-black bg-gray-50 p-4">
                    <h3 className="font-bold text-black text-lg">{cls.name}</h3>
                  </div>
                  <div className="p-6 space-y-3">
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
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Schuljahr:</span>
                      <span className="font-semibold text-black">{cls.academic_year}</span>
                    </div>
                  </div>
                  <div className="border-t-2 border-black p-4 space-y-2">
                    <Link
                      href={`/teacher/classes/${cls.id}`}
                      className="block w-full py-2 text-center border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors uppercase text-sm"
                    >
                      Details anzeigen
                    </Link>
                    <Link
                      href={`/teacher/classes/${cls.id}/attendance`}
                      className="block w-full py-2 text-center border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors uppercase text-sm"
                    >
                      Anwesenheit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}