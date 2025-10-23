// app/(dashboard)/admin/students/[id]/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  student_number: string;
  date_of_birth: string;
  grade_level: string;
  class_id: number | null;
  address: string | null;
  emergency_contact: string | null;
}

interface Grade {
  grade_id: number;
  course_name: string;
  exam_title: string;
  score: number;
  grade_value: string | null;
  graded_at: string;
}

interface Attendance {
  id: number;
  date: string;
  status: string;
  notes: string | null;
}

interface Fee {
  id: number;
  amount: number;
  fee_type: string;
  due_date: string;
  is_paid: boolean;
  academic_year: string;
}

export default function AdminStudentDetailPage() {
  const { logout } = useAuthStore();
  const params = useParams();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  const gradeLevels: Record<string, string> = {
    vorschule: "Vorschule",
    klasse_1: "Klasse 1",
    klasse_2: "Klasse 2",
    klasse_3: "Klasse 3",
    klasse_4: "Klasse 4",
  };

  const attendanceStatus: Record<string, { label: string; color: string }> = {
    present: { label: "ANWESEND", color: "bg-green-100 text-green-800 border-green-800" },
    absent: { label: "ABWESEND", color: "bg-red-100 text-red-800 border-red-800" },
    late: { label: "VERSPÄTET", color: "bg-yellow-100 text-yellow-800 border-yellow-800" },
    excused: { label: "ENTSCHULDIGT", color: "bg-blue-100 text-blue-800 border-blue-800" },
  };

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // Load student details
      const studentRes = await fetch(`/api/students/${studentId}`, {
        credentials: 'include',
      });
      if (studentRes.ok) {
        const data = await studentRes.json();
        setStudent(data);
      }

      // Load grades
      const gradesRes = await fetch(`/api/students/${studentId}/grades`, {
        credentials: 'include',
      });
      if (gradesRes.ok) {
        const data = await gradesRes.json();
        setGrades(data);
      }

      // Load attendance
      const attendanceRes = await fetch(`/api/students/${studentId}/attendance`, {
        credentials: 'include',
      });
      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setAttendance(data);
      }

      // Load fees
      const feesRes = await fetch(`/api/students/${studentId}/fees`, {
        credentials: 'include',
      });
      if (feesRes.ok) {
        const data = await feesRes.json();
        setFees(data);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(2)
    : "0.00";

  const attendanceRate = attendance.length > 0
    ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1)
    : "0.0";

  const unpaidFees = fees.filter(f => !f.is_paid);
  const totalUnpaid = unpaidFees.reduce((sum, f) => sum + f.amount, 0);

  if (!student && !loading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="border-2 border-black p-8 text-center">
            <h2 className="text-xl font-bold text-black mb-2">Schüler nicht gefunden</h2>
            <Link href="/admin/students" className="text-sm text-gray-600 hover:text-black">
              ← Zurück zur Schülerliste
            </Link>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin/students" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
                  ← Zurück zur Schülerliste
                </Link>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  {student ? `${student.firstName} ${student.lastName}` : 'LADEN...'}
                </h1>
                {student && (
                  <p className="text-sm text-gray-600 mt-1">
                    Schülernummer: {student.student_number} • {gradeLevels[student.grade_level]}
                  </p>
                )}
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
        ) : student && (
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
                      <p className="text-xs text-gray-500 uppercase mb-1">Name</p>
                      <p className="font-semibold text-black">
                        {student.firstName} {student.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">E-Mail</p>
                      <p className="text-sm text-black break-all">{student.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Schülernummer</p>
                      <p className="font-semibold text-black">{student.student_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Geburtsdatum</p>
                      <p className="text-sm text-black">
                        {new Date(student.date_of_birth).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Klassenstufe</p>
                      <p className="font-semibold text-black">
                        {gradeLevels[student.grade_level]}
                      </p>
                    </div>
                    {student.address && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Adresse</p>
                        <p className="text-sm text-black">{student.address}</p>
                      </div>
                    )}
                    {student.emergency_contact && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Notfallkontakt</p>
                        <p className="text-sm text-black">{student.emergency_contact}</p>
                      </div>
                    )}
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
                      <p className="text-2xl font-bold text-black">{averageGrade}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Anwesenheitsrate</p>
                      <p className="text-2xl font-bold text-black">{attendanceRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Offene Gebühren</p>
                      <p className="text-2xl font-bold text-black">{unpaidFees.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Gesamt Noten</p>
                      <p className="text-2xl font-bold text-black">{grades.length}</p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="lg:col-span-2">
                {/* Grades Section */}
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                    Noten
                  </h2>
                  {grades.length === 0 ? (
                    <div className="border-2 border-black p-8 text-center">
                      <p className="text-gray-600">Noch keine Noten verfügbar</p>
                    </div>
                  ) : (
                    <div className="border-2 border-black bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b-2 border-black">
                            <tr>
                              <th className="p-4 text-left text-xs font-bold text-black uppercase">Kurs</th>
                              <th className="p-4 text-left text-xs font-bold text-black uppercase">Prüfung</th>
                              <th className="p-4 text-center text-xs font-bold text-black uppercase">Punkte</th>
                              <th className="p-4 text-center text-xs font-bold text-black uppercase">Note</th>
                              <th className="p-4 text-left text-xs font-bold text-black uppercase">Datum</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-gray-200">
                            {grades.map((grade) => (
                              <tr key={grade.grade_id} className="hover:bg-gray-50">
                                <td className="p-4 font-semibold text-black">{grade.course_name}</td>
                                <td className="p-4 text-sm text-gray-600">{grade.exam_title}</td>
                                <td className="p-4 text-center font-bold text-black">{grade.score}</td>
                                <td className="p-4 text-center">
                                  {grade.grade_value && (
                                    <span className="px-3 py-1 bg-black text-white font-bold text-sm">
                                      {grade.grade_value}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                  {new Date(grade.graded_at).toLocaleDateString('de-DE')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>

                {/* Attendance Section */}
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                    Anwesenheit (Letzte 10)
                  </h2>
                  {attendance.length === 0 ? (
                    <div className="border-2 border-black p-8 text-center">
                      <p className="text-gray-600">Keine Anwesenheitsdaten verfügbar</p>
                    </div>
                  ) : (
                    <div className="border-2 border-black bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b-2 border-black">
                            <tr>
                              <th className="p-4 text-left text-xs font-bold text-black uppercase">Datum</th>
                              <th className="p-4 text-center text-xs font-bold text-black uppercase">Status</th>
                              <th className="p-4 text-left text-xs font-bold text-black uppercase">Notizen</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-gray-200">
                            {attendance.slice(0, 10).map((record) => (
                              <tr key={record.id} className="hover:bg-gray-50">
                                <td className="p-4 font-semibold text-black">
                                  {new Date(record.date).toLocaleDateString('de-DE', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`inline-block px-3 py-1 text-xs font-bold border-2 ${
                                    attendanceStatus[record.status]?.color || 'bg-gray-100 text-gray-800 border-gray-800'
                                  }`}>
                                    {attendanceStatus[record.status]?.label || record.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                  {record.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>

                {/* Fees Section */}
                <section>
                  <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                    Gebühren
                  </h2>
                  {fees.length === 0 ? (
                    <div className="border-2 border-black p-8 text-center">
                      <p className="text-gray-600">Keine Gebühren verfügbar</p>
                    </div>
                  ) : (
                    <>
                      {/* Fee Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="border-2 border-black bg-white p-6">
                          <p className="text-xs text-gray-500 uppercase mb-2">Gesamt</p>
                          <p className="text-2xl font-bold text-black">
                            €{fees.reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="border-2 border-green-600 bg-green-50 p-6">
                          <p className="text-xs text-green-700 uppercase mb-2">Bezahlt</p>
                          <p className="text-2xl font-bold text-green-800">
                            €{fees.filter(f => f.is_paid).reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="border-2 border-red-600 bg-red-50 p-6">
                          <p className="text-xs text-red-700 uppercase mb-2">Offen</p>
                          <p className="text-2xl font-bold text-red-800">
                            €{totalUnpaid.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Fees Table */}
                      <div className="border-2 border-black bg-white">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-black">
                              <tr>
                                <th className="p-4 text-left text-xs font-bold text-black uppercase">Gebührenart</th>
                                <th className="p-4 text-center text-xs font-bold text-black uppercase">Betrag</th>
                                <th className="p-4 text-center text-xs font-bold text-black uppercase">Fällig am</th>
                                <th className="p-4 text-center text-xs font-bold text-black uppercase">Status</th>
                                <th className="p-4 text-left text-xs font-bold text-black uppercase">Schuljahr</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-200">
                              {fees.map((fee) => (
                                <tr key={fee.id} className="hover:bg-gray-50">
                                  <td className="p-4 font-semibold text-black">{fee.fee_type}</td>
                                  <td className="p-4 text-center font-bold text-black">
                                    €{fee.amount.toFixed(2)}
                                  </td>
                                  <td className="p-4 text-center text-sm text-gray-600">
                                    {new Date(fee.due_date).toLocaleDateString('de-DE')}
                                  </td>
                                  <td className="p-4 text-center">
                                    {fee.is_paid ? (
                                      <span className="px-3 py-1 bg-green-100 text-green-800 border-2 border-green-600 text-xs font-bold">
                                        BEZAHLT
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 bg-red-100 text-red-800 border-2 border-red-600 text-xs font-bold">
                                        OFFEN
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 text-sm text-gray-600">{fee.academic_year}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              </main>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}