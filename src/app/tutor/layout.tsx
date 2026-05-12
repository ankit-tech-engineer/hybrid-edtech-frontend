'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['TUTOR']}>
      {children}
    </ProtectedRoute>
  );
}
