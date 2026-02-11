import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  bottomPadding?: boolean; // Add extra padding for tabs
}

export function Screen({ children, scroll = true, bottomPadding = false }: ScreenProps) {
  // Extra padding for bottom tabs to avoid overlap with phone buttons
  const bottomTabHeight = Platform.OS === 'ios' ? 100 : 95;
  const extraBottomPadding = bottomPadding ? bottomTabHeight + 10 : 0;

  const containerStyle = [
    styles.container,
    { paddingBottom: bottomPadding ? 16 + extraBottomPadding : 16 },
  ];

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={containerStyle}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 6,
    gap: 16,
  },
});
