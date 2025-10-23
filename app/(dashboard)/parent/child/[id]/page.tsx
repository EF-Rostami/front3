// app/(dashboard)/parent/child/[id]/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Child {
  student_id: number;
  firstName: string;
  lastName: string;
  student_number: string;
  grade_level: string;
  relationship_type: string;
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

export default function ParentChildDetailPage() {
  const { logout } = useAuthStore();
  const params = useParams();
  const childId = params?.id as string;
  
  const [child, setChild] = useState<Child | null>(null);
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
    if (childId) {
      loadChildData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const loadChildData = async () => {
    try {
      setLoading(true);

      // Get parent profile first to get children list
      const parentRes = await fetch('/api/parents/me', { credentials: 'include' });
      if (parentRes.ok) {
        const parentData = await parentRes.json();
        
        // Get children
        const childrenRes = await fetch(`/api/parents/${parentData.id}/students`, {
          credentials: 'include',
        });
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          const currentChild = childrenData.find((c: Child) => c.student_id === parseInt(childId));
          setChild(currentChild || null);
        }
      }

      // Get child's grades
      const gradesRes = await fetch(`/api/students/${childId}/grades`, {
        credentials: 'include',
      });
      if (gradesRes.ok) {
        const gradesData = await gradesRes.json();
        setGrades(gradesData);
      }

      // Get child's attendance
      const attendanceRes = await fetch(`/api/students/${childId}/attendance`, {
        credentials: 'include',
      });
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);
      }

      // Get child's fees
      const feesRes = await fetch(`/api/students/${childId}/fees`, {
        credentials: 'include',
      });
      if (feesRes.ok) {
        const feesData = await feesRes.json();
        setFees(feesData);
      }
    } catch (error) {
      console.error('Error loading child data:', error);
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

  if (!child && !loading) {
    return (
      <RoleGuard allowedRoles={['parent']}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="border-2 border-black p-8 text-center">
            <h2 className="text-xl font-bold text-black mb-2">Kind nicht gefunden</h2>
            <Link href="/parent" className="text-sm text-gray-600 hover:text-black">
              ← Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['parent']}>
      <div className="min-h-screen bg-white">
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/parent" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
                  ← Zurück zum Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  {child ? `${child.firstName} ${child.lastName}` : 'LADEN...'}
                </h1>
                {child && (
                  <p className="text-sm text-gray-600 mt-1">
                    {gradeLevels[child.grade_level] || child.grade_level} • Schülernummer: {child.student_number}
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
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Tab Navigation */}
            <div className="border-2 border-black bg-white mb-8">
              <div className="flex divide-x-2 divide-black">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 p-4 text-sm font-bold uppercase transition-colors ${
                    activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  Übersicht
                </button>
                <button
                  onClick={() => setActiveTab('grades')}
                  className={`flex-1 p-4 text-sm font-bold uppercase transition-colors ${
                    activeTab === 'grades' ? 'bg-black text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  Noten
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`flex-1 p-4 text-sm font-bold uppercase transition-colors ${
                    activeTab === 'attendance' ? 'bg-black text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  Anwesenheit
                </button>
                <button
                  onClick={() => setActiveTab('fees')}
                  className={`flex-1 p-4 text-sm font-bold uppercase transition-colors ${
                    activeTab === 'fees' ? 'bg-black text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  Gebühren
                </button>
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-black bg-white p-6">
                    <p className="text-xs text-gray-500 uppercase mb-2">Durchschnittsnote</p>
                    <p className="text-3xl font-bold text-black">{averageGrade}</p>
                    <p className="text-xs text-gray-600 mt-2">aus {grades.length} Noten</p>
                  </div>
                  <div className="border-2 border-black bg-white p-6">
                    <p className="text-xs text-gray-500 uppercase mb-2">Anwesenheit</p>
                    <p className="text-3xl font-bold text-black">{attendanceRate}%</p>
                    <p className="text-xs text-gray-600 mt-2">
                      {attendance.filter(a => a.status === 'present').length} von {attendance.length} Tagen
                    </p>
                  </div>
                  <div className="border-2 border-black bg-white p-6">
                    <p className="text-xs text-gray-500 uppercase mb-2">Offene Gebühren</p>
                    <p className="text-3xl font-bold text-black">€{totalUnpaid.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-2">{unpaidFees.length} offen</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <section>
                  <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                    Neueste Aktivitäten
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recent Grades */}
                    <div className="border-2 border-black bg-white p-6">
                      <h3 className="font-bold text-black mb-4 uppercase text-sm">Letzte Noten</h3>
                      {grades.length === 0 ? (
                        <p className="text-sm text-gray-600">Keine Noten verfügbar</p>
                      ) : (
                        <div className="space-y-3">
                          {grades.slice(0, 3).map((grade) => (
                            <div key={grade.grade_id} className="pb-3 border-b border-gray-200 last:border-b-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-black text-sm">{grade.course_name}</p>
                                <span className="text-lg font-bold text-black">{grade.score}</span>
                              </div>
                              <p className="text-xs text-gray-600">{grade.exam_title}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setActiveTab('grades')}
                        className="mt-4 text-xs font-semibold text-black hover:underline uppercase"
                      >
                        Alle anzeigen →
                      </button>
                    </div>

                    {/* Recent Attendance */}
                    <div className="border-2 border-black bg-white p-6">
                      <h3 className="font-bold text-black mb-4 uppercase text-sm">Letzte Anwesenheit</h3>
                      {attendance.length === 0 ? (
                        <p className="text-sm text-gray-600">Keine Daten verfügbar</p>
                      ) : (
                        <div className="space-y-3">
                          {attendance.slice(0, 3).map((record) => (
                            <div key={record.id} className="pb-3 border-b border-gray-200 last:border-b-0">
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                  {new Date(record.date).toLocaleDateString('de-DE')}
                                </p>
                                <span className={`px-2 py-1 text-xs font-bold border ${
                                  attendanceStatus[record.status]?.color || 'bg-gray-100 text-gray-800'
                                }`}>
                                  {attendanceStatus[record.status]?.label || record.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setActiveTab('attendance')}
                        className="mt-4 text-xs font-semibold text-black hover:underline uppercase"
                      >
                        Alle anzeigen →
                      </button>
                    </div>
                  </div>
                </section>

                {/* Alerts */}
                {unpaidFees.length > 0 && (
                  <div className="border-2 border-red-600 bg-red-50 p-6">
                    <h3 className="font-bold text-red-800 mb-2 uppercase">
                      ⚠ Offene Gebühren
                    </h3>
                    <p className="text-red-700 mb-4">
                      {child?.firstName} hat {unpaidFees.length} offene Gebühr(en) im Gesamtwert von €{totalUnpaid.toFixed(2)}
                    </p>
                    <button
                      onClick={() => setActiveTab('fees')}
                      className="px-4 py-2 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors"
                    >
                      GEBÜHREN ANZEIGEN
                    </button>
                  </div>
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
                            <th className="p-4 text-left text-xs font-bold text-black uppercase">Kommentar</th>
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
                              <td className="p-4 text-sm text-gray-600">{grade.comments || '-'}</td>
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
          </div>
        )}
      </div>
    </RoleGuard>
  );
}