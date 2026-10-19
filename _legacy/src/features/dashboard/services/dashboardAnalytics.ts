import { supabase } from '@/lib/supabase';
import type { InvoiceStatus, TableRow } from '@/types/database';

export interface DashboardStat {
  title: string;
  value: string;
  description: string;
}

export interface DashboardListItem {
  id: string;
  label: string;
  value: string;
}

export interface DashboardChartItem {
  label: string;
  value: number;
  displayValue?: string;
}

export interface DashboardInvoiceRow {
  id: string;
  invoiceNumber: string;
  customer: string;
  status: InvoiceStatus;
  balance: string;
  date: string;
}

export interface DashboardPaymentRow {
  id: string;
  label: string;
  value: string;
}

export interface DashboardAnalytics {
  stats: DashboardStat[];
  revenueThisMonth: DashboardChartItem[];
  ordersByStatus: DashboardChartItem[];
  topSellingProducts: DashboardChartItem[];
  monthlySalesTrend: DashboardChartItem[];
  recentOrders: DashboardInvoiceRow[];
  recentPayments: DashboardPaymentRow[];
  pendingPayments: DashboardListItem[];
  upcomingDeliveries: DashboardListItem[];
}

type Invoice = TableRow<'invoices'> & {
  customers?: { full_name: string | null } | null;
};

type Payment = TableRow<'payments'> & {
  invoices?: {
    invoice_number: string | null;
    customers?: { full_name: string | null } | null;
  } | null;
};

type InvoiceItem = TableRow<'invoice_items'> & {
  products?: { product_name: string | null } | null;
};

type InvoiceAddon = TableRow<'invoice_addons'> & {
  addons?: { addon_name: string | null } | null;
};

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const numberFormatter = new Intl.NumberFormat('en-PH');

const statusLabels: Record<InvoiceStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function toCurrency(value: number) {
  return currencyFormatter.format(value || 0);
}

function startOfLocalDay(date = new Date()) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatShortDate(value: string | null) {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-PH', { month: 'short' }).format(date);
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0);
}

function topName<T>(
  items: T[],
  getName: (item: T) => string | null | undefined,
  getQuantity: (item: T) => number,
) {
  const totals = new Map<string, number>();

  items.forEach((item) => {
    const name = getName(item);

    if (!name) {
      return;
    }

    totals.set(name, (totals.get(name) ?? 0) + getQuantity(item));
  });

  return [...totals.entries()].sort((a, b) => b[1] - a[1])[0];
}

