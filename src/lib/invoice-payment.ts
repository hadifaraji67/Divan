import type { Invoice, Payment } from '../types/models';
import { invoiceTotal } from '../types/models';

export type InvoicePayStatus = 'paid' | 'partial' | 'unpaid';

export interface InvoicePaymentInfo {
  total: number;
  paid: number;
  remaining: number;
  status: InvoicePayStatus;
  payments: Payment[];
}

/**
 * محاسبه وضعیت پرداخت فاکتور
 */
export function getInvoicePaymentInfo(invoice: Invoice, allPayments: Payment[]): InvoicePaymentInfo {
  const total = invoiceTotal(invoice.items, invoice.discountPercent, invoice.taxPercent, invoice.shippingCost);
  const isPurchase = invoice.type === 'خرید' || invoice.type === 'پیش‌فاکتور خرید';
  const direction = isPurchase ? 'پرداخت' : 'دریافت';

  // پرداخت‌های وصل به این فاکتور
  const payments = allPayments.filter(p => p.invoiceId === invoice.id);

  // اگر پرداخت مستقیم به فاکتور وصل نیست، از پرداخت‌های مشتری/تامین‌کننده استفاده کن
  const fallbackPayments = allPayments.filter(p =>
    p.contactId === invoice.contactId &&
    p.direction === direction &&
    !p.invoiceId
  );

  // محاسبه مجموع پرداخت‌ها
  const directPaid = payments.reduce((s, p) => s + p.amount, 0);

  let paid = directPaid;
  // اگر پرداخت مستقیم نبود، از پرداخت‌های بدون فاکتور به‌نسبت استفاده کن
  if (directPaid === 0 && fallbackPayments.length > 0) {
    paid = fallbackPayments.reduce((s, p) => s + p.amount, 0);
  }

  // برای پیش‌فاکتورها، وضعیت پرداخت مهم نیست
  if (invoice.type === 'پیش‌فاکتور فروش' || invoice.type === 'پیش‌فاکتور خرید') {
    return { total, paid: 0, remaining: total, status: 'unpaid', payments: [] };
  }

  const remaining = Math.max(0, total - paid);
  let status: InvoicePayStatus = 'unpaid';
  if (paid >= total && total > 0) status = 'paid';
  else if (paid > 0) status = 'partial';

  return { total, paid, remaining, status, payments };
}

/**
 * برچسب فارسی وضعیت
 */
export function payStatusLabel(status: InvoicePayStatus): string {
  return status === 'paid' ? 'پرداخت‌شده' : status === 'partial' ? 'نیمه‌پرداخت' : 'پرداخت‌نشده';
}

export function payStatusColor(status: InvoicePayStatus): string {
  return status === 'paid'
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    : status === 'partial'
      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
}

export function payStatusEmoji(status: InvoicePayStatus): string {
  return status === 'paid' ? '🟢' : status === 'partial' ? '🟡' : '🔴';
}
