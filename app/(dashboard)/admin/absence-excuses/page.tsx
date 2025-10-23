// app/(dashboard)/admin/absence-excuses/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useEffect, useState } from "react";

interface AbsenceExcuse {
  id: number;
  student_id: number;
  student_name: string;
  student_number: string;
  parent_id: number;
  parent_name: string;
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

export default function AbsenceExcusesPage() {
  const { getFullName, logout, selectedRole } = useAuthStore();
  const [excuses, setExcuses] = useState<AbsenceExcuse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedExcuse, setSelectedExcuse] = useState<AbsenceExcuse | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasonLabels: Record<string, string> = {
    illness: 'Krankheit',
    medical_appointment: 'Arzttermin',
    family_emergency: 'Familiennotfall',
    family_event: 'Familiäre Angelegenheit',
    other: 'Sonstiges'
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'AUSSTEHEND', color: 'bg-yellow-100 text-yellow-800 border-yellow-800' },
    approved: { label: 'GENEHMIGT', color: 'bg-green-100 text-green-800 border-green-800' },
    rejected: { label: 'ABGELEHNT', color: 'bg-red-100 text-red-800 border-red-800' }
  };

  useEffect(() => {
    loadExcuses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadExcuses = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/absence-excuses'
        : `/api/absence-excuses?status=${statusFilter}`;
      
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setExcuses(data);
      }
    } catch (error) {
      console.error('Error loading excuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedExcuse) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/absence-excuses/${selectedExcuse.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: reviewAction,
          admin_notes: adminNotes.trim() || null
        })
      });

      if (response.ok) {
        setShowReviewModal(false);
        setSelectedExcuse(null);
        setAdminNotes('');
        loadExcuses();
        alert(`Entschuldigung erfolgreich ${reviewAction === 'approved' ? 'genehmigt' : 'abgelehnt'}!`);
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.detail || 'Konnte Entschuldigung nicht aktualisieren'}`);
      }
    } catch (error) {
      console.error('Error reviewing excuse:', error);
      alert('Ein Fehler ist aufgetreten');
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewModal = (excuse: AbsenceExcuse, action: 'approved' | 'rejected') => {
    setSelectedExcuse(excuse);
    setReviewAction(action);
    setAdminNotes('');
    setShowReviewModal(true);
  };

  const filteredExcuses = excuses;
  const pendingCount = excuses.filter(e => e.status === 'pending').length;

  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  ENTSCHULDIGUNGSVERWALTUNG
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="border-2 border-black bg-white p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Gesamt</p>
              <p className="text-3xl font-bold text-black">{excuses.length}</p>
            </div>
            <div className="border-2 border-yellow-600 bg-yellow-50 p-6">
              <p className="text-xs text-yellow-700 uppercase mb-2">Ausstehend</p>
              <p className="text-3xl font-bold text-yellow-800">{pendingCount}</p>
            </div>
            <div className="border-2 border-green-600 bg-green-50 p-6">
              <p className="text-xs text-green-700 uppercase mb-2">Genehmigt</p>
              <p className="text-3xl font-bold text-green-800">
                {excuses.filter(e => e.status === 'approved').length}
              </p>
            </div>
            <div className="border-2 border-red-600 bg-red-50 p-6">
              <p className="text-xs text-red-700 uppercase mb-2">Abgelehnt</p>
              <p className="text-3xl font-bold text-red-800">
                {excuses.filter(e => e.status === 'rejected').length}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-2 border-black bg-white mb-6">
            <div className="flex divide-x-2 divide-gray-200">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  statusFilter === 'all' ? 'bg-black text-white' : 'hover:bg-gray-50'
                }`}
              >
                ALLE
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  statusFilter === 'pending' ? 'bg-black text-white' : 'hover:bg-gray-50'
                }`}
              >
                AUSSTEHEND {pendingCount > 0 && `(${pendingCount})`}
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  statusFilter === 'approved' ? 'bg-black text-white' : 'hover:bg-gray-50'
                }`}
              >
                GENEHMIGT
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  statusFilter === 'rejected' ? 'bg-black text-white' : 'hover:bg-gray-50'
                }`}
              >
                ABGELEHNT
              </button>
            </div>
          </div>

          {/* Excuses List */}
          {loading ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : filteredExcuses.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Keine Entschuldigungen gefunden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExcuses.map((excuse) => (
                <div key={excuse.id} className="border-2 border-black bg-white">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-black">
                            {excuse.student_name}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-bold border-2 ${
                            statusConfig[excuse.status]?.color || 'bg-gray-100 text-gray-800 border-gray-800'
                          }`}>
                            {statusConfig[excuse.status]?.label || excuse.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Schülernummer: {excuse.student_number} | Elternteil: {excuse.parent_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase">Eingereicht</p>
                        <p className="text-sm font-semibold text-black">
                          {new Date(excuse.submitted_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Zeitraum</p>
                        <p className="text-sm text-black">
                          {new Date(excuse.start_date).toLocaleDateString('de-DE')}
                          {excuse.start_date !== excuse.end_date && (
                            <> bis {new Date(excuse.end_date).toLocaleDateString('de-DE')}</>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Grund</p>
                        <p className="text-sm text-black">
                          {reasonLabels[excuse.reason] || excuse.reason}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Nachricht</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {excuse.message}
                      </p>
                    </div>

                    {excuse.status === 'pending' && (
                      <div className="flex items-center space-x-3 pt-4 border-t-2 border-gray-200">
                        <button
                          onClick={() => openReviewModal(excuse, 'approved')}
                          className="px-6 py-2 border-2 border-green-600 text-green-600 font-semibold hover:bg-green-600 hover:text-white transition-colors"
                        >
                          ✓ GENEHMIGEN
                        </button>
                        <button
                          onClick={() => openReviewModal(excuse, 'rejected')}
                          className="px-6 py-2 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors"
                        >
                          ✗ ABLEHNEN
                        </button>
                      </div>
                    )}

                    {(excuse.status === 'approved' || excuse.status === 'rejected') && excuse.reviewed_at && (
                      <div className={`pt-4 mt-4 border-t-2 ${
                        excuse.status === 'approved' ? 'border-green-200' : 'border-red-200'
                      }`}>
                        <p className={`text-xs font-bold uppercase mb-1 ${
                          excuse.status === 'approved' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {excuse.status === 'approved' ? '✓ Genehmigt' : '✗ Abgelehnt'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Am {new Date(excuse.reviewed_at).toLocaleDateString('de-DE')}
                          {excuse.reviewed_by && ` von ${excuse.reviewed_by}`}
                        </p>
                        {excuse.admin_notes && (
                          <div className="mt-2">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Anmerkung</p>
                            <p className="text-sm text-gray-700 italic">{excuse.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedExcuse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="border-2 border-black bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="border-b-2 border-black bg-gray-50 p-6">
                <h2 className="text-xl font-bold text-black uppercase">
                  Entschuldigung {reviewAction === 'approved' ? 'genehmigen' : 'ablehnen'}
                </h2>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Schüler</h3>
                  <p className="text-gray-700">{selectedExcuse.student_name} ({selectedExcuse.student_number})</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Zeitraum</h3>
                  <p className="text-gray-700">
                    {new Date(selectedExcuse.start_date).toLocaleDateString('de-DE')}
                    {selectedExcuse.start_date !== selectedExcuse.end_date && (
                      <> bis {new Date(selectedExcuse.end_date).toLocaleDateString('de-DE')}</>
                    )}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Grund</h3>
                  <p className="text-gray-700">{reasonLabels[selectedExcuse.reason] || selectedExcuse.reason}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Nachricht</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedExcuse.message}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-black uppercase mb-2">
                    Anmerkung (optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none resize-none"
                    placeholder="Fügen Sie eine Anmerkung hinzu..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedExcuse(null);
                      setAdminNotes('');
                    }}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold hover:border-black transition-colors"
                    disabled={submitting}
                  >
                    ABBRECHEN
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={submitting}
                    className={`px-6 py-2 border-2 font-semibold transition-colors disabled:opacity-50 ${
                      reviewAction === 'approved'
                        ? 'border-green-600 bg-green-600 text-white hover:bg-white hover:text-green-600'
                        : 'border-red-600 bg-red-600 text-white hover:bg-white hover:text-red-600'
                    }`}
                  >
                    {submitting ? 'WIRD VERARBEITET...' : reviewAction === 'approved' ? '✓ GENEHMIGEN' : '✗ ABLEHNEN'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}