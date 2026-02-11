import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Card } from '../../../../src/components/ui/Card';
import { Button } from '../../../../src/components/ui/Button';
import { apartmentsApi, Complex } from '../../../../src/api/apartments';
import apiClient from '../../../../src/api/client';
import { useAuthStore } from '../../../../src/stores/authStore';
import { getDisplayText } from '../../../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

export default function AdminComplexesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: complexes = [] } = useQuery<Complex[]>({
    queryKey: ['admin-complexes'],
    queryFn: () => apartmentsApi.getComplexes(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/complexes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complexes'] });
    },
  });

  const handleDelete = (complex: Complex) => {
    Alert.alert(
      'Delete Complex',
      'Are you sure you want to delete this complex?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(complex.id),
        },
      ]
    );
  };

  return (
    <AuthGuard allowRoles={['OWNER_ADMIN', 'MANAGER_ADMIN']}>
      <Screen>
        <Header
          title="Complexes"
          subtitle="Manage residential complexes"
          right={
            <Button title="New" size="sm" onPress={() => router.push('/(dashboard)/admin/complexes/new')} />
          }
        />

        {complexes.map((complex) => {
          const title = getDisplayText(complex.title, complex.name);
          const location = getDisplayText(complex.locationText, complex.address, complex.city);
          return (
            <Card key={complex.id} style={styles.card}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{location}</Text>
              <View style={styles.row}>
                <Button
                  title="Edit"
                  size="sm"
                  variant="outline"
                  onPress={() => router.push(`/(dashboard)/admin/complexes/${complex.id}/edit`)}
                />
                {user?.role === 'OWNER_ADMIN' && (
                  <Button
                    title="Delete"
                    size="sm"
                    variant="destructive"
                    onPress={() => handleDelete(complex)}
                  />
                )}
              </View>
            </Card>
          );
        })}
      </Screen>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
