// app/(dashboard)/admin/courses/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Course {
  id: number;
  name: string;
  code: string;
  description: string | null;
  class_id: number;
  teacher_id: number;
  academic_year: string;
}

interface Class {
  id: number;
  name: string;
  grade_level: string;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

export default function AdminCoursesPage() {
  const { logout } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    class_id: "",
    teacher_id: "",
    academic_year: "2024/2025"
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load courses
      const coursesRes = await fetch('/api/courses', { credentials: 'include' });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }

      // Load classes
      const classesRes = await fetch('/api/classes', { credentials: 'include' });
      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }

      // Load teachers
      const teachersRes = await fetch('/api/teachers', { credentials: 'include' });
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);
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
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          class_id: parseInt(formData.class_id),
          teacher_id: parseInt(formData.teacher_id)
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          name: "",
          code: "",
          description: "",
          class_id: "",
          teacher_id: "",
          academic_year: "2024/2025"
        });
        loadData();
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.detail || 'Kurs konnte nicht erstellt werden'}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Fehler beim Erstellen des Kurses');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie diesen Kurs wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadData();
      } else {
        alert('Fehler beim Löschen des Kurses');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Fehler beim Löschen des Kurses');
    }
  };

  const getClassName = (classId: number) => {
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.name : '-';
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : '-';
  };

  const uniqueYears = Array.from(new Set(courses.map(c => c.academic_year))).sort().reverse();

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === "all" || course.academic_year === filterYear;
    return matchesSearch && matchesYear;
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
                  KURSVERWALTUNG
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
                placeholder="Suche nach Kursname oder Code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
              />
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
              + Neuer Kurs
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Gesamt Kurse</p>
              <p className="text-3xl font-bold text-black">{courses.length}</p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Gefilterte</p>
              <p className="text-3xl font-bold text-black">{filteredCourses.length}</p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Schuljahre</p>
              <p className="text-3xl font-bold text-black">{uniqueYears.length}</p>
            </div>
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Lehrer</p>
              <p className="text-3xl font-bold text-black">{teachers.length}</p>
            </div>
          </div>

          {/* Courses Table */}
          {loading ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Keine Kurse gefunden</p>
            </div>
          ) : (
            <div className="border-2 border-black bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-black">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Kursname</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Code</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Klasse</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Lehrer</th>
                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Schuljahr</th>
                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-200">
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="p-4 font-semibold text-black">{course.name}</td>
                        <td className="p-4 text-sm text-gray-600">{course.code}</td>
                        <td className="p-4 text-sm text-gray-600">{getClassName(course.class_id)}</td>
                        <td className="p-4 text-sm text-gray-600">{getTeacherName(course.teacher_id)}</td>
                        <td className="p-4 text-sm text-gray-600">{course.academic_year}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/courses/${course.id}`}
                              className="px-3 py-1 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors text-xs"
                            >
                              Details
                            </Link>
                            <button
                              onClick={() => handleDelete(course.id)}
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
                <h2 className="text-xl font-bold text-black uppercase">Neuen Kurs erstellen</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Klasse *
                    </label>
                    <select
                      required
                      value={formData.class_id}
                      onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                      <option value="">Klasse wählen</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Lehrer *
                    </label>
                    <select
                      required
                      value={formData.teacher_id}
                      onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                      <option value="">Lehrer wählen</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      Beschreibung
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      rows={3}
                      placeholder="Kursbeschreibung..."
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 uppercase"
                  >
                    {submitting ? 'Erstellen...' : 'Kurs erstellen'}
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
// -2">
//                       Kursname *
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={formData.name}
//                       onChange={(e) => setFormData({...formData, name: e.target.value})}
//                       className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
//                       placeholder="z.B. Mathematik Grundlagen"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-black uppercase mb-2">
//                       Kurscode *
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={formData.code}
//                       onChange={(e) => setFormData({...formData, code: e.target.value})}
//                       className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
//                       placeholder="z.B. MATH-101"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-black uppercase mb