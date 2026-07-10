import type {
  OrderAddonItem,
  OrderProductItem,
  PricingSummary,
} from '@/features/orders/types';

export function calculatePricing(
  products: OrderProductItem[],
  addons: OrderAddonItem[],
  discountPercent: number,
  deliveryFee: number,
  downpaymentPercent: number,
): PricingSummary {
  const subtotal = [...products, ...addons].reduce(
    (total, item) => total + item.totalPrice,
    0,
  );
  const safeDiscountPercent = Math.max(0, discountPercent);
  const discountAmount = subtotal * (safeDiscountPercent / 100);
  const totalAmount = Math.max(0, subtotal - discountAmount + Math.max(0, deliveryFee));
  const downpaymentAmount = totalAmount * (Math.max(0, downpaymentPercent) / 100);

  return {
    subtotal,
    discountPercent: safeDiscountPercent,
    discountAmount,
    deliveryFee: Math.max(0, deliveryFee),
    totalAmount,
    downpaymentPercent: Math.max(0, downpaymentPercent),
    downpaymentAmount,
    remainingBalance: Math.max(0, totalAmount - downpaymentAmount),
  };
}
