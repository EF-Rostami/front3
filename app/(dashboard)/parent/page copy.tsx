// app/(dashboard)/parent/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { RoleSwitcher } from "@/app/components/RoleSwitcher";
import { useEffect, useState } from "react";


interface ParentProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone_number: string | null;
  address: string | null;
}

interface Child {
  student_id: number;
  firstName: string;
  lastName: string;
  student_number: string;
  grade_level: string;
  relationship_type: string;
}

interface Grade {
  grade_id: number;
  course_name: string;
  exam_title: string;
  score: number;
  grade_value: string | null;
  comments: string | null;
  graded_at: string;
}

interface Attendance {
  id: number;
  date: string;
  status: string;
  notes: string | null;
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

interface AbsenceExcuse {
  id: number;
  student_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
}

interface AbsenceFormData {
  start_date: string;
  end_date: string;
  reason: string;
  message: string;
}

type Availability = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
};

export default function ParentPage() {
  const { user, getFullName, logout, selectedRole } = useAuthStore();
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [childGrades, setChildGrades] = useState<Grade[]>([]);
  const [childAttendance, setChildAttendance] = useState<Attendance[]>([]);
  const [childFees, setChildFees] = useState<Fee[]>([]);
  const [childExcuses, setChildExcuses] = useState<AbsenceExcuse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'fees' | 'appointment' | 'excuses'>('overview');
  const [showExcuseForm, setShowExcuseForm] = useState(false);
  const [submittingExcuse, setSubmittingExcuse] = useState(false);
  const [excuseForm, setExcuseForm] = useState<AbsenceFormData>({
    start_date: '',
    end_date: '',
    reason: '',
    message: ''
  });

  const gradeLevels: Record<string, string> = {
    vorschule: "Vorschule",
    klasse_1: "Klasse 1",
    klasse_2: "Klasse 2",
    klasse_3: "Klasse 3",
    klasse_4: "Klasse 4",
  };

  const attendanceStatus: Record<string, { label: string; color: string }> = {
    present: { label: "ANWESEND", color: "bg-green-100 text-green-800 border-green-800" },
    absent: { label: "ABWESEND", color: "bg-red-100 text-red-800 border-red-800" },
    late: { label: "VERSPÄTET", color: "bg-yellow-100 text-yellow-800 border-yellow-800" },
    excused: { label: "ENTSCHULDIGT", color: "bg-blue-100 text-blue-800 border-blue-800" },
  };

  const excuseStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "AUSSTEHEND", color: "bg-yellow-100 text-yellow-800 border-yellow-800" },
    approved: { label: "GENEHMIGT", color: "bg-green-100 text-green-800 border-green-800" },
    rejected: { label: "ABGELEHNT", color: "bg-red-100 text-red-800 border-red-800" },
  };

  const absenceReasons = [
    { value: 'illness', label: 'Krankheit' },
    { value: 'medical_appointment', label: 'Arzttermin' },
    { value: 'family_emergency', label: 'Familiennotfall' },
    { value: 'family_event', label: 'Familiäre Angelegenheit' },
    { value: 'other', label: 'Sonstiges' },
  ];

  const [slots, setSlots] = useState<Availability[]>([]);
  useEffect(() => {
  const loadSlots = async () => {
    try {
      const res = await fetch("api/appointments/available");
      const data: Availability[] = await res.json();
      setSlots(data);
    } catch (error) {
      console.error(error);
    }
  };
  loadSlots();
}, []);

