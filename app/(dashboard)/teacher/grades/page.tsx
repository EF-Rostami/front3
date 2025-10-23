// app/teacher/grades/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';


interface Class {
  id: number;
  name: string;
  grade_level: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  student_number: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface Grade {
  id: number;
  student_id: number;
  course_id: number;
  grade_value: number;
  grade_type: string;
  weight: number;
  comments: string;
  grading_period: string;
  graded_at: string;
}

function GradesContent() {
  const searchParams = useSearchParams();
  const classIdParam = searchParams.get('classId');
  const studentIdParam = searchParams.get('studentId');

  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(classIdParam || '');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>(studentIdParam || '');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGradeForm, setShowAddGradeForm] = useState(false);

  const [newGrade, setNewGrade] = useState({
    student_id: '',
    course_id: '',
    grade_value: 1,
    grade_type: 'exam',
    weight: 1,
    comments: '',
    grading_period: '1st_semester',
    date_assigned: new Date().toISOString().split('T')[0]
  });

  const gradeTypes: Record<string, string> = {
    exam: 'Prüfung',
    quiz: 'Test',
    homework: 'Hausaufgabe',
    participation: 'Mitarbeit',
    project: 'Projekt',
    other: 'Sonstiges'
  };

  const gradingPeriods: Record<string, string> = {
    '1st_semester': '1. Halbjahr',
    '2nd_semester': '2. Halbjahr',
    'final': 'Jahresabschluss'
  };

  useEffect(() => {
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent || selectedCourse) {
      loadGrades();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudent, selectedCourse]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load teacher profile and classes
      const profileRes = await fetch('/api/teachers/me', {
        credentials: 'include',
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        
        const classesRes = await fetch(`/api/teachers/${profileData.id}/classes`, {
          credentials: 'include',
        });
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData);
          
          if (classIdParam && classesData.length > 0) {
            setSelectedClass(classIdParam);
          }
        }

        const coursesRes = await fetch(`/api/teachers/${profileData.id}/courses`, {
          credentials: 'include',
        });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await fetch(`/api/classes/${selectedClass}/students`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        
        if (studentIdParam) {
          setSelectedStudent(studentIdParam);
        }
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadGrades = async () => {
    try {
      let url = '/api/grades?';
      if (selectedStudent) url += `studentId=${selectedStudent}&`;
      if (selectedCourse) url += `courseId=${selectedCourse}&`;
      
      const response = await fetch(url, {
        credentials: 'include',
      });

        if (response.ok) {
            const gradesData: Grade[] = (await response.json()).map((g: Grade) => ({
                ...g,
                grade_value: Number(g.grade_value),
            }));
            setGrades(gradesData);
            }
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const addGrade = async () => {
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newGrade,
          student_id: parseInt(newGrade.student_id),
          course_id: parseInt(newGrade.course_id)
        })
      });

      if (response.ok) {
        alert('Note erfolgreich hinzugefügt!');
        setShowAddGradeForm(false);
        setNewGrade({
          student_id: '',
          course_id: '',
          grade_value: 1,
          grade_type: 'exam',
          weight: 1,
          comments: '',
          grading_period: '1st_semester',
          date_assigned: new Date().toISOString().split('T')[0]
        });
        loadGrades();
      } else {
        alert('Fehler beim Hinzufügen der Note');
      }
    } catch (error) {
      console.error('Error adding grade:', error);
      alert('Fehler beim Hinzufügen der Note');
    }
  };

  const deleteGrade = async (id: number) => {
    if (!confirm('Möchten Sie diese Note wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/grades/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Note erfolgreich gelöscht!');
        loadGrades();
      } else {
        alert('Fehler beim Löschen der Note');
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      alert('Fehler beim Löschen der Note');
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade === 1) return 'text-green-600';
    if (grade === 2) return 'text-green-500';
    if (grade === 3) return 'text-yellow-600';
    if (grade === 4) return 'text-orange-600';
    if (grade === 5) return 'text-red-600';
    if (grade === 6) return 'text-red-700';
    return 'text-gray-600';
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const totalWeightedGrades = grades.reduce((sum, g) => sum + (g.grade_value * g.weight), 0);
    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
    return totalWeight > 0 ? (totalWeightedGrades / totalWeight).toFixed(2) : 0;
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unbekannt';
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unbekannt';
  };

  return (
    <RoleGuard allowedRoles={['teacher']}>
      <div className="min-h-screen bg-white">
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/teacher" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
                  ← Zurück zum Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  NOTENVERWALTUNG
                </h1>
              </div>
              <button
                onClick={() => setShowAddGradeForm(true)}
                className="px-6 py-2 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
              >
                + NEUE NOTE
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Add Grade Form */}
          {showAddGradeForm && (
            <div className="border-2 border-black bg-white mb-8">
              <div className="border-b-2 border-black bg-gray-50 p-4 flex items-center justify-between">
                <h2 className="font-bold text-black uppercase tracking-wide">
                  Neue Note hinzufügen
                </h2>
                <button
                  onClick={() => setShowAddGradeForm(false)}
                  className="text-black hover:text-gray-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Schüler
                    </label>
                    <select
                      value={newGrade.student_id}
                      onChange={(e) => setNewGrade({...newGrade, student_id: e.target.value})}
                      className="w-full border-2 border-black p-3"
                    >
                      <option value="">Schüler auswählen</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Kurs
                    </label>
                    <select
                      value={newGrade.course_id}
                      onChange={(e) => setNewGrade({...newGrade, course_id: e.target.value})}
                      className="w-full border-2 border-black p-3"
                    >
                      <option value="">Kurs auswählen</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Note (1-6)
                    </label>
                    <input
                      type="number"
                      value={newGrade.grade_value}
                      onChange={(e) => setNewGrade({...newGrade, grade_value: parseFloat(e.target.value)})}
                      className="w-full border-2 border-black p-3"
                      min="1"
                      max="6"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Notentyp
                    </label>
                    <select
                      value={newGrade.grade_type}
                      onChange={(e) => setNewGrade({...newGrade, grade_type: e.target.value})}
                      className="w-full border-2 border-black p-3"
                    >
                      {Object.entries(gradeTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Gewichtung
                    </label>
                    <input
                      type="number"
                      value={newGrade.weight}
                      onChange={(e) => setNewGrade({...newGrade, weight: parseFloat(e.target.value)})}
                      className="w-full border-2 border-black p-3"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Zeitraum
                    </label>
                    <select
                      value={newGrade.grading_period}
                      onChange={(e) => setNewGrade({...newGrade, grading_period: e.target.value})}
                      className="w-full border-2 border-black p-3"
                    >
                      {Object.entries(gradingPeriods).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Datum
                    </label>
                    <input
                      type="date"
                      value={newGrade.date_assigned}
                      onChange={(e) => setNewGrade({...newGrade, date_assigned: e.target.value})}
                      className="w-full border-2 border-black p-3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">
                    Kommentare
                  </label>
                  <textarea
                    value={newGrade.comments}
                    onChange={(e) => setNewGrade({...newGrade, comments: e.target.value})}
                    className="w-full border-2 border-black p-3"
                    rows={3}
                    placeholder="Optionale Kommentare..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddGradeForm(false)}
                    className="px-6 py-2 border-2 border-black text-black font-bold uppercase hover:bg-gray-50 transition-colors"
                  >
                    ABBRECHEN
                  </button>
                  <button
                    onClick={addGrade}
                    className="px-6 py-2 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
                  >
                    HINZUFÜGEN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="border-2 border-black bg-white mb-6">
            <div className="border-b-2 border-black bg-gray-50 p-4">
              <h2 className="font-bold text-black uppercase tracking-wide">Filter</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase">
                  Klasse
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full border-2 border-black p-2"
                >
                  <option value="">Alle Klassen</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase">
                  Schüler
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full border-2 border-black p-2"
                  disabled={!selectedClass}
                >
                  <option value="">Alle Schüler</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase">
                  Kurs
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full border-2 border-black p-2"
                >
                  <option value="">Alle Kurse</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Average */}
          {grades.length > 0 && (
            <div className="border-2 border-black bg-white mb-6 p-6 text-center">
              <p className="text-sm text-gray-600 uppercase mb-2">Durchschnittsnote</p>
              <p className={`text-4xl font-bold ${getGradeColor(parseFloat(calculateAverage().toString()))}`}>
                {calculateAverage()}
              </p>
            </div>
          )}

          {/* Grades List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : grades.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600 mb-2">Keine Noten gefunden</p>
              <p className="text-sm text-gray-500">Fügen Sie die erste Note hinzu</p>
            </div>
          ) : (
            <div className="border-2 border-black bg-white">
              <div className="border-b-2 border-black bg-gray-50 p-4">
                <h2 className="font-bold text-black uppercase tracking-wide">
                  Notenliste ({grades.length})
                </h2>
              </div>
              <div className="divide-y-2 divide-gray-200">
                {grades.map((grade) => (
                  <div key={grade.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className={`text-3xl font-bold ${getGradeColor(grade.grade_value)}`}>
                            {grade.grade_value.toFixed(1)}
                          </span>
                          <div>
                            <p className="font-bold text-black">
                              {getStudentName(grade.student_id)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {getCourseName(grade.course_id)} • {gradeTypes[grade.grade_type]}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>Gewichtung: {grade.weight}</span>
                          <span>Zeitraum: {gradingPeriods[grade.grading_period]}</span>
                          <span>Datum: {new Date(grade.graded_at).toLocaleDateString('de-DE')}</span>
                        </div>
                        {grade.comments && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            &quot;{grade.comments}&quot;
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteGrade(grade.id)}
                        className="px-4 py-2 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors text-sm uppercase"
                      >
                        LÖSCHEN
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

// Loading fallback
function LoadingGrades() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Main page - export this as default
export default function GradesPage() {
  return (
    <Suspense fallback={<LoadingGrades />}>
      <GradesContent />
    </Suspense>
  );
}
