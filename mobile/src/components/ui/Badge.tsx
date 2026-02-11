import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <View style={[styles.base, variantStyles[variant]]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#fff',
  },
});

const variantStyles = StyleSheet.create({
  default: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.secondary },
  success: { backgroundColor: COLORS.success },
  warning: { backgroundColor: COLORS.warning },
});
