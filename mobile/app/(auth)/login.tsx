import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, Link } from 'expo-router';
import { Screen } from '../../src/components/layout/Screen';
import { Header } from '../../src/components/layout/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { authApi } from '../../src/api/auth';
import { loginSchema, LoginInput } from '../../src/utils/validation';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    setError(null);
    try {
      const response = await authApi.login(values);
      login(response.token, response.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Login failed'
      );
    }
  };

  return (
    <Screen>
      <Header title="Welcome Back" subtitle="Login to continue" />
      <View style={styles.form}>
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              error={formState.errors.email?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Password"
              placeholder="Password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={formState.errors.password?.message}
            />
          )}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={formState.isSubmitting ? 'Signing in...' : 'Sign In'}
          onPress={handleSubmit(onSubmit)}
          loading={formState.isSubmitting}
        />
        <Link href="/(auth)/register" asChild>
          <Text style={styles.link}>Create a new account</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  error: {
    color: COLORS.danger,
    fontSize: 14,
  },
  link: {
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 8,
  },
});
