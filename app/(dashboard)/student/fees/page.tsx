// app/(dashboard)/student/fees/page.tsx
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

export default function StudentFeesPage() {
  const { logout } = useAuthStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

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

        const feesRes = await fetch(`/api/students/${profileData.id}/fees`, {
          credentials: 'include',
        });
        if (feesRes.ok) {
          const feesData = await feesRes.json();
          setFees(feesData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique academic years
  const uniqueYears = Array.from(new Set(fees.map(f => f.academic_year))).sort().reverse();

  // Filter fees
  let filteredFees = fees;
  if (filterYear !== "all") {
    filteredFees = filteredFees.filter(f => f.academic_year === filterYear);
  }
  if (filterStatus !== "all") {
    filteredFees = filteredFees.filter(f => 
      filterStatus === "paid" ? f.is_paid : !f.is_paid
    );
  }

  // Calculate statistics
  const totalAmount = filteredFees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = filteredFees.filter(f => f.is_paid).reduce((sum, f) => sum + f.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;
  const paidCount = filteredFees.filter(f => f.is_paid).length;
  const unpaidCount = filteredFees.filter(f => !f.is_paid).length;

  // Check for overdue fees
  const overdueFees = filteredFees.filter(f => 
    !f.is_paid && new Date(f.due_date) < new Date()
  );

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
                  GEBÜHRENÜBERSICHT
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
            {/* Overdue Alert */}
            {overdueFees.length > 0 && (
              <div className="border-2 border-red-600 bg-red-50 p-6 mb-8">
                <h3 className="font-bold text-red-800 mb-2 uppercase">
                  ⚠ ÜBERFÄLLIGE GEBÜHREN
                </h3>
                <p className="text-red-700 mb-4">
                  Sie haben {overdueFees.length} überfällige Gebühr(en) im Gesamtwert von €
                  {overdueFees.reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
                </p>
                <p className="text-sm text-red-600">
                  Bitte kontaktieren Sie das Schulbüro zur Klärung der Zahlung.
                </p>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="border-2 border-black bg-white p-6">
                <p className="text-xs text-gray-500 uppercase mb-2">Gesamt</p>
                <p className="text-3xl font-bold text-black">€{totalAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-2">{filteredFees.length} Gebühren</p>
              </div>
              <div className="border-2 border-green-600 bg-green-50 p-6">
                <p className="text-xs text-green-700 uppercase mb-2">Bezahlt</p>
                <p className="text-3xl font-bold text-green-800">€{paidAmount.toFixed(2)}</p>
                <p className="text-xs text-green-700 mt-2">{paidCount} Gebühren</p>
              </div>
              <div className="border-2 border-red-600 bg-red-50 p-6">
                <p className="text-xs text-red-700 uppercase mb-2">Offen</p>
                <p className="text-3xl font-bold text-red-800">€{unpaidAmount.toFixed(2)}</p>
                <p className="text-xs text-red-700 mt-2">{unpaidCount} Gebühren</p>
              </div>
              <div className="border-2 border-yellow-600 bg-yellow-50 p-6">
                <p className="text-xs text-yellow-700 uppercase mb-2">Überfällig</p>
                <p className="text-3xl font-bold text-yellow-800">{overdueFees.length}</p>
                <p className="text-xs text-yellow-700 mt-2">
                  €{overdueFees.reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Nach Schuljahr filtern
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full p-3 border-2 border-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">Alle Schuljahre</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Nach Status filtern
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-3 border-2 border-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">Alle Status</option>
                  <option value="paid">Nur Bezahlt</option>
                  <option value="unpaid">Nur Offen</option>
                </select>
              </div>
            </div>

            {/* Fees Table */}
            <div className="border-2 border-black bg-white">
              <div className="border-b-2 border-black bg-gray-50 p-4">
                <h2 className="font-bold text-black uppercase tracking-wide text-sm">
                  Gebührendetails
                </h2>
              </div>
              {filteredFees.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">Keine Gebühren verfügbar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-black">
                      <tr>
                        <th className="p-4 text-left text-xs font-bold text-black uppercase">Gebührenart</th>
                        <th className="p-4 text-center text-xs font-bold text-black uppercase">Betrag</th>
                        <th className="p-4 text-center text-xs font-bold text-black uppercase">Fällig am</th>
                        <th className="p-4 text-center text-xs font-bold text-black uppercase">Bezahlt am</th>
                        <th className="p-4 text-center text-xs font-bold text-black uppercase">Status</th>
                        <th className="p-4 text-left text-xs font-bold text-black uppercase">Schuljahr</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-200">
                      {filteredFees.map((fee) => {
                        const isOverdue = !fee.is_paid && new Date(fee.due_date) < new Date();
                        return (
                          <tr key={fee.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                            <td className="p-4 font-semibold text-black">{fee.fee_type}</td>
                            <td className="p-4 text-center font-bold text-black text-lg">
                              €{fee.amount.toFixed(2)}
                            </td>
                            <td className="p-4 text-center text-sm text-gray-600">
                              {new Date(fee.due_date).toLocaleDateString('de-DE')}
                            </td>
                            <td className="p-4 text-center text-sm text-gray-600">
                              {fee.paid_date ? new Date(fee.paid_date).toLocaleDateString('de-DE') : '-'}
                            </td>
                            <td className="p-4 text-center">
                              {fee.is_paid ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 border-2 border-green-600 text-xs font-bold">
                                  BEZAHLT
                                </span>
                              ) : isOverdue ? (
                                <span className="px-3 py-1 bg-red-100 text-red-800 border-2 border-red-600 text-xs font-bold">
                                  ÜBERFÄLLIG
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border-2 border-yellow-600 text-xs font-bold">
                                  OFFEN
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-sm text-gray-600">{fee.academic_year}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payment History by Year */}
            {filterStatus === "all" && uniqueYears.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                  Übersicht nach Schuljahr
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueYears.map((year) => {
                    const yearFees = fees.filter(f => f.academic_year === year);
                    const yearTotal = yearFees.reduce((sum, f) => sum + f.amount, 0);
                    const yearPaid = yearFees.filter(f => f.is_paid).reduce((sum, f) => sum + f.amount, 0);
                    const yearUnpaid = yearTotal - yearPaid;

                    return (
                      <div key={year} className="border-2 border-black bg-white p-6">
                        <h3 className="font-bold text-black mb-3">{year}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Gesamt:</span>
                            <span className="font-semibold text-black">€{yearTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Bezahlt:</span>
                            <span className="font-semibold text-green-700">€{yearPaid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Offen:</span>
                            <span className="font-semibold text-red-700">€{yearUnpaid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Anzahl:</span>
                            <span className="font-semibold text-black">{yearFees.length}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="mt-8 border-2 border-black bg-gray-50 p-6">
              <h3 className="font-bold text-black mb-3 uppercase">Zahlungsinformationen</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Bitte überweisen Sie offene Gebühren rechtzeitig vor dem Fälligkeitsdatum.</p>
                <p>• Bei Fragen zur Zahlung kontaktieren Sie bitte das Schulbüro.</p>
                <p>• Akzeptierte Zahlungsmethoden: Überweisung, Lastschrift, Bar</p>
                <p>• Kontakt: verwaltung@grundschule.de | Tel: +49 211 123456</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}