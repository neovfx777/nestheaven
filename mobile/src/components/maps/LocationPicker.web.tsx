import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../../theme';

export interface MapLocation {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: MapLocation;
  onChange: (value: MapLocation) => void;
  height?: number;
}

export function LocationPicker({ value, height = 260 }: LocationPickerProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.title}>Map preview is not available on web.</Text>
      <Text style={styles.subtitle}>
        Use the Latitude/Longitude inputs below to set location.
      </Text>
      <Text style={styles.coords}>
        Current: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  coords: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
