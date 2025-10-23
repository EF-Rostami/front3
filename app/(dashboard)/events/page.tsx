"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useEffect, useState } from "react";

interface Event {
  id: number;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string | null;
  target_audience: string;
  target_grade_levels: string | null;
  requires_rsvp: boolean;
  max_participants: number | null;
  registration_deadline: string | null;
  created_by: number;
  creator_name: string;
  organizer_name: string | null;
  organizer_contact: string | null;
  is_published: boolean;
  is_cancelled: boolean;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  total_rsvps: number;
  attending_count: number;
  available_spots: number | null;
  user_rsvp_status: string | null;
}

export default function EventsPage() {
  const { getFullName, logout, selectedRole } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not_attending' | 'maybe'>('attending');
  const [rsvpNotes, setRsvpNotes] = useState('');
  const [submittingRSVP, setSubmittingRSVP] = useState(false);

  const eventTypeLabels: Record<string, string> = {
    assembly: 'Versammlung',
    meeting: 'Treffen',
    sports: 'Sport',
    field_trip: 'Ausflug',
    holiday: 'Feiertag',
    exam: 'Prüfung',
    workshop: 'Workshop',
    celebration: 'Feier',
    other: 'Sonstiges'
  };

  const eventTypeColors: Record<string, string> = {
    assembly: 'bg-blue-100 text-blue-800 border-blue-800',
    meeting: 'bg-purple-100 text-purple-800 border-purple-800',
    sports: 'bg-green-100 text-green-800 border-green-800',
    field_trip: 'bg-yellow-100 text-yellow-800 border-yellow-800',
    holiday: 'bg-red-100 text-red-800 border-red-800',
    exam: 'bg-orange-100 text-orange-800 border-orange-800',
    workshop: 'bg-indigo-100 text-indigo-800 border-indigo-800',
    celebration: 'bg-pink-100 text-pink-800 border-pink-800',
    other: 'bg-gray-100 text-gray-800 border-gray-800'
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!selectedEvent) return;

    try {
      setSubmittingRSVP(true);
      
      const method = selectedEvent.user_rsvp_status ? 'PATCH' : 'POST';
      const response = await fetch(`/api/events/${selectedEvent.id}/rsvp`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: rsvpStatus,
          notes: rsvpNotes.trim() || null
        })
      });

      if (response.ok) {
        setShowRSVPModal(false);
        setSelectedEvent(null);
        setRsvpNotes('');
        loadEvents();
        alert('RSVP erfolgreich!');
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.detail || 'Konnte RSVP nicht speichern'}`);
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Ein Fehler ist aufgetreten');
    } finally {
      setSubmittingRSVP(false);
    }
  };

  const openRSVPModal = (event: Event) => {
    setSelectedEvent(event);
    setRsvpStatus(event.user_rsvp_status as any || 'attending');
    setRsvpNotes('');
    setShowRSVPModal(true);
  };

  const openDetailModal = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const now = new Date();
  const filteredEvents = events.filter(event => {
    const eventStart = new Date(event.start_date);
    const eventEnd = new Date(event.end_date);
    
    if (viewMode === 'upcoming') {
      return eventEnd >= now;
    } else if (viewMode === 'past') {
      return eventEnd < now;
    }
    return true;
  });

  const upcomingCount = events.filter(e => new Date(e.end_date) >= now).length;
  const pastCount = events.filter(e => new Date(e.end_date) < now).length;

  return (
    <RoleGuard allowedRoles={['admin', 'teacher', 'parent', 'student']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  VERANSTALTUNGEN
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
          {/* View Mode Tabs */}
          <div className="border-2 border-black bg-white mb-6">
            <div className="flex divide-x-2 divide-gray-200">
              <button
                onClick={() => setViewMode('upcoming')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  viewMode === 'upcoming' ? 'bg-black text-white' : 'hover:bg-gray-50'
                }`}
              >
                BEVORSTEHEND ({upcomingCount})
              </button>
              <button
                onClick={() => setViewMode('past')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  viewMode === 'past' ? 'bg-black text-white' : 'hover:bg-gray-50'
                }`}
              >
                VERGANGEN ({pastCount})
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  viewMode === 'all' ? 'bg-black text-white' : 'hover:bg-gray-50'
                }`}
              >
                ALLE ({events.length})
              </button>
            </div>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600">Keine Veranstaltungen gefunden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const eventStart = new Date(event.start_date);
                const eventEnd = new Date(event.end_date);
                const isPast = eventEnd < now;
                const isSameDay = eventStart.toDateString() === eventEnd.toDateString();

                return (
                  <div
                    key={event.id}
                    className={`border-2 border-black bg-white ${
                      event.is_cancelled ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="border-b-2 border-black bg-gray-50 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-3 py-1 text-xs font-bold border-2 ${
                          eventTypeColors[event.event_type] || 'bg-gray-100 text-gray-800 border-gray-800'
                        }`}>
                          {eventTypeLabels[event.event_type] || event.event_type.toUpperCase()}
                        </span>
                        {event.is_cancelled && (
                          <span className="px-3 py-1 text-xs font-bold border-2 bg-red-100 text-red-800 border-red-800">
                            ABGESAGT
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-black text-lg">{event.title}</h3>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-black mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {isSameDay
                          ? eventStart.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" })
                          : `${eventStart.toLocaleDateString("de-DE")} - ${eventEnd.toLocaleDateString("de-DE")}`}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openDetailModal(event)}
                          className="flex-1 border-2 border-black py-2 text-sm hover:bg-black hover:text-white"
                        >
                          DETAILS
                        </button>
                        {event.requires_rsvp && (
                          <button
                            onClick={() => openRSVPModal(event)}
                            className="flex-1 border-2 border-black py-2 text-sm hover:bg-black hover:text-white"
                          >
                            RSVP
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
