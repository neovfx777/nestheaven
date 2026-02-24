import { useState, useEffect } from 'react';
import { Settings, Globe2, Mail, Shield, Bell, Database, Save, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

const STORAGE_KEY = 'owner-settings';

interface OwnerSettings {
  platformName: string;
  contactEmail: string;
  defaultCurrency: string;
  listingApprovalMode: 'auto' | 'manual';
  enableFeaturedListings: boolean;
  enableRecommendedListings: boolean;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  dailyBackupTime: string;
  timezone: string;
}

const DEFAULT_SETTINGS: OwnerSettings = {
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

export const OwnerSettingsPage = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<OwnerSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load from localStorage once (so page works without backend)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        if (parsed._lastSavedAt) {
          setLastSaved(parsed._lastSavedAt);
        }
      }
    } catch {
      // ignore parse errors, keep defaults
    }
  }, []);

  const handleToggle = (field: keyof OwnerSettings) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString();
      const payload = { ...settings, _lastSavedAt: timestamp };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSaved(timestamp);
      // In future we can POST to backend /api/owner/settings from here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">
            Global configuration for the NestHeaven platform
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800">
            <Shield className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{user?.role}</span>
          </div>
          {lastSaved && (
            <p className="text-xs text-gray-500">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* General Settings */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">General</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform Name
            </label>
            <Input
              value={settings.platformName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, platformName: e.target.value }))
              }
            />
            <p className="mt-1 text-xs text-gray-500">
              Shaxsiy brendingiz nomi (masalan, NestHeaven).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                className="pl-9"
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contactEmail: e.target.value }))
                }
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Foydalanuvchilarga ko‘rinadigan support email manzili.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Currency
            </label>
            <Select
              value={settings.defaultCurrency}
              onChange={(value) =>
                setSettings((s) => ({ ...s, defaultCurrency: value }))
              }
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'UZS', label: 'UZS (so‘m)' },
                { value: 'EUR', label: 'EUR (€)' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <div className="relative">
              <Globe2 className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                className="pl-9"
                value={settings.timezone}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, timezone: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Listings & Features */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Listings & Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Listing Approval Mode
            </label>
            <Select
              value={settings.listingApprovalMode}
              onChange={(value) =>
                setSettings((s) => ({
                  ...s,
                  listingApprovalMode: value as OwnerSettings['listingApprovalMode'],
                }))
              }
              options={[
                { value: 'manual', label: 'Manual (Admin reviews every listing)' },
                { value: 'auto', label: 'Automatic (activate immediately)' },
              ]}
            />
            <p className="mt-1 text-xs text-gray-500">
              Manual mode xavfsizroq, auto mode esa tezroq.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured & Recommended
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggle('enableFeaturedListings')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  settings.enableFeaturedListings
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Featured listings (Free)
              </button>
              <button
                type="button"
                onClick={() => handleToggle('enableRecommendedListings')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  settings.enableRecommendedListings
                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Recommended listings (Paid)
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Bu sozlamalar home page’dagi “Qaynoq sotilyotgan uylar” va
              “Tavsiya etilgan uylar” carousel’larini boshqaradi.
            </p>
          </div>
        </div>
      </Card>

      {/* Security & Maintenance */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Security & Maintenance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Maintenance Mode
                </p>
                <p className="text-xs text-gray-500">
                  Platform vaqtincha texnik ishlar uchun yopiladi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('maintenanceMode')}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  settings.maintenanceMode
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : 'bg-green-50 text-green-700 border-green-300'
                }`}
              >
                {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Allow New Registrations
                </p>
                <p className="text-xs text-gray-500">
                  Yangi foydalanuvchilar ro‘yxatdan o‘tishiga ruxsat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowNewRegistrations')}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  settings.allowNewRegistrations
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}
              >
                {settings.allowNewRegistrations ? 'Allowed' : 'Blocked'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Backup Time
            </label>
            <div className="relative mb-2">
              <Database className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="time"
                className="pl-9"
                value={settings.dailyBackupTime}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, dailyBackupTime: e.target.value }))
                }
              />
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Bell className="h-3 w-3" />
              Backup va texnik ishlar shu vaqtda rejalashtiriladi (server vaqtiga ko‘ra).
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-3"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default OwnerSettingsPage;

