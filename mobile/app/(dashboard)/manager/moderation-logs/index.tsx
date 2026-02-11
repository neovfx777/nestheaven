import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Card } from '../../../../src/components/ui/Card';
import { Select } from '../../../../src/components/ui/Select';
import { apartmentsApi, Apartment } from '../../../../src/api/apartments';
import { getDisplayText } from '../../../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

const STATUS_OPTIONS = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Hidden', value: 'HIDDEN' },
  { label: 'Sold', value: 'SOLD' },
];

export default function ModerationLogsScreen() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { data } = useQuery({
    queryKey: ['moderation-logs'],
    queryFn: () => apartmentsApi.getAllApartments({ limit: 200 }),
  });

  const apartments: Apartment[] = data?.apartments || [];

  const logs = useMemo(() => {
    const list = apartments
      .map((apt) => ({
        id: apt.id,
        title: getDisplayText(apt.title, apt.titleUz, apt.titleEn, apt.titleRu) || 'Untitled',
        complexName:
          getDisplayText(apt.complex?.title, apt.complex?.name) || '',
        status: apt.status?.toUpperCase(),
        createdAt: apt.createdAt,
        price: apt.price,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    if (statusFilter === 'ALL') return list;
    return list.filter((log) => log.status === statusFilter);
  }, [apartments, statusFilter]);

  return (
    <AuthGuard allowRoles={['MANAGER_ADMIN', 'OWNER_ADMIN']}>
      <Screen>
        <Header title="Moderation Logs" subtitle="Recent listing activity" />
        <Select
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={setStatusFilter}
        />

        {logs.map((log) => (
          <Card key={log.id} style={styles.card}>
            <Text style={styles.title}>{log.title}</Text>
            <Text style={styles.subtitle}>
              {log.complexName || '—'} • {log.status}
            </Text>
            <Text style={styles.meta}>
              {log.price ? `${log.price.toLocaleString()} сум` : '—'} •{' '}
              {new Date(log.createdAt).toLocaleString()}
            </Text>
          </Card>
        ))}
      </Screen>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  meta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
