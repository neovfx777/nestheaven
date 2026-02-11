import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/layout/Screen';
import { Header } from '../../../src/components/layout/Header';
import { Input } from '../../../src/components/ui/Input';
import { Card } from '../../../src/components/ui/Card';
import { apartmentsApi, Apartment } from '../../../src/api/apartments';
import { getAssetUrl } from '../../../src/api/client';
import { getDisplayText } from '../../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../../src/theme';

export default function ApartmentsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => apartmentsApi.getApartments({ limit: 20, page: 1 }),
  });

  const apartments = data?.apartments || [];

  const filtered = useMemo(() => {
    if (!search) return apartments;
    const q = search.toLowerCase();
    return apartments.filter((apartment) => {
      const title = getDisplayText(apartment.title, apartment.titleUz, apartment.titleEn, apartment.titleRu);
      return title.toLowerCase().includes(q);
    });
  }, [apartments, search]);

  return (
    <Screen bottomPadding={true}>
      <Header title="Apartments" subtitle="Browse all listings" showBack={false} />
      <Input placeholder="Search apartments..." value={search} onChangeText={setSearch} />

      {filtered.map((apartment: Apartment) => (
        <Pressable key={apartment.id} onPress={() => router.push(`/apartments/${apartment.id}`)}>
          <Card style={styles.card}>
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
              <Text style={styles.meta}>
                {apartment.area} м² • Floor {apartment.floor || 0}
              </Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  image: {
    width: 78,
    height: 78,
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
    marginTop: 4,
  },
  meta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 6,
  },
});
