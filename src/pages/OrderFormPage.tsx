import { useMemo, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  KeyValueDisplay,
  LoadingOverlay,
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
} from '@/features/orders';
import type {
  OrderAddonItem,
  OrderFormValues,
  OrderProductItem,
} from '@/features/orders';
import { formatOrderCurrency } from '@/features/orders/utils/orderFormatters';
import { invoicesRepository } from '@/services/repositories/invoicesRepository';
import { uploadReceipt } from '@/services/storage';
import { orderFormSchema } from '@/validation/orders';

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
  downpaymentPercent: 30,
  paymentMethod: 'cash',
  paymentStatus: 'pending',
  cashReceived: 0,
  referenceNumber: '',
  orderNotes: '',
  status: 'pending',
};

export function OrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const { addons, customers, isLoading, products } = useOrderData();
  const [selectedProducts, setSelectedProducts] = useState<OrderProductItem[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<OrderAddonItem[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationSummary, setValidationSummary] = useState('');
  const { handleSubmit, register, setValue, watch } = useForm<OrderFormValues>({
    defaultValues,
  });

  const watched = watch();
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
  const suggestion = useMemo(
    () => getSmartStemSuggestion(Number(watched.requestedStems), products, addons),
    [addons, products, watched.requestedStems],
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
      },
    ]);
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
        totalPrice: addon.price * quantity,
      },
    ]);
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
    const file = event.target.files?.[0] ?? null;
    setReceiptFile(file);
    setReceiptPreview(file ? URL.createObjectURL(file) : '');
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
    const invoiceNumberResult = await invoicesRepository.generateInvoiceNumber();

    if (invoiceNumberResult.error) {
      setIsSubmitting(false);
      showToast({
        variant: 'error',
        title: 'Invoice number failed',
        description: invoiceNumberResult.error.message,
      });
      return;
    }

    const result = await invoicesRepository.createOrder(
      {
        invoice_number: invoiceNumberResult.invoiceNumber,
        customer_id: parsed.data.customerId,
        subtotal: pricing.subtotal,
        discount_percent: pricing.discountPercent,
        discount_amount: pricing.discountAmount,
        delivery_fee: pricing.deliveryFee,
        total_amount: pricing.totalAmount,
        downpayment_amount: pricing.downpaymentAmount,
        remaining_balance: pricing.remainingBalance,
        status: values.status,
        notes: values.orderNotes,
        delivery_date: values.deliveryDate,
        delivery_address: values.deliveryAddress,
        payment_method: values.paymentMethod,
      },
      selectedProducts,
      selectedAddons,
    );

    if (result.error || !result.data) {
      setIsSubmitting(false);
      showToast({
        variant: 'error',
        title: 'Order save failed',
        description: result.error?.message,
      });
      return;
    }

    if (receiptFile && values.paymentMethod !== 'cash') {
      await uploadReceipt(receiptFile, result.data.id);
    }

    setIsSubmitting(false);
    showToast({ variant: 'success', title: 'Invoice generated' });
    navigate(`/orders/${result.data.id}/preview`);
  });

  return (
    <CrudPageContainer
      title={id ? 'Edit Order' : 'Create Order'}
      subtitle="Build an order, validate pricing, and generate an invoice record."
      primaryAction={
        <Button onClick={submitOrder} isLoading={isSubmitting}>
          Generate Invoice
        </Button>
      }
      tableSlot={
        <div className="space-y-6">
          {validationSummary ? (
            <Alert
              variant="error"
              title="Order validation"
              description={validationSummary}
            />
          ) : null}
          <Card variant="elevated">
            <CardBody className="space-y-4">
              <SectionHeader title="1. Customer" showDivider={false} />
              <Select
                label="Search Existing Customer"
                value={watched.customerId}
                onChange={(event) => selectCustomer(event.target.value)}
                options={[
                  { label: 'Select customer', value: '' },
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
                  title="Smart stem suggestion"
                  description={`${suggestion.requestedStems} stems can use ${suggestion.product.product_name}${suggestion.extraStemAddon ? ` + ${suggestion.extraStemsNeeded} ${suggestion.extraStemAddon.addon_name}` : ''}.`}
                  actions={
                    <Button size="sm" onClick={acceptSuggestion}>
                      Accept Suggestion
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
                  ...products.map((product) => ({
                    label: `${product.product_name} - ${formatOrderCurrency(product.base_price)}`,
                    value: product.id,
                  })),
                ]}
              />
              <KeyValueDisplay
                items={selectedProducts.map((item) => ({
                  label: item.productName,
                  value: `${item.quantity} x ${formatOrderCurrency(item.unitPrice)} = ${formatOrderCurrency(item.totalPrice)}`,
                }))}
              />
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
                  ...addons.map((addon) => ({
                    label: `${addon.addon_name} - ${formatOrderCurrency(addon.price)}`,
                    value: addon.id,
                  })),
                ]}
              />
              <KeyValueDisplay
                items={selectedAddons.map((item) => ({
                  label: item.addonName,
                  value: `${item.quantity} x ${formatOrderCurrency(item.unitPrice)} = ${formatOrderCurrency(item.totalPrice)}`,
                }))}
              />
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
                  {...register('deliveryFee', { valueAsNumber: true })}
                />
                <Input
                  label="Downpayment %"
                  type="number"
                  min={0}
                  max={100}
                  {...register('downpaymentPercent', { valueAsNumber: true })}
                />
              </div>
              <KeyValueDisplay
                items={[
                  { label: 'Subtotal', value: formatOrderCurrency(pricing.subtotal) },
                  {
                    label: 'Discount',
                    value: formatOrderCurrency(pricing.discountAmount),
                  },
                  {
                    label: 'Grand Total',
                    value: formatOrderCurrency(pricing.totalAmount),
                  },
                  {
                    label: 'Downpayment',
                    value: formatOrderCurrency(pricing.downpaymentAmount),
                  },
                  {
                    label: 'Remaining Balance',
                    value: formatOrderCurrency(pricing.remainingBalance),
                  },
                ]}
              />
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="space-y-4">
              <SectionHeader
                title="5. Delivery, Payment, Notes, Review"
                showDivider={false}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Order Status"
                  options={[
                    { label: 'Pending', value: 'pending' },
                    { label: 'Confirmed', value: 'confirmed' },
                    { label: 'Preparing', value: 'preparing' },
                    { label: 'Ready', value: 'ready' },
                    { label: 'Out for Delivery', value: 'out_for_delivery' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ]}
                  {...register('status')}
                />
                <Select
                  label="Payment Method"
                  options={[
                    { label: 'Cash', value: 'cash' },
                    { label: 'GCash', value: 'gcash' },
                    { label: 'Bank Transfer', value: 'bank_transfer' },
                    { label: 'MariBank', value: 'maribank' },
                  ]}
                  {...register('paymentMethod')}
                />
                {watched.paymentMethod === 'cash' ? (
                  <Input
                    label="Cash Received"
                    type="number"
                    min={0}
                    {...register('cashReceived', { valueAsNumber: true })}
                  />
                ) : (
                  <div>
                    <Input
                      label="Receipt Upload"
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
                )}
                <Input label="Reference Number" {...register('referenceNumber')} />
              </div>
              <TextArea
                label="Order Notes"
                maxLength={1000}
                showCharacterCount
                {...register('orderNotes')}
              />
              <KeyValueDisplay
                items={[
                  { label: 'Customer', value: watched.customerName || 'Not selected' },
                  { label: 'Products', value: selectedProducts.length },
                  { label: 'Add-ons', value: selectedAddons.length },
                  { label: 'Payment', value: watched.paymentMethod },
                  { label: 'Status', value: watched.status },
                ]}
              />
            </CardBody>
          </Card>
          <LoadingOverlay
            isVisible={isSubmitting || isLoading}
            message="Saving order..."
          />
        </div>
      }
    />
  );
}