function makeMonthBuckets(monthCount = 6) {
  const now = new Date();

  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (monthCount - 1 - index),
      1,
    );

    return {
      key: monthKey(date),
      label: monthLabel(date),
      value: 0,
    };
  });
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const today = startOfLocalDay();
  const tomorrow = addDays(today, 1);
  const currentMonth = startOfMonth(today);
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const nextWeek = addDays(today, 7);

  const [
    invoicesResult,
    paymentsResult,
    productsResult,
    customersResult,
    invoiceItemsResult,
    invoiceAddonsResult,
  ] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, customers(full_name)')
      .order('created_at', { ascending: false })
      .limit(250),
    supabase
      .from('payments')
      .select('*, invoices(invoice_number, customers(full_name))')
      .order('payment_date', { ascending: false })
      .limit(150),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase
      .from('invoice_items')
      .select('*, products(product_name)')
      .order('created_at', { ascending: false })
      .limit(250),
    supabase.from('invoice_addons').select('*, addons(addon_name)').limit(250),
  ]);

  const error =
    invoicesResult.error ??
    paymentsResult.error ??
    productsResult.error ??
    customersResult.error ??
    invoiceItemsResult.error ??
    invoiceAddonsResult.error;

  if (error) {
    throw error;
  }

  const invoices = (invoicesResult.data ?? []) as Invoice[];
  const payments = (paymentsResult.data ?? []) as Payment[];
  const invoiceItems = (invoiceItemsResult.data ?? []) as InvoiceItem[];
  const invoiceAddons = (invoiceAddonsResult.data ?? []) as InvoiceAddon[];

  const todayInvoices = invoices.filter((invoice) => {
    const createdAt = new Date(invoice.created_at);
    return createdAt >= today && createdAt < tomorrow;
  });
  const todayPayments = payments.filter((payment) => {
    const paidAt = new Date(payment.payment_date);
    return paidAt >= today && paidAt < tomorrow;
  });
  const thisMonthPayments = payments.filter(
    (payment) => new Date(payment.payment_date) >= currentMonth,
  );
  const activeInvoices = invoices.filter((invoice) => invoice.status !== 'cancelled');
  const completedOrders = invoices.filter((invoice) => invoice.status === 'completed');
  const pendingOrders = invoices.filter((invoice) =>
    ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(
      invoice.status,
    ),
  );
  const cancelledOrders = invoices.filter((invoice) => invoice.status === 'cancelled');
  const pendingPaymentInvoices = activeInvoices.filter(
    (invoice) => invoice.remaining_balance > 0,
  );
  const upcoming = activeInvoices
    .filter((invoice) => {
      if (!invoice.delivery_date) {
        return false;
      }

      const deliveryDate = new Date(invoice.delivery_date);
      return deliveryDate >= today && deliveryDate <= nextWeek;
    })
    .sort((a, b) => {
      return (
        new Date(a.delivery_date ?? '').getTime() -
        new Date(b.delivery_date ?? '').getTime()
      );
    });

  const revenueToday = sumBy(todayPayments, (payment) => payment.amount);
  const revenueThisMonth = sumBy(thisMonthPayments, (payment) => payment.amount);
  const outstandingBalance = sumBy(
    pendingPaymentInvoices,
    (invoice) => invoice.remaining_balance,
  );
  const averageOrderValue =
    activeInvoices.length > 0
      ? sumBy(activeInvoices, (invoice) => invoice.total_amount) / activeInvoices.length
      : 0;
  const topBouquet = topName(
    invoiceItems,
    (item) => item.products?.product_name,
    (item) => item.quantity,
  );
  const topAddon = topName(
    invoiceAddons,
    (item) => item.addons?.addon_name,
    (item) => item.quantity,
  );

  const stats: DashboardStat[] = [
    {
      title: "Today's Orders",
      value: numberFormatter.format(todayInvoices.length),
      description: 'Invoices created today',
    },
    {
      title: 'Pending Orders',
      value: numberFormatter.format(pendingOrders.length),
      description: 'Awaiting completion',
    },
    {
      title: 'Completed Orders',
      value: numberFormatter.format(completedOrders.length),
      description: 'Fulfilled invoices',
    },
    {
      title: 'Revenue Today',
      value: toCurrency(revenueToday),
      description: 'Payments received today',
    },
    {
      title: 'Outstanding Balance',
      value: toCurrency(outstandingBalance),
      description: 'Unpaid active invoice balance',
    },
    {
      title: 'Customers',
      value: numberFormatter.format(customersResult.count ?? 0),
      description: 'Customer records',
    },
    {
      title: 'Products',
      value: numberFormatter.format(productsResult.count ?? 0),
      description: 'Catalog products',
    },
    {
      title: 'Invoices',
      value: numberFormatter.format(invoices.length),
      description: 'Recent invoice records loaded',
    },
    {
      title: 'Payments Received',
      value: toCurrency(sumBy(payments, (payment) => payment.amount)),
      description: 'Recent payment total',
    },
    {
      title: 'Monthly Revenue',
      value: toCurrency(revenueThisMonth),
      description: 'Payments this month',
    },
    {
      title: 'Average Order Value',
      value: toCurrency(averageOrderValue),
      description: 'Across active loaded invoices',
    },
    {
      title: 'Most Ordered Bouquet',
      value: topBouquet?.[0] ?? 'None yet',
      description: topBouquet
        ? `${numberFormatter.format(topBouquet[1])} stems ordered`
        : 'No product sales yet',
    },
    {
      title: 'Most Popular Add-on',
      value: topAddon?.[0] ?? 'None yet',
      description: topAddon
        ? `${numberFormatter.format(topAddon[1])} add-ons ordered`
        : 'No add-on sales yet',
    },
    {
      title: 'Upcoming Deliveries',
      value: numberFormatter.format(upcoming.length),
      description: 'Scheduled in the next 7 days',
    },
    {
      title: 'Pending Payments',
      value: numberFormatter.format(pendingPaymentInvoices.length),
      description: 'Invoices with remaining balance',
    },
    {
      title: 'Cancelled Orders',
      value: numberFormatter.format(cancelledOrders.length),
      description: 'Cancelled invoices',
    },
  ];

  const statusTotals = new Map<InvoiceStatus, number>();
  invoices.forEach((invoice) => {
    statusTotals.set(invoice.status, (statusTotals.get(invoice.status) ?? 0) + 1);
  });

  const productTotals = new Map<string, number>();
  invoiceItems.forEach((item) => {
    const name = item.products?.product_name ?? 'Unnamed product';
    productTotals.set(name, (productTotals.get(name) ?? 0) + item.quantity);
  });

  const monthBuckets = makeMonthBuckets();
  const monthBucketMap = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]));
  payments
    .filter((payment) => new Date(payment.payment_date) >= sixMonthsAgo)
    .forEach((payment) => {
      const key = monthKey(new Date(payment.payment_date));
      const bucket = monthBucketMap.get(key);

      if (bucket) {
        bucket.value += payment.amount;
      }
    });

  return {
    stats,
    revenueThisMonth: thisMonthPayments.slice(0, 10).map((payment) => ({
      label: formatShortDate(payment.payment_date),
      value: payment.amount,
      displayValue: toCurrency(payment.amount),
    })),
    ordersByStatus: [...statusTotals.entries()].map(([status, value]) => ({
      label: statusLabels[status],
      value,
      displayValue: numberFormatter.format(value),
    })),
    topSellingProducts: [...productTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({
        label,
        value,
        displayValue: numberFormatter.format(value),
      })),
    monthlySalesTrend: monthBuckets.map((bucket) => ({
      label: bucket.label,
      value: bucket.value,
      displayValue: toCurrency(bucket.value),
    })),
    recentOrders: invoices.slice(0, 6).map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customer: invoice.customers?.full_name ?? 'Walk-in customer',
      status: invoice.status,
      balance: toCurrency(invoice.remaining_balance),
      date: formatShortDate(invoice.created_at),
    })),
    recentPayments: payments.slice(0, 5).map((payment) => ({
      id: payment.id,
      label: payment.invoices?.invoice_number ?? 'Payment',
      value: `${toCurrency(payment.amount)} - ${
        payment.invoices?.customers?.full_name ?? 'Customer not linked'
      }`,
    })),
    pendingPayments: pendingPaymentInvoices.slice(0, 5).map((invoice) => ({
      id: invoice.id,
      label: invoice.invoice_number,
      value: toCurrency(invoice.remaining_balance),
    })),
    upcomingDeliveries: upcoming.slice(0, 5).map((invoice) => ({
      id: invoice.id,
      label: invoice.invoice_number,
      value: formatShortDate(invoice.delivery_date),
    })),
  };
}
