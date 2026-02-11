import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthGuard } from '../../../../../src/components/auth/AuthGuard';
import { ComplexFormScreen } from '../../../../../src/screens/dashboard/admin/ComplexFormScreen';

export default function AdminComplexEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <AuthGuard allowRoles={['OWNER_ADMIN', 'MANAGER_ADMIN']}>
      <ComplexFormScreen
        mode="edit"
        complexId={id as string}
        onSuccess={() => router.replace('/(dashboard)/admin/complexes')}
      />
    </AuthGuard>
  );
}
