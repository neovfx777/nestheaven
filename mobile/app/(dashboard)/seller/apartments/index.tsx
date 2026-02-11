import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Card } from '../../../../src/components/ui/Card';
import { Button } from '../../../../src/components/ui/Button';
import { apartmentsApi, Apartment } from '../../../../src/api/apartments';
import { getDisplayText } from '../../../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

export default function SellerApartmentsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: listings = [] } = useQuery({
    queryKey: ['seller-listings'],
    queryFn: apartmentsApi.getMyListings,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apartmentsApi.deleteApartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-listings'] });
    },
  });

  return (
    <AuthGuard allowRoles={['SELLER']}>
      <Screen>
        <Header
          title="My Listings"
          subtitle="Manage your apartments"
          right={
            <Button title="New" size="sm" onPress={() => router.push('/(dashboard)/seller/apartments/new')} />
          }
        />

        {listings.map((apartment: Apartment) => (
          <Card key={apartment.id} style={styles.card}>
            <Text style={styles.title}>
              {getDisplayText(apartment.title, apartment.titleUz, apartment.titleEn, apartment.titleRu)}
            </Text>
            <Text style={styles.subtitle}>
              {apartment.price?.toLocaleString()} сум • {apartment.status}
            </Text>
            <View style={styles.row}>
              <Button
                title="Delete"
                size="sm"
                variant="destructive"
                onPress={() => deleteMutation.mutate(apartment.id)}
              />
            </View>
          </Card>
        ))}
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
    gap: 8,
    marginTop: 8,
  },
});
