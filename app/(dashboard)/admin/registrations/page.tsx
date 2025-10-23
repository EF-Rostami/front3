// app/admin/registrations/page.tsx - Registration Requests
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Registration {
  id: number;
  student_firstName: string;
  student_lastName: string;
  date_of_birth: string;
  desired_grade_level: string;
  parent_email: string;
  status: string;
}

export default function AdminRegistrationsPage() {
  const { logout } = useAuthStore();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<Registration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionComment, setActionComment] = useState('');

  const gradeLevels: Record<string, string> = {
    vorschule: "Vorschule",
    klasse_1: "Klasse 1",
    klasse_2: "Klasse 2",
    klasse_3: "Klasse 3",
    klasse_4: "Klasse 4",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Ausstehend", color: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Genehmigt", color: "bg-green-100 text-green-800" },
    rejected: { label: "Abgelehnt", color: "bg-red-100 text-red-800" },
  };

  useEffect(() => {
    loadRegistrations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/registrations'
        : `/api/registrations?status=${filter}`;
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/registrations/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comments: actionComment }),
      });

      if (response.ok) {
        setShowDetailModal(false);
        setActionComment('');
        loadRegistrations();
        alert('Anmeldung wurde genehmigt!');
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Fehler beim Genehmigen der Anmeldung');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Anmeldung ablehnen möchten?')) return;
    
    try {
      const response = await fetch(`/api/registrations/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comments: actionComment }),
      });

      if (response.ok) {
        setShowDetailModal(false);
        setActionComment('');
        loadRegistrations();
        alert('Anmeldung wurde abgelehnt!');
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Fehler beim Ablehnen der Anmeldung');
    }
  };

  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

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
                  ANMELDEANFRAGEN
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
              <p className="text-xs text-gray-500 uppercase mb-1">Gesamt</p>
              <p className="text-3xl font-bold text-black">{registrations.length}</p>
            </div>
            <div className="border-2 border-yellow-500 p-4 bg-yellow-50">
              <p className="text-xs text-gray-500 uppercase mb-1">Ausstehend</p>
              <p className="text-3xl font-bold text-black">{pendingCount}</p>
            </div>
            <div className="border-2 border-green-500 p-4 bg-green-50">
              <p className="text-xs text-gray-500 uppercase mb-1">Genehmigt</p>
              <p className="text-3xl font-bold text-black">{approvedCount}</p>
            </div>
            <div className="border-2 border-red-500 p-4 bg-red-50">
              <p className="text-xs text-gray-500 uppercase mb-1">Abgelehnt</p>
              <p className="text-3xl font-bold text-black">{rejectedCount}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <nav className="border-b-2 border-black mb-6">
            <div className="flex space-x-8">
              {[
                { key: 'pending', label: 'Ausstehend', count: pendingCount },
                { key: 'approved', label: 'Genehmigt', count: approvedCount },
                { key: 'rejected', label: 'Abgelehnt', count: rejectedCount },
                { key: 'all', label: 'Alle', count: registrations.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-2 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 ${
                    filter === tab.key
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </nav>

          {/* Registrations Table */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : (
            <div className="border-2 border-black">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-black">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Schülername</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Geburtsdatum</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Gewünschte Klasse</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Eltern Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-200">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        Keine Anmeldungen gefunden
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-black">
                            {reg.student_firstName} {reg.student_lastName}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(reg.date_of_birth).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-xs font-semibold uppercase">
                            {gradeLevels[reg.desired_grade_level] || reg.desired_grade_level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{reg.parent_email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 text-xs font-bold ${statusLabels[reg.status]?.color}`}>
                            {statusLabels[reg.status]?.label || reg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(reg);
                                setShowDetailModal(true);
                              }}
                              className="px-3 py-1 border-2 border-black text-xs font-semibold hover:bg-black hover:text-white transition-colors"
                            >
                              DETAILS
                            </button>
                            {reg.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(reg.id)}
                                  className="px-3 py-1 border-2 border-green-600 text-green-600 text-xs font-semibold hover:bg-green-600 hover:text-white transition-colors"
                                >
                                  GENEHMIGEN
                                </button>
                                <button
                                  onClick={() => handleReject(reg.id)}
                                  className="px-3 py-1 border-2 border-red-600 text-red-600 text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors"
                                >
                                  ABLEHNEN
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6 uppercase">Anmeldungsdetails</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Vorname</p>
                  <p className="font-semibold">{selectedRequest.student_firstName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Nachname</p>
                  <p className="font-semibold">{selectedRequest.student_lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Geburtsdatum</p>
                  <p className="font-semibold">
                    {new Date(selectedRequest.date_of_birth).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Gewünschte Klasse</p>
                  <p className="font-semibold">
                    {gradeLevels[selectedRequest.desired_grade_level]}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase mb-1">Eltern Email</p>
                  <p className="font-semibold">{selectedRequest.parent_email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 text-xs font-bold ${statusLabels[selectedRequest.status]?.color}`}>
                    {statusLabels[selectedRequest.status]?.label}
                  </span>
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 uppercase">
                    Kommentar (Optional)
                  </label>
                  <textarea
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2"
                    rows={3}
                    placeholder="Fügen Sie einen Kommentar hinzu..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {selectedRequest.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1 px-4 py-3 border-2 border-green-600 text-green-600 font-semibold hover:bg-green-600 hover:text-white transition-colors"
                  >
                    GENEHMIGEN
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    className="flex-1 px-4 py-3 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors"
                  >
                    ABLEHNEN
                  </button>
                </>
              ) : null}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setActionComment('');
                }}
                className="flex-1 px-4 py-3 border-2 border-black font-semibold hover:bg-black hover:text-white transition-colors"
              >
                SCHLIESSEN
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleGuard>
  );
}