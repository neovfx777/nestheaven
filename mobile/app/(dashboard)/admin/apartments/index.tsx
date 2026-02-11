import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Card } from '../../../../src/components/ui/Card';
import { Button } from '../../../../src/components/ui/Button';
import { apartmentsApi, Apartment } from '../../../../src/api/apartments';
import { statusApi } from '../../../../src/api/status';
import { getDisplayText } from '../../../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

export default function AdminApartmentsScreen() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-apartments'],
    queryFn: () => apartmentsApi.getAllApartments({ limit: 50, page: 1 }),
  });

  const apartments: Apartment[] = data?.apartments || [];

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await statusApi.changeStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-apartments'] });
    },
  });

  return (
    <AuthGuard allowRoles={['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']}>
      <Screen>
        <Header title="Moderation" subtitle="Manage listing visibility" />

        {apartments.map((apartment) => {
          const title = getDisplayText(apartment.title, apartment.titleUz, apartment.titleEn, apartment.titleRu);
          return (
            <Card key={apartment.id} style={styles.card}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                {apartment.price?.toLocaleString()} сум • {apartment.rooms} rooms • {apartment.status}
              </Text>
              <View style={styles.row}>
                <Button
                  title="Active"
                  size="sm"
                  variant="outline"
                  onPress={() => statusMutation.mutate({ id: apartment.id, status: 'active' })}
                />
                <Button
                  title="Hidden"
                  size="sm"
                  variant="outline"
                  onPress={() => statusMutation.mutate({ id: apartment.id, status: 'hidden' })}
                />
                <Button
                  title="Sold"
                  size="sm"
                  variant="outline"
                  onPress={() => statusMutation.mutate({ id: apartment.id, status: 'sold' })}
                />
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
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
});
