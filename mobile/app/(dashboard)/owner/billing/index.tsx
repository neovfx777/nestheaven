import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { AuthGuard } from '../../../../src/components/auth/AuthGuard';
import { Screen } from '../../../../src/components/layout/Screen';
import { Header } from '../../../../src/components/layout/Header';
import { Card } from '../../../../src/components/ui/Card';
import { Button } from '../../../../src/components/ui/Button';
import { COLORS, FONT_SIZES } from '../../../../src/theme';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    description: 'Basic access for small agencies and testers.',
    features: ['Unlimited manual listings', 'Basic analytics', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 49,
    description: 'For professional sellers and developers.',
    features: [
      'Featured listings',
      'Recommended listings',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 149,
    description: 'For big agencies and construction companies.',
    features: ['Custom billing', 'Dedicated manager', 'Custom integrations'],
  },
];

export default function OwnerBillingScreen() {
  const [currentPlan, setCurrentPlan] = useState('pro');

  return (
    <AuthGuard allowRoles={['OWNER_ADMIN']}>
      <Screen>
        <Header title="Billing & Payments" subtitle="Subscription management" />
        {PLANS.map((plan) => (
          <Card key={plan.id} style={styles.card}>
            <Text style={styles.title}>{plan.name}</Text>
            <Text style={styles.subtitle}>{plan.description}</Text>
            <Text style={styles.price}>
              {plan.priceMonthly === 0 ? 'Free' : `$${plan.priceMonthly}/mo`}
            </Text>
            {plan.features.map((feature) => (
              <Text key={feature} style={styles.feature}>
                • {feature}
              </Text>
            ))}
            <Button
              title={currentPlan === plan.id ? 'Current Plan' : 'Switch Plan'}
              variant={currentPlan === plan.id ? 'secondary' : 'outline'}
              onPress={() => setCurrentPlan(plan.id)}
            />
          </Card>
        ))}
      </Screen>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  feature: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
