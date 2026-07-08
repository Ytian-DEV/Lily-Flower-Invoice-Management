import type { Addon, ProductViewModel } from '@/features/products';
import type {
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  TableRow,
} from '@/types/database';

export type Order = TableRow<'invoices'>;

export interface OrderProductItem {
  id: string;
  productId: string;
  productName: string;
  stemCount: number | null;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderAddonItem {
  id: string;
  addonId: string;
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
  product: ProductViewModel;
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
  cashReceived: number;
  referenceNumber: string;
  orderNotes: string;
  status: InvoiceStatus;
}
