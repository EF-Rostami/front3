// app/teacher/students/[id]/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  student_number: string;
  date_of_birth: string;
  enrollment_date: string;
  status: string;
}

interface Grade {
  id: number;
  course_id: number;
  course_name?: string; // Optional, might come from API
  grade_value: number;
  grade_type: string;
  graded_at: string; 
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Course {
  id: number;
  name: string;
  code: string;
}

interface AttendanceRecord {
  id: number;
  date: string;
  status: string;
  class_name: string;
}

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Load student profile
      const studentRes = await fetch(`/api/students/${studentId}`, {
        credentials: 'include',
      });
      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudent(studentData);
      }

      // Load grades
      const gradesRes = await fetch(`/api/grades?studentId=${studentId}`, {
        credentials: 'include',
      });
        if (gradesRes.ok) {
        const gradesData: Grade[] = (await gradesRes.json()).map((g: Grade) => ({
            ...g,
            grade_value: Number(g.grade_value),
        }));
        setGrades(gradesData);
        }


      // Load attendance
      const attendanceRes = await fetch(`/api/attendance?studentId=${studentId}`, {
        credentials: 'include',
      });
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = ():string => {
    if (grades.length === 0) return '0';
    const sum = grades.reduce((acc, grade) => acc + grade.grade_value, 0);
    return (sum / grades.length).toFixed(2);
  };

  const getAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const excused = attendance.filter(a => a.status === 'excused').length;
    
    return { total, present, absent, late, excused };
  };

  const stats = getAttendanceStats();
  const attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  const getGradeColor = (grade: number) => {
    if (grade <= 2) return 'text-green-600';
    if (grade <= 3) return 'text-yellow-600';
    if (grade <= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const statusLabels: Record<string, string> = {
    present: 'Anwesend',
    absent: 'Abwesend',
    late: 'Verspätet',
    excused: 'Entschuldigt'
  };

  const gradeTypeLabels: Record<string, string> = {
    exam: 'Prüfung',
    quiz: 'Test',
    homework: 'Hausaufgabe',
    participation: 'Mitarbeit',
    project: 'Projekt',
    other: 'Sonstiges'
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

  if (!student) {
    return (
      <RoleGuard allowedRoles={['teacher']}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Schüler nicht gefunden</p>
            <Link href="/teacher" className="text-black font-semibold hover:underline">
              Zurück zum Dashboard
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
            <Link href="/teacher" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
              ← Zurück zum Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  {student.firstName} {student.lastName}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Schüler-Nr: {student.student_number}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Student Info */}
            <aside className="lg:col-span-1">
              <div className="border-2 border-black bg-white mb-6">
                <div className="border-b-2 border-black bg-gray-50 p-4">
                  <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                    Schülerinformationen
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Geburtsdatum</p>
                    <p className="text-sm font-bold text-black">
                      {new Date(student.date_of_birth).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Einschreibungsdatum</p>
                    <p className="text-sm font-bold text-black">
                      {new Date(student.enrollment_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                    <p className="text-sm font-bold text-black capitalize">
                      {student.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Alter</p>
                    <p className="text-sm font-bold text-black">
                      {Math.floor((new Date().getTime() - new Date(student.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} Jahre
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-2 border-black bg-white">
                <div className="border-b-2 border-black bg-gray-50 p-4">
                  <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                    Statistiken
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Durchschnittsnote</p>
                    <p className={`text-3xl font-bold ${getGradeColor(parseFloat(calculateAverage()))}`}>
                      {calculateAverage()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Anwesenheitsrate</p>
                    <p className="text-3xl font-bold text-black">
                      {attendanceRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Gesamt Noten</p>
                    <p className="text-3xl font-bold text-black">{grades.length}</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-2">
              {/* Recent Grades */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black uppercase tracking-wide border-b-2 border-black pb-2 flex-1">
                    Aktuelle Noten
                  </h2>
                  <Link 
                    href={`/teacher/grades?studentId=${studentId}`}
                    className="text-sm font-semibold text-black hover:underline uppercase tracking-wide ml-4"
                  >
                    Alle anzeigen →
                  </Link>
                </div>
                {grades.length === 0 ? (
                  <div className="border-2 border-black p-8 text-center">
                    <p className="text-gray-600">Keine Noten vorhanden</p>
                  </div>
                ) : (
                  <div className="border-2 border-black bg-white">
                    <div className="divide-y-2 divide-gray-200">
                      {grades.slice(0, 5).map((grade) => (
                        <div key={grade.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className={`text-2xl font-bold ${getGradeColor(grade.grade_value)}`}>
                                {grade.grade_value.toFixed(1)}
                              </span>
                              <div>
                                <p className="font-bold text-black">{grade.course_name}</p>
                                <p className="text-sm text-gray-600">
                                  {gradeTypeLabels[grade.grade_type] || grade.grade_type} • {new Date(grade.graded_at).toLocaleDateString('de-DE')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Attendance Summary */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                  Anwesenheitsübersicht
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="border-2 border-black p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                    <p className="text-xs text-gray-600 uppercase mt-1">Anwesend</p>
                  </div>
                  <div className="border-2 border-black p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                    <p className="text-xs text-gray-600 uppercase mt-1">Abwesend</p>
                  </div>
                  <div className="border-2 border-black p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
                    <p className="text-xs text-gray-600 uppercase mt-1">Verspätet</p>
                  </div>
                  <div className="border-2 border-black p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{stats.excused}</p>
                    <p className="text-xs text-gray-600 uppercase mt-1">Entschuldigt</p>
                  </div>
                </div>

                {/* Recent Attendance */}
                <div className="border-2 border-black bg-white">
                  <div className="border-b-2 border-black bg-gray-50 p-4">
                    <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                      Letzte Anwesenheitseinträge
                    </h3>
                  </div>
                  {attendance.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">Keine Anwesenheitsdaten vorhanden</p>
                    </div>
                  ) : (
                    <div className="divide-y-2 divide-gray-200">
                      {attendance.slice(0, 10).map((record) => (
                        <div key={record.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-black">
                                {new Date(record.date).toLocaleDateString('de-DE')}
                              </p>
                              <p className="text-sm text-gray-600">{record.class_name}</p>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-bold uppercase ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : record.status === 'absent'
                                  ? 'bg-red-100 text-red-800'
                                  : record.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {statusLabels[record.status]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Grade Distribution */}
              <section>
                <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                  Notenverteilung
                </h2>
                <div className="border-2 border-black bg-white p-6">
                  {grades.length === 0 ? (
                    <p className="text-center text-gray-600">Keine Daten verfügbar</p>
                  ) : (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5, 6].map((gradeValue) => {
                        const count = grades.filter(g => Math.round(g.grade_value) === gradeValue).length;
                        const percentage = grades.length > 0 ? (count / grades.length) * 100 : 0;
                        
                        return (
                          <div key={gradeValue}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-black">Note {gradeValue}</span>
                              <span className="text-sm text-gray-600">
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 h-4 border-2 border-black">
                              <div
                                className={`h-full ${
                                  gradeValue <= 2
                                    ? 'bg-green-500'
                                    : gradeValue <= 3
                                    ? 'bg-yellow-500'
                                    : gradeValue <= 4
                                    ? 'bg-orange-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}