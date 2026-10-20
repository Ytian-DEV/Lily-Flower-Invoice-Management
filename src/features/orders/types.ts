import type { Addon, Product } from '@/features/catalog/api';
import type {
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  TableRow,
} from '@/types/database';

export type Order = TableRow<'invoices'>;

export interface OrderProductItem {
  id: string;
  /** Null when the catalog product was deleted after the order was placed. */
  productId: string | null;
  productName: string;
  stemCount: number | null;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  colorId: string | null;
  colorName: string;
  customColorName: string | null;
  isCustomColor: boolean;
}

export interface OrderAddonItem {
  id: string;
  addonId: string | null;
  addonName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PricingSummary {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  downpaymentPercent: number;
  downpaymentAmount: number;
  remainingBalance: number;
}

export interface SmartStemSuggestion {
  requestedStems: number;
  product: Product;
  extraStemAddon: Addon | null;
  extraStemsNeeded: number;
}

export interface OrderFormValues {
  customerId: string;
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  deliveryDate: string;
  customerNotes: string;
  requestedStems: number;
  products: OrderProductItem[];
  addons: OrderAddonItem[];
  discountPercent: number;
  deliveryFee: number;
  downpaymentPercent: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  referenceNumber: string;
  orderNotes: string;
  status: InvoiceStatus;
}
