import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { Minus, Plus, Sparkles, Trash2 } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import {
  Alert,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Input,
  LoadingScreen,
  PageHeader,
  Select,
  TextArea,
  orderStatusLabels,
  useToast,
} from '@/components/ui';
import { useCatalog, type Product } from '@/features/catalog/api';
import { useCreateOrder, useOrder, useUpdateOrder } from '@/features/orders/api';
import { CustomerPicker } from '@/features/orders/components/CustomerPicker';
import type {
  OrderAddonItem,
  OrderFormValues,
  OrderProductItem,
} from '@/features/orders/types';
import { calculatePricing, roundCurrency } from '@/features/orders/utils/pricing';
import { getSmartStemSuggestion } from '@/features/orders/utils/smartStemSuggestion';
import { useSettings } from '@/features/settings/api';
import { paymentMethodOptions } from '@/lib/labels';
import type { OrderSavePayload } from '@/services/repositories/invoicesRepository';
import { removeFile, uploadReceipt } from '@/services/storage';
import type { InvoiceStatus } from '@/types/database';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatCurrency';
import { manilaToday } from '@/utils/formatDate';
import { orderFormSchema } from '@/validation/orders';

const customColorValue = '__custom__';

const defaultValues: OrderFormValues = {
  customerId: '',
  customerName: '',
  phoneNumber: '',
  deliveryAddress: '',
  deliveryDate: '',
  customerNotes: '',
  requestedStems: 0,
  products: [],
  addons: [],
  discountPercent: 0,
  deliveryFee: 0,
  downpaymentPercent: 50,
  paymentMethod: 'cash',
  paymentStatus: 'pending',
  referenceNumber: '',
  orderNotes: '',
  status: 'pending',
};

const statusOptions = (Object.keys(orderStatusLabels) as InvoiceStatus[]).map(
  (status) => ({
    value: status,
    label: orderStatusLabels[status],
  }),
);

function withQuantity<TLine extends OrderProductItem | OrderAddonItem>(
  line: TLine,
  quantity: number,
): TLine {
  const safeQuantity = Math.max(1, Math.floor(quantity) || 1);
  return {
    ...line,
    quantity: safeQuantity,
    totalPrice: roundCurrency(safeQuantity * line.unitPrice),
  };
}

function QuantityStepper({
  label,
  onChange,
  value,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex h-9 items-center rounded-lg border border-border-strong bg-surface">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="flex h-full w-8 items-center justify-center text-muted hover:text-text disabled:opacity-40"
      >
        <Minus aria-hidden="true" className="size-3.5" />
      </button>
      <input
        aria-label={`${label} quantity`}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, '')) || 1)}
        className="h-full w-9 border-x border-border bg-transparent text-center text-sm tabular-nums focus:outline-none"
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(value + 1)}
        className="flex h-full w-8 items-center justify-center text-muted hover:text-text"
      >
        <Plus aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}

function TotalLine({
  divided,
  label,
  strong,
  value,
}: {
  label: string;
  value: string;
  strong?: boolean;
  /** Draws a rule above the row (for totals); keeps <dt>/<dd> direct children of the row. */
  divided?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between py-1 text-sm',
        divided && 'mt-1 border-t border-border pt-2',
      )}
    >
      <dt className={strong ? 'font-medium text-text' : 'text-muted'}>{label}</dt>
      <dd className={strong ? 'text-base font-semibold tabular-nums' : 'tabular-nums'}>
        {value}
      </dd>
    </div>
  );
}

