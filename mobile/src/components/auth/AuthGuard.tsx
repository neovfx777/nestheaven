import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  allowRoles?: string[];
}

export function AuthGuard({ children, allowRoles }: AuthGuardProps) {
  const router = useRouter();
  const { token, user, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }
    if (allowRoles && user && !allowRoles.includes(user.role)) {
      router.replace('/(tabs)');
    }
  }, [allowRoles, hydrated, router, token, user]);

  if (!hydrated || !token) return null;

  if (allowRoles && user && !allowRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
