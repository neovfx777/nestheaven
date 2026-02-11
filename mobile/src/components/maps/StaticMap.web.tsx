import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../../theme';

interface StaticMapProps {
  lat: number;
  lng: number;
  height?: number;
}

export function StaticMap({ lat, lng, height = 180 }: StaticMapProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.title}>Map preview is not available on web.</Text>
      <Text style={styles.coords}>
        {lat.toFixed(6)}, {lng.toFixed(6)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    gap: 6,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  coords: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
