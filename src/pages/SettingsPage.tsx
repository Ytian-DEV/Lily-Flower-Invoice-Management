import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import {
  Alert,
  Button,
  Card,
  CardFooter,
  CardHeader,
  ErrorState,
  Input,
  LoadingScreen,
  PageHeader,
  TextArea,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useSaveSettings, useSettings } from '@/features/settings/api';
import { settingsSchema } from '@/validation/settings';

type Errors = Partial<Record<string, string>>;

export function SettingsPage() {
  const { showToast } = useToast();
  const { isAdmin, profile, user } = useAuth();
  const settings = useSettings();
  const saveSettings = useSaveSettings();
  const [errors, setErrors] = useState<Errors>({});

  if (settings.isPending) {
    return <LoadingScreen label="Loading settings" />;
  }

  if (settings.isError) {
    return (
      <PageContainer size="narrow">
        <ErrorState
          description={settings.error.message}
          onRetry={() => settings.refetch()}
        />
      </PageContainer>
    );
  }

  const current = settings.data;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = settingsSchema.safeParse({
      business_name: String(form.get('business_name') ?? ''),
      business_address: String(form.get('business_address') ?? ''),
      phone_1: String(form.get('phone_1') ?? '').replace(/\s/g, ''),
      phone_2: String(form.get('phone_2') ?? '').replace(/\s/g, '') || null,
      facebook: String(form.get('facebook') ?? '') || null,
      invoice_prefix: String(form.get('invoice_prefix') ?? '').toUpperCase(),
      default_downpayment_percent: Number(form.get('default_downpayment_percent')),
    });

    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});

    try {
      await saveSettings.mutateAsync({ id: current?.id ?? null, values: parsed.data });
      showToast({ variant: 'success', title: 'Settings saved' });
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Settings were not saved',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <PageContainer size="narrow">
      <PageHeader title="Settings" description="Shop details printed on every invoice." />

      {!isAdmin ? (
        <Alert
          className="mb-6"
          variant="info"
          title="View only"
          description="Only an admin can change shop settings."
        />
      ) : null}

      <form onSubmit={submit} noValidate className="grid gap-6">
        <fieldset disabled={!isAdmin} className="grid gap-6">
          <Card>
            <CardHeader
              title="Shop details"
              description="Shown at the top of invoices."
            />
            <div className="grid gap-4 px-5 pb-5">
              <Input
                name="business_name"
                label="Shop name"
                required
                defaultValue={
                  current?.business_name ?? 'Lily Flowers - Baybay City Branch'
                }
                error={errors.business_name}
              />
              <TextArea
                name="business_address"
                label="Address"
                required
                rows={2}
                defaultValue={current?.business_address ?? ''}
                error={errors.business_address}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="phone_1"
                  label="Main phone"
                  type="tel"
                  required
                  defaultValue={current?.phone_1 ?? ''}
                  error={errors.phone_1}
                />
                <Input
                  name="phone_2"
                  label="Second phone"
                  type="tel"
                  defaultValue={current?.phone_2 ?? ''}
                  error={errors.phone_2}
                />
              </div>
              <Input
                name="facebook"
                label="Facebook page"
                defaultValue={current?.facebook ?? ''}
                helperText="The page name customers search for."
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Orders and invoices" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Input
                name="invoice_prefix"
                label="Invoice number prefix"
                required
                maxLength={12}
                defaultValue={current?.invoice_prefix ?? 'INV'}
                error={errors.invoice_prefix}
                helperText="New invoices look like PREFIX-20261019-0001."
              />
              <Input
                name="default_downpayment_percent"
                label="Default downpayment"
                type="number"
                min={0}
                max={100}
                required
                defaultValue={current?.default_downpayment_percent ?? 50}
                error={errors.default_downpayment_percent}
                helperText="Percent of the total, pre-filled on new orders."
              />
            </div>
            {isAdmin ? (
              <CardFooter>
                <Button type="submit" isLoading={saveSettings.isPending}>
                  Save settings
                </Button>
              </CardFooter>
            ) : null}
          </Card>
        </fieldset>
      </form>

      <Card className="mt-6">
        <CardHeader title="Your account" />
        <dl className="grid gap-3 px-5 pb-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="mt-0.5 font-medium text-text">{profile?.full_name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-0.5 truncate font-medium text-text">
              {user?.email ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-text capitalize">
              {profile?.role ?? 'staff'}
              {!isAdmin ? (
                <Lock aria-hidden="true" className="size-3.5 text-subtle" />
              ) : null}
            </dd>
          </div>
        </dl>
      </Card>
    </PageContainer>
  );
}
