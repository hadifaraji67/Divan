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
 *
 * قواعد:
 * - فقط پرداخت‌هایی که صریحاً به این فاکتور وصل شده‌اند (invoiceId) لحاظ می‌شوند
 * - پرداخت‌های بدون فاکتور در «مانده کل مشتری» حساب می‌شوند، نه در یک فاکتور خاص
 * - پیش‌فاکتورها همیشه پرداخت‌نشده در نظر گرفته می‌شوند
 */
export function getInvoicePaymentInfo(invoice: Invoice, allPayments: Payment[]): InvoicePaymentInfo {
  const total = invoiceTotal(invoice.items, invoice.discountPercent, invoice.taxPercent, invoice.shippingCost);

  // پیش‌فاکتورها: پرداخت نمی‌گیرند
  if (invoice.type === 'پیش‌فاکتور فروش' || invoice.type === 'پیش‌فاکتور خرید') {
    return { total, paid: 0, remaining: total, status: 'unpaid', payments: [] };
  }

  // فقط پرداخت‌های وصل‌شده به این فاکتور
  const payments = allPayments.filter(p => p.invoiceId === invoice.id && !p.void);
  const paid = payments.reduce((s, p) => s + p.amount, 0);

  const remaining = Math.max(0, total - paid);
  let status: InvoicePayStatus = 'unpaid';
  if (total > 0 && paid >= total) status = 'paid';
  else if (paid > 0) status = 'partial';

  return { total, paid, remaining, status, payments };
}

/**
 * مجموع پرداخت‌های بدون فاکتور یک شخص
 * (برای نمایش در دفتر معین به عنوان «در حساب جاری»)
 */
export function getUnallocatedPayments(contactId: string, allPayments: Payment[]): number {
  return allPayments
    .filter(p => p.contactId === contactId && !p.invoiceId && !p.void)
    .reduce((s, p) => s + p.amount, 0);
}

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
