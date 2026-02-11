import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Card } from '../../../../src/components/ui/Card';
import { apartmentsApi } from '../../../../src/api/apartments';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

export default function AnalyticsScreen() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: apartmentsApi.getAdminStats,
  });

  const stats = data || {
    totalListings: 0,
    activeListings: 0,
    hiddenListings: 0,
    soldListings: 0,
    pendingReviews: 0,
    todayApprovals: 0,
    todayRejections: 0,
    flaggedContent: 0,
  };

  return (
    <AuthGuard allowRoles={['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']}>
      <Screen>
        <Header title="Analytics" subtitle="Platform statistics" />
        <View style={styles.grid}>
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key} style={styles.statCard}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{key}</Text>
            </Card>
          ))}
        </View>
      </Screen>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  statCard: {
    gap: 6,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
