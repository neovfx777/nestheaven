import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/layout/Screen';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { apartmentsApi, Apartment, Complex } from '../../src/api/apartments';
import { broadcastsApi } from '../../src/api/broadcasts';
import { getAssetUrl } from '../../src/api/client';
import { getDisplayText } from '../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { data: complexes = [] } = useQuery<Complex[]>({
    queryKey: ['home-complexes'],
    queryFn: () => apartmentsApi.getComplexes(),
  });

  const { data: apartments } = useQuery({
    queryKey: ['home-apartments'],
    queryFn: () => apartmentsApi.getApartments({ limit: 6, page: 1 }),
  });

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['home-broadcasts'],
    queryFn: () => broadcastsApi.getBroadcasts(1),
  });

  const featuredComplexes = complexes.slice(0, 3);
  const latestApartments: Apartment[] = apartments?.apartments?.slice(0, 6) || [];

  return (
    <Screen>
      <Header
        title="NestHeaven"
        subtitle="Find modern apartments and trusted complexes"
      />

      {broadcasts.length > 0 && (
        <Card style={styles.broadcastCard}>
          <Text style={styles.broadcastTitle}>{broadcasts[0].title}</Text>
          <Text style={styles.broadcastMessage}>{broadcasts[0].message}</Text>
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Popular Complexes</Text>
        {featuredComplexes.map((complex) => {
          const title = getDisplayText(complex.title, complex.name);
          const location = getDisplayText(complex.locationText, complex.address, complex.city);
          const cover = getAssetUrl(complex.bannerImageUrl || complex.coverImage || null);
          return (
            <Pressable
              key={complex.id}
              style={styles.listItem}
              onPress={() => router.push(`/complexes/${complex.id}`)}
            >
              {cover ? (
                <Image source={{ uri: cover }} style={styles.listImage} />
              ) : (
                <View style={[styles.listImage, styles.placeholder]} />
              )}
              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>{title}</Text>
                <Text style={styles.listSubtitle}>{location}</Text>
              </View>
            </Pressable>
          );
        })}
        <Button
          title="View All Complexes"
          variant="outline"
          onPress={() => router.push('/complexes')}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Latest Apartments</Text>
        {latestApartments.map((apartment) => (
          <Pressable
            key={apartment.id}
            style={styles.listItem}
            onPress={() => router.push(`/apartments/${apartment.id}`)}
          >
            {apartment.coverImage ? (
              <Image source={{ uri: getAssetUrl(apartment.coverImage) || '' }} style={styles.listImage} />
            ) : (
              <View style={[styles.listImage, styles.placeholder]} />
            )}
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>
                {getDisplayText(apartment.title, apartment.titleUz, apartment.titleEn, apartment.titleRu)}
              </Text>
              <Text style={styles.listSubtitle}>
                {apartment.price?.toLocaleString()} сум • {apartment.rooms} rooms
              </Text>
            </View>
          </Pressable>
        ))}
        <Button
          title="Browse Apartments"
          variant="outline"
          onPress={() => router.push('/apartments')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  broadcastCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  broadcastTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  broadcastMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  listImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  placeholder: {
    backgroundColor: COLORS.border,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  listSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
