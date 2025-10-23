// app/(dashboard)/admin/teachers/[id]/page.tsx
"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employee_number: string;
  subject_specialization: string | null;
}


export default function AdminTeacherDetailPage() {
  const { logout } = useAuthStore();
  const params = useParams();
  const teacherId = params?.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);




  useEffect(() => {
    if (teacherId) {
      loadTeacherData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);

      // Load teacher details
      const teacherRes = await fetch(`/api/teachers/${teacherId}`, {
        credentials: 'include',
      });
      if (teacherRes.ok) {
        const data = await teacherRes.json();
        setTeacher(data);
      }

      } catch (error) {
      console.error('Error loading teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!teacher && !loading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="border-2 border-black p-8 text-center">
            <h2 className="text-xl font-bold text-black mb-2">Lehrer nicht gefunden</h2>
            <Link href="/admin/teachers" className="text-sm text-gray-600 hover:text-black">
              ← Zurück zur Lehrerliste
            </Link>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin/teachers" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
                  ← Zurück zur Lehrerliste
                </Link>
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'LADEN...'}
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
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1>Contents will be made later!</h1>
            </div>
          
        </main>

      </div>
    </RoleGuard>
  );
}