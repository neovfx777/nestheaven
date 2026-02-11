import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/layout/Screen';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { AuthGuard } from '../../src/components/auth/AuthGuard';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, FONT_SIZES } from '../../src/theme';

export default function DashboardHome() {
  const router = useRouter();
  const { user } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);

  return (
    <AuthGuard>
      <Screen>
        <Header
          title="Dashboard"
          subtitle={`Welcome back, ${user?.fullName || user?.email || ''}`}
        />

        <Card>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actions}>
            {user?.role === 'OWNER_ADMIN' && (
              <>
                <Button title="User Management" variant="outline" onPress={() => router.push('/(dashboard)/admin/users')} />
                <Button title="Complexes" variant="outline" onPress={() => router.push('/(dashboard)/admin/complexes')} />
                <Button title="Broadcasts" variant="outline" onPress={() => router.push('/(dashboard)/owner/broadcasts')} />
                <Button title="Analytics" variant="outline" onPress={() => router.push('/(dashboard)/admin/analytics')} />
              </>
            )}

            {user?.role === 'MANAGER_ADMIN' && (
              <>
                <Button title="User Management" variant="outline" onPress={() => router.push('/(dashboard)/admin/users')} />
                <Button title="Complexes" variant="outline" onPress={() => router.push('/(dashboard)/admin/complexes')} />
                <Button title="Moderation" variant="outline" onPress={() => router.push('/(dashboard)/admin/apartments')} />
                <Button title="Moderation Logs" variant="outline" onPress={() => router.push('/(dashboard)/manager/moderation-logs')} />
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Button title="Moderate Listings" variant="outline" onPress={() => router.push('/(dashboard)/admin/apartments')} />
                <Button title="User Management" variant="outline" onPress={() => router.push('/(dashboard)/admin/users')} />
              </>
            )}

            {user?.role === 'SELLER' && (
              <>
                <Button title="My Listings" variant="outline" onPress={() => router.push('/(dashboard)/seller/apartments')} />
                <Button title="Add Listing" variant="outline" onPress={() => router.push('/(dashboard)/seller/apartments/new')} />
              </>
            )}

            {user?.role === 'USER' && (
              <Button title="Favorites" variant="outline" onPress={() => router.push('/(dashboard)/favorites')} />
            )}
          </View>
        </Card>

        <Button title="Logout" variant="outline" onPress={logout} />
      </Screen>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  actions: {
    gap: 12,
  },
});
