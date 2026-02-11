import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showBack?: boolean;
  backLabel?: string;
  onBackPress?: () => void;
}

export function Header({
  title,
  subtitle,
  right,
  showBack = true,
  backLabel = 'Orqaga',
  onBackPress,
}: HeaderProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const canGoBack = typeof navigation.canGoBack === 'function' ? navigation.canGoBack() : true;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (canGoBack) {
      router.back();
      return;
    }
    // Fallback for tab root screens (no back stack)
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            disabled={!canGoBack}
            hitSlop={8}
            style={({ pressed }) => [
              styles.backButton,
              !canGoBack && styles.backButtonDisabled,
              pressed && canGoBack && styles.backButtonPressed,
            ]}
          >
            <Feather name="arrow-left" size={20} color={COLORS.text} />
            <Text style={styles.backLabel}>{backLabel}</Text>
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : <View style={styles.right} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  left: {
    minWidth: 72,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  right: {
    minWidth: 72,
    alignItems: 'flex-end',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonDisabled: {
    opacity: 0.4,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  backSpacer: {
    height: 24,
  },
});
