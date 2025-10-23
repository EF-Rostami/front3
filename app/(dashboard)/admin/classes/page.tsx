// app/admin/classes/page.tsx - Classes Management
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Class {
  id: number;
  name: string;
  grade_level: string;
  academic_year: string;
  room_number: string | null;
  max_students: number;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  employee_number: string;
  subject_specialization: string | null;
}

export default function AdminClassesPage() {
  const { logout } = useAuthStore();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    grade_level: 'klasse_1',
    academic_year: '2024/2025',
    room_number: '',
    max_students: 25,
    class_teacher_id: null as number | null
  });

  const gradeLevels = [
    { value: "vorschule", label: "Vorschule" },
    { value: "klasse_1", label: "Klasse 1" },
    { value: "klasse_2", label: "Klasse 2" },
    { value: "klasse_3", label: "Klasse 3" },
    { value: "klasse_4", label: "Klasse 4" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load classes
      const classesRes = await fetch('/api/classes', {
        credentials: 'include',
      });
      const classesData = await classesRes.json();
      setClasses(classesData);

      // Load teachers for assignment
      const teachersRes = await fetch('/api/teachers', {
        credentials: 'include',
      });
      const teachersData = await teachersRes.json();
      setTeachers(teachersData);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newClass),
      });

      if (response.ok) {
        setShowAddModal(false);
        loadData();
        setNewClass({
          name: '',
          grade_level: 'klasse_1',
          academic_year: '2024/2025',
          room_number: '',
          max_students: 25,
          class_teacher_id: null
        });
      }
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Klasse löschen möchten?')) return;
    
    try {
      await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin" className="text-sm text-gray-600 hover:text-black mb-2 block">
                  ← Zurück zum Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  KLASSENVERWALTUNG
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="border-2 border-black p-4 bg-white">
              <p className="text-xs text-gray-500 uppercase mb-1">Gesamt Klassen</p>
              <p className="text-3xl font-bold text-black">{classes.length}</p>
            </div>
            <div className="border-2 border-black p-4 bg-white">
              <p className="text-xs text-gray-500 uppercase mb-1">Vorschule</p>
              <p className="text-3xl font-bold text-black">
                {classes.filter(c => c.grade_level === 'vorschule').length}
              </p>
            </div>
            <div className="border-2 border-black p-4 bg-white">
              <p className="text-xs text-gray-500 uppercase mb-1">Grundschule</p>
              <p className="text-3xl font-bold text-black">
                {classes.filter(c => c.grade_level !== 'vorschule').length}
              </p>
            </div>
            <div className="border-2 border-black p-4 bg-white">
              <p className="text-xs text-gray-500 uppercase mb-1">Max. Kapazität</p>
              <p className="text-3xl font-bold text-black">
                {classes.reduce((sum, c) => sum + c.max_students, 0)}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black uppercase">Klassenliste</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              + KLASSE HINZUFÜGEN
            </button>
          </div>

          {/* Classes Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <div key={classItem.id} className="border-2 border-black bg-white p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-black">{classItem.name}</h3>
                      <p className="text-sm text-gray-600">
                        {gradeLevels.find(g => g.value === classItem.grade_level)?.label}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-xs font-semibold">
                      {classItem.academic_year}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Raum:</span>
                      <span className="font-semibold">{classItem.room_number || 'Nicht zugewiesen'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max. Schüler:</span>
                      <span className="font-semibold">{classItem.max_students}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/classes/${classItem.id}`}
                      className="flex-1 text-center px-3 py-2 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors text-sm"
                    >
                      DETAILS
                    </Link>
                    <button
                      onClick={() => handleDeleteClass(classItem.id)}
                      className="px-3 py-2 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors text-sm"
                    >
                      LÖSCHEN
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 uppercase">Neue Klasse Erstellen</h2>
            
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 uppercase">Klassenname *</label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  className="w-full border-2 border-black px-3 py-2"
                  placeholder="z.B. 1A, 2B"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 uppercase">Klassenstufe *</label>
                <select
                  value={newClass.grade_level}
                  onChange={(e) => setNewClass({...newClass, grade_level: e.target.value})}
                  className="w-full border-2 border-black px-3 py-2 bg-white"
                  required
                >
                  {gradeLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 uppercase">Schuljahr *</label>
                <input
                  type="text"
                  value={newClass.academic_year}
                  onChange={(e) => setNewClass({...newClass, academic_year: e.target.value})}
                  className="w-full border-2 border-black px-3 py-2"
                  placeholder="2024/2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 uppercase">Raumnummer</label>
                <input
                  type="text"
                  value={newClass.room_number}
                  onChange={(e) => setNewClass({...newClass, room_number: e.target.value})}
                  className="w-full border-2 border-black px-3 py-2"
                  placeholder="z.B. Raum 301"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 uppercase">Max. Schüler *</label>
                <input
                  type="number"
                  value={newClass.max_students}
                  onChange={(e) => setNewClass({...newClass, max_students: parseInt(e.target.value)})}
                  className="w-full border-2 border-black px-3 py-2"
                  min="1"
                  max="30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 uppercase">Klassenlehrer</label>
                <select
                  value={newClass.class_teacher_id || ''}
                  onChange={(e) => setNewClass({
                    ...newClass, 
                    class_teacher_id: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="w-full border-2 border-black px-3 py-2 bg-white"
                >
                  <option value="">Kein Lehrer zugewiesen</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName} ({teacher.employee_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                >
                  KLASSE ERSTELLEN
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors font-semibold"
                >
                  ABBRECHEN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RoleGuard>
  );
}