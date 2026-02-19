import { useState } from 'react';
import { CreditCard, Receipt, DollarSign, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  period: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    description: 'Basic access for small agencies and testers.',
    features: [
      'Unlimited manual listings',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 49,
    description: 'For professional sellers and developers.',
    features: [
      'Featured listings (Free block)',
      'Recommended listings (Paid block)',
      'Advanced analytics & reports',
      'Priority support',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 149,
    description: 'For big agencies and construction companies.',
    features: [
      'Custom billing',
      'Dedicated account manager',
      'Custom integrations',
      'SLA & uptime guarantees',
    ],
  },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2026-001', date: '2026-01-15', amount: 49, status: 'PAID', period: 'Jan 2026' },
  { id: 'INV-2025-012', date: '2025-12-15', amount: 49, status: 'PAID', period: 'Dec 2025' },
  { id: 'INV-2025-011', date: '2025-11-15', amount: 49, status: 'FAILED', period: 'Nov 2025' },
];

export const OwnerBillingPage = () => {
  const { user } = useAuthStore();
  const [currentPlanId, setCurrentPlanId] = useState<string>('pro');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChangePlan = (planId: string) => {
    setIsUpdating(true);
    // In future: call backend /api/owner/billing/plan
    setTimeout(() => {
      setCurrentPlanId(planId);
      setIsUpdating(false);
    }, 600);
  };

  const currentPlan = PLANS.find((p) => p.id === currentPlanId)!;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription, invoices, and payment settings
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              Current plan: {currentPlan.name}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Barcha to‘lovlar test ma’lumotlari asosida simulyatsiya qilinmoqda (real gateway yo‘q).
          </p>
        </div>
      </div>

      {/* Plans */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 flex flex-col justify-between ${
              plan.recommended ? 'border-primary-500 shadow-md' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">{plan.name}</h2>
                {plan.recommended && (
                  <span className="px-2 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.priceMonthly === 0 ? 'Free' : `$${plan.priceMonthly}`}
                </span>
                {plan.priceMonthly > 0 && (
                  <span className="text-sm text-gray-500 ml-1">/ month</span>
                )}
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start">
                    <span className="mt-1 mr-2 text-green-500">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              {currentPlanId === plan.id ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isUpdating}
                  onClick={() => handleChangePlan(plan.id)}
                >
                  {isUpdating ? 'Updating...' : 'Switch to this plan'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </section>

      {/* Invoices & Payment info */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-gray-500">Invoice</th>
                  <th className="text-left py-2 px-3 text-gray-500">Date</th>
                  <th className="text-left py-2 px-3 text-gray-500">Period</th>
                  <th className="text-left py-2 px-3 text-gray-500">Amount</th>
                  <th className="text-left py-2 px-3 text-gray-500">Status</th>
                  <th className="text-left py-2 px-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900">{inv.id}</td>
                    <td className="py-2 px-3 text-gray-700">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-gray-700">{inv.period}</td>
                    <td className="py-2 px-3 text-gray-700">${inv.amount}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inv.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : inv.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <Button variant="outline" size="sm">
                        Download PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment method / summary */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
          </div>
          <p className="text-sm text-gray-600">
            Hozircha to‘lovlar faqat test rejimida. Keyinchalik bu yerga Stripe / Click /
            Payme integratsiyasi qo‘shiladi.
          </p>
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Test Card</p>
              <p className="text-xs text-gray-500">**** **** **** 4242 • 12/30</p>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Next billing date</span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Estimated monthly charge</span>
              <span className="font-medium text-gray-900">
                {currentPlan.priceMonthly === 0
                  ? '$0'
                  : `$${currentPlan.priceMonthly}`}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-2">
              <AlertTriangle className="h-3 w-3 mr-1 text-yellow-600" />
              Bu faqat UI darajasida; real billing backend bilan bog‘lanmagan.
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-2">
            View billing documentation
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default OwnerBillingPage;

