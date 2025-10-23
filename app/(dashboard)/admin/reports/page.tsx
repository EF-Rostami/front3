// app/(dashboard)/admin/reports/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";

interface AttendanceSummary {
  total_records: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}

interface FeeSummary {
  total_fees: number;
  paid_fees: number;
  unpaid_fees: number;
  total_records: number;
  paid_count: number;
  unpaid_count: number;
  payment_rate: number;
}

interface GradeDistribution {
  total_grades: number;
  average_score: number;
  grade_distribution: Record<string, number>;
}

export default function AdminReportsPage() {
  const { logout } = useAuthStore();
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  useEffect(() => {
    loadReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, academicYear]);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Load attendance summary
      const attendanceParams = new URLSearchParams();
      if (dateFrom) attendanceParams.append('date_from', dateFrom);
      if (dateTo) attendanceParams.append('date_to', dateTo);
      
      const attendanceRes = await fetch(`/api/dashboard/attendance-summary?${attendanceParams}`, {
        credentials: 'include',
      });
      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setAttendanceSummary(data);
      }

      // Load fee summary
      const feeParams = new URLSearchParams();
      if (academicYear) feeParams.append('academic_year', academicYear);
      
      const feeRes = await fetch(`/api/dashboard/fee-summary?${feeParams}`, {
        credentials: 'include',
      });
      if (feeRes.ok) {
        const data = await feeRes.json();
        setFeeSummary(data);
      }

      // Load grade distribution
      const gradeRes = await fetch('/api/dashboard/grade-distribution', {
        credentials: 'include',
      });
      if (gradeRes.ok) {
        const data = await gradeRes.json();
        setGradeDistribution(data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    alert('PDF-Export wird implementiert...');
  };

  const exportToExcel = () => {
    alert('Excel-Export wird implementiert...');
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
                  ← Zurück zum Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  BERICHTE & ANALYSEN
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

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Filter Section */}
          <div className="border-2 border-black bg-white p-6 mb-8">
            <h2 className="text-lg font-bold text-black mb-4 uppercase">Berichtsfilter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Von Datum
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Bis Datum
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Schuljahr
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="z.B. 2024/2025"
                  className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={generatePDFReport}
                className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors uppercase"
              >
                📄 PDF Exportieren
              </button>
              <button
                onClick={exportToExcel}
                className="px-6 py-3 border-2 border-black text-black font-semibold hover:bg-gray-100 transition-colors uppercase"
              >
                📊 Excel Exportieren
              </button>
            </div>
          </div>

          {loading ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Berichte werden geladen...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Attendance Report */}
              <section>
                <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                  Anwesenheitsbericht
                </h2>
                {attendanceSummary && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="border-2 border-black bg-white p-6">
                        <p className="text-xs text-gray-500 uppercase mb-2">Gesamt</p>
                        <p className="text-3xl font-bold text-black">{attendanceSummary.total_records}</p>
                      </div>
                      <div className="border-2 border-green-600 bg-green-50 p-6">
                        <p className="text-xs text-green-700 uppercase mb-2">Anwesend</p>
                        <p className="text-3xl font-bold text-green-800">{attendanceSummary.present}</p>
                      </div>
                      <div className="border-2 border-red-600 bg-red-50 p-6">
                        <p className="text-xs text-red-700 uppercase mb-2">Abwesend</p>
                        <p className="text-3xl font-bold text-red-800">{attendanceSummary.absent}</p>
                      </div>
                      <div className="border-2 border-yellow-600 bg-yellow-50 p-6">
                        <p className="text-xs text-yellow-700 uppercase mb-2">Verspätet</p>
                        <p className="text-3xl font-bold text-yellow-800">{attendanceSummary.late}</p>
                      </div>
                      <div className="border-2 border-blue-600 bg-blue-50 p-6">
                        <p className="text-xs text-blue-700 uppercase mb-2">Rate</p>
                        <p className="text-3xl font-bold text-blue-800">{attendanceSummary.attendance_rate}%</p>
                      </div>
                    </div>
                    <div className="border-2 border-black bg-white p-6">
                      <h3 className="font-bold text-black mb-4 uppercase text-sm">Zusammenfassung</h3>
                      <div className="space-y-2 text-sm">
                        <p>• Gesamtanzahl Einträge: <span className="font-bold">{attendanceSummary.total_records}</span></p>
                        <p>• Anwesenheitsquote: <span className="font-bold">{attendanceSummary.attendance_rate}%</span></p>
                        <p>• Entschuldigt: <span className="font-bold">{attendanceSummary.excused}</span></p>
                        <p className="text-gray-600 mt-4">
                          {dateFrom && dateTo 
                            ? `Zeitraum: ${new Date(dateFrom).toLocaleDateString('de-DE')} - ${new Date(dateTo).toLocaleDateString('de-DE')}`
                            : 'Gesamter Zeitraum'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* Fee Report */}
              <section>
                <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                  Gebührenbericht
                </h2>
                {feeSummary && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="border-2 border-black bg-white p-6">
                        <p className="text-xs text-gray-500 uppercase mb-2">Gesamt</p>
                        <p className="text-2xl font-bold text-black">€{feeSummary.total_fees.toFixed(2)}</p>
                        <p className="text-xs text-gray-600 mt-1">{feeSummary.total_records} Gebühren</p>
                      </div>
                      <div className="border-2 border-green-600 bg-green-50 p-6">
                        <p className="text-xs text-green-700 uppercase mb-2">Bezahlt</p>
                        <p className="text-2xl font-bold text-green-800">€{feeSummary.paid_fees.toFixed(2)}</p>
                        <p className="text-xs text-green-700 mt-1">{feeSummary.paid_count} Gebühren</p>
                      </div>
                      <div className="border-2 border-red-600 bg-red-50 p-6">
                        <p className="text-xs text-red-700 uppercase mb-2">Offen</p>
                        <p className="text-2xl font-bold text-red-800">€{feeSummary.unpaid_fees.toFixed(2)}</p>
                        <p className="text-xs text-red-700 mt-1">{feeSummary.unpaid_count} Gebühren</p>
                      </div>
                      <div className="border-2 border-black bg-white p-6">
                        <p className="text-xs text-gray-500 uppercase mb-2">Zahlungsrate</p>
                        <p className="text-2xl font-bold text-black">{feeSummary.payment_rate}%</p>
                      </div>
                    </div>
                    <div className="border-2 border-black bg-white p-6">
                      <h3 className="font-bold text-black mb-4 uppercase text-sm">Finanzübersicht</h3>
                      <div className="space-y-2 text-sm">
                        <p>• Gesamteinnahmen: <span className="font-bold text-green-700">€{feeSummary.paid_fees.toFixed(2)}</span></p>
                        <p>• Ausstehende Beträge: <span className="font-bold text-red-700">€{feeSummary.unpaid_fees.toFixed(2)}</span></p>
                        <p>• Zahlungsquote: <span className="font-bold">{feeSummary.payment_rate}%</span></p>
                        <p className="text-gray-600 mt-4">
                          {academicYear ? `Schuljahr: ${academicYear}` : 'Alle Schuljahre'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* Grade Distribution Report */}
              <section>
                <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                  Notenverteilung
                </h2>
                {gradeDistribution && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="border-2 border-black bg-white p-6">
                        <p className="text-xs text-gray-500 uppercase mb-2">Gesamt Noten</p>
                        <p className="text-3xl font-bold text-black">{gradeDistribution.total_grades}</p>
                      </div>
                      <div className="border-2 border-black bg-white p-6">
                        <p className="text-xs text-gray-500 uppercase mb-2">Durchschnitt</p>
                        <p className="text-3xl font-bold text-black">{gradeDistribution.average_score.toFixed(2)}</p>
                      </div>
                    </div>
                    {Object.keys(gradeDistribution.grade_distribution).length > 0 && (
                      <div className="border-2 border-black bg-white p-6">
                        <h3 className="font-bold text-black mb-4 uppercase text-sm">Verteilung nach Noten</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(gradeDistribution.grade_distribution).map(([grade, count]) => (
                            <div key={grade} className="border-2 border-gray-300 p-4">
                              <p className="text-xs text-gray-500 uppercase mb-1">Note {grade}</p>
                              <p className="text-2xl font-bold text-black">{count}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Quick Actions */}
              <section>
                <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                  Schnellaktionen
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/admin/students"
                    className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-colors text-center"
                  >
                    <div className="text-3xl mb-2">👤</div>
                    <p className="font-bold uppercase">Schülerverwaltung</p>
                  </Link>
                  <Link
                    href="/admin/attendance"
                    className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-colors text-center"
                  >
                    <div className="text-3xl mb-2">📊</div>
                    <p className="font-bold uppercase">Anwesenheit</p>
                  </Link>
                  <Link
                    href="/admin/fees"
                    className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-colors text-center"
                  >
                    <div className="text-3xl mb-2">💰</div>
                    <p className="font-bold uppercase">Gebühren</p>
                  </Link>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}