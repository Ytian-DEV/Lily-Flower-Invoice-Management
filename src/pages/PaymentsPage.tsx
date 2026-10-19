import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Banknote, FileText, Plus, Receipt, Trash2, Upload } from 'lucide-react';

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  LoadingScreen,
  Select,
  StatusChip,
  TextArea,
} from '@/components/ui';
import { CrudPageContainer } from '@/features/crud';
import type { Order } from '@/features/orders';
import {
  formatOrderCurrency,
  formatOrderDate,
} from '@/features/orders/utils/orderFormatters';
import { invoicesRepository } from '@/services/repositories/invoicesRepository';
import {
  paymentReceiptsRepository,
  paymentsRepository,
} from '@/services/repositories/paymentsRepository';
import {
  createSignedUrl,
  receiptPathFromImageUrl,
  removeFile,
  uploadReceipt,
} from '@/services/storage';
import type { PaymentMethod, TableRow } from '@/types/database';

type Payment = TableRow<'payments'>;
type PaymentReceipt = TableRow<'payment_receipts'>;

interface FormState {
  payment_method: PaymentMethod;
  amount: string;
  reference_number: string;
  payment_date: string;
  notes: string;
}

const methodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'GCash', value: 'gcash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'MariBank', value: 'maribank' },
];

const formatMethod = (method: PaymentMethod) =>
  methodOptions.find((option) => option.value === method)?.label ?? method;

const getPaymentStatus = (paidAmount: number, totalAmount: number) => {
  if (paidAmount <= 0) {
    return 'unpaid';
  }

  return paidAmount >= totalAmount ? 'paid' : 'partially-paid';
};

// en-CA formats as YYYY-MM-DD; the shop runs on Manila time, not UTC.
const todayInputValue = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());