export function OrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { showToast } = useToast();
  const catalog = useCatalog();
  const settings = useSettings();
  const existing = useOrder(id);
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder(id ?? '');
  const [selectedProducts, setSelectedProducts] = useState<OrderProductItem[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<OrderAddonItem[]>([]);
  const [linkedCustomerName, setLinkedCustomerName] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationSummary, setValidationSummary] = useState('');
  const [hasLoadedExisting, setHasLoadedExisting] = useState(false);
  const { control, handleSubmit, register, reset, setValue } = useForm<OrderFormValues>({
    defaultValues,
  });

  // Subscribe only to the fields the summary needs, so typing in other fields
  // does not re-render the whole page.
  const [
    discountPercent,
    deliveryFee,
    downpaymentPercent,
    paymentMethod,
    requestedStems,
  ] = useWatch({
    control,
    name: [
      'discountPercent',
      'deliveryFee',
      'downpaymentPercent',
      'paymentMethod',
      'requestedStems',
    ],
  });

  const products = useMemo(() => catalog.data?.products ?? [], [catalog.data]);
  const addons = useMemo(() => catalog.data?.addons ?? [], [catalog.data]);
  const availableProducts = useMemo(
    () => products.filter((product) => product.availability === 'available'),
    [products],
  );
  const availableAddons = useMemo(
    () => addons.filter((addon) => addon.availability === 'available'),
    [addons],
  );

  useEffect(() => {
    if (!isEditing && settings.data) {
      setValue('downpaymentPercent', settings.data.default_downpayment_percent);
    }
  }, [isEditing, setValue, settings.data]);

  useEffect(() => {
    if (!existing.data || hasLoadedExisting) {
      return;
    }

    const { addons: addonLines, customer, invoice, items } = existing.data;
    reset({
      ...defaultValues,
      customerId: invoice.customer_id ?? '',
      customerName: invoice.customer_name,
      phoneNumber: invoice.customer_phone ?? customer?.phone_number ?? '',
      deliveryAddress: invoice.delivery_address ?? '',
      deliveryDate: invoice.delivery_date ?? '',
      discountPercent: invoice.discount_percent,
      deliveryFee: invoice.delivery_fee,
      paymentMethod: invoice.payment_method ?? 'cash',
      orderNotes: invoice.notes ?? '',
      status: invoice.status,
    });
    setLinkedCustomerName(customer?.full_name ?? null);
    setSelectedProducts(
      items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name ?? item.products?.product_name ?? 'Bouquet',
        stemCount: null,
        categoryName: '',
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        colorId: item.color_id,
        colorName: item.custom_color_name ?? item.color_name ?? '',
        customColorName: item.custom_color_name,
        isCustomColor: Boolean(item.custom_color_name),
      })),
    );
    setSelectedAddons(
      addonLines.map((line) => ({
        id: line.id,
        addonId: line.addon_id,
        addonName: line.addon_name ?? line.addons?.addon_name ?? 'Add-on',
        quantity: line.quantity,
        unitPrice: line.unit_price,
        totalPrice: line.total_price,
      })),
    );
    setHasLoadedExisting(true);
  }, [existing.data, hasLoadedExisting, reset]);

  const pricing = useMemo(
    () =>
      calculatePricing(
        selectedProducts,
        selectedAddons,
        Number(discountPercent),
        Number(deliveryFee),
        Number(downpaymentPercent),
      ),
    [deliveryFee, discountPercent, downpaymentPercent, selectedAddons, selectedProducts],
  );
  const paidSoFar = roundCurrency(
    (existing.data?.payments ?? []).reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    ),
  );
  const suggestion = useMemo(
    () => getSmartStemSuggestion(Number(requestedStems), availableProducts, addons),
    [addons, availableProducts, requestedStems],
  );

  const addProduct = (product: Product | undefined) => {
    if (!product) {
      return;
    }

    setSelectedProducts((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.product_name,
        stemCount: product.stem_count,
        categoryName: product.categoryName,
        quantity: 1,
        unitPrice: product.base_price,
        totalPrice: product.base_price,
        colorId: null,
        colorName: '',
        customColorName: null,
        isCustomColor: false,
      },
    ]);
  };

  const addAddon = (addonId: string, quantity = 1) => {
    const addon = addons.find((item) => item.id === addonId);

    if (!addon) {
      return;
    }

    setSelectedAddons((current) => {
      const existingLine = current.find((line) => line.addonId === addon.id);

      if (existingLine) {
        return current.map((line) =>
          line.id === existingLine.id
            ? withQuantity(line, line.quantity + quantity)
            : line,
        );
      }

      return [
        ...current,
        {
          id: crypto.randomUUID(),
          addonId: addon.id,
          addonName: addon.addon_name,
          quantity,
          unitPrice: addon.price,
          totalPrice: roundCurrency(addon.price * quantity),
        },
      ];
    });
  };

  const updateProduct = (
    lineId: string,
    update: (line: OrderProductItem) => OrderProductItem,
  ) =>
    setSelectedProducts((current) =>
      current.map((line) => (line.id === lineId ? update(line) : line)),
    );

  const chooseColor = (line: OrderProductItem, value: string): OrderProductItem => {
    if (value === customColorValue) {
      return {
        ...line,
        colorId: null,
        colorName: line.customColorName ?? '',
        customColorName: line.customColorName ?? '',
        isCustomColor: true,
      };
    }

    const color = products
      .find((product) => product.id === line.productId)
      ?.colors.find((option) => option.id === value);

    return {
      ...line,
      colorId: color?.id ?? null,
      colorName: color?.color_name ?? '',
      customColorName: null,
      isCustomColor: false,
    };
  };

  const submitOrder = handleSubmit(async (values) => {
    const parsed = orderFormSchema.safeParse({
      ...values,
      products: selectedProducts,
      addons: selectedAddons,
      discountPercent: Number(values.discountPercent) || 0,
      deliveryFee: Number(values.deliveryFee) || 0,
      downpaymentPercent: Number(values.downpaymentPercent) || 0,
    });

    if (!parsed.success) {
      setValidationSummary(parsed.error.issues[0]?.message ?? 'Please check the order.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationSummary('');

    const order: Omit<OrderSavePayload, 'payment'> = {
      invoice: {
        customer_id: parsed.data.customerId,
        customer_name: parsed.data.customerName,
        customer_phone: parsed.data.phoneNumber,
        discount_percent: parsed.data.discountPercent,
        delivery_fee: parsed.data.deliveryFee,
        status: parsed.data.status,
        notes: parsed.data.orderNotes || null,
        delivery_date: parsed.data.deliveryDate,
        delivery_address: parsed.data.deliveryAddress,
        payment_method: parsed.data.paymentMethod,
      },
      items: selectedProducts.map((item) => ({
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        color_id: item.isCustomColor ? null : item.colorId,
        color_name: item.isCustomColor ? null : item.colorName,
        custom_color_name: item.isCustomColor ? item.customColorName : null,
      })),
      addons: selectedAddons.map((item) => ({
        addon_id: item.addonId,
        addon_name: item.addonName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    };

    try {
      if (id) {
        const saved = await updateOrder.mutateAsync(order);
        showToast({ variant: 'success', title: `${saved.invoice_number} updated` });
        navigate(`/orders/${id}`);
        return;
      }

      const isDigital = parsed.data.paymentMethod !== 'cash';
      let receiptPath: string | null = null;

      if (isDigital && receiptFile && pricing.downpaymentAmount > 0) {
        setIsUploading(true);
        const upload = await uploadReceipt(receiptFile, 'downpayments');
        setIsUploading(false);

        if (upload.error) {
          throw new Error(`Receipt upload failed: ${upload.error.message}`);
        }

        receiptPath = upload.data.path;
      }

      try {
        const saved = await createOrder.mutateAsync({
          ...order,
          payment: {
            downpayment_percent: parsed.data.downpaymentPercent,
            payment_method: parsed.data.paymentMethod,
            reference_number: isDigital ? values.referenceNumber.trim() || null : null,
            receipt_path: receiptPath,
          },
        });
        showToast({ variant: 'success', title: `Order ${saved.invoice_number} created` });
        navigate(`/orders/${saved.id}`);
      } catch (error) {
        if (receiptPath) {
          await removeFile('receipts', receiptPath);
        }
        throw error;
      }
    } catch (error) {
      setIsUploading(false);
      showToast({
        variant: 'error',
        title: 'Order was not saved',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  });

  if (catalog.isPending || (isEditing && existing.isPending)) {
    return <LoadingScreen label="Loading order form" />;
  }

  if (catalog.isError || existing.isError) {
    return (
      <PageContainer size="narrow">
        <ErrorState
          title={
            existing.isError
              ? 'This order could not be loaded'
              : 'The catalog could not load'
          }
          description={(existing.error ?? catalog.error)?.message}
          onRetry={() => (existing.isError ? existing.refetch() : catalog.refetch())}
        />
      </PageContainer>
    );
  }

  const isSaving = isUploading || createOrder.isPending || updateOrder.isPending;
  const balanceDue = isEditing
    ? Math.max(0, roundCurrency(pricing.totalAmount - paidSoFar))
    : pricing.remainingBalance;
  const invoiceNumber = existing.data?.invoice.invoice_number;

  return (
    <PageContainer>
      <PageHeader
        back={
          id
            ? { to: `/orders/${id}`, label: invoiceNumber ?? 'Order' }
            : { to: '/orders', label: 'Orders' }
        }
        title={isEditing ? `Edit ${invoiceNumber}` : 'New order'}
        description={
          isEditing
            ? 'Changes update the invoice. Recorded payments are kept.'
            : 'The invoice number is assigned when you save.'
        }
      />

      {validationSummary ? (
        <Alert
          variant="error"
          title="Check the order"
          description={validationSummary}
          className="mb-6"
        />
      ) : null}

      <form
        onSubmit={submitOrder}
        noValidate
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
      >
        <div className="grid gap-6">
          <Card>
            <CardHeader title="Customer" />
            <div className="grid gap-4 px-5 pb-5">
              <CustomerPicker
                selectedName={linkedCustomerName}
                onSelect={(customer) => {
                  setValue('customerId', customer.id);
                  setValue('customerName', customer.full_name);
                  setValue('phoneNumber', customer.phone_number);
                  setValue('deliveryAddress', customer.delivery_address ?? '');
                  setLinkedCustomerName(customer.full_name);
                }}
                onClear={() => {
                  setValue('customerId', '');
                  setLinkedCustomerName(null);
                }}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  required
                  autoComplete="off"
                  {...register('customerName')}
                />
                <Input
                  label="Phone"
                  required
                  type="tel"
                  autoComplete="off"
                  placeholder="09XX XXX XXXX"
                  {...register('phoneNumber')}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Delivery" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-[12rem_minmax(0,1fr)]">
              <Input
                label="Date"
                required
                type="date"
                min={isEditing ? undefined : manilaToday()}
                {...register('deliveryDate')}
              />
              <Input
                label="Address"
                required
                placeholder="Street, barangay, landmark"
                {...register('deliveryAddress')}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Bouquets" />
            <div className="grid gap-4 px-5 pb-5">
              <Select
                aria-label="Add a bouquet"
                value=""
                onChange={(event) =>
                  addProduct(
                    products.find((product) => product.id === event.target.value),
                  )
                }
                options={[
                  { label: 'Add a bouquet…', value: '' },
                  ...availableProducts.map((product) => ({
                    label: `${product.product_name} · ${formatCurrency(product.base_price)}`,
                    value: product.id,
                  })),
                ]}
              />

              {selectedProducts.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted">
                  No bouquets yet. Pick one above.
                </p>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {selectedProducts.map((line) => {
                    const product = products.find((item) => item.id === line.productId);
                    const colorOptions = (product?.colors ?? [])
                      .filter(
                        (color) =>
                          color.availability === 'available' || color.id === line.colorId,
                      )
                      .map((color) => ({ label: color.color_name, value: color.id }));

                    if (
                      line.colorId &&
                      !colorOptions.some((option) => option.value === line.colorId)
                    ) {
                      colorOptions.push({ label: line.colorName, value: line.colorId });
                    }

                    return (
                      <li key={line.id} className="grid gap-3 p-3 sm:p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-text">{line.productName}</p>
                            <p className="text-xs text-muted tabular-nums">
                              {formatCurrency(line.unitPrice)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <QuantityStepper
                              label={line.productName}
                              value={line.quantity}
                              onChange={(quantity) =>
                                updateProduct(line.id, (current) =>
                                  withQuantity(current, quantity),
                                )
                              }
                            />
                            <span className="w-24 text-right text-sm font-medium tabular-nums">
                              {formatCurrency(line.totalPrice)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${line.productName}`}
                              onClick={() =>
                                setSelectedProducts((current) =>
                                  current.filter((item) => item.id !== line.id),
                                )
                              }
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Select
                            label="Color"
                            required
                            value={
                              line.isCustomColor ? customColorValue : (line.colorId ?? '')
                            }
                            onChange={(event) =>
                              updateProduct(line.id, (current) =>
                                chooseColor(current, event.target.value),
                              )
                            }
                            options={[
                              { label: 'Choose a color', value: '' },
                              ...colorOptions,
                              { label: 'Other (type it)', value: customColorValue },
                            ]}
                          />
                          {line.isCustomColor ? (
                            <Input
                              label="Color name"
                              required
                              value={line.customColorName ?? ''}
                              onChange={(event) =>
                                updateProduct(line.id, (current) => ({
                                  ...current,
                                  colorName: event.target.value.trim(),
                                  customColorName: event.target.value,
                                }))
                              }
                            />
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <details className="rounded-lg bg-surface-muted px-4 py-3 text-sm">
                <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-muted hover:text-text [&::-webkit-details-marker]:hidden">
                  <Sparkles aria-hidden="true" className="size-4 text-primary" />
                  Customer asked for a stem count?
                </summary>
                <div className="mt-3 grid gap-3">
                  <Input
                    label="Stems requested"
                    type="number"
                    min={0}
                    containerClassName="max-w-40"
                    {...register('requestedStems', { valueAsNumber: true })}
                  />
                  {suggestion ? (
                    <Alert
                      variant="info"
                      description={`${suggestion.product.product_name}${
                        suggestion.extraStemAddon
                          ? ` + ${suggestion.extraStemsNeeded} × ${suggestion.extraStemAddon.addon_name}`
                          : ''
                      } makes ${suggestion.requestedStems} stems.`}
                      actions={
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            addProduct(suggestion.product);
                            if (suggestion.extraStemAddon) {
                              addAddon(
                                suggestion.extraStemAddon.id,
                                suggestion.extraStemsNeeded,
                              );
                            }
                          }}
                        >
                          Add these
                        </Button>
                      }
                    />
                  ) : null}
                </div>
              </details>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Add-ons"
              description="Ribbons, cards, chocolates and extras"
            />
            <div className="grid gap-3 px-5 pb-5">
              <Select
                aria-label="Add an add-on"
                value=""
                onChange={(event) => addAddon(event.target.value)}
                options={[
                  { label: 'Add an add-on…', value: '' },
                  ...availableAddons.map((addon) => ({
                    label: `${addon.addon_name} · ${formatCurrency(addon.price)}`,
                    value: addon.id,
                  })),
                ]}
              />
              {selectedAddons.length ? (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {selectedAddons.map((line) => (
                    <li
                      key={line.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text">{line.addonName}</p>
                        <p className="text-xs text-muted tabular-nums">
                          {formatCurrency(line.unitPrice)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <QuantityStepper
                          label={line.addonName}
                          value={line.quantity}
                          onChange={(quantity) =>
                            setSelectedAddons((current) =>
                              current.map((item) =>
                                item.id === line.id ? withQuantity(item, quantity) : item,
                              ),
                            )
                          }
                        />
                        <span className="w-24 text-right text-sm font-medium tabular-nums">
                          {formatCurrency(line.totalPrice)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${line.addonName}`}
                          onClick={() =>
                            setSelectedAddons((current) =>
                              current.filter((item) => item.id !== line.id),
                            )
                          }
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Status and notes" />
            <div className="grid gap-4 px-5 pb-5">
              <Select
                label="Order status"
                containerClassName="sm:max-w-60"
                options={statusOptions}
                {...register('status')}
              />
              <TextArea
                label="Notes"
                maxLength={1000}
                placeholder="Card message, delivery instructions, special requests"
                helperText="Printed on the invoice."
                {...register('orderNotes')}
              />
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-6">
          <Card>
            <CardHeader title="Summary" />
            <div className="grid gap-4 px-5 pb-5">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Discount %"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  {...register('discountPercent', { valueAsNumber: true })}
                />
                <Input
                  label="Delivery fee"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  {...register('deliveryFee', { valueAsNumber: true })}
                />
              </div>

              <dl className="border-t border-border pt-3">
                <TotalLine label="Subtotal" value={formatCurrency(pricing.subtotal)} />
                {pricing.discountAmount > 0 ? (
                  <TotalLine
                    label="Discount"
                    value={`-${formatCurrency(pricing.discountAmount)}`}
                  />
                ) : null}
                {pricing.deliveryFee > 0 ? (
                  <TotalLine
                    label="Delivery"
                    value={formatCurrency(pricing.deliveryFee)}
                  />
                ) : null}
                <TotalLine
                  label="Total"
                  value={formatCurrency(pricing.totalAmount)}
                  strong
                  divided
                />
              </dl>

              {isEditing ? (
                <dl className="rounded-lg bg-surface-muted px-3 py-2">
                  <TotalLine label="Paid so far" value={formatCurrency(paidSoFar)} />
                  <TotalLine
                    label="Balance due"
                    value={formatCurrency(balanceDue)}
                    strong
                  />
                  {paidSoFar > pricing.totalAmount ? (
                    <p className="mt-1 text-xs text-warning-text">
                      Payments already exceed the new total.
                    </p>
                  ) : null}
                </dl>
              ) : (
                <div className="grid gap-3 rounded-lg bg-surface-muted p-3">
                  <p className="text-sm font-medium text-text">Downpayment</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Percent"
                      type="number"
                      min={0}
                      max={100}
                      {...register('downpaymentPercent', { valueAsNumber: true })}
                    />
                    <Select
                      label="Method"
                      options={paymentMethodOptions}
                      {...register('paymentMethod')}
                    />
                  </div>
                  {paymentMethod !== 'cash' && pricing.downpaymentAmount > 0 ? (
                    <>
                      <Input label="Reference no." {...register('referenceNumber')} />
                      <Input
                        label="Receipt"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) =>
                          setReceiptFile(event.target.files?.[0] ?? null)
                        }
                      />
                    </>
                  ) : null}
                  <dl>
                    <TotalLine
                      label="Collect now"
                      value={formatCurrency(pricing.downpaymentAmount)}
                    />
                    <TotalLine
                      label="Balance due"
                      value={formatCurrency(balanceDue)}
                      strong
                    />
                  </dl>
                </div>
              )}

              <div className="grid gap-2">
                <Button type="submit" size="lg" isLoading={isSaving}>
                  {isEditing ? 'Save changes' : 'Create order'}
                </Button>
                <Button variant="ghost" onClick={() => navigate(-1)} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </aside>
      </form>
    </PageContainer>
  );
}
