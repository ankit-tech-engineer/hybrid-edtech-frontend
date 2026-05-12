'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      {children}
    </ProtectedRoute>
  );
}
