import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Input } from '../../../../src/components/ui/Input';
import { Select } from '../../../../src/components/ui/Select';
import { Button } from '../../../../src/components/ui/Button';
import { statusApi } from '../../../../src/api/status';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'Sold', value: 'sold' },
];

export default function BulkOperationsScreen() {
  const [ids, setIds] = useState('');
  const [status, setStatus] = useState('hidden');
  const [result, setResult] = useState<string | null>(null);

  const handleApply = async () => {
    const list = ids
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setResult('Please provide apartment IDs.');
      return;
    }
    const res = await statusApi.bulkChangeStatus(list, status);
    setResult(`Updated: ${res.successful}, Failed: ${res.failed}`);
  };

  return (
    <AuthGuard allowRoles={['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']}>
      <Screen>
        <Header title="Bulk Operations" subtitle="Update multiple listings" />
        <Input
          label="Apartment IDs (comma separated)"
          placeholder="id1, id2, id3"
          value={ids}
          onChangeText={setIds}
        />
        <Select label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
        <Button title="Apply" onPress={handleApply} />
        {result ? <Text style={styles.result}>{result}</Text> : null}
      </Screen>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  result: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
