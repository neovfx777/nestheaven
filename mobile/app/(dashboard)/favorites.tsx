import React from 'react';
import { Text, StyleSheet, View, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../src/components/auth/AuthGuard';
import { Screen } from '../../src/components/layout/Screen';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/ui/Card';
import { usersApi } from '../../src/api/users';
import { getAssetUrl } from '../../src/api/client';
import { getDisplayText } from '../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../src/theme';

export default function FavoritesScreen() {
  const { data } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => usersApi.getFavorites(1, 20),
  });

  const favorites = data?.apartments || [];

  return (
    <AuthGuard allowRoles={['USER', 'SELLER', 'ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']}>
      <Screen>
        <Header title="Favorites" subtitle="Saved apartments" />

        {favorites.map((apartment: any) => (
          <Card key={apartment.id} style={styles.card}>
            {apartment.coverImage ? (
              <Image
                source={{ uri: getAssetUrl(apartment.coverImage) || '' }}
                style={styles.image}
              />
            ) : (
              <View style={[styles.image, styles.placeholder]} />
            )}
            <View style={styles.info}>
              <Text style={styles.title}>
                {getDisplayText(apartment.title, apartment.titleUz, apartment.titleEn, apartment.titleRu)}
              </Text>
              <Text style={styles.subtitle}>
                {apartment.price?.toLocaleString()} сум • {apartment.rooms} rooms
              </Text>
            </View>
          </Card>
        ))}
      </Screen>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  placeholder: {
    backgroundColor: COLORS.border,
  },
  info: {
    flex: 1,
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
});
