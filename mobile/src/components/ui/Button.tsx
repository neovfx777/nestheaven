import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'secondary' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  style,
}: ButtonProps) {
  const variantStyle = stylesByVariant[variant];
  const sizeStyle = stylesBySize[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        pressed && !disabled && !loading ? styles.pressed : null,
        disabled || loading ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color} />
      ) : (
        <Text style={[styles.text, variantStyle.text, sizeStyle.text]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});

const stylesBySize = {
  sm: {
    container: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
    text: { fontSize: FONT_SIZES.sm },
  },
  md: {
    container: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
    text: { fontSize: FONT_SIZES.md },
  },
  lg: {
    container: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl },
    text: { fontSize: FONT_SIZES.lg },
  },
} as const;

const stylesByVariant = {
  primary: {
    container: { backgroundColor: COLORS.primary },
    text: { color: '#FFFFFF' },
  },
  outline: {
    container: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'transparent' },
    text: { color: COLORS.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: COLORS.text },
  },
  secondary: {
    container: { backgroundColor: COLORS.secondary },
    text: { color: '#FFFFFF' },
  },
  destructive: {
    container: { backgroundColor: COLORS.danger },
    text: { color: '#FFFFFF' },
  },
} as const;
