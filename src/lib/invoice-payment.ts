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

// ═══════════════════════════════════════════════════════════
//  محاسبه مانده شخص و مجموع کل
// ═══════════════════════════════════════════════════════════

/**
 * محاسبه مانده یک شخص (مشتری/تأمین‌کننده/همکار)
 *
 * منطق:
 * - فروش → مشتری به ما بدهکار می‌شود (+)
 * - برگشت از فروش → بدهی مشتری کم می‌شود (−)
 * - خرید → ما به تأمین‌کننده بدهکار می‌شویم (payable +)
 * - دریافت → طلب از مشتری کم می‌شود (−)
 * - پرداخت → بدهی ما به تأمین‌کننده کم می‌شود (−)
 *
 * - پیش‌فاکتورها نادیده گرفته می‌شوند
 * - فاکتورها/پرداخت‌های void شده نادیده گرفته می‌شوند
 */
export function computeContactBalance(
  contactId: string,
  invoices: Invoice[],
  payments: Payment[],
): { receivable: number; payable: number; net: number } {
  const myInvoices = invoices.filter((i) => i.contactId === contactId && !i.void);

  // فروش‌ها → طلب از مشتری
  const salesTotal = myInvoices
    .filter((i) => i.type === 'فروش')
    .reduce(
      (s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost),
      0,
    );

  // برگشت از فروش → کاهش طلب
  const returnsTotal = myInvoices
    .filter((i) => i.type === 'برگشت از فروش')
    .reduce(
      (s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost),
      0,
    );

  // خریدها → بدهی به تأمین‌کننده
  const purchasesTotal = myInvoices
    .filter((i) => i.type === 'خرید')
    .reduce(
      (s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost),
      0,
    );

  const myPayments = payments.filter((p) => p.contactId === contactId && !p.void);

  // دریافت‌ها → کاهش طلب
  const received = myPayments
    .filter((p) => p.direction === 'دریافت')
    .reduce((s, p) => s + p.amount, 0);

  // پرداخت‌ها → کاهش بدهی
  const paid = myPayments
    .filter((p) => p.direction === 'پرداخت')
    .reduce((s, p) => s + p.amount, 0);

  const receivable = Math.max(0, salesTotal - returnsTotal - received);
  const payable = Math.max(0, purchasesTotal - paid);

  return { receivable, payable, net: receivable - payable };
}

/**
 * مجموع طلب از تمام مشتریان (برای Dashboard)
 */
export function computeTotalReceivable(invoices: Invoice[], payments: Payment[]): number {
  const salesTotal = invoices
    .filter((i) => i.type === 'فروش' && !i.void)
    .reduce(
      (s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost),
      0,
    );

  const returnsTotal = invoices
    .filter((i) => i.type === 'برگشت از فروش' && !i.void)
    .reduce(
      (s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost),
      0,
    );

  const received = payments
    .filter((p) => p.direction === 'دریافت' && !p.void)
    .reduce((s, p) => s + p.amount, 0);

  return Math.max(0, salesTotal - returnsTotal - received);
}

/**
 * مجموع بدهی به تمام تأمین‌کنندگان (برای Dashboard)
 */
export function computeTotalPayable(invoices: Invoice[], payments: Payment[]): number {
  const purchasesTotal = invoices
    .filter((i) => i.type === 'خرید' && !i.void)
    .reduce(
      (s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost),
      0,
    );

  const paid = payments
    .filter((p) => p.direction === 'پرداخت' && !p.void)
    .reduce((s, p) => s + p.amount, 0);

  return Math.max(0, purchasesTotal - paid);
}
