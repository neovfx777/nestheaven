import React from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../src/components/layout/Screen';
import { Button } from '../src/components/ui/Button';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <Text>Page not found.</Text>
      <Button title="Go Home" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
