import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../../src/components/layout/Screen';
import { Header } from '../../../src/components/layout/Header';
import { Card } from '../../../src/components/ui/Card';
import { apartmentsApi, ApartmentDetail } from '../../../src/api/apartments';
import { getAssetUrl } from '../../../src/api/client';
import { getDisplayText } from '../../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../../src/theme';

export default function ApartmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: apartment } = useQuery<ApartmentDetail>({
    queryKey: ['apartment', id],
    queryFn: () => apartmentsApi.getApartmentById(id as string),
    enabled: !!id,
  });

  if (!apartment) {
    return (
      <Screen>
        <Text>Loading...</Text>
      </Screen>
    );
  }

  const title = getDisplayText(apartment.title, (apartment as any).titleUz, (apartment as any).titleEn, (apartment as any).titleRu);

  const images = apartment.images?.length ? apartment.images : [];

  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Header title={title} subtitle={`${apartment.price.toLocaleString()} сум`} />

        {images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img) => (
              <Image
                key={img.id}
                source={{ uri: getAssetUrl(img.url) || '' }}
                style={styles.image}
              />
            ))}
          </ScrollView>
        ) : apartment.coverImage ? (
          <Image
            source={{ uri: getAssetUrl(apartment.coverImage) || '' }}
            style={styles.banner}
          />
        ) : null}

        <Card>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.text}>Rooms: {apartment.rooms}</Text>
          <Text style={styles.text}>Area: {apartment.area} м²</Text>
          <Text style={styles.text}>Floor: {apartment.floor}</Text>
          {apartment.totalFloors ? (
            <Text style={styles.text}>Total floors: {apartment.totalFloors}</Text>
          ) : null}
        </Card>

        {apartment.description?.uz || apartment.description?.en ? (
          <Card>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.text}>
              {apartment.description?.uz || apartment.description?.en || apartment.description?.ru}
            </Text>
          </Card>
        ) : null}

        {apartment.complex ? (
          <Card>
            <Text style={styles.sectionTitle}>Complex</Text>
            <Text style={styles.text}>
              {getDisplayText(apartment.complex.title, apartment.complex.name)}
            </Text>
            <Text style={styles.text}>
              {getDisplayText(apartment.complex.locationText, apartment.complex.address, apartment.complex.city)}
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  image: {
    width: 260,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
});
