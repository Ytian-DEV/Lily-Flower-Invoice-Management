import { describe, expect, it } from 'vitest';

import type { OrderAddonItem, OrderProductItem } from '@/features/orders/types';
import { calculatePricing, roundCurrency } from '@/features/orders/utils/pricing';
import { getInvoicePaymentStatus } from '@/features/orders/utils/paymentStatus';

const bouquet = (unitPrice: number, quantity = 1): OrderProductItem => ({
  id: crypto.randomUUID(),
  productId: 'p',
  productName: 'Bouquet',
  stemCount: 12,
  categoryName: 'Roses',
  quantity,
  unitPrice,
  totalPrice: unitPrice * quantity,
  colorId: null,
  colorName: 'Red',
  customColorName: null,
  isCustomColor: false,
});

const addon = (unitPrice: number, quantity = 1): OrderAddonItem => ({
  id: crypto.randomUUID(),
  addonId: 'a',
  addonName: 'Extra stem',
  quantity,
  unitPrice,
  totalPrice: unitPrice * quantity,
});

describe('calculatePricing', () => {
  it('matches the totals the database computes for a real order', () => {
    // Same case as the SQL check: 2 × 1,499.50 + 3 × 80, 10% off, 150 delivery, 30% down.
    const pricing = calculatePricing([bouquet(1499.5, 2)], [addon(80, 3)], 10, 150, 30);

    expect(pricing.subtotal).toBe(3239);
    expect(pricing.discountAmount).toBe(323.9);
    expect(pricing.totalAmount).toBe(3065.1);
    expect(pricing.downpaymentAmount).toBe(919.53);
    expect(pricing.remainingBalance).toBe(2145.57);
  });

  it('clamps discount and downpayment to 0–100%', () => {
    const pricing = calculatePricing([bouquet(1000)], [], 150, -50, 120);

    expect(pricing.discountPercent).toBe(100);
    expect(pricing.deliveryFee).toBe(0);
    expect(pricing.totalAmount).toBe(0);
    expect(pricing.downpaymentPercent).toBe(100);
  });

  it('treats empty number inputs as zero', () => {
    const pricing = calculatePricing(
      [bouquet(500)],
      [],
      Number.NaN,
      Number.NaN,
      Number.NaN,
    );

    expect(pricing.totalAmount).toBe(500);
    expect(pricing.downpaymentAmount).toBe(0);
  });

  it('rounds to centavos without floating point drift', () => {
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
    expect(roundCurrency(1.005)).toBe(1.01);
  });
});

describe('getInvoicePaymentStatus', () => {
  it('derives the state from total and remaining balance', () => {
    expect(getInvoicePaymentStatus({ total_amount: 1000, remaining_balance: 1000 })).toBe(
      'unpaid',
    );
    expect(getInvoicePaymentStatus({ total_amount: 1000, remaining_balance: 400 })).toBe(
      'partially-paid',
    );
    expect(getInvoicePaymentStatus({ total_amount: 1000, remaining_balance: 0 })).toBe(
      'paid',
    );
  });
});
