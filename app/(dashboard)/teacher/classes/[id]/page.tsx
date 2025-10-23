// app/teacher/classes/[id]/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Class {
  id: number;
  name: string;
  grade_level: string;
  room_number: string;
  student_count: number;
  max_students: number;
  academic_year: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  student_number: string;
  date_of_birth: string;
}

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const gradeLevels: Record<string, string> = {
    vorschule: "Vorschule",
    klasse_1: "Klasse 1",
    klasse_2: "Klasse 2",
    klasse_3: "Klasse 3",
    klasse_4: "Klasse 4",
  };

  useEffect(() => {
    loadClassData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      
      const classRes = await fetch(`/api/classes/${classId}`, {
        credentials: 'include',
      });
      
      if (classRes.ok) {
        const classInfo = await classRes.json();
        setClassData(classInfo);
      }

      const studentsRes = await fetch(`/api/classes/${classId}/students`, {
        credentials: 'include',
      });
      
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error loading class data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['teacher']}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Laden...</p>
        </div>
      </RoleGuard>
    );
  }

  if (!classData) {
    return (
      <RoleGuard allowedRoles={['teacher']}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Klasse nicht gefunden</p>
            <Link href="/teacher/classes" className="text-black font-semibold hover:underline">
              Zurück zu Klassen
            </Link>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['teacher']}>
      <div className="min-h-screen bg-white">
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href="/teacher/classes" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
              ← Zurück zu Meine Klassen
            </Link>
            <h1 className="text-2xl font-bold text-black tracking-tight">
              {classData.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {gradeLevels[classData.grade_level] || classData.grade_level} • Raum {classData.room_number}
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Link
              href={`/teacher/classes/${classId}/attendance`}
              className="border-2 border-black p-6 text-center hover:bg-gray-50 transition-colors"
            >
              <p className="font-bold text-black text-lg mb-2">ANWESENHEIT</p>
              <p className="text-sm text-gray-600">Anwesenheit erfassen</p>
            </Link>
            <Link
              href={`/teacher/grades?classId=${classId}`}
              className="border-2 border-black p-6 text-center hover:bg-gray-50 transition-colors"
            >
              <p className="font-bold text-black text-lg mb-2">NOTEN</p>
              <p className="text-sm text-gray-600">Noten verwalten</p>
            </Link>
            <Link
              href={`/teacher/classes/${classId}/exams`}
              className="border-2 border-black p-6 text-center hover:bg-gray-50 transition-colors"
            >
              <p className="font-bold text-black text-lg mb-2">PRÜFUNGEN</p>
              <p className="text-sm text-gray-600">Prüfungen verwalten</p>
            </Link>
            <Link
              href={`/teacher/resources?classId=${classId}`}
              className="border-2 border-black p-6 text-center hover:bg-gray-50 transition-colors"
            >
              <p className="font-bold text-black text-lg mb-2">RESSOURCEN</p>
              <p className="text-sm text-gray-600">Materialien teilen</p>
            </Link>
          </div>

          {/* Class Info */}
          <div className="border-2 border-black bg-white mb-8">
            <div className="border-b-2 border-black bg-gray-50 p-4">
              <h2 className="font-bold text-black uppercase tracking-wide">
                Klasseninformationen
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Klassenstufe</p>
                <p className="text-lg font-bold text-black">
                  {gradeLevels[classData.grade_level] || classData.grade_level}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Schüleranzahl</p>
                <p className="text-lg font-bold text-black">
                  {classData.student_count} / {classData.max_students}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Raum</p>
                <p className="text-lg font-bold text-black">{classData.room_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Schuljahr</p>
                <p className="text-lg font-bold text-black">{classData.academic_year}</p>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="border-2 border-black bg-white">
            <div className="border-b-2 border-black bg-gray-50 p-4">
              <h2 className="font-bold text-black uppercase tracking-wide">
                Schülerliste ({students.length})
              </h2>
            </div>
            {students.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">Keine Schüler in dieser Klasse</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-200">
                {students.map((student, idx) => (
                  <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-black">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Schüler-Nr: {student.student_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="px-4 py-2 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors text-sm"
                        >
                          PROFIL
                        </Link>
                        <Link
                          href={`/teacher/grades?studentId=${student.id}`}
                          className="px-4 py-2 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors text-sm"
                        >
                          NOTEN
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}