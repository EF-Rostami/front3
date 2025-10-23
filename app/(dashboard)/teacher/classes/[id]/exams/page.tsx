// app/teacher/classes/[id]/exams/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Exam {
  id: number;
  title: string;
  exam_date: string;
  subject: string;
  max_score: number;
  weight: number;
  exam_type: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  student_number: string;
}

interface ExamResult {
  student_id: number;
  score: number;
  notes: string;
}

export default function ExamsPage() {
  const params = useParams();
  const classId = params.id as string;
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examResults, setExamResults] = useState<Record<number, ExamResult>>({});
  const [loading, setLoading] = useState(true);

  const [newExam, setNewExam] = useState({
    title: '',
    exam_date: new Date().toISOString().split('T')[0],
    subject: '',
    max_score: 100,
    weight: 1,
    exam_type: 'written'
  });

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load class info
      const classRes = await fetch(`/api/classes/${classId}`, {
        credentials: 'include',
      });
      if (classRes.ok) {
        const classData = await classRes.json();
        setClassName(classData.name);
      }

      // Load students
      const studentsRes = await fetch(`/api/classes/${classId}/students`, {
        credentials: 'include',
      });
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }

      // Load exams
      const examsRes = await fetch(`/api/classes/${classId}/exams`, {
        credentials: 'include',
      });
      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExam = async () => {
    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newExam,
          class_id: parseInt(classId)
        })
      });

      if (response.ok) {
        alert('Prüfung erfolgreich erstellt!');
        setShowCreateForm(false);
        setNewExam({
          title: '',
          exam_date: new Date().toISOString().split('T')[0],
          subject: '',
          max_score: 100,
          weight: 1,
          exam_type: 'written'
        });
        loadData();
      } else {
        alert('Fehler beim Erstellen der Prüfung');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Fehler beim Erstellen der Prüfung');
    }
  };

  const loadExamResults = async (examId: number) => {
    try {
      const response = await fetch(`/api/exams/${examId}/results`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const results = await response.json();
        const resultsMap: Record<number, ExamResult> = {};
        
        students.forEach(student => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const existing = results.find((r: any) => r.student_id === student.id);
          resultsMap[student.id] = existing || {
            student_id: student.id,
            score: 0,
            notes: ''
          };
        });
        
        setExamResults(resultsMap);
      }
    } catch (error) {
      console.error('Error loading exam results:', error);
    }
  };

  const saveExamResults = async () => {
    if (!selectedExam) return;

    try {
      const results = Object.values(examResults);
      
      const response = await fetch(`/api/exams/${selectedExam.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ results })
      });

      if (response.ok) {
        alert('Ergebnisse erfolgreich gespeichert!');
        setSelectedExam(null);
      } else {
        alert('Fehler beim Speichern der Ergebnisse');
      }
    } catch (error) {
      console.error('Error saving results:', error);
      alert('Fehler beim Speichern der Ergebnisse');
    }
  };

  const updateResult = (studentId: number, field: keyof ExamResult, value: unknown) => {
    setExamResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const selectExam = (exam: Exam) => {
    setSelectedExam(exam);
    loadExamResults(exam.id);
  };

  const examTypeLabels: Record<string, string> = {
    written: 'Schriftlich',
    oral: 'Mündlich',
    practical: 'Praktisch',
    project: 'Projekt'
  };

  return (
    <RoleGuard allowedRoles={['teacher']}>
      <div className="min-h-screen bg-white">
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href={`/teacher/classes/${classId}`} className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
              ← Zurück zur Klasse
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-black tracking-tight">
                PRÜFUNGEN - {className}
              </h1>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-2 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
              >
                + NEUE PRÜFUNG
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Create Exam Form */}
          {showCreateForm && (
            <div className="border-2 border-black bg-white mb-8">
              <div className="border-b-2 border-black bg-gray-50 p-4 flex items-center justify-between">
                <h2 className="font-bold text-black uppercase tracking-wide">
                  Neue Prüfung erstellen
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-black hover:text-gray-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Titel
                    </label>
                    <input
                      type="text"
                      value={newExam.title}
                      onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                      className="w-full border-2 border-black p-3"
                      placeholder="z.B. Mathematik Klassenarbeit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Fach
                    </label>
                    <input
                      type="text"
                      value={newExam.subject}
                      onChange={(e) => setNewExam({...newExam, subject: e.target.value})}
                      className="w-full border-2 border-black p-3"
                      placeholder="z.B. Mathematik"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Datum
                    </label>
                    <input
                      type="date"
                      value={newExam.exam_date}
                      onChange={(e) => setNewExam({...newExam, exam_date: e.target.value})}
                      className="w-full border-2 border-black p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Prüfungsart
                    </label>
                    <select
                      value={newExam.exam_type}
                      onChange={(e) => setNewExam({...newExam, exam_type: e.target.value})}
                      className="w-full border-2 border-black p-3"
                    >
                      <option value="written">Schriftlich</option>
                      <option value="oral">Mündlich</option>
                      <option value="practical">Praktisch</option>
                      <option value="project">Projekt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Maximale Punktzahl
                    </label>
                    <input
                      type="number"
                      value={newExam.max_score}
                      onChange={(e) => setNewExam({...newExam, max_score: parseInt(e.target.value)})}
                      className="w-full border-2 border-black p-3"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Gewichtung
                    </label>
                    <input
                      type="number"
                      value={newExam.weight}
                      onChange={(e) => setNewExam({...newExam, weight: parseFloat(e.target.value)})}
                      className="w-full border-2 border-black p-3"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 border-2 border-black text-black font-bold uppercase hover:bg-gray-50 transition-colors"
                  >
                    ABBRECHEN
                  </button>
                  <button
                    onClick={createExam}
                    className="px-6 py-2 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
                  >
                    ERSTELLEN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Exam Results Entry */}
          {selectedExam && (
            <div className="border-2 border-black bg-white mb-8">
              <div className="border-b-2 border-black bg-gray-50 p-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-black uppercase tracking-wide">
                    Ergebnisse eingeben: {selectedExam.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Max. Punktzahl: {selectedExam.max_score} • Gewichtung: {selectedExam.weight}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="text-black hover:text-gray-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>
              <div className="divide-y-2 divide-gray-200">
                {students.map((student, idx) => (
                  <div key={student.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-black">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Schüler-Nr: {student.student_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">PUNKTZAHL</label>
                          <input
                            type="number"
                            value={examResults[student.id]?.score || 0}
                            onChange={(e) => updateResult(student.id, 'score', parseFloat(e.target.value))}
                            className="w-24 border-2 border-black p-2 text-center font-bold"
                            min="0"
                            max={selectedExam.max_score}
                            step="0.5"
                          />
                        </div>
                        <div className="text-center">
                          <label className="block text-xs text-gray-600 mb-1">PROZENT</label>
                          <p className="text-lg font-bold text-black">
                            {((examResults[student.id]?.score || 0) / selectedExam.max_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Notizen (optional)"
                      value={examResults[student.id]?.notes || ''}
                      onChange={(e) => updateResult(student.id, 'notes', e.target.value)}
                      className="w-full border-2 border-gray-300 p-2 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-black p-4 flex justify-end">
                <button
                  onClick={saveExamResults}
                  className="px-8 py-3 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
                >
                  ERGEBNISSE SPEICHERN
                </button>
              </div>
            </div>
          )}

          {/* Exams List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600 mb-2">Keine Prüfungen erstellt</p>
              <p className="text-sm text-gray-500">Erstellen Sie Ihre erste Prüfung</p>
            </div>
          ) : (
            <div className="border-2 border-black bg-white">
              <div className="border-b-2 border-black bg-gray-50 p-4">
                <h2 className="font-bold text-black uppercase tracking-wide">
                  Prüfungsliste ({exams.length})
                </h2>
              </div>
              <div className="divide-y-2 divide-gray-200">
                {exams.map((exam) => (
                  <div key={exam.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-black text-lg">{exam.title}</h3>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            <strong>Fach:</strong> {exam.subject}
                          </span>
                          <span className="text-gray-600">
                            <strong>Datum:</strong> {new Date(exam.exam_date).toLocaleDateString('de-DE')}
                          </span>
                          <span className="text-gray-600">
                            <strong>Art:</strong> {examTypeLabels[exam.exam_type]}
                          </span>
                          <span className="text-gray-600">
                            <strong>Max:</strong> {exam.max_score} Punkte
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => selectExam(exam)}
                        className="px-6 py-2 border-2 border-black text-black font-bold uppercase hover:bg-black hover:text-white transition-colors"
                      >
                        ERGEBNISSE EINGEBEN
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
  );}