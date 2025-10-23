// app/(dashboard)/admin/fees/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Fee {
  id: number;
  student_id: number;
  amount: number;
  fee_type: string;
  due_date: string;
  paid_date: string | null;
  is_paid: boolean;
  payment_method: string | null;
  academic_year: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  student_number: string;
}

export default function AdminFeesPage() {
  const { logout } = useAuthStore();
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    fee_type: "",
    due_date: "",
    academic_year: "2024/2025"
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load fees
      const feesRes = await fetch('/api/fees', { credentials: 'include' });
      if (feesRes.ok) {
        const feesData = await feesRes.json();
        setFees(feesData);
      }

      // Load students
      const studentsRes = await fetch('/api/students', { credentials: 'include' });
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          student_id: parseInt(formData.student_id),
          amount: parseFloat(formData.amount)
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          student_id: "",
          amount: "",
          fee_type: "",
          due_date: "",
          academic_year: "2024/2025"
        });
        loadData();
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.detail || 'Gebühr konnte nicht erstellt werden'}`);
      }
    } catch (error) {
      console.error('Error creating fee:', error);
      alert('Fehler beim Erstellen der Gebühr');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (feeId: number) => {
    const paymentMethod = prompt('Zahlungsmethode eingeben (z.B. Überweisung, Bar, Lastschrift):');
    if (!paymentMethod) return;

    try {
      const response = await fetch(`/api/fees/${feeId}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payment_method: paymentMethod }),
      });

      if (response.ok) {
        loadData();
      } else {
        alert('Fehler beim Aktualisieren der Zahlung');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Fehler beim Aktualisieren der Zahlung');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie diese Gebühr wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/fees/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadData();
      } else {
        alert('Fehler beim Löschen der Gebühr');
      }
    } catch (error) {
      console.error('Error deleting fee:', error);
      alert('Fehler beim Löschen der Gebühr');
    }
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : '-';
  };

  const uniqueYears = Array.from(new Set(fees.map(f => f.academic_year))).sort().reverse();

  const filteredFees = fees.filter(fee => {
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "paid" && fee.is_paid) ||
      (filterStatus === "unpaid" && !fee.is_paid);
    const matchesYear = filterYear === "all" || fee.academic_year === filterYear;
    return matchesStatus && matchesYear;
  });

  // Calculate statistics
  const totalAmount = filteredFees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = filteredFees.filter(f => f.is_paid).reduce((sum, f) => sum + f.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;
  const paidCount = filteredFees.filter(f => f.is_paid).length;
  const unpaidCount = filteredFees.filter(f => !f.is_paid).length;

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
                  GEBÜHRENVERWALTUNG
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
          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="all">Alle Status</option>
                <option value="paid">Nur Bezahlt</option>
                <option value="unpaid">Nur Offen</option>
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="all">Alle Schuljahre</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors uppercase whitespace-nowrap"
            >
              + Neue Gebühr
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Gesamt</p>
              <p className="text-2xl font-bold text-black">€{totalAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-1">{filteredFees.length} Gebühren</p>
            </div>
            <div className="border-2 border-green-600 bg-green-50 p-6">
              <p className="text-xs text-green-700 uppercase mb-2">Bezahlt</p>
              <p className="text-2xl font-bold text-green-800">€{paidAmount.toFixed(2)}</p>
              <p className="text-xs text-green-700 mt-1">{paidCount} Gebühren</p>
            </div>
            <div className="border-2 border-red-600 bg-red-50 p-6">
              <p className="text-xs text-red-700 uppercase mb-2">Offen</p>
              <p className="text-2xl font-bold text-red-800">€{unpaidAmount.toFixed(2)}</p>
              <p className="text-xs text-red-700 mt-1">{unpaidCount} Gebühren</p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Zahlungsrate</p>
              <p className="text-2xl font-bold text-black">
                {totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Schuljahre</p>
              <p className="text-2xl font-bold text-black">{uniqueYears.length}</p>
            </div>
          </div>

          {/* Fees Table */}
          {loading ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Keine Gebühren gefunden</p>
            </div>
          ) : (
            <div className="border-2 border-black bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-black">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Schüler</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Gebührenart</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Betrag</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Fällig am</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Status</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Schuljahr</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-200">
                    {filteredFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50">
                        <td className="p-4 font-semibold text-black">{getStudentName(fee.student_id)}</td>
                        <td className="p-4 text-sm text-gray-600">{fee.fee_type}</td>
                        <td className="p-4 text-center font-bold text-black">€{fee.amount.toFixed(2)}</td>
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
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {!fee.is_paid && (
                              <button
                                onClick={() => handleMarkAsPaid(fee.id)}
                                className="px-3 py-1 border-2 border-green-600 text-green-600 font-semibold hover:bg-green-600 hover:text-white transition-colors text-xs"
                              >
                                Als bezahlt markieren
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(fee.id)}
                              className="px-3 py-1 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors text-xs"
                            >
                              Löschen
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="border-b-2 border-black bg-gray-50 p-6">
                <h2 className="text-xl font-bold text-black uppercase">Neue Gebühr erstellen</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Schüler *
                    </label>
                    <select
                      required
                      value={formData.student_id}
                      onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                      <option value="">Schüler wählen</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.student_number})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Gebührenart *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fee_type}
                      onChange={(e) => setFormData({...formData, fee_type: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="z.B. Schulgeld, Materialkosten"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Betrag (€) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Fälligkeitsdatum *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Schuljahr *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.academic_year}
                      onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="z.B. 2024/2025"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 uppercase"
                  >
                    {submitting ? 'Erstellen...' : 'Gebühr erstellen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border-2 border-black text-black font-semibold hover:bg-gray-100 transition-colors uppercase"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}