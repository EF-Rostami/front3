// app/(dashboard)/admin/students/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  student_number: string;
  date_of_birth: string;
  grade_level: string;
  class_id: number | null;
}

interface Class {
  id: number;
  name: string;
  grade_level: string;
}

export default function AdminStudentsPage() {
  const { logout } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    student_number: "",
    date_of_birth: "",
    grade_level: "klasse_1",
    address: "",
    emergency_contact: ""
  });
  const [submitting, setSubmitting] = useState(false);

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
      
      // Load students
      const studentsRes = await fetch('/api/students', {
        credentials: 'include',
      });
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data);
      }

      // Load classes
      const classesRes = await fetch('/api/classes', {
        credentials: 'include',
      });
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data);
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
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          student_number: "",
          date_of_birth: "",
          grade_level: "klasse_1",
          address: "",
          emergency_contact: ""
        });
        loadData();
        alert('Schüler erfolgreich erstellt!');
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.detail || 'Schüler konnte nicht erstellt werden'}`);
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Fehler beim Erstellen des Schülers');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie diesen Schüler wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadData();
        alert('Schüler erfolgreich gelöscht!');
      } else {
        alert('Fehler beim Löschen des Schülers');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Fehler beim Löschen des Schülers');
    }
  };

  const getClassName = (classId: number | null) => {
    if (!classId) return 'Keine Klasse';
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.name : 'Unbekannt';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === "all" || student.grade_level === filterGrade;
    return matchesSearch && matchesGrade;
  });

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
                  SCHÜLERVERWALTUNG
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
            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
              <input
                type="text"
                placeholder="Suche nach Name, E-Mail oder Schülernummer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="all">Alle Klassenstufen</option>
                {Object.entries(gradeLevels).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors uppercase whitespace-nowrap"
            >
              + Neuer Schüler
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Gesamt Schüler</p>
              <p className="text-3xl font-bold text-black">{students.length}</p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Gefilterte Ergebnisse</p>
              <p className="text-3xl font-bold text-black">{filteredStudents.length}</p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Klassen</p>
              <p className="text-3xl font-bold text-black">{classes.length}</p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Ohne Klasse</p>
              <p className="text-3xl font-bold text-black">
                {students.filter(s => !s.class_id).length}
              </p>
            </div>
          </div>

          {/* Students Table */}
          {loading ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Keine Schüler gefunden</p>
            </div>
          ) : (
            <div className="border-2 border-black bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-black">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Name</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">E-Mail</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Schülernr.</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Klassenstufe</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Klasse</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="p-4 font-semibold text-black">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="p-4 text-sm text-gray-600">{student.email}</td>
                        <td className="p-4 text-sm text-gray-600">{student.student_number}</td>
                        <td className="p-4 text-sm text-gray-600">
                          {gradeLevels[student.grade_level] || student.grade_level}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {getClassName(student.class_id)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/students/${student.id}`}
                              className="px-3 py-1 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors text-xs"
                            >
                              Details
                            </Link>
                            <button
                              onClick={() => handleDelete(student.id)}
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
                <h2 className="text-xl font-bold text-black uppercase">Neuen Schüler erstellen</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Vorname *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Nachname *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Passwort *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">Min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl, Sonderzeichen</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Schülernummer *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.student_number}
                      onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="z.B. S2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Geburtsdatum *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Klassenstufe *
                    </label>
                    <select
                      required
                      value={formData.grade_level}
                      onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                      {Object.entries(gradeLevels).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Notfallkontakt
                    </label>
                    <input
                      type="text"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Telefonnummer"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Adresse
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      rows={2}
                      placeholder="Straße, PLZ, Stadt"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 uppercase"
                  >
                    {submitting ? 'Erstellen...' : 'Schüler erstellen'}
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