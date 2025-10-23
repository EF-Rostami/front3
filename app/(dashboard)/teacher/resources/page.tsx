// app/teacher/resources/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Resource {
  id: number;
  title: string;
  description: string;
  resource_type: string;
  file_url: string;
  subject: string;
  grade_level: string;
  created_at: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    resource_type: 'document',
    subject: '',
    grade_level: 'klasse_1',
    file: null as File | null
  });

  const gradeLevels: Record<string, string> = {
    vorschule: "Vorschule",
    klasse_1: "Klasse 1",
    klasse_2: "Klasse 2",
    klasse_3: "Klasse 3",
    klasse_4: "Klasse 4",
  };

  const resourceTypes: Record<string, string> = {
    document: "Dokument",
    worksheet: "Arbeitsblatt",
    presentation: "Präsentation",
    video: "Video",
    link: "Link",
    other: "Sonstiges"
  };

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resources', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadResource = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newResource.title);
      formData.append('description', newResource.description);
      formData.append('resource_type', newResource.resource_type);
      formData.append('subject', newResource.subject);
      formData.append('grade_level', newResource.grade_level);
      
      if (newResource.file) {
        formData.append('file', newResource.file);
      }

      const response = await fetch('/api/resources', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        alert('Ressource erfolgreich hochgeladen!');
        setShowUploadForm(false);
        setNewResource({
          title: '',
          description: '',
          resource_type: 'document',
          subject: '',
          grade_level: 'klasse_1',
          file: null
        });
        loadResources();
      } else {
        alert('Fehler beim Hochladen der Ressource');
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert('Fehler beim Hochladen der Ressource');
    }
  };

  const deleteResource = async (id: number) => {
    if (!confirm('Möchten Sie diese Ressource wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Ressource erfolgreich gelöscht!');
        loadResources();
      } else {
        alert('Fehler beim Löschen der Ressource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Fehler beim Löschen der Ressource');
    }
  };

  const filteredResources = resources.filter(resource => {
    if (filterSubject !== 'all' && resource.subject !== filterSubject) return false;
    if (filterType !== 'all' && resource.resource_type !== filterType) return false;
    return true;
  });

  const subjects = Array.from(new Set(resources.map(r => r.subject))).filter(Boolean);

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
                  RESSOURCEN & MATERIALIEN
                </h1>
              </div>
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-6 py-2 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
              >
                + NEUE RESSOURCE
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Upload Form */}
          {showUploadForm && (
            <div className="border-2 border-black bg-white mb-8">
              <div className="border-b-2 border-black bg-gray-50 p-4 flex items-center justify-between">
                <h2 className="font-bold text-black uppercase tracking-wide">
                  Neue Ressource hochladen
                </h2>
                <button
                  onClick={() => setShowUploadForm(false)}
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
                      value={newResource.title}
                      onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                      className="w-full border-2 border-black p-3"
                      placeholder="z.B. Mathe Arbeitsblatt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Fach
                    </label>
                    <input
                      type="text"
                      value={newResource.subject}
                      onChange={(e) => setNewResource({...newResource, subject: e.target.value})}
                      className="w-full border-2 border-black p-3"
                      placeholder="z.B. Mathematik"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Ressourcentyp
                    </label>
                    <select
                      value={newResource.resource_type}
                      onChange={(e) => setNewResource({...newResource, resource_type: e.target.value})}
                      className="w-full border-2 border-black p-3"
                    >
                      {Object.entries(resourceTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Klassenstufe
                    </label>
                    <select
                      value={newResource.grade_level}
                      onChange={(e) => setNewResource({...newResource, grade_level: e.target.value})}
                      className="w-full border-2 border-black p-3"
                    >
                      {Object.entries(gradeLevels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">
                    Beschreibung
                  </label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                    className="w-full border-2 border-black p-3"
                    rows={3}
                    placeholder="Beschreiben Sie die Ressource..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">
                    Datei hochladen
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setNewResource({...newResource, file: e.target.files?.[0] || null})}
                    className="w-full border-2 border-black p-3"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="px-6 py-2 border-2 border-black text-black font-bold uppercase hover:bg-gray-50 transition-colors"
                  >
                    ABBRECHEN
                  </button>
                  <button
                    onClick={uploadResource}
                    className="px-6 py-2 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
                  >
                    HOCHLADEN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="border-2 border-black bg-white mb-6 p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-black mb-2 uppercase">
                  Nach Fach filtern
                </label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full border-2 border-black p-2"
                >
                  <option value="all">Alle Fächer</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-black mb-2 uppercase">
                  Nach Typ filtern
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full border-2 border-black p-2"
                >
                  <option value="all">Alle Typen</option>
                  {Object.entries(resourceTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="border-2 border-black p-12 text-center">
              <p className="text-gray-600 mb-2">Keine Ressourcen gefunden</p>
              <p className="text-sm text-gray-500">Laden Sie Ihre erste Ressource hoch</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="border-2 border-black bg-white hover:bg-gray-50 transition-colors">
                  <div className="border-b-2 border-black bg-gray-50 p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-black">{resource.title}</h3>
                      <span className="px-2 py-1 bg-black text-white text-xs font-bold uppercase">
                        {resourceTypes[resource.resource_type]}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {resource.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fach:</span>
                        <span className="font-semibold text-black">{resource.subject}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Klassenstufe:</span>
                        <span className="font-semibold text-black">
                          {gradeLevels[resource.grade_level]}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hochgeladen:</span>
                        <span className="font-semibold text-black">
                          {new Date(resource.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {resource.file_url && (
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 text-center border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors text-sm uppercase"
                        >
                          ÖFFNEN
                        </a>
                      )}
                      <button
                        onClick={() => deleteResource(resource.id)}
                        className="px-4 py-2 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors text-sm uppercase"
                      >
                        LÖSCHEN
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}