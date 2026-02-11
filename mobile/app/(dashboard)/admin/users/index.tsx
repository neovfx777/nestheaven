import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Input } from '../../../../src/components/ui/Input';
import { Select } from '../../../../src/components/ui/Select';
import { Button } from '../../../../src/components/ui/Button';
import { Card } from '../../../../src/components/ui/Card';
import { usersApi } from '../../../../src/api/users';
import { useAuthStore } from '../../../../src/stores/authStore';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

const ROLE_OPTIONS = {
  OWNER_ADMIN: [
    { label: 'USER', value: 'USER' },
    { label: 'SELLER', value: 'SELLER' },
    { label: 'ADMIN', value: 'ADMIN' },
    { label: 'MANAGER_ADMIN', value: 'MANAGER_ADMIN' },
  ],
  MANAGER_ADMIN: [
    { label: 'USER', value: 'USER' },
    { label: 'SELLER', value: 'SELLER' },
  ],
} as const;

export default function UserManagementScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SELLER');

  const { data } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.getAdminUsers(),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return usersApi.createAdminUser({ email, password, role });
    },
    onSuccess: () => {
      setEmail('');
      setPassword('');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return usersApi.updateAdminUser(id, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => usersApi.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return (
    <AuthGuard allowRoles={['MANAGER_ADMIN', 'OWNER_ADMIN']}>
      <Screen>
        <Header title="User Management" subtitle="Manage admins, sellers and users" />

        <Card>
          <Text style={styles.sectionTitle}>Create User</Text>
          <Input label="Email" value={email} onChangeText={setEmail} />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Select
            label="Role"
            value={role}
            options={ROLE_OPTIONS[user?.role as 'OWNER_ADMIN' | 'MANAGER_ADMIN'] || ROLE_OPTIONS.MANAGER_ADMIN}
            onChange={setRole}
          />
          <Button
            title={createMutation.isPending ? 'Creating...' : 'Create'}
            onPress={() => createMutation.mutate()}
            loading={createMutation.isPending}
          />
        </Card>

        {data?.users?.map((u) => (
          <Card key={u.id} style={styles.userCard}>
            <Text style={styles.title}>{u.email}</Text>
            <Text style={styles.subtitle}>
              {u.role} • {u.isActive === false ? 'Deactivated' : 'Active'}
            </Text>
            <View style={styles.row}>
              <Button
                title={u.isActive === false ? 'Activate' : 'Deactivate'}
                size="sm"
                variant="outline"
                onPress={() => updateMutation.mutate({ id: u.id, isActive: !(u.isActive === false) })}
              />
              {user?.role === 'OWNER_ADMIN' && (
                <Button
                  title="Delete"
                  size="sm"
                  variant="destructive"
                  onPress={() => deleteMutation.mutate(u.id)}
                />
              )}
            </View>
          </Card>
        ))}
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
  userCard: {
    gap: 8,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
