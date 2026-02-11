import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/layout/Screen';
import { Text } from 'react-native';
import { useAuthStore } from '../../src/stores/authStore';

export default function DashboardRedirect() {
  const router = useRouter();
  const { token, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(dashboard)');
    }
  }, [hydrated, router, token]);

  return (
    <Screen>
      <Text>Redirecting...</Text>
    </Screen>
  );
}
