"use client";

import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuthStore } from "@/app/stores/auth.store";
import { useEffect, useState } from "react";

export default function EventsPage() {

  return (
    <RoleGuard allowedRoles={['admin', 'teacher', 'parent', 'student']}>
      <div className="min-h-screen bg-white">
        <h1>Under Construction!</h1>

      </div>
    </RoleGuard>
  );
}
