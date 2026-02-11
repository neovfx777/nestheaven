import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Card } from '../../../../src/components/ui/Card';
import { Input } from '../../../../src/components/ui/Input';
import { Select } from '../../../../src/components/ui/Select';
import { Button } from '../../../../src/components/ui/Button';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

const STORAGE_KEY = 'owner-settings';

const DEFAULT_SETTINGS = {
  platformName: 'NestHeaven',
  contactEmail: 'support@nestheaven.uz',
  defaultCurrency: 'USD',
  listingApprovalMode: 'manual',
  enableFeaturedListings: true,
  enableRecommendedListings: true,
  maintenanceMode: false,
  allowNewRegistrations: true,
  dailyBackupTime: '03:00',
  timezone: 'Asia/Tashkent',
};

export default function OwnerSettingsScreen() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        }
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const toggle = (key: keyof typeof DEFAULT_SETTINGS) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGuard allowRoles={['OWNER_ADMIN']}>
      <Screen>
        <Header title="System Settings" subtitle="Global configuration" />

        <Card>
          <Text style={styles.sectionTitle}>General</Text>
          <Input
            label="Platform Name"
            value={settings.platformName}
            onChangeText={(value) => setSettings((prev) => ({ ...prev, platformName: value }))}
          />
          <Input
            label="Contact Email"
            value={settings.contactEmail}
            onChangeText={(value) => setSettings((prev) => ({ ...prev, contactEmail: value }))}
          />
          <Select
            label="Default Currency"
            value={settings.defaultCurrency}
            options={[
              { label: 'USD ($)', value: 'USD' },
              { label: 'UZS (so‘m)', value: 'UZS' },
              { label: 'EUR (€)', value: 'EUR' },
            ]}
            onChange={(value) => setSettings((prev) => ({ ...prev, defaultCurrency: value }))}
          />
          <Input
            label="Timezone"
            value={settings.timezone}
            onChangeText={(value) => setSettings((prev) => ({ ...prev, timezone: value }))}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Listings & Features</Text>
          <Select
            label="Listing Approval Mode"
            value={settings.listingApprovalMode}
            options={[
              { label: 'Manual', value: 'manual' },
              { label: 'Automatic', value: 'auto' },
            ]}
            onChange={(value) => setSettings((prev) => ({ ...prev, listingApprovalMode: value }))}
          />
          <View style={styles.row}>
            <Button
              title={settings.enableFeaturedListings ? 'Featured: ON' : 'Featured: OFF'}
              variant="outline"
              onPress={() => toggle('enableFeaturedListings')}
            />
            <Button
              title={settings.enableRecommendedListings ? 'Recommended: ON' : 'Recommended: OFF'}
              variant="outline"
              onPress={() => toggle('enableRecommendedListings')}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Security & Maintenance</Text>
          <View style={styles.row}>
            <Button
              title={settings.maintenanceMode ? 'Maintenance: ON' : 'Maintenance: OFF'}
              variant="outline"
              onPress={() => toggle('maintenanceMode')}
            />
            <Button
              title={settings.allowNewRegistrations ? 'Registrations: ON' : 'Registrations: OFF'}
              variant="outline"
              onPress={() => toggle('allowNewRegistrations')}
            />
          </View>
          <Input
            label="Daily Backup Time"
            value={settings.dailyBackupTime}
            onChangeText={(value) => setSettings((prev) => ({ ...prev, dailyBackupTime: value }))}
          />
        </Card>

        <Button
          title={isSaving ? 'Saving...' : 'Save Settings'}
          onPress={handleSave}
          loading={isSaving}
        />
      </Screen>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
});
