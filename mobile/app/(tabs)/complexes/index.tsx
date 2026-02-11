import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/layout/Screen';
import { Header } from '../../../src/components/layout/Header';
import { Input } from '../../../src/components/ui/Input';
import { Card } from '../../../src/components/ui/Card';
import { apartmentsApi, Complex } from '../../../src/api/apartments';
import { getAssetUrl } from '../../../src/api/client';
import { getDisplayText } from '../../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../../src/theme';

export default function ComplexesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: complexes = [] } = useQuery<Complex[]>({
    queryKey: ['complexes'],
    queryFn: () => apartmentsApi.getComplexes(),
  });

  const filtered = useMemo(() => {
    if (!search) return complexes;
    const q = search.toLowerCase();
    return complexes.filter((complex) => {
      const name = getDisplayText(complex.title, complex.name);
      return (name || '').toLowerCase().includes(q);
    });
  }, [complexes, search]);

  return (
    <Screen bottomPadding={true}>
      <Header title="Complexes" subtitle="Explore residential complexes" showBack={false} />
      <Input
        placeholder="Search complexes..."
        value={search}
        onChangeText={setSearch}
      />
      {filtered.map((complex) => {
        const title = getDisplayText(complex.title, complex.name);
        const location = getDisplayText(complex.locationText, complex.address, complex.city);
        const cover = getAssetUrl(complex.bannerImageUrl || complex.coverImage || null);
        return (
          <Pressable key={complex.id} onPress={() => router.push(`/complexes/${complex.id}`)}>
            <Card style={styles.card}>
              {cover ? (
                <Image source={{ uri: cover }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.placeholder]} />
              )}
              <View style={styles.info}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{location}</Text>
                <Text style={styles.meta}>
                  {(complex._count?.apartments || 0).toString()} apartments
                </Text>
              </View>
            </Card>
          </Pressable>
        );
      })}
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