const book = async (id: number) => {
  try {
    await fetch("api/appointments/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability_id: id }),
    });
    alert("Termin gebucht");
    setSlots((prev) => prev.filter((s) => s.id !== id));
  } catch (error) {
    console.error(error);
    alert("Fehler beim Buchen");
  }
};

  useEffect(() => {
    loadParentData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      loadChildData(selectedChildId);
    }
  }, [selectedChildId]);

  const loadParentData = async () => {
    try {
      setLoading(true);
      
      // Get parent profile
      const profileRes = await fetch('/api/parents/me', {
        credentials: 'include',
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setParentProfile(profileData);

        // Get parent's children
        const childrenRes = await fetch(`/api/parents/${profileData.id}/students`, {
          credentials: 'include',
        });
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          setChildren(childrenData);
          
          // Auto-select first child
          if (childrenData.length > 0 && !selectedChildId) {
            setSelectedChildId(childrenData[0].student_id);
          }
        }
      }
    } catch (error) {
      console.error('Error loading parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (childId: number) => {
    try {
      // Get child's grades
      const gradesRes = await fetch(`/api/students/${childId}/grades`, {
        credentials: 'include',
      });
      if (gradesRes.ok) {
        const gradesData = await gradesRes.json();
        setChildGrades(gradesData);
      }

      // Get child's attendance
      const attendanceRes = await fetch(`/api/students/${childId}/attendance`, {
        credentials: 'include',
      });
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setChildAttendance(attendanceData);
      }

      // Get child's fees
      const feesRes = await fetch(`/api/students/${childId}/fees`, {
        credentials: 'include',
      });
      if (feesRes.ok) {
        const feesData = await feesRes.json();
        setChildFees(feesData);
      }

      // Get child's absence excuses
      const excusesRes = await fetch(`/api/absence-excuses/students/${childId}/absence-excuses`, {
        credentials: 'include',
      });
      if (excusesRes.ok) {
        const excusesData = await excusesRes.json();
        setChildExcuses(excusesData);
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const handleExcuseFormChange = (field: keyof AbsenceFormData, value: string) => {
    setExcuseForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChildId) return;

    // Validation
    if (!excuseForm.start_date || !excuseForm.end_date || !excuseForm.reason || !excuseForm.message.trim()) {
      alert('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (new Date(excuseForm.start_date) > new Date(excuseForm.end_date)) {
      alert('Das Enddatum muss nach dem Startdatum liegen');
      return;
    }

    try {
      setSubmittingExcuse(true);

      const response = await fetch(`/api/absence-excuses/students/${selectedChildId}/absence-excuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(excuseForm),
      });

      if (response.ok) {
        // Reset form
        setExcuseForm({
          start_date: '',
          end_date: '',
          reason: '',
          message: ''
        });
        setShowExcuseForm(false);
        
        // Reload excuses
        loadChildData(selectedChildId);
        
        alert('Entschuldigung erfolgreich eingereicht!');
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.message || 'Konnte Entschuldigung nicht einreichen'}`);
      }
    } catch (error) {
      console.error('Error submitting excuse:', error);
      alert('Ein Fehler ist aufgetreten');
    } finally {
      setSubmittingExcuse(false);
    }
  };

  const selectedChild = children.find(c => c.student_id === selectedChildId);

  // Calculate statistics for selected child
  const averageGrade = childGrades.length > 0 
    ? (childGrades.reduce((sum, g) => sum + g.score, 0) / childGrades.length).toFixed(2)
    : "0.00";

  const attendanceRate = childAttendance.length > 0
    ? ((childAttendance.filter(a => a.status === 'present').length / childAttendance.length) * 100).toFixed(1)
    : "0.0";

  const unpaidFees = childFees.filter(f => !f.is_paid);
  const totalUnpaid = unpaidFees.reduce((sum, f) => sum + f.amount, 0);

  const pendingExcuses = childExcuses.filter(e => e.status === 'pending').length;

  return (
    <RoleGuard allowedRoles={['parent']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  ELTERNPORTAL
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Willkommen zurück, {getFullName()}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Aktuelle Rolle</p>
                  <p className="text-sm font-bold text-black capitalize">{selectedRole}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors"
                >
                  ABMELDEN
                </button>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="max-w-7xl mx-auto px-6 py-12 text-center">
            <p className="text-gray-600">Laden...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <aside className="lg:col-span-1">
                {/* Role Switcher */}
                {user && user.roles.length > 1 && (
                  <div className="mb-6">
                    <RoleSwitcher />
                  </div>
                )}

                {/* Parent Profile Card */}
                {parentProfile && (
                  <div className="border-2 border-black bg-white mb-6">
                    <div className="border-b-2 border-black bg-gray-50 p-4">
                      <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                        Mein Profil
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Name</p>
                        <p className="font-semibold text-black">
                          {parentProfile.firstName} {parentProfile.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">E-Mail</p>
                        <p className="text-sm text-black break-all">{parentProfile.email}</p>
                      </div>
                      {parentProfile.phone_number && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Telefon</p>
                          <p className="text-sm text-black">{parentProfile.phone_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Children Selector */}
                <div className="border-2 border-black bg-white mb-6">
                  <div className="border-b-2 border-black bg-gray-50 p-4">
                    <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                      Meine Kinder
                    </h3>
                  </div>
                  <div className="p-4">
                    {children.length === 0 ? (
                      <p className="text-sm text-gray-600">Keine Kinder zugeordnet</p>
                    ) : (
                      <div className="space-y-2">
                        {children.map((child) => (
                          <button
                            key={child.student_id}
                            onClick={() => setSelectedChildId(child.student_id)}
                            className={`w-full text-left p-3 border-2 transition-colors ${
                              selectedChildId === child.student_id
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 hover:border-black'
                            }`}
                          >
                            <p className="font-semibold">
                              {child.firstName} {child.lastName}
                            </p>
                            <p className="text-xs mt-1 opacity-80">
                              {gradeLevels[child.grade_level] || child.grade_level}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats for Selected Child */}
                {selectedChild && (
                  <div className="border-2 border-black bg-white mb-6">
                    <div className="border-b-2 border-black bg-gray-50 p-4">
                      <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                        Schnellübersicht
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedChild.firstName}
                      </p>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Durchschnittsnote</p>
                        <p className="text-2xl font-bold text-black">{averageGrade}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Anwesenheitsrate</p>
                        <p className="text-2xl font-bold text-black">{attendanceRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Offene Gebühren</p>
                        <p className="text-2xl font-bold text-black">{unpaidFees.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Ausstehende Entsch.</p>
                        <p className="text-2xl font-bold text-black">{pendingExcuses}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <nav className="border-2 border-black bg-white">
                  <div className="border-b-2 border-black bg-gray-50 p-4">
                    <h3 className="font-bold text-black uppercase tracking-wide text-sm">
                      Navigation
                    </h3>
                  </div>
                  <div className="divide-y-2 divide-gray-200">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === 'overview' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      ÜBERSICHT
                    </button>
                    <button
                      onClick={() => setActiveTab('grades')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === 'grades' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      NOTEN
                    </button>
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === 'attendance' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      ANWESENHEIT
                    </button>
                    <button
                      onClick={() => setActiveTab('fees')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === 'fees' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      GEBÜHREN
                    </button>

                    <button
                      onClick={() => setActiveTab('appointment')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === "appointment" ? "bg-gray-50" : "hover:bg-gray-50"
                      }`}
                    >
                      APPOINTMENT
                    </button>


                    <button
                      onClick={() => setActiveTab('excuses')}
                      className={`block w-full text-left p-4 text-sm font-semibold text-black transition-colors ${
                        activeTab === 'excuses' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      ENTSCHULDIGUNGEN
                      {pendingExcuses > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-black text-xs font-bold">
                          {pendingExcuses}
                        </span>
                      )}
                    </button>
                  </div>
                </nav>
              </aside>

              {/* Main Content */}
              <main className="lg:col-span-3">
                {!selectedChild ? (
                  <div className="border-2 border-black p-12 text-center">
                    <h3 className="text-xl font-bold text-black mb-2">Kein Kind ausgewählt</h3>
                    <p className="text-gray-600">
                      Bitte wählen Sie ein Kind aus der Seitenleiste aus
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Child Info Header */}
                    <div className="border-2 border-black bg-white p-6 mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-black">
                            {selectedChild.firstName} {selectedChild.lastName}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Schülernummer: {selectedChild.student_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase">Klassenstufe</p>
                          <p className="text-lg font-bold text-black">
                            {gradeLevels[selectedChild.grade_level] || selectedChild.grade_level}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div className="space-y-8">
                        {/* Performance Summary */}
                        <section>
                          <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                            Leistungsübersicht
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border-2 border-black bg-white p-6">
                              <p className="text-xs text-gray-500 uppercase mb-2">Durchschnittsnote</p>
                              <p className="text-3xl font-bold text-black">{averageGrade}</p>
                              <p className="text-xs text-gray-600 mt-2">aus {childGrades.length} Noten</p>
                            </div>
                            <div className="border-2 border-black bg-white p-6">
                              <p className="text-xs text-gray-500 uppercase mb-2">Anwesenheit</p>
                              <p className="text-3xl font-bold text-black">{attendanceRate}%</p>
                              <p className="text-xs text-gray-600 mt-2">
                                {childAttendance.filter(a => a.status === 'present').length} von {childAttendance.length} Tagen
                              </p>
                            </div>
                            <div className="border-2 border-black bg-white p-6">
                              <p className="text-xs text-gray-500 uppercase mb-2">Offene Gebühren</p>
                              <p className="text-3xl font-bold text-black">€{totalUnpaid.toFixed(2)}</p>
                              <p className="text-xs text-gray-600 mt-2">{unpaidFees.length} offen</p>
                            </div>
                          </div>
                        </section>

                        {/* Recent Grades */}
                        <section>
                          <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                            Neueste Noten
                          </h2>
                          {childGrades.length === 0 ? (
                            <div className="border-2 border-black p-8 text-center">
                              <p className="text-gray-600">Noch keine Noten verfügbar</p>
                            </div>
                          ) : (
                            <div className="border-2 border-black bg-white">
                              {childGrades.slice(0, 5).map((grade) => (
                                <div key={grade.grade_id} className="p-4 border-b-2 border-gray-200 last:border-b-0">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-bold text-black">{grade.course_name}</p>
                                      <p className="text-sm text-gray-600">{grade.exam_title}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-2xl font-bold text-black">{grade.score}</p>
                                      {grade.grade_value && (
                                        <p className="text-sm text-gray-600">{grade.grade_value}</p>
                                      )}
                                    </div>
                                  </div>
                                  {grade.comments && (
                                    <p className="text-sm text-gray-600 mt-2 italic">{grade.comments}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </section>

                        {/* Recent Attendance */}
                        <section>
                          <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                            Letzte Anwesenheit
                          </h2>
                          {childAttendance.length === 0 ? (
                            <div className="border-2 border-black p-8 text-center">
                              <p className="text-gray-600">Keine Anwesenheitsdaten verfügbar</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {childAttendance.slice(0, 6).map((record) => (
                                <div key={record.id} className="border-2 border-black bg-white p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">
                                      {new Date(record.date).toLocaleDateString('de-DE')}
                                    </p>
                                    <span className={`px-2 py-1 text-xs font-bold border-2 ${
                                      attendanceStatus[record.status]?.color || 'bg-gray-100 text-gray-800 border-gray-800'
                                    }`}>
                                      {attendanceStatus[record.status]?.label || record.status.toUpperCase()}
                                    </span>
                                  </div>
                                  {record.notes && (
                                    <p className="text-sm text-gray-600">{record.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </section>

                        {/* Pending Excuses Alert */}
                        {pendingExcuses > 0 && (
                          <section>
                            <div className="border-2 border-yellow-600 bg-yellow-50 p-6">
                              <h3 className="font-bold text-yellow-800 mb-2 uppercase">
                                ⏳ Ausstehende Entschuldigungen
                              </h3>
                              <p className="text-yellow-700 mb-4">
                                Sie haben {pendingExcuses} ausstehende Entschuldigung(en), die noch geprüft werden
                              </p>
                              <button
                                onClick={() => setActiveTab('excuses')}
                                className="px-4 py-2 border-2 border-yellow-600 text-yellow-600 font-semibold hover:bg-yellow-600 hover:text-white transition-colors"
                              >
                                ENTSCHULDIGUNGEN ANZEIGEN
                              </button>
                            </div>
                          </section>
                        )}

                        {/* Unpaid Fees Alert */}
                        {unpaidFees.length > 0 && (
                          <section>
                            <div className="border-2 border-red-600 bg-red-50 p-6">
                              <h3 className="font-bold text-red-800 mb-2 uppercase">
                                ⚠ Offene Gebühren
                              </h3>
                              <p className="text-red-700 mb-4">
                                {selectedChild.firstName} hat {unpaidFees.length} offene Gebühr(en) im Gesamtwert von €{totalUnpaid.toFixed(2)}
                              </p>
                              <button
                                onClick={() => setActiveTab('fees')}
                                className="px-4 py-2 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors"
                              >
                                GEBÜHREN ANZEIGEN
                              </button>
                            </div>
                          </section>
                        )}
                      </div>
                    )}

                    {/* Grades Tab */}
                    {activeTab === 'grades' && (
                      <section>
                        <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                          Alle Noten - {selectedChild.firstName}
                        </h2>
                        {childGrades.length === 0 ? (
                          <div className="border-2 border-black p-8 text-center">
                            <p className="text-gray-600">Noch keine Noten verfügbar</p>
                          </div>
                        ) : (
                          <div className="border-2 border-black bg-white">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-black">
                                  <tr>
                                    <th className="p-4 text-left text-xs font-bold text-black uppercase">Kurs</th>
                                    <th className="p-4 text-left text-xs font-bold text-black uppercase">Prüfung</th>
                                    <th className="p-4 text-center text-xs font-bold text-black uppercase">Punkte</th>
                                    <th className="p-4 text-center text-xs font-bold text-black uppercase">Note</th>
                                    <th className="p-4 text-left text-xs font-bold text-black uppercase">Datum</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-200">
                                  {childGrades.map((grade) => (
                                    <tr key={grade.grade_id} className="hover:bg-gray-50">
                                      <td className="p-4 font-semibold text-black">{grade.course_name}</td>
                                      <td className="p-4 text-sm text-gray-600">{grade.exam_title}</td>
                                      <td className="p-4 text-center font-bold text-black">{grade.score}</td>
                                      <td className="p-4 text-center">
                                        {grade.grade_value && (
                                          <span className="px-3 py-1 bg-black text-white font-bold text-sm">
                                            {grade.grade_value}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-4 text-sm text-gray-600">
                                        {new Date(grade.graded_at).toLocaleDateString('de-DE')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                      <section>
                        <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                          Anwesenheitsverlauf - {selectedChild.firstName}
                        </h2>
                        {childAttendance.length === 0 ? (
                          <div className="border-2 border-black p-8 text-center">
                            <p className="text-gray-600">Keine Anwesenheitsdaten verfügbar</p>
                          </div>
                        ) : (
                          <div className="border-2 border-black bg-white">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-black">
                                  <tr>
                                    <th className="p-4 text-left text-xs font-bold text-black uppercase">Datum</th>
                                    <th className="p-4 text-center text-xs font-bold text-black uppercase">Status</th>
                                    <th className="p-4 text-left text-xs font-bold text-black uppercase">Notizen</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-200">
                                  {childAttendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                      <td className="p-4 font-semibold text-black">
                                        {new Date(record.date).toLocaleDateString('de-DE', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </td>
                                      <td className="p-4 text-center">
                                        <span className={`inline-block px-3 py-1 text-xs font-bold border-2 ${
                                          attendanceStatus[record.status]?.color || 'bg-gray-100 text-gray-800 border-gray-800'
                                        }`}>
                                          {attendanceStatus[record.status]?.label || record.status.toUpperCase()}
                                        </span>
                                      </td>
                                      <td className="p-4 text-sm text-gray-600">
                                        {record.notes || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Fees Tab */}
                    {activeTab === 'fees' && (
                      <section>
                        <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                          Gebührenübersicht - {selectedChild.firstName}
                        </h2>
                        {childFees.length === 0 ? (
                          <div className="border-2 border-black p-8 text-center">
                            <p className="text-gray-600">Keine Gebühren verfügbar</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="border-2 border-black bg-white p-6">
                                <p className="text-xs text-gray-500 uppercase mb-2">Gesamt</p>
                                <p className="text-2xl font-bold text-black">
                                  €{childFees.reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
                                </p>
                              </div>
                              <div className="border-2 border-green-600 bg-green-50 p-6">
                                <p className="text-xs text-green-700 uppercase mb-2">Bezahlt</p>
                                <p className="text-2xl font-bold text-green-800">
                                  €{childFees.filter(f => f.is_paid).reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
                                </p>
                              </div>
                              <div className="border-2 border-red-600 bg-red-50 p-6">
                                <p className="text-xs text-red-700 uppercase mb-2">Offen</p>
                                <p className="text-2xl font-bold text-red-800">
                                  €{totalUnpaid.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Fees List */}
                            <div className="border-2 border-black bg-white">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50 border-b-2 border-black">
                                    <tr>
                                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Gebührenart</th>
                                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Betrag</th>
                                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Fällig am</th>
                                      <th className="p-4 text-center text-xs font-bold text-black uppercase">Status</th>
                                      <th className="p-4 text-left text-xs font-bold text-black uppercase">Schuljahr</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y-2 divide-gray-200">
                                    {childFees.map((fee) => (
                                      <tr key={fee.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-black">{fee.fee_type}</td>
                                        <td className="p-4 text-center font-bold text-black">
                                          €{fee.amount.toFixed(2)}
                                        </td>
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
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </section>
                    )}


                    {/* Appointment Tab */}
                    {activeTab === 'appointment' && (
                      <section>
                        <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                          Parent-Teacher Appointment - {selectedChild.firstName}
                        </h2>

                        {/* Empty state if no slots available */}
                        {slots.length === 0 ? (
                          <div className="border-2 border-black p-8 text-center">
                            <p className="text-gray-600">Keine verfügbaren Termine</p>
                          </div>
                        ) : (
                          <div className="border-2 border-black bg-white p-4 space-y-4">
                            {slots.map((slot) => {
                              const startDateTime = new Date(`${slot.date}T${slot.start_time}`);
                              const endDateTime = new Date(`${slot.date}T${slot.end_time}`);

                              return (
                                <div
                                  key={slot.id}
                                  className="flex items-center justify-between border-b border-gray-200 p-2 hover:bg-gray-50"
                                >
                                  <div className="text-sm font-semibold text-black">
                                    {startDateTime.toLocaleDateString('de-DE', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}{' '}
                                    {startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                    {endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <button
                                    onClick={() => book(slot.id)}
                                    className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded"
                                  >
                                    Buchen
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    )}


                    {/* Excuses Tab */}
                    {activeTab === 'excuses' && (
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-black uppercase tracking-wide border-b-2 border-black pb-2 flex-1">
                            Entschuldigungen - {selectedChild.firstName}
                          </h2>
                          <button
                            onClick={() => setShowExcuseForm(!showExcuseForm)}
                            className="px-4 py-2 border-2 border-black bg-black text-white font-semibold hover:bg-white hover:text-black transition-colors"
                          >
                            {showExcuseForm ? 'ABBRECHEN' : '+ NEUE ENTSCHULDIGUNG'}
                          </button>
                        </div>

                        {/* Excuse Form */}
                        {showExcuseForm && (
                          <div className="border-2 border-black bg-white p-6 mb-6">
                            <h3 className="font-bold text-black mb-4 uppercase text-sm">
                              Neue Entschuldigung einreichen
                            </h3>
                            <form onSubmit={handleSubmitExcuse} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                    Von Datum *
                                  </label>
                                  <input
                                    type="date"
                                    value={excuseForm.start_date}
                                    onChange={(e) => handleExcuseFormChange('start_date', e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                    Bis Datum *
                                  </label>
                                  <input
                                    type="date"
                                    value={excuseForm.end_date}
                                    onChange={(e) => handleExcuseFormChange('end_date', e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                  Grund *
                                </label>
                                <select
                                  value={excuseForm.reason}
                                  onChange={(e) => handleExcuseFormChange('reason', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
                                  required
                                >
                                  <option value="">Bitte wählen...</option>
                                  {absenceReasons.map((reason) => (
                                    <option key={reason.value} value={reason.value}>
                                      {reason.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                  Nachricht / Details *
                                </label>
                                <textarea
                                  value={excuseForm.message}
                                  onChange={(e) => handleExcuseFormChange('message', e.target.value)}
                                  rows={4}
                                  className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none resize-none"
                                  placeholder="Bitte geben Sie weitere Details zur Abwesenheit an..."
                                  required
                                />
                              </div>

                              <div className="flex items-center justify-end space-x-4 pt-4">
                                <button
                                  type="button"
                                  onClick={() => setShowExcuseForm(false)}
                                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold hover:border-black transition-colors"
                                >
                                  ABBRECHEN
                                </button>
                                <button
                                  type="submit"
                                  disabled={submittingExcuse}
                                  className="px-6 py-2 border-2 border-black bg-black text-white font-semibold hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                                >
                                  {submittingExcuse ? 'WIRD EINGEREICHT...' : 'EINREICHEN'}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Excuses List */}
                        {childExcuses.length === 0 ? (
                          <div className="border-2 border-black p-8 text-center">
                            <p className="text-gray-600">Keine Entschuldigungen vorhanden</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Klicken Sie auf &quot;Neue Entschuldigung&quot;, um eine Abwesenheit zu melden
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {childExcuses.map((excuse) => (
                              <div key={excuse.id} className="border-2 border-black bg-white p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h3 className="font-bold text-black">
                                        {absenceReasons.find(r => r.value === excuse.reason)?.label || excuse.reason}
                                      </h3>
                                      <span className={`px-3 py-1 text-xs font-bold border-2 ${
                                        excuseStatusConfig[excuse.status]?.color || 'bg-gray-100 text-gray-800 border-gray-800'
                                      }`}>
                                        {excuseStatusConfig[excuse.status]?.label || excuse.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {new Date(excuse.start_date).toLocaleDateString('de-DE')} 
                                      {excuse.start_date !== excuse.end_date && (
                                        <> bis {new Date(excuse.end_date).toLocaleDateString('de-DE')}</>
                                      )}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Eingereicht: {new Date(excuse.submitted_at).toLocaleDateString('de-DE')}
                                  </p>
                                </div>

                                <div className="mb-4">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {excuse.message}
                                  </p>
                                </div>

                                {excuse.status === 'approved' && excuse.reviewed_at && (
                                  <div className="border-t-2 border-green-200 pt-4 mt-4">
                                    <p className="text-xs font-bold text-green-800 uppercase mb-1">
                                      ✓ Genehmigt
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Am {new Date(excuse.reviewed_at).toLocaleDateString('de-DE')}
                                      {excuse.reviewed_by && ` von ${excuse.reviewed_by}`}
                                    </p>
                                    {excuse.admin_notes && (
                                      <p className="text-sm text-gray-700 mt-2 italic">
                                        Anmerkung: {excuse.admin_notes}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {excuse.status === 'rejected' && excuse.reviewed_at && (
                                  <div className="border-t-2 border-red-200 pt-4 mt-4">
                                    <p className="text-xs font-bold text-red-800 uppercase mb-1">
                                      ✗ Abgelehnt
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Am {new Date(excuse.reviewed_at).toLocaleDateString('de-DE')}
                                      {excuse.reviewed_by && ` von ${excuse.reviewed_by}`}
                                    </p>
                                    {excuse.admin_notes && (
                                      <p className="text-sm text-gray-700 mt-2 italic">
                                        Grund: {excuse.admin_notes}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {excuse.status === 'pending' && (
                                  <div className="border-t-2 border-yellow-200 pt-4 mt-4">
                                    <p className="text-xs font-bold text-yellow-800 uppercase">
                                      ⏳ Wird geprüft...
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}