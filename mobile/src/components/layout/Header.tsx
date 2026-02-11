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
  
  // Check if we can go back properly
  const canGoBack = React.useMemo(() => {
    if (onBackPress) return true; // If custom handler, always allow
    try {
      return typeof navigation.canGoBack === 'function' ? navigation.canGoBack() : false;
    } catch {
      return false;
    }
  }, [navigation, onBackPress]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    try {
      // Try router.back() first (works better with expo-router)
      if (router.canGoBack && router.canGoBack()) {
        router.back();
        return;
      }
      // Fallback: try navigation.goBack()
      if (canGoBack && typeof navigation.goBack === 'function') {
        navigation.goBack();
        return;
      }
    } catch (error) {
      console.log('Navigation error:', error);
    }
    // Final fallback: go to dashboard home or tabs
    try {
      // Check if we're in dashboard, go to dashboard home
      const currentPath = router.pathname || '';
      if (currentPath.includes('dashboard')) {
        router.replace('/(dashboard)');
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Feather name="arrow-left" size={22} color={COLORS.primary} />
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
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  backButtonPressed: {
    opacity: 0.7,
    backgroundColor: COLORS.border,
  },
  backLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  backSpacer: {
    height: 24,
  },
});
