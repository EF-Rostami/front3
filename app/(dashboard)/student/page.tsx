// app/(dashboard)/student/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { RoleSwitcher } from "@/app/components/RoleSwitcher";
import { useEffect, useState } from "react";

interface StudentProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  student_number: string;
  date_of_birth: string;
  grade_level: string;
  class_id: number | null;
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
  paid_date: string | null;
  is_paid: boolean;
  payment_method: string | null;
  academic_year: string;
}

export default function StudentPage() {
  const { user, getFullName, logout, selectedRole } = useAuthStore();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'fees'>('overview');

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
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Get student profile
      const profileRes = await fetch('/api/students/me', {
        credentials: 'include',
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setStudentProfile(profileData);

        // Get student's grades
        const gradesRes = await fetch(`/api/students/${profileData.id}/grades`, {
          credentials: 'include',
        });
        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          setGrades(gradesData);
        }

        // Get student's attendance
        const attendanceRes = await fetch(`/api/students/${profileData.id}/attendance`, {
          credentials: 'include',
        });
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          setAttendance(attendanceData);
        }

        // Get student's fees
        const feesRes = await fetch(`/api/students/${profileData.id}/fees`, {
          credentials: 'include',
        });
        if (feesRes.ok) {
          const feesData = await feesRes.json();
          setFees(feesData);
        }
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

  return (
    <RoleGuard allowedRoles={['student']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  SCHÜLERPORTAL
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

                {/* Profile Card */}
                {studentProfile && (
                  <div className="border-2 border-black bg-white mb-6">
                    <div className="border-b-2 border-black bg-gray-50 p-4">
                      <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                        Mein Profil
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Schülernummer</p>
                        <p className="font-semibold text-black">{studentProfile.student_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Klassenstufe</p>
                        <p className="font-semibold text-black">
                          {gradeLevels[studentProfile.grade_level] || studentProfile.grade_level}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">E-Mail</p>
                        <p className="text-sm text-black break-all">{studentProfile.email}</p>
                      </div>
                    </div>
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
                      <p className="text-xs text-gray-500 uppercase mb-1">Noten insgesamt</p>
                      <p className="text-2xl font-bold text-black">{grades.length}</p>
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
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === 'overview' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      ÜBERSICHT
                    </button>
                    <button
                      onClick={() => setActiveTab('grades')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === 'grades' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      NOTEN
                    </button>
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === 'attendance' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      ANWESENHEIT
                    </button>
                    <button
                      onClick={() => setActiveTab('fees')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === 'fees' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      GEBÜHREN
                    </button>
                  </div>
                </nav>
              </aside>

              {/* Main Content */}
              <main className="lg:col-span-3">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Recent Grades */}
                    <section>
                      <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                        Neueste Noten
                      </h2>
                      {grades.length === 0 ? (
                        <div className="border-2 border-black p-8 text-center">
                          <p className="text-gray-600">Noch keine Noten verfügbar</p>
                        </div>
                      ) : (
                        <div className="border-2 border-black bg-white">
                          {grades.slice(0, 5).map((grade) => (
                            <div key={grade.grade_id} className="p-4 border-b-2 border-gray-200 last:border-b-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-black">{grade.course_name}</p>
                                  <p className="text-sm text-gray-600">{grade.exam_title}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-black">{grade.score}</p>
                                  {grade.grade_value && (
                                    <p className="text-sm text-gray-600">{grade.grade_value}</p>
                                  )}
                                </div>
                              </div>
                              {grade.comments && (
                                <p className="text-sm text-gray-600 mt-2">{grade.comments}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Recent Attendance */}
                    <section>
                      <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                        Letzte Anwesenheit
                      </h2>
                      {attendance.length === 0 ? (
                        <div className="border-2 border-black p-8 text-center">
                          <p className="text-gray-600">Keine Anwesenheitsdaten verfügbar</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {attendance.slice(0, 6).map((record) => (
                            <div key={record.id} className="border-2 border-black bg-white p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">
                                  {new Date(record.date).toLocaleDateString('de-DE')}
                                </p>
                                <span className={`px-2 py-1 text-xs font-bold border-2 ${
                                  attendanceStatus[record.status]?.color || 'bg-gray-100 text-gray-800 border-gray-800'
                                }`}>
                                  {attendanceStatus[record.status]?.label || record.status.toUpperCase()}
                                </span>
                              </div>
                              {record.notes && (
                                <p className="text-sm text-gray-600">{record.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Unpaid Fees Alert */}
                    {unpaidFees.length > 0 && (
                      <section>
                        <div className="border-2 border-red-600 bg-red-50 p-6">
                          <h3 className="font-bold text-red-800 mb-2 uppercase">
                            ⚠ Offene Gebühren
                          </h3>
                          <p className="text-red-700 mb-4">
                            Sie haben {unpaidFees.length} offene Gebühr(en) im Gesamtwert von €{totalUnpaid.toFixed(2)}
                          </p>
                          <button
                            onClick={() => setActiveTab('fees')}
                            className="px-4 py-2 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors"
                          >
                            GEBÜHREN ANZEIGEN
                          </button>
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {/* Grades Tab */}
                {activeTab === 'grades' && (
                  <section>
                    <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                      Alle Noten
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
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                  <section>
                    <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                      Anwesenheitsverlauf
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
                              {attendance.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50">
                                  <td className="p-4 font-semibold text-black">
                                    {new Date(record.date).toLocaleDateString('de-DE', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
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
                )}

                {/* Fees Tab */}
                {activeTab === 'fees' && (
                  <section>
                    <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                      Gebührenübersicht
                    </h2>
                    {fees.length === 0 ? (
                      <div className="border-2 border-black p-8 text-center">
                        <p className="text-gray-600">Keine Gebühren verfügbar</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

                        {/* Fees List */}
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
                      </div>
                    )}
                  </section>
                )}
              </main>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}