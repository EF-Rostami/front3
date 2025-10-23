// app/(dashboard)/admin/teachers/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employee_number: string;
  subject_specialization: string | null;
}

export default function AdminTeachersPage() {
  const { logout } = useAuthStore();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    employee_number: "",
    subject_specialization: "",
    phone_number: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/teachers', {
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
          employee_number: "",
          subject_specialization: "",
          phone_number: ""
        });
        loadTeachers();
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.detail || 'Lehrer konnte nicht erstellt werden'}`);
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      alert('Fehler beim Erstellen des Lehrers');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie diesen Lehrer wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/teachers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadTeachers();
      } else {
        alert('Fehler beim Löschen des Lehrers');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Fehler beim Löschen des Lehrers');
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.employee_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  LEHRERVERWALTUNG
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
            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Suche nach Name, E-Mail oder Personalnummer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors uppercase whitespace-nowrap"
            >
              + Neuer Lehrer
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Gesamt Lehrer</p>
              <p className="text-3xl font-bold text-black">{teachers.length}</p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Gefilterte Ergebnisse</p>
              <p className="text-3xl font-bold text-black">{filteredTeachers.length}</p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Aktive Lehrer</p>
              <p className="text-3xl font-bold text-black">{teachers.length}</p>
            </div>
          </div>

          {/* Teachers Table */}
          {loading ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Keine Lehrer gefunden</p>
            </div>
          ) : (
            <div className="border-2 border-black bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-black">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Name</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">E-Mail</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Personalnummer</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Fachgebiet</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-200">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="p-4 font-semibold text-black">
                          {teacher.firstName} {teacher.lastName}
                        </td>
                        <td className="p-4 text-sm text-gray-600">{teacher.email}</td>
                        <td className="p-4 text-sm text-gray-600">{teacher.employee_number}</td>
                        <td className="p-4 text-sm text-gray-600">
                          {teacher.subject_specialization || '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/teachers/${teacher.id}`}
                              className="px-3 py-1 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors text-xs"
                            >
                              Details
                            </Link>
                            <button
                              onClick={() => handleDelete(teacher.id)}
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
                <h2 className="text-xl font-bold text-black uppercase">Neuen Lehrer erstellen</h2>
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
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Personalnummer *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employee_number}
                      onChange={(e) => setFormData({...formData, employee_number: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Telefonnummer
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Fachgebiet
                    </label>
                    <input
                      type="text"
                      value={formData.subject_specialization}
                      onChange={(e) => setFormData({...formData, subject_specialization: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="z.B. Mathematik, Deutsch, Sachkunde"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 uppercase"
                  >
                    {submitting ? 'Erstellen...' : 'Lehrer erstellen'}
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