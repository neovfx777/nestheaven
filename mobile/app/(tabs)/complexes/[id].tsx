import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../../src/components/layout/Screen';
import { Header } from '../../../src/components/layout/Header';
import { Card } from '../../../src/components/ui/Card';
import { apartmentsApi, Complex } from '../../../src/api/apartments';
import { getAssetUrl } from '../../../src/api/client';
import { getDisplayText } from '../../../src/utils/text';
import { COLORS, FONT_SIZES } from '../../../src/theme';
import { StaticMap } from '../../../src/components/maps/StaticMap';

export default function ComplexDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: complex } = useQuery<Complex>({
    queryKey: ['complex', id],
    queryFn: async () => {
      const result = await apartmentsApi.getComplexById(id as string);
      return result as Complex;
    },
    enabled: !!id,
  });

  if (!complex) {
    return (
      <Screen>
        <Text>Loading...</Text>
      </Screen>
    );
  }

  const title = getDisplayText(complex.title, complex.name);
  const location = getDisplayText(complex.locationText, complex.address, complex.city);

  const banner = getAssetUrl(complex.bannerImageUrl || complex.coverImage || null);

  return (
    <Screen>
      <Header title={title} subtitle={location} />

      {banner ? <Image source={{ uri: banner }} style={styles.banner} /> : null}

      <Card>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.text}>{location}</Text>
        {complex.locationLat && complex.locationLng ? (
          <StaticMap lat={complex.locationLat} lng={complex.locationLng} />
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Ratings</Text>
        <Text style={styles.text}>
          Walkability: {complex.walkabilityRating ?? 'N/A'} / 10
        </Text>
        <Text style={styles.text}>
          Air quality: {complex.airQualityRating ?? 'N/A'} / 10
        </Text>
      </Card>

      {complex.nearbyNote ? (
        <Card>
          <Text style={styles.sectionTitle}>Nearby</Text>
          <Text style={styles.text}>{complex.nearbyNote}</Text>
        </Card>
      ) : null}

      {complex.nearbyPlaces && complex.nearbyPlaces.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Nearby Places</Text>
          {complex.nearbyPlaces.map((place, index) => (
            <Text key={`${place.name}-${index}`} style={styles.text}>
              {place.name} • {place.distanceMeters}m
            </Text>
          ))}
        </Card>
      ) : null}

      {complex.amenities && complex.amenities.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <Text style={styles.text}>{complex.amenities.join(', ')}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 200,
    borderRadius: 12,
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
  mapContainer: {
    marginTop: 12,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
