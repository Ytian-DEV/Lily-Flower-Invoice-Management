import type {
  OrderAddonItem,
  OrderProductItem,
  PricingSummary,
} from '@/features/orders/types';

/** Mirrors Postgres round(value, 2) so the preview matches what the database saves. */
export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculatePricing(
  products: OrderProductItem[],
  addons: OrderAddonItem[],
  discountPercent: number,
  deliveryFee: number,
  downpaymentPercent: number,
): PricingSummary {
  const subtotal = roundCurrency(
    [...products, ...addons].reduce(
      (total, item) => total + roundCurrency(item.quantity * item.unitPrice),
      0,
    ),
  );
  const safeDiscountPercent = Math.min(100, Math.max(0, discountPercent || 0));
  const safeDeliveryFee = Math.max(0, deliveryFee || 0);
  const safeDownpaymentPercent = Math.min(100, Math.max(0, downpaymentPercent || 0));
  const discountAmount = roundCurrency(subtotal * (safeDiscountPercent / 100));
  const totalAmount = Math.max(
    0,
    roundCurrency(subtotal - discountAmount + safeDeliveryFee),
  );
  const downpaymentAmount = roundCurrency(totalAmount * (safeDownpaymentPercent / 100));

  return {
    subtotal,
    discountPercent: safeDiscountPercent,
    discountAmount,
    deliveryFee: safeDeliveryFee,
    totalAmount,
    downpaymentPercent: safeDownpaymentPercent,
    downpaymentAmount,
    remainingBalance: Math.max(0, roundCurrency(totalAmount - downpaymentAmount)),
  };
}
