import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Palette, RotateCcw, Save } from 'lucide-react';

import {
  Alert,
  Button,
  Card,
  CardBody,
  ConfirmationDialog,
  Input,
  LoadingScreen,
  Select,
  TextArea,
  useToast,
} from '@/components/ui';
import { CrudPageContainer } from '@/features/crud';
import { LogoPlaceholder } from '@/components/layout/LogoPlaceholder';
import { settingsRepository } from '@/services/repositories/settingsRepository';
import type { TableRow } from '@/types/database';
import { settingsSchema } from '@/validation/settings';

type SettingsRow = TableRow<'settings'>;

interface SettingsFormState {
  business_name: string;
  business_address: string;
  phone_1: string;
  phone_2: string;
  facebook: string;
  invoice_prefix: string;
  default_downpayment_percent: string;
  delivery_fee_default: string;
  currency: string;
  default_payment_method: string;
  default_order_status: string;
  theme: string;
  language: string;
  timezone: string;
  date_format: string;
  email: string;
  tin: string;
}

const defaults: SettingsFormState = {
  business_name: 'Lily Flowers - Baybay City Branch',
  business_address: 'Purok 1, Santa Cruz, Baybay City, Leyte, Philippines 6521',
  phone_1: '09152111698',
  phone_2: '09613899028',
  facebook: 'Lily Flowers Baybay City',
  invoice_prefix: 'INV',
  default_downpayment_percent: '30',
  delivery_fee_default: '0',
  currency: 'PHP',
  default_payment_method: 'cash',
  default_order_status: 'pending',
  theme: 'light',
  language: 'English',
  timezone: 'Asia/Manila',
  date_format: 'MM/DD/YYYY',
  email: '',
  tin: '',
};

const fromSettings = (settings?: SettingsRow | null): SettingsFormState => ({
  ...defaults,
  business_name: settings?.business_name ?? defaults.business_name,
  business_address: settings?.business_address ?? defaults.business_address,
  phone_1: settings?.phone_1 ?? defaults.phone_1,
  phone_2: settings?.phone_2 ?? defaults.phone_2,
  facebook: settings?.facebook ?? defaults.facebook,
  invoice_prefix: settings?.invoice_prefix ?? defaults.invoice_prefix,
  default_downpayment_percent: String(
    settings?.default_downpayment_percent ?? defaults.default_downpayment_percent,
  ),
});

