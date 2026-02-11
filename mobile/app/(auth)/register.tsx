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
import { registerSchema, RegisterInput } from '../../src/utils/validation';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setError(null);
    try {
      const nameParts = values.fullName.trim().split(/\s+/);
      const firstName = nameParts.shift();
      const lastName = nameParts.length ? nameParts.join(' ') : undefined;
      const payload = {
        email: values.email,
        password: values.password,
        firstName,
        lastName,
        phone: values.phone || undefined,
      };
      const response = await authApi.register(payload);
      login(response.token, response.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Registration failed'
      );
    }
  };

  return (
    <Screen>
      <Header title="Create Account" subtitle="Join NestHeaven" />
      <View style={styles.form}>
        <Controller
          name="fullName"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={value}
              onChangeText={onChange}
              error={formState.errors.fullName?.message}
            />
          )}
        />
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
          name="phone"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Phone (optional)"
              placeholder="+998..."
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              error={formState.errors.phone?.message}
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
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="Confirm password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={formState.errors.confirmPassword?.message}
            />
          )}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={formState.isSubmitting ? 'Creating...' : 'Create Account'}
          onPress={handleSubmit(onSubmit)}
          loading={formState.isSubmitting}
        />
        <Link href="/(auth)/login" asChild>
          <Text style={styles.link}>Already have an account? Sign in</Text>
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
