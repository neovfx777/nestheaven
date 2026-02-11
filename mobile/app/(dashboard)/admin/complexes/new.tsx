import React from 'react';
import { useRouter } from 'expo-router';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { ComplexFormScreen } from '../../../../src/screens/dashboard/admin/ComplexFormScreen';

export default function AdminComplexNew() {
  const router = useRouter();
  return (
    <AuthGuard allowRoles={['OWNER_ADMIN', 'MANAGER_ADMIN']}>
      <ComplexFormScreen
        mode="create"
        onSuccess={() => router.replace('/(dashboard)/admin/complexes')}
      />
    </AuthGuard>
  );
}
