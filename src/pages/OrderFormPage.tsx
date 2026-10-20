import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { Trash2 } from 'lucide-react';

import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  KeyValueDisplay,
  LoadingOverlay,
  LoadingScreen,
  Select,
  SectionHeader,
  TextArea,
  useToast,
} from '@/components/ui';
import { CrudPageContainer } from '@/features/crud';
import {
  useOrderData,
  calculatePricing,
  getSmartStemSuggestion,
  roundCurrency,
} from '@/features/orders';
import type {
  OrderAddonItem,
  OrderFormValues,
  OrderProductItem,
} from '@/features/orders';
import { formatOrderCurrency } from '@/features/orders/utils/orderFormatters';
import {
  invoicesRepository,
  type InvoicePreviewData,
  type OrderSavePayload,
} from '@/services/repositories/invoicesRepository';
import { settingsRepository } from '@/services/repositories/settingsRepository';
import { removeFile, uploadReceipt } from '@/services/storage';
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

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const paymentMethodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'GCash', value: 'gcash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'MariBank', value: 'maribank' },
];

function toQuantity(value: string) {
  const quantity = Math.floor(Number(value));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function withQuantity<TLine extends OrderProductItem | OrderAddonItem>(
  line: TLine,
  quantity: number,
): TLine {
  return { ...line, quantity, totalPrice: roundCurrency(quantity * line.unitPrice) };
}

export function OrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { showToast } = useToast();
  const { addons, customers, isLoading, products } = useOrderData();
  const [existingOrder, setExistingOrder] = useState<InvoicePreviewData | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(isEditing);
  const [orderLoadError, setOrderLoadError] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<OrderProductItem[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<OrderAddonItem[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationSummary, setValidationSummary] = useState('');
  const { handleSubmit, register, reset, setValue, watch } = useForm<OrderFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (isEditing) {
      return;
    }

    let isActive = true;

    settingsRepository.getActive().then(({ data }) => {
      if (isActive && data) {
        setValue('downpaymentPercent', data.default_downpayment_percent);
      }
    });

    return () => {
      isActive = false;
    };
  }, [isEditing, setValue]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isActive = true;

    invoicesRepository.getPreviewById(id).then(({ data, error }) => {
      if (!isActive) {
        return;
      }

      if (error || !data) {
        setOrderLoadError(error?.message ?? 'This order could not be found.');
        setIsLoadingOrder(false);
        return;
      }

      const { customer, invoice } = data;
      setExistingOrder(data);
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
      setSelectedProducts(
        data.items.map((item) => ({
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
        data.addons.map((line) => ({
          id: line.id,
          addonId: line.addon_id,
          addonName: line.addon_name ?? line.addons?.addon_name ?? 'Add-on',
          quantity: line.quantity,
          unitPrice: line.unit_price,
          totalPrice: line.total_price,
        })),
      );
      setIsLoadingOrder(false);
    });

    return () => {
      isActive = false;
    };
  }, [id, reset]);

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(receiptFile);
    setReceiptPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [receiptFile]);

  const watched = watch();
  const availableProducts = useMemo(
    () => products.filter((product) => product.availability === 'available'),
    [products],
  );
  const availableAddons = useMemo(
    () => addons.filter((addon) => addon.availability === 'available'),
    [addons],
  );
  const pricing = useMemo(
    () =>
      calculatePricing(
        selectedProducts,
        selectedAddons,
        Number(watched.discountPercent),
        Number(watched.deliveryFee),
        Number(watched.downpaymentPercent),
      ),
    [
      selectedAddons,
      selectedProducts,
      watched.deliveryFee,
      watched.discountPercent,
      watched.downpaymentPercent,
    ],
  );
  const paidSoFar = useMemo(
    () =>
      roundCurrency(
        (existingOrder?.payments ?? []).reduce(
          (sum, payment) => sum + Number(payment.amount),
          0,
        ),
      ),
    [existingOrder],
  );
  const suggestion = useMemo(
    () =>
      getSmartStemSuggestion(Number(watched.requestedStems), availableProducts, addons),
    [addons, availableProducts, watched.requestedStems],
  );

  const selectCustomer = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId);
    setValue('customerId', customerId);

    if (customer) {
      setValue('customerName', customer.full_name);
      setValue('phoneNumber', customer.phone_number);
      setValue('deliveryAddress', customer.delivery_address ?? '');
      setValue('customerNotes', customer.notes ?? '');
    }
  };

  const addProduct = (productId: string) => {
    const product = products.find((item) => item.id === productId);

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

  const updateProductColor = (lineId: string, colorValue: string) => {
    setSelectedProducts((current) =>
      current.map((item) => {
        if (item.id !== lineId) {
          return item;
        }

        if (colorValue === customColorValue) {
          return {
            ...item,
            colorId: null,
            colorName: item.customColorName ?? '',
            customColorName: item.customColorName ?? '',
            isCustomColor: true,
          };
        }

        const product = products.find((productItem) => productItem.id === item.productId);
        const color = product?.colors.find(
          (productColor) => productColor.id === colorValue,
        );

        return {
          ...item,
          colorId: color?.id ?? null,
          colorName: color?.color_name ?? '',
          customColorName: null,
          isCustomColor: false,
        };
      }),
    );
  };

  const updateCustomColor = (lineId: string, customColorName: string) => {
    setSelectedProducts((current) =>
      current.map((item) =>
        item.id === lineId
          ? {
              ...item,
              colorName: customColorName.trim(),
              customColorName,
              isCustomColor: true,
            }
          : item,
      ),
    );
  };

  const updateProductQuantity = (lineId: string, value: string) => {
    setSelectedProducts((current) =>
      current.map((item) =>
        item.id === lineId ? withQuantity(item, toQuantity(value)) : item,
      ),
    );
  };

  const removeProduct = (lineId: string) => {
    setSelectedProducts((current) => current.filter((item) => item.id !== lineId));
  };

  const addAddon = (addonId: string, quantity = 1) => {
    const addon = addons.find((item) => item.id === addonId);

    if (!addon) {
      return;
    }

    setSelectedAddons((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        addonId: addon.id,
        addonName: addon.addon_name,
        quantity,
        unitPrice: addon.price,
        totalPrice: roundCurrency(addon.price * quantity),
      },
    ]);
  };

  const updateAddonQuantity = (lineId: string, value: string) => {
    setSelectedAddons((current) =>
      current.map((item) =>
        item.id === lineId ? withQuantity(item, toQuantity(value)) : item,
      ),
    );
  };

  const removeAddon = (lineId: string) => {
    setSelectedAddons((current) => current.filter((item) => item.id !== lineId));
  };

  const acceptSuggestion = () => {
    if (!suggestion) {
      return;
    }

    addProduct(suggestion.product.id);

    if (suggestion.extraStemAddon) {
      addAddon(suggestion.extraStemAddon.id, suggestion.extraStemsNeeded);
    }
  };

  const handleReceiptChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReceiptFile(event.target.files?.[0] ?? null);
  };

  const submitOrder = handleSubmit(async (values) => {
    const parsed = orderFormSchema.safeParse({
      ...values,
      products: selectedProducts,
      addons: selectedAddons,
      discountPercent: Number(values.discountPercent),
      deliveryFee: Number(values.deliveryFee),
      downpaymentPercent: Number(values.downpaymentPercent),
    });

    if (!parsed.success) {
      setValidationSummary(parsed.error.issues[0]?.message ?? 'Please review the order.');
      return;
    }

    setValidationSummary('');
    setIsSubmitting(true);

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

    if (id) {
      const result = await invoicesRepository.updateOrder(id, order);
      setIsSubmitting(false);

      if (result.error || !result.data) {
        showToast({
          variant: 'error',
          title: 'Order was not saved',
          description: result.error?.message,
        });
        return;
      }

      showToast({ variant: 'success', title: `${result.data.invoice_number} updated` });
      navigate(`/orders/${id}/preview`);
      return;
    }

    const isDigitalPayment = parsed.data.paymentMethod !== 'cash';
    let receiptPath: string | null = null;

    if (isDigitalPayment && receiptFile && pricing.downpaymentAmount > 0) {
      const upload = await uploadReceipt(receiptFile, 'downpayments');

      if (upload.error) {
        setIsSubmitting(false);
        showToast({
          variant: 'error',
          title: 'Receipt upload failed',
          description: upload.error.message,
        });
        return;
      }

      receiptPath = upload.data.path;
    }

    const result = await invoicesRepository.createOrder({
      ...order,
      payment: {
        downpayment_percent: parsed.data.downpaymentPercent,
        payment_method: parsed.data.paymentMethod,
        reference_number: isDigitalPayment ? values.referenceNumber.trim() || null : null,
        receipt_path: receiptPath,
      },
    });

    if (result.error || !result.data) {
      if (receiptPath) {
        await removeFile('receipts', receiptPath);
      }

      setIsSubmitting(false);
      showToast({
        variant: 'error',
        title: 'Order was not saved',
        description: result.error?.message,
      });
      return;
    }

    setIsSubmitting(false);
    showToast({
      variant: 'success',
      title: `Invoice ${result.data.invoice_number} created`,
    });
    navigate(`/orders/${result.data.id}/preview`);
  });

  if (isLoadingOrder) {
    return <LoadingScreen text="Loading order..." />;
  }

  if (orderLoadError) {
    return (
      <CrudPageContainer
        title="Order not found"
        subtitle={orderLoadError}
        primaryAction={
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        }
      />
    );
  }

  const submitLabel = isEditing ? 'Save Changes' : 'Create Invoice';
  const balanceAfterEdit = Math.max(0, roundCurrency(pricing.totalAmount - paidSoFar));

  return (
    <CrudPageContainer
      title={existingOrder ? `Edit ${existingOrder.invoice.invoice_number}` : 'New Order'}
      subtitle={
        isEditing
          ? 'Changes update this invoice. Recorded payments are kept.'
          : 'An invoice number is assigned when you save.'
      }
      primaryAction={
        <Button onClick={submitOrder} isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      }
      tableSlot={
        <div className="space-y-6">
          {validationSummary ? (
            <Alert
              variant="error"
              title="Check the order"
              description={validationSummary}
            />
          ) : null}
          <Card variant="elevated">
            <CardBody className="space-y-4">
              <SectionHeader title="1. Customer" showDivider={false} />
              <Select
                label="Existing Customer"
                value={watched.customerId}
                onChange={(event) => selectCustomer(event.target.value)}
                options={[
                  { label: 'Walk-in / new customer', value: '' },
                  ...customers.map((customer) => ({
                    label: `${customer.full_name} - ${customer.phone_number}`,
                    value: customer.id,
                  })),
                ]}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Customer Name" required {...register('customerName')} />
                <Input label="Phone" required {...register('phoneNumber')} />
                <Input
                  label="Delivery Date"
                  required
                  type="date"
                  {...register('deliveryDate')}
                />
                <Input
                  label="Delivery Address"
                  required
                  {...register('deliveryAddress')}
                />
              </div>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="space-y-4">
              <SectionHeader title="2. Bouquets" showDivider={false} />
              <Input
                label="Requested Stems"
                type="number"
                min={0}
                {...register('requestedStems', { valueAsNumber: true })}
              />
              {suggestion ? (
                <Alert
                  variant="info"
                  title="Stem suggestion"
                  description={`${suggestion.requestedStems} stems can use ${suggestion.product.product_name}${suggestion.extraStemAddon ? ` + ${suggestion.extraStemsNeeded} ${suggestion.extraStemAddon.addon_name}` : ''}.`}
                  actions={
                    <Button size="sm" onClick={acceptSuggestion}>
                      Use Suggestion
                    </Button>
                  }
                />
              ) : null}
              <Select
                label="Add Bouquet"
                value=""
                onChange={(event) => addProduct(event.target.value)}
                options={[
                  { label: 'Select bouquet', value: '' },
                  ...availableProducts.map((product) => ({
                    label: `${product.product_name} - ${formatOrderCurrency(product.base_price)}`,
                    value: product.id,
                  })),
                ]}
              />
              {selectedProducts.length === 0 ? (
                <p className="text-sm text-muted">No bouquets added yet.</p>
              ) : null}
              <div className="grid gap-3">
                {selectedProducts.map((item) => {
                  const product = products.find(
                    (productItem) => productItem.id === item.productId,
                  );
                  const selectedValue = item.isCustomColor
                    ? customColorValue
                    : (item.colorId ?? '');
                  const colorOptions = (product?.colors ?? [])
                    .filter(
                      (color) =>
                        color.availability === 'available' || color.id === item.colorId,
                    )
                    .map((color) => ({ label: color.color_name, value: color.id }));

                  if (
                    item.colorId &&
                    !colorOptions.some((o) => o.value === item.colorId)
                  ) {
                    colorOptions.push({ label: item.colorName, value: item.colorId });
                  }

                  return (
                    <div
                      key={item.id}
                      className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_8rem_auto]"
                    >
                      <div>
                        <p className="font-semibold text-text">{item.productName}</p>
                        <p className="text-sm text-muted">
                          {formatOrderCurrency(item.unitPrice)} each ·{' '}
                          {formatOrderCurrency(item.totalPrice)}
                        </p>
                      </div>
                      <Input
                        label="Qty"
                        type="number"
                        min={1}
                        step={1}
                        value={item.quantity}
                        onChange={(event) =>
                          updateProductQuantity(item.id, event.target.value)
                        }
                      />
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Remove ${item.productName}`}
                          leftIcon={<Trash2 className="size-4" />}
                          onClick={() => removeProduct(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-3 md:col-span-3 md:grid-cols-2">
                        <Select
                          label="Bouquet Color"
                          required
                          value={selectedValue}
                          onChange={(event) =>
                            updateProductColor(item.id, event.target.value)
                          }
                          options={[
                            { label: 'Select bouquet color', value: '' },
                            ...colorOptions,
                            { label: 'Custom Color', value: customColorValue },
                          ]}
                        />
                        {item.isCustomColor ? (
                          <Input
                            label="Custom Color Name"
                            required
                            value={item.customColorName ?? ''}
                            onChange={(event) =>
                              updateCustomColor(item.id, event.target.value)
                            }
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="space-y-4">
              <SectionHeader title="3. Add-ons" showDivider={false} />
              <Select
                label="Add Add-on"
                value=""
                onChange={(event) => addAddon(event.target.value)}
                options={[
                  { label: 'Select add-on', value: '' },
                  ...availableAddons.map((addon) => ({
                    label: `${addon.addon_name} - ${formatOrderCurrency(addon.price)}`,
                    value: addon.id,
                  })),
                ]}
              />
              <div className="grid gap-3">
                {selectedAddons.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_8rem_auto]"
                  >
                    <div>
                      <p className="font-semibold text-text">{item.addonName}</p>
                      <p className="text-sm text-muted">
                        {formatOrderCurrency(item.unitPrice)} each ·{' '}
                        {formatOrderCurrency(item.totalPrice)}
                      </p>
                    </div>
                    <Input
                      label="Qty"
                      type="number"
                      min={1}
                      step={1}
                      value={item.quantity}
                      onChange={(event) =>
                        updateAddonQuantity(item.id, event.target.value)
                      }
                    />
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove ${item.addonName}`}
                        leftIcon={<Trash2 className="size-4" />}
                        onClick={() => removeAddon(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="space-y-4">
              <SectionHeader title="4. Pricing" showDivider={false} />
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  label="Discount %"
                  type="number"
                  min={0}
                  max={100}
                  {...register('discountPercent', { valueAsNumber: true })}
                />
                <Input
                  label="Delivery Fee"
                  type="number"
                  min={0}
                  step="0.01"
                  {...register('deliveryFee', { valueAsNumber: true })}
                />
                {isEditing ? null : (
                  <Input
                    label="Downpayment %"
                    type="number"
                    min={0}
                    max={100}
                    {...register('downpaymentPercent', { valueAsNumber: true })}
                  />
                )}
              </div>
              <KeyValueDisplay
                items={[
                  { label: 'Subtotal', value: formatOrderCurrency(pricing.subtotal) },
                  {
                    label: 'Discount',
                    value: formatOrderCurrency(pricing.discountAmount),
                  },
                  {
                    label: 'Delivery Fee',
                    value: formatOrderCurrency(pricing.deliveryFee),
                  },
                  { label: 'Total', value: formatOrderCurrency(pricing.totalAmount) },
                  ...(isEditing
                    ? [
                        { label: 'Paid So Far', value: formatOrderCurrency(paidSoFar) },
                        {
                          label: 'Balance Due',
                          value: formatOrderCurrency(balanceAfterEdit),
                        },
                      ]
                    : [
                        {
                          label: 'Downpayment',
                          value: formatOrderCurrency(pricing.downpaymentAmount),
                        },
                        {
                          label: 'Balance Due',
                          value: formatOrderCurrency(pricing.remainingBalance),
                        },
                      ]),
                ]}
              />
              {isEditing && paidSoFar > pricing.totalAmount ? (
                <Alert
                  variant="warning"
                  title="Customer has overpaid"
                  description={`Payments recorded (${formatOrderCurrency(paidSoFar)}) exceed the new total.`}
                />
              ) : null}
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="space-y-4">
              <SectionHeader
                title={isEditing ? '5. Status & Notes' : '5. Downpayment & Notes'}
                showDivider={false}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Order Status"
                  options={statusOptions}
                  {...register('status')}
                />
                {isEditing ? null : (
                  <>
                    <Select
                      label="Payment Method"
                      options={paymentMethodOptions}
                      {...register('paymentMethod')}
                    />
                    {watched.paymentMethod === 'cash' ? null : (
                      <>
                        <Input
                          label="Reference Number"
                          {...register('referenceNumber')}
                        />
                        <div>
                          <Input
                            label="Receipt"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleReceiptChange}
                          />
                          {receiptPreview ? (
                            <img
                              src={receiptPreview}
                              alt="Receipt preview"
                              className="mt-3 max-h-48 rounded-xl border border-border object-contain"
                            />
                          ) : null}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              {isEditing ? (
                <p className="text-sm text-muted">
                  To add or review payments, use{' '}
                  <button
                    type="button"
                    className="font-semibold text-primary-dark underline-offset-2 hover:underline"
                    onClick={() => navigate(`/payments/${id}`)}
                  >
                    Payments
                  </button>
                  .
                </p>
              ) : null}
              <TextArea
                label="Order Notes"
                maxLength={1000}
                showCharacterCount
                {...register('orderNotes')}
              />
            </CardBody>
          </Card>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={submitOrder} isLoading={isSubmitting}>
              {submitLabel}
            </Button>
          </div>

          <LoadingOverlay
            isVisible={isSubmitting || isLoading}
            message={isSubmitting ? 'Saving order...' : 'Loading catalog...'}
          />
        </div>
      }
    />
  );
}
