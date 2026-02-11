import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../src/components/layout/Screen';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { AuthGuard } from '../../src/components/auth/AuthGuard';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, FONT_SIZES } from '../../src/theme';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const fullName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    '';

  return (
    <AuthGuard>
      <Screen>
        <Header title="Profile" subtitle="Your account details" />

        <Card>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{fullName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user?.phone || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user?.role || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>
              {user?.isActive === false ? 'Deactivated' : 'Active'}
            </Text>
          </View>
        </Card>

        <Button title="Logout" variant="outline" onPress={logout} />
      </Screen>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  value: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
});
