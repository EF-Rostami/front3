// app/admin/page.tsx - Connected Admin Dashboard
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_courses: number;
  pending_registrations: number;
}

export default function AdminPage() {
  const { user, getFullName, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { 
      title: "Schülerverwaltung", 
      description: "Schüler hinzufügen, bearbeiten und verwalten",
      href: "/admin/students",
      icon: "👤",
      count: stats?.total_students || 0
    },
    { 
      title: "Lehrerverwaltung", 
      description: "Lehrer und deren Kurse verwalten",
      href: "/admin/teachers",
      icon: "👨‍🏫",
      count: stats?.total_teachers || 0
    },
    { 
      title: "Klassenverwaltung", 
      description: "Klassen erstellen und Schüler zuweisen",
      href: "/admin/classes",
      icon: "🏫",
      count: stats?.total_classes || 0
    },
    { 
      title: "Kursübersicht", 
      description: "Kurse und Lehrpläne verwalten",
      href: "/admin/courses",
      icon: "📚",
      count: stats?.total_courses || 0
    },
    { 
      title: "Anmeldungen", 
      description: "Neue Anmeldeanfragen bearbeiten",
      href: "/admin/registrations",
      icon: "📝",
      count: stats?.pending_registrations || 0,
      badge: stats?.pending_registrations || 0
    },
    { 
      title: "Gebührenverwaltung", 
      description: "Schulgebühren und Zahlungen",
      href: "/admin/fees",
      icon: "💰",
      count: 0
    },
    { 
      title: "Anwesenheit", 
      description: "Anwesenheitsübersicht und Berichte",
      href: "/admin/attendance",
      icon: "📊",
      count: 0
    },
    { 
      title: "Admission", 
      description: "Admission for new students",
      href: "/admin/admissions",
      icon: "📊",
      count: 0
    },
    { 
      title: "Admission letter", 
      description: "Admission letter for new students",
      href: "/admin/admissions/letters",
      icon: "📊",
      count: 0
    },
    { 
      title: "Absence-Excuse", 
      description: "Absence Excuse Page",
      href: "/admin/absence-excuses",
      icon: "📊",
      count: 0
    },
    { 
      title: "Events", 
      description: "Events Page",
      href: "/events",
      icon: "📊",
      count: 0
    },
    { 
      title: "Berichte", 
      description: "Berichte und Analysen erstellen",
      href: "/admin/reports",
      icon: "📈",
      count: 0
    },
  ];

  const recentActivities = [
    { action: "Neuer Schüler angemeldet", user: "Maria Schmidt", time: "vor 2 Stunden" },
    { action: "Lehrer-Account erstellt", user: "John Doe", time: "vor 4 Stunden" },
    { action: "Stundenplan aktualisiert", user: "System", time: "vor 5 Stunden" },
    { action: "Zahlung eingegangen", user: "Eltern-Portal", time: "vor 1 Tag" },
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  SCHULVERWALTUNGSSYSTEM
                </h1>
                <p className="text-sm text-gray-600 mt-1">Administrator Control Panel</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm font-semibold text-black">{getFullName()}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
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

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Statistics Grid */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-black mb-6 uppercase tracking-wide border-b-2 border-black pb-2">
              Systemübersicht
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-600">Laden...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border-2 border-black p-6 bg-white hover:bg-gray-50 transition-colors">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Gesamt Schüler
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-black">{stats?.total_students || 0}</p>
                  </div>
                </div>

                <div className="border-2 border-black p-6 bg-white hover:bg-gray-50 transition-colors">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Gesamt Lehrer
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-black">{stats?.total_teachers || 0}</p>
                  </div>
                </div>

                <div className="border-2 border-black p-6 bg-white hover:bg-gray-50 transition-colors">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Aktive Klassen
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-black">{stats?.total_classes || 0}</p>
                  </div>
                </div>

                <div className="border-2 border-black p-6 bg-white hover:bg-gray-50 transition-colors">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Anmeldungen
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-black">{stats?.pending_registrations || 0}</p>
                    {stats && stats.pending_registrations > 0 && (
                      <span className="text-sm font-semibold text-red-600">Neu</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Quick Links Grid */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-black mb-6 uppercase tracking-wide border-b-2 border-black pb-2">
              Schnellzugriff
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-colors group relative"
                >
                  {(link.badge ?? 0) > 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {link.badge}
                    </span>
                  )}
                  <div className="text-3xl mb-3">{link.icon}</div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-2">{link.title}</h3>
                  <p className="text-xs text-gray-600 group-hover:text-gray-300 mb-3">
                    {link.description}
                  </p>
                  <div className="text-2xl font-bold">{link.count}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activities */}
            <section>
              <h2 className="text-xl font-bold text-black mb-6 uppercase tracking-wide border-b-2 border-black pb-2">
                Letzte Aktivitäten
              </h2>
              <div className="border-2 border-black bg-white">
                <div className="divide-y-2 divide-gray-200">
                  {recentActivities.map((activity, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-black text-sm">{activity.action}</p>
                          <p className="text-xs text-gray-600 mt-1">{activity.user}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-black p-4 bg-gray-50">
                  <button className="text-sm font-semibold text-black hover:underline uppercase tracking-wide">
                    Alle Aktivitäten anzeigen →
                  </button>
                </div>
              </div>
            </section>

            {/* System Status */}
            <section>
              <h2 className="text-xl font-bold text-black mb-6 uppercase tracking-wide border-b-2 border-black pb-2">
                Systemstatus
              </h2>
              <div className="border-2 border-black bg-white p-6 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Server Status</p>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="font-semibold text-black">Online</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Datenbank</p>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="font-semibold text-black">Verbunden</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Letzte Sicherung</p>
                  <span className="font-semibold text-black">vor 2 Stunden</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Aktive Benutzer</p>
                  <span className="font-semibold text-black">
                    {(stats?.total_students || 0) + (stats?.total_teachers || 0)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}