export function SettingsPage() {
  const { showToast } = useToast();
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [form, setForm] = useState<SettingsFormState>(defaults);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const payload = useMemo(
    () => ({
      business_name: form.business_name,
      business_address: form.business_address,
      phone_1: form.phone_1,
      phone_2: form.phone_2 || null,
      facebook: form.facebook || null,
      invoice_prefix: form.invoice_prefix,
      default_downpayment_percent: Number(form.default_downpayment_percent),
    }),
    [form],
  );

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      const { data, error } = await settingsRepository.getActive();

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setSettingsId(data?.id ?? null);
      setForm(fromSettings(data));
      setIsLoading(false);
    }

    loadSettings();
  }, []);

  const updateField = (field: keyof SettingsFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveSettings = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setErrorMessage('');

    const parsed = settingsSchema.safeParse(payload);

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Please review settings.');
      return;
    }

    setIsSaving(true);
    const result = settingsId
      ? await settingsRepository.update(settingsId, parsed.data)
      : await settingsRepository.create(parsed.data);
    setIsSaving(false);

    if (result.error || !result.data) {
      setErrorMessage(result.error?.message ?? 'Unable to save settings.');
      return;
    }

    setSettingsId(result.data.id);
    setForm(fromSettings(result.data));
    showToast({ variant: 'success', title: 'Settings saved' });
  };

  const resetSettings = async () => {
    setIsResetOpen(false);
    setForm(defaults);
    setErrorMessage('');
    setIsSaving(true);

    const parsed = settingsSchema.safeParse({
      business_name: defaults.business_name,
      business_address: defaults.business_address,
      phone_1: defaults.phone_1,
      phone_2: defaults.phone_2,
      facebook: defaults.facebook,
      invoice_prefix: defaults.invoice_prefix,
      default_downpayment_percent: Number(defaults.default_downpayment_percent),
    });

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Unable to reset settings.');
      setIsSaving(false);
      return;
    }

    const result = settingsId
      ? await settingsRepository.update(settingsId, parsed.data)
      : await settingsRepository.create(parsed.data);
    setIsSaving(false);

    if (result.error || !result.data) {
      setErrorMessage(result.error?.message ?? 'Unable to reset settings.');
      return;
    }

    setSettingsId(result.data.id);
    showToast({ variant: 'success', title: 'Default settings restored' });
  };

  if (isLoading) {
    return <LoadingScreen text="Loading settings..." />;
  }

  return (
    <CrudPageContainer
      title="Settings"
      subtitle="Manage business information, invoice defaults, branding, and system preferences."
      primaryAction={
        <Button
          leftIcon={<Save className="size-4" />}
          isLoading={isSaving}
          onClick={() => saveSettings()}
        >
          Save Settings
        </Button>
      }
      secondaryAction={
        <Button
          variant="outline"
          leftIcon={<RotateCcw className="size-4" />}
          onClick={() => setIsResetOpen(true)}
        >
          Reset
        </Button>
      }
      tableSlot={
        <form className="space-y-6" onSubmit={saveSettings}>
          {errorMessage ? (
            <Alert variant="error" title="Settings error" description={errorMessage} />
          ) : null}

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-xl font-bold text-text">Business Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Business Name"
                  value={form.business_name}
                  onChange={(event) => updateField('business_name', event.target.value)}
                  required
                />
                <Input
                  label="Facebook"
                  value={form.facebook}
                  onChange={(event) => updateField('facebook', event.target.value)}
                />
                <Input
                  label="Phone Number 1"
                  value={form.phone_1}
                  onChange={(event) => updateField('phone_1', event.target.value)}
                  required
                />
                <Input
                  label="Phone Number 2"
                  value={form.phone_2}
                  onChange={(event) => updateField('phone_2', event.target.value)}
                />
                <Input
                  label="Email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  helperText="Prepared for future settings storage."
                />
                <Input
                  label="TIN"
                  value={form.tin}
                  onChange={(event) => updateField('tin', event.target.value)}
                  helperText="Optional future field."
                />
              </div>
              <TextArea
                label="Business Address"
                value={form.business_address}
                onChange={(event) => updateField('business_address', event.target.value)}
                required
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-xl font-bold text-text">Invoice Configuration</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  label="Invoice Prefix"
                  value={form.invoice_prefix}
                  maxLength={12}
                  onChange={(event) => updateField('invoice_prefix', event.target.value)}
                  required
                />
                <Input
                  label="Default Downpayment %"
                  type="number"
                  min="0"
                  max="100"
                  value={form.default_downpayment_percent}
                  onChange={(event) =>
                    updateField('default_downpayment_percent', event.target.value)
                  }
                  required
                />
                <Input
                  label="Delivery Fee Default"
                  type="number"
                  min="0"
                  value={form.delivery_fee_default}
                  onChange={(event) =>
                    updateField('delivery_fee_default', event.target.value)
                  }
                  helperText="Future order default."
                />
                <Input label="Currency" value={form.currency} disabled />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-xl font-bold text-text">Payment Defaults</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Default Payment Method"
                  value={form.default_payment_method}
                  onChange={(event) =>
                    updateField('default_payment_method', event.target.value)
                  }
                  options={[
                    { label: 'Cash', value: 'cash' },
                    { label: 'GCash', value: 'gcash' },
                    { label: 'Bank Transfer', value: 'bank_transfer' },
                    { label: 'MariBank', value: 'maribank' },
                  ]}
                />
                <Select
                  label="Default Order Status"
                  value={form.default_order_status}
                  onChange={(event) =>
                    updateField('default_order_status', event.target.value)
                  }
                  options={[{ label: 'Pending', value: 'pending' }]}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-xl font-bold text-text">Branding</h2>
              <div className="flex flex-wrap items-center gap-5">
                <LogoPlaceholder />
                <div>
                  <p className="font-semibold text-text">Logo Placeholder</p>
                  <p className="text-sm text-muted">
                    Place your final logo at public/images/lily-logo.png.
                  </p>
                </div>
                <Button
                  variant="outline"
                  leftIcon={<Palette className="size-4" />}
                  disabled
                >
                  Future Upload
                </Button>
                <span className="h-10 w-20 rounded-lg border border-border bg-primary" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-xl font-bold text-text">System Preferences</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Input label="Theme" value={form.theme} disabled />
                <Input label="Language" value={form.language} disabled />
                <Input label="Timezone" value={form.timezone} disabled />
                <Input label="Date Format" value={form.date_format} disabled />
              </div>
            </CardBody>
          </Card>

          <ConfirmationDialog
            isOpen={isResetOpen}
            title="Reset settings?"
            description="This restores the default Lily Flowers business settings."
            confirmLabel="Reset"
            isLoading={isSaving}
            onCancel={() => setIsResetOpen(false)}
            onConfirm={resetSettings}
          />
        </form>
      }
    />
  );
}
