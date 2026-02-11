import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Input } from '../../../../src/components/ui/Input';
import { Textarea } from '../../../../src/components/ui/Textarea';
import { Button } from '../../../../src/components/ui/Button';
import { Card } from '../../../../src/components/ui/Card';
import { broadcastsApi } from '../../../../src/api/broadcasts';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

export default function BroadcastsScreen() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => broadcastsApi.getBroadcasts(20),
  });

  const createMutation = useMutation({
    mutationFn: () => broadcastsApi.createBroadcast({ title, message, isActive: true }),
    onSuccess: () => {
      setTitle('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) =>
      broadcastsApi.updateBroadcast(payload.id, { isActive: payload.isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => broadcastsApi.deleteBroadcast(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  });

  return (
    <AuthGuard allowRoles={['OWNER_ADMIN']}>
      <Screen>
        <Header title="Broadcasts" subtitle="Send messages to all users" />

        <Card>
          <Text style={styles.sectionTitle}>New Broadcast</Text>
          <Input label="Title" value={title} onChangeText={setTitle} />
          <Textarea label="Message" value={message} onChangeText={setMessage} />
          <Button
            title={createMutation.isPending ? 'Sending...' : 'Send Broadcast'}
            onPress={() => createMutation.mutate()}
            loading={createMutation.isPending}
          />
        </Card>

        {broadcasts.map((broadcast) => (
          <Card key={broadcast.id} style={styles.card}>
            <Text style={styles.title}>{broadcast.title}</Text>
            <Text style={styles.subtitle}>{broadcast.message}</Text>
            <View style={styles.row}>
              <Button
                title={broadcast.isActive ? 'Deactivate' : 'Activate'}
                size="sm"
                variant="outline"
                onPress={() =>
                  toggleMutation.mutate({ id: broadcast.id, isActive: !broadcast.isActive })
                }
              />
              <Button
                title="Delete"
                size="sm"
                variant="destructive"
                onPress={() => deleteMutation.mutate(broadcast.id)}
              />
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
  card: {
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
