// app/teacher/classes/[id]/attendance/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  student_number: string;
}

interface AttendanceRecord {
  student_id: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

export default function AttendancePage() {
  const params = useParams();
  const classId = params.id as string;
  
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceRecord>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [className, setClassName] = useState('');

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, selectedDate]);

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
        
        // Initialize attendance records for all students FIRST
        const initialAttendance: Record<number, AttendanceRecord> = {};
        studentsData.forEach((student: Student) => {
          initialAttendance[student.id] = {
            student_id: student.id,
            status: 'present',
            notes: ''
          };
        });

        // Load existing attendance for selected date
        const attendanceRes = await fetch(
          `/api/attendance?classId=${classId}&date=${selectedDate}`,
          { credentials: 'include' }
        );
        
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          // ✅ Only update records that exist in the response
          if (attendanceData && attendanceData.length > 0) {
            attendanceData.forEach((record: AttendanceRecord) => {
              if (initialAttendance[record.student_id]) {
                initialAttendance[record.student_id] = {
                  student_id: record.student_id,
                  status: record.status,
                  notes: record.notes || ''
                };
              }
            });
          }
        }
        
        // ✅ Set attendance once with the final merged data
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (studentId: number, field: keyof AttendanceRecord, value: unknown) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const records = Object.values(attendance);
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          class_id: parseInt(classId),
          date: selectedDate,
          records
        })
      });

      if (response.ok) {
        alert('Anwesenheit erfolgreich gespeichert!');
      } else {
        alert('Fehler beim Speichern der Anwesenheit');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Fehler beim Speichern der Anwesenheit');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 border-green-500 text-green-800';
      case 'absent': return 'bg-red-100 border-red-500 text-red-800';
      case 'late': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'excused': return 'bg-blue-100 border-blue-500 text-blue-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const statusLabels = {
    present: 'ANWESEND',
    absent: 'ABWESEND',
    late: 'VERSPÄTET',
    excused: 'ENTSCHULDIGT'
  };

  const summary = {
    present: Object.values(attendance).filter(a => a.status === 'present').length,
    absent: Object.values(attendance).filter(a => a.status === 'absent').length,
    late: Object.values(attendance).filter(a => a.status === 'late').length,
    excused: Object.values(attendance).filter(a => a.status === 'excused').length,
  };

  return (
    <RoleGuard allowedRoles={['teacher']}>
      <div className="min-h-screen bg-white">
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href={`/teacher/classes/${classId}`} className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
              ← Zurück zur Klasse
            </Link>
            <h1 className="text-2xl font-bold text-black tracking-tight">
              ANWESENHEIT - {className}
            </h1>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Date Selector & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-black bg-white p-6">
              <label className="block text-sm font-bold text-black mb-2 uppercase">
                Datum auswählen
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border-2 border-black p-3 text-black font-semibold"
              />
            </div>

            <div className="border-2 border-black bg-white p-6">
              <h3 className="text-sm font-bold text-black mb-3 uppercase">Zusammenfassung</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                  <p className="text-xs text-gray-600">Anwesend</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                  <p className="text-xs text-gray-600">Abwesend</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
                  <p className="text-xs text-gray-600">Verspätet</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{summary.excused}</p>
                  <p className="text-xs text-gray-600">Entschuldigt</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : (
            <>
              {/* Attendance List */}
              <div className="border-2 border-black bg-white mb-6">
                <div className="border-b-2 border-black bg-gray-50 p-4">
                  <h2 className="font-bold text-black uppercase tracking-wide">
                    Schülerliste ({students.length})
                  </h2>
                </div>
                <div className="divide-y-2 divide-gray-200">
                  {students.map((student, idx) => (
                    <div key={student.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
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
                        <div className="flex gap-2">
                          {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateAttendance(student.id, 'status', status)}
                              className={`px-4 py-2 border-2 font-semibold text-xs uppercase transition-colors ${
                                attendance[student.id]?.status === status
                                  ? getStatusColor(status)
                                  : 'border-gray-300 text-gray-600 hover:border-black'
                              }`}
                            >
                              {statusLabels[status]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Notizen (optional)"
                        value={attendance[student.id]?.notes || ''}
                        onChange={(e) => updateAttendance(student.id, 'notes', e.target.value)}
                        className="w-full border-2 border-gray-300 p-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="px-8 py-3 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'SPEICHERN...' : 'ANWESENHEIT SPEICHERN'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}