import React from 'react';
import { useRouter } from 'expo-router';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { ApartmentFormScreen } from '../../../../src/screens/dashboard/seller/ApartmentFormScreen';

export default function SellerApartmentNew() {
  const router = useRouter();
  return (
    <AuthGuard allowRoles={['SELLER']}>
      <ApartmentFormScreen onSuccess={() => router.replace('/(dashboard)/seller/apartments')} />
    </AuthGuard>
  );
}