export function PaymentsPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Order[]>([]);
  const [invoice, setInvoice] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipts, setReceipts] = useState<Record<string, PaymentReceipt>>({});
  const [receiptUrls, setReceiptUrls] = useState<Record<string, string>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    payment_method: 'cash',
    amount: '',
    reference_number: '',
    payment_date: todayInputValue(),
    notes: '',
  });

  const paidAmount = useMemo(
    () => payments.reduce((sum, payment) => sum + Number(payment.amount), 0),
    [payments],
  );
  const currentRemaining = Math.max(0, (invoice?.total_amount ?? 0) - paidAmount);
  const selectedInvoiceId = invoiceId ?? invoice?.id;
  const requiresReceipt = form.payment_method !== 'cash';

  const loadPayments = async (id: string, baseInvoice?: Order) => {
    const [{ data: paymentData, error: paymentError }, invoiceResult] = await Promise.all(
      [
        paymentsRepository.listByInvoice(id),
        baseInvoice
          ? Promise.resolve({ data: baseInvoice, error: null })
          : invoicesRepository.getById(id),
      ],
    );

    if (paymentError || invoiceResult.error) {
      setErrorMessage(paymentError?.message ?? invoiceResult.error?.message ?? null);
      return;
    }

    const loadedPayments = paymentData ?? [];
    setInvoice(invoiceResult.data ?? null);
    setPayments(loadedPayments);

    const receiptPairs = await Promise.all(
      loadedPayments.map(async (payment) => {
        const { data } = await paymentReceiptsRepository.getByPaymentId(payment.id);
        return [payment.id, data] as const;
      }),
    );
    const loadedReceipts = receiptPairs.filter(
      (entry): entry is readonly [string, PaymentReceipt] => Boolean(entry[1]),
    );
    setReceipts(Object.fromEntries(loadedReceipts));

    const urlPairs = await Promise.all(
      loadedReceipts.map(async ([paymentId, receiptData]) => {
        const { data } = await createSignedUrl(
          'receipts',
          receiptPathFromImageUrl(receiptData.image_url),
        );
        return [paymentId, data?.signedUrl ?? ''] as const;
      }),
    );
    setReceiptUrls(Object.fromEntries(urlPairs.filter(([, url]) => Boolean(url))));
  };

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await invoicesRepository.list();

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const invoiceRows = data ?? [];
      setInvoices(invoiceRows);
      const activeInvoice =
        invoiceRows.find((item) => item.id === invoiceId) ?? invoiceRows[0] ?? null;

      if (activeInvoice) {
        await loadPayments(activeInvoice.id, activeInvoice);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [invoiceId]);

  useEffect(() => {
    if (!receiptFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(receiptFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [receiptFile]);

  const handleInvoiceChange = (id: string) => {
    if (id) {
      navigate(`/payments/${id}`);
    }
  };

  const resetForm = () => {
    setForm({
      payment_method: 'cash',
      amount: '',
      reference_number: '',
      payment_date: todayInputValue(),
      notes: '',
    });
    setReceiptFile(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedInvoiceId || !invoice) {
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Enter a valid payment amount.');
      return;
    }

    if (requiresReceipt && !receiptFile) {
      setErrorMessage('Receipt upload is required for digital payments.');
      return;
    }

    if (amount > currentRemaining) {
      const confirmed = window.confirm(
        'This payment is greater than the remaining balance. Record it anyway?',
      );

      if (!confirmed) {
        return;
      }
    }

    setIsSaving(true);
    setErrorMessage(null);

    let receiptPath: string | null = null;

    if (receiptFile) {
      const uploadResult = await uploadReceipt(receiptFile, selectedInvoiceId);

      if (uploadResult.error) {
        setErrorMessage(uploadResult.error.message);
        setIsSaving(false);
        return;
      }

      receiptPath = uploadResult.data.path;
    }

    const { error: paymentError } = await paymentsRepository.record({
      invoice_id: selectedInvoiceId,
      payment_method: form.payment_method,
      amount,
      reference_number: form.reference_number.trim() || null,
      payment_date: form.payment_date,
      receipt_path: receiptPath,
    });

    if (paymentError) {
      if (receiptPath) {
        await removeFile('receipts', receiptPath);
      }

      setErrorMessage(paymentError.message);
      setIsSaving(false);
      return;
    }

    await loadPayments(selectedInvoiceId);
    resetForm();
    setIsSaving(false);
  };

  if (isLoading) {
    return <LoadingScreen text="Loading payments..." />;
  }

  return (
    <CrudPageContainer
      title="Payments"
      subtitle="Record invoice payments, receipt references, and balance updates."
      primaryAction={
        selectedInvoiceId ? (
          <Button
            variant="outline"
            leftIcon={<FileText className="size-4" />}
            onClick={() => navigate(`/orders/${selectedInvoiceId}/preview`)}
          >
            Preview Invoice
          </Button>
        ) : null
      }
      tableSlot={
        <div className="space-y-6">
          {errorMessage ? (
            <Alert variant="error" title="Payment error" description={errorMessage} />
          ) : null}

          {invoices.length === 0 ? (
            <EmptyState
              title="No invoices yet"
              description="Create an order before recording payments."
              primaryAction={
                <Button onClick={() => navigate('/orders/new')}>Create Order</Button>
              }
            />
          ) : (
            <>
              <Card>
                <CardBody className="grid gap-4 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                  <Select
                    label="Invoice"
                    value={selectedInvoiceId ?? ''}
                    onChange={(event) => handleInvoiceChange(event.target.value)}
                    options={invoices.map((item) => ({
                      label: item.invoice_number,
                      value: item.id,
                    }))}
                  />
                  <div>
                    <p className="text-sm font-semibold text-muted">Paid Amount</p>
                    <p className="mt-2 text-xl font-bold text-text">
                      {formatOrderCurrency(paidAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted">Remaining Balance</p>
                    <p className="mt-2 text-xl font-bold text-text">
                      {formatOrderCurrency(currentRemaining)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted">Payment Status</p>
                    <div className="mt-2">
                      <StatusChip
                        status={getPaymentStatus(paidAmount, invoice?.total_amount ?? 0)}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Card>
                  <CardBody>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-accent text-primary-dark">
                        <Plus className="size-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-text">Add Payment</h2>
                        <p className="text-sm text-muted">
                          Validate amount against the remaining balance before saving.
                        </p>
                      </div>
                    </div>
                    <form className="grid gap-4" onSubmit={handleSubmit}>
                      <Select
                        label="Payment Method"
                        value={form.payment_method}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            payment_method: event.target.value as PaymentMethod,
                          }))
                        }
                        options={methodOptions}
                      />
                      <Input
                        label="Amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amount}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            amount: event.target.value,
                          }))
                        }
                        required
                      />
                      <Input
                        label="Reference Number"
                        value={form.reference_number}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            reference_number: event.target.value,
                          }))
                        }
                        helperText="Optional for cash payments."
                      />
                      <Input
                        label="Payment Date"
                        type="date"
                        value={form.payment_date}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            payment_date: event.target.value,
                          }))
                        }
                        required
                      />
                      <Input
                        label="Receipt Upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => {
                          setReceiptFile(event.target.files?.[0] ?? null);
                        }}
                        required={requiresReceipt}
                      />
                      {previewUrl ? (
                        <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                          <img
                            src={previewUrl}
                            alt="Receipt preview"
                            className="h-24 w-24 rounded-md object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="size-4" />}
                            onClick={() => setReceiptFile(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : null}
                      <TextArea
                        label="Internal Notes"
                        value={form.notes}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        helperText="Prepared for staff-only notes. Not printed on invoices."
                      />
                      <Button
                        type="submit"
                        isLoading={isSaving}
                        leftIcon={<Upload className="size-4" />}
                      >
                        Record Payment
                      </Button>
                    </form>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-accent text-primary-dark">
                        <Receipt className="size-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-text">Payment Timeline</h2>
                        <p className="text-sm text-muted">
                          Newest payments appear first.
                        </p>
                      </div>
                    </div>
                    {payments.length === 0 ? (
                      <EmptyState
                        title="No payments recorded"
                        description="Add the first transaction for this invoice."
                      />
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => {
                          const receiptData = receipts[payment.id];

                          return (
                            <div
                              key={payment.id}
                              className="rounded-lg border border-border bg-background p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="font-bold text-text">
                                    {formatOrderCurrency(payment.amount)}
                                  </p>
                                  <p className="text-sm text-muted">
                                    {formatMethod(payment.payment_method)} ·{' '}
                                    {formatOrderDate(payment.payment_date)}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <StatusChip
                                    status={
                                      payment.payment_status === 'partially_paid'
                                        ? 'partially-paid'
                                        : payment.payment_status
                                    }
                                  />
                                  <Badge
                                    variant={
                                      receiptData?.verified ? 'success' : 'warning'
                                    }
                                  >
                                    {receiptData?.verified ? 'Verified' : 'Unverified'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
                                <span>
                                  Reference:{' '}
                                  <strong className="text-text">
                                    {payment.reference_number ?? 'None'}
                                  </strong>
                                </span>
                                <span>
                                  Status:{' '}
                                  <strong className="text-text">
                                    {payment.payment_status.replace('_', ' ')}
                                  </strong>
                                </span>
                              </div>
                              {receiptData && receiptUrls[payment.id] ? (
                                <a
                                  href={receiptUrls[payment.id]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 inline-flex items-center gap-3 text-sm font-semibold text-primary-dark"
                                >
                                  <img
                                    src={receiptUrls[payment.id]}
                                    alt={`Receipt for ${formatOrderCurrency(payment.amount)} payment`}
                                    className="size-16 rounded-md border border-border object-cover"
                                  />
                                  View receipt
                                </a>
                              ) : receiptData ? (
                                <p className="mt-4 text-sm text-muted">
                                  Receipt attached but could not be loaded.
                                </p>
                              ) : (
                                <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted">
                                  <Banknote className="size-4" />
                                  No receipt attached
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </>
          )}
        </div>
      }
    />
  );
}
