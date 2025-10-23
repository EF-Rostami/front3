// app/(dashboard)/admin/attendance/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Attendance {
  id: number;
  student_id: number;
  date: string;
  status: string;
  notes: string | null;
  recorded_at: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  student_number: string;
  grade_level: string;
}

export default function AdminAttendancePage() {
  const { logout } = useAuthStore();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    student_id: "",
    date: new Date().toISOString().split('T')[0],
    status: "present",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const attendanceStatus: Record<string, { label: string; color: string }> = {
    present: { label: "ANWESEND", color: "bg-green-100 text-green-800 border-green-800" },
    absent: { label: "ABWESEND", color: "bg-red-100 text-red-800 border-red-800" },
    late: { label: "VERSPÄTET", color: "bg-yellow-100 text-yellow-800 border-yellow-800" },
    excused: { label: "ENTSCHULDIGT", color: "bg-blue-100 text-blue-800 border-blue-800" },
  };

  const gradeLevels: Record<string, string> = {
    vorschule: "Vorschule",
    klasse_1: "Klasse 1",
    klasse_2: "Klasse 2",
    klasse_3: "Klasse 3",
    klasse_4: "Klasse 4",
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load attendance
      const attendanceRes = await fetch('/api/attendance', { credentials: 'include' });
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);
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
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          student_id: parseInt(formData.student_id)
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          student_id: "",
          date: new Date().toISOString().split('T')[0],
          status: "present",
          notes: ""
        });
        loadData();
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.detail || 'Anwesenheit konnte nicht erfasst werden'}`);
      }
    } catch (error) {
      console.error('Error creating attendance:', error);
      alert('Fehler beim Erfassen der Anwesenheit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie diesen Anwesenheitseintrag wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/attendance/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadData();
      } else {
        alert('Fehler beim Löschen des Eintrags');
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Fehler beim Löschen des Eintrags');
    }
  };

  const getStudentInfo = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? {
      name: `${student.firstName} ${student.lastName}`,
      number: student.student_number,
      grade: gradeLevels[student.grade_level] || student.grade_level
    } : { name: '-', number: '-', grade: '-' };
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesDate = !filterDate || record.date === filterDate;
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  // Calculate statistics
  const totalRecords = filteredAttendance.length;
  const presentCount = filteredAttendance.filter(a => a.status === 'present').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'absent').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'late').length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const excusedCount = filteredAttendance.filter(a => a.status === 'excused').length;
  const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : "0.0";

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
                  ANWESENHEITSVERWALTUNG
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
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="all">Alle Status</option>
                <option value="present">Anwesend</option>
                <option value="absent">Abwesend</option>
                <option value="late">Verspätet</option>
                <option value="excused">Entschuldigt</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors uppercase whitespace-nowrap"
            >
              + Anwesenheit erfassen
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Gesamt</p>
              <p className="text-3xl font-bold text-black">{totalRecords}</p>
            </div>
            <div className="border-2 border-green-600 bg-green-50 p-6">
              <p className="text-xs text-green-700 uppercase mb-2">Anwesend</p>
              <p className="text-3xl font-bold text-green-800">{presentCount}</p>
            </div>
            <div className="border-2 border-red-600 bg-red-50 p-6">
              <p className="text-xs text-red-700 uppercase mb-2">Abwesend</p>
              <p className="text-3xl font-bold text-red-800">{absentCount}</p>
            </div>
            <div className="border-2 border-yellow-600 bg-yellow-50 p-6">
              <p className="text-xs text-yellow-700 uppercase mb-2">Verspätet</p>
              <p className="text-3xl font-bold text-yellow-800">{lateCount}</p>
            </div>
            <div className="border-2 border-blue-600 bg-blue-50 p-6">
              <p className="text-xs text-blue-700 uppercase mb-2">Rate</p>
              <p className="text-3xl font-bold text-blue-800">{attendanceRate}%</p>
            </div>
          </div>

          {/* Attendance Table */}
          {loading ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Keine Anwesenheitsdaten gefunden</p>
            </div>
          ) : (
            <div className="border-2 border-black bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-black">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Schüler</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Schülernr.</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Klasse</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Datum</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Status</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Notizen</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-200">
                    {filteredAttendance.map((record) => {
                      const studentInfo = getStudentInfo(record.student_id);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="p-4 font-semibold text-black">{studentInfo.name}</td>
                          <td className="p-4 text-sm text-gray-600">{studentInfo.number}</td>
                          <td className="p-4 text-sm text-gray-600">{studentInfo.grade}</td>
                          <td className="p-4 text-center text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString('de-DE')}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 text-xs font-bold border-2 ${
                              attendanceStatus[record.status]?.color || 'bg-gray-100 text-gray-800 border-gray-800'
                            }`}>
                              {attendanceStatus[record.status]?.label || record.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{record.notes || '-'}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="px-3 py-1 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors text-xs"
                              >
                                Löschen
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                <h2 className="text-xl font-bold text-black uppercase">Anwesenheit erfassen</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 gap-4 mb-6">
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
                          {student.firstName} {student.lastName} ({student.student_number}) - {gradeLevels[student.grade_level]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Datum *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Status *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                      <option value="present">Anwesend</option>
                      <option value="absent">Abwesend</option>
                      <option value="late">Verspätet</option>
                      <option value="excused">Entschuldigt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Notizen
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      rows={3}
                      placeholder="Zusätzliche Anmerkungen..."
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 uppercase"
                  >
                    {submitting ? 'Erfassen...' : 'Anwesenheit erfassen'}
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