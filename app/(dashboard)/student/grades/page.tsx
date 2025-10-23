// app/(dashboard)/student/grades/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useEffect, useState } from "react";
import Link from "next/link";

interface StudentProfile {
  id: number;
  firstName: string;
  lastName: string;
}

interface Grade {
  grade_id: number;
  course_name: string;
  exam_title: string;
  score: number;
  grade_value: string | null;
  comments: string | null;
  graded_at: string;
}

export default function StudentGradesPage() {
  const { logout } = useAuthStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileRes = await fetch('/api/students/me', { credentials: 'include' });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setStudentProfile(profileData);

        const gradesRes = await fetch(`/api/students/${profileData.id}/grades`, {
          credentials: 'include',
        });
        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          setGrades(gradesData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique courses
  const uniqueCourses = Array.from(new Set(grades.map(g => g.course_name)));

  // Filter grades
  const filteredGrades = filterCourse === "all" 
    ? grades 
    : grades.filter(g => g.course_name === filterCourse);

  // Calculate statistics
  const averageScore = filteredGrades.length > 0
    ? (filteredGrades.reduce((sum, g) => sum + g.score, 0) / filteredGrades.length).toFixed(2)
    : "0.00";

  const highestScore = filteredGrades.length > 0
    ? Math.max(...filteredGrades.map(g => g.score))
    : 0;

  const lowestScore = filteredGrades.length > 0
    ? Math.min(...filteredGrades.map(g => g.score))
    : 0;

  return (
    <RoleGuard allowedRoles={['student']}>
      <div className="min-h-screen bg-white">
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/student" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
                  ← Zurück zum Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  NOTENÜBERSICHT
                </h1>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors"
              >
                ABMELDEN
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="max-w-7xl mx-auto px-6 py-12 text-center">
            <p className="text-gray-600">Laden...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="border-2 border-black bg-white p-6">
                <p className="text-xs text-gray-500 uppercase mb-2">Gesamt Noten</p>
                <p className="text-3xl font-bold text-black">{filteredGrades.length}</p>
              </div>
              <div className="border-2 border-black bg-white p-6">
                <p className="text-xs text-gray-500 uppercase mb-2">Durchschnitt</p>
                <p className="text-3xl font-bold text-black">{averageScore}</p>
              </div>
              <div className="border-2 border-green-600 bg-green-50 p-6">
                <p className="text-xs text-green-700 uppercase mb-2">Beste Note</p>
                <p className="text-3xl font-bold text-green-800">{highestScore}</p>
              </div>
              <div className="border-2 border-red-600 bg-red-50 p-6">
                <p className="text-xs text-red-700 uppercase mb-2">Niedrigste Note</p>
                <p className="text-3xl font-bold text-red-800">{lowestScore}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black uppercase mb-2">
                Nach Kurs filtern
              </label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full md:w-64 p-3 border-2 border-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">Alle Kurse</option>
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Grades Table */}
            <div className="border-2 border-black bg-white">
              <div className="border-b-2 border-black bg-gray-50 p-4">
                <h2 className="font-bold text-black uppercase tracking-wide text-sm">
                  Alle Noten {filterCourse !== "all" && `- ${filterCourse}`}
                </h2>
              </div>
              {filteredGrades.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">Keine Noten verfügbar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-black">
                      <tr>
                        <th className="p-4 text-left text-xs font-bold text-black uppercase">Kurs</th>
                        <th className="p-4 text-left text-xs font-bold text-black uppercase">Prüfung</th>
                        <th className="p-4 text-center text-xs font-bold text-black uppercase">Punkte</th>
                        <th className="p-4 text-center text-xs font-bold text-black uppercase">Note</th>
                        <th className="p-4 text-left text-xs font-bold text-black uppercase">Kommentar</th>
                        <th className="p-4 text-left text-xs font-bold text-black uppercase">Datum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-200">
                      {filteredGrades.map((grade) => (
                        <tr key={grade.grade_id} className="hover:bg-gray-50">
                          <td className="p-4 font-semibold text-black">{grade.course_name}</td>
                          <td className="p-4 text-sm text-gray-600">{grade.exam_title}</td>
                          <td className="p-4 text-center font-bold text-black text-lg">{grade.score}</td>
                          <td className="p-4 text-center">
                            {grade.grade_value && (
                              <span className="px-3 py-1 bg-black text-white font-bold text-sm">
                                {grade.grade_value}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-600 max-w-xs">
                            {grade.comments || '-'}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {new Date(grade.graded_at).toLocaleDateString('de-DE')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Course Performance Summary */}
            {filterCourse === "all" && uniqueCourses.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                  Leistung pro Kurs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueCourses.map((course) => {
                    const courseGrades = grades.filter(g => g.course_name === course);
                    const courseAvg = (courseGrades.reduce((sum, g) => sum + g.score, 0) / courseGrades.length).toFixed(2);
                    return (
                      <div key={course} className="border-2 border-black bg-white p-6">
                        <h3 className="font-bold text-black mb-3">{course}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Anzahl Noten:</span>
                            <span className="font-semibold text-black">{courseGrades.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Durchschnitt:</span>
                            <span className="font-semibold text-black">{courseAvg}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Beste Note:</span>
                            <span className="font-semibold text-green-700">
                              {Math.max(...courseGrades.map(g => g.score))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}