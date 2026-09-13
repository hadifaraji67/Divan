import type { Invoice, Payment, Product, Contact, Cheque } from '../types/models';
import { invoiceTotal } from '../types/models';
import { loadData, saveData, genId } from './storage';

/**
 * وقتی فاکتور ذخیره می‌شود:
 * - موجودی کالاها کم/زیاد می‌شود
 * - اگر پرداخت نقدی همراه فاکتور ثبت شده، به payments اضافه می‌شود
 * - اگر چک همراه فاکتور ثبت شده، به cheques اضافه می‌شود
 */
export function applyInvoiceEffects(invoice: Invoice, payments?: Payment[], cheques?: Cheque[]) {
  // ۱. کسر/افزایش موجودی
  const products = loadData<Product[]>('products', []);
  const updated = products.map(p => {
    const lines = invoice.items.filter(it => it.productId === p.id);
    if (lines.length === 0) return p;
    const qtyDelta = lines.reduce((s, l) => s + l.quantity, 0);
    let newStock = p.stock;
    if (invoice.type === 'فروش' || invoice.type === 'پیش‌فاکتور') newStock -= qtyDelta;
    else if (invoice.type === 'خرید') newStock += qtyDelta;
    else if (invoice.type === 'برگشت از فروش') newStock += qtyDelta;
    return { ...p, stock: Math.max(0, newStock) };
  });
  saveData('products', updated);

  // ۲. اضافه کردن پرداخت‌ها
  if (payments && payments.length > 0) {
    const all = loadData<Payment[]>('payments', []);
    saveData('payments', [...payments, ...all]);
  }

  // ۳. اضافه کردن چک‌ها
  if (cheques && cheques.length > 0) {
    const all = loadData<Cheque[]>('cheques', []);
    saveData('cheques', [...cheques, ...all]);
  }
}

/**
 * وقتی پرداخت ثبت می‌شود:
 * - مانده فاکتور به‌روزرسانی می‌شود (اگر invoiceId داده شده)
 */
export function attachPaymentToInvoice(payment: Payment) {
  if (!payment.invoiceId) return;
  const invoices = loadData<Invoice[]>('invoices', []);
  const updated = invoices.map(inv => {
    if (inv.id !== payment.invoiceId) return inv;
    return inv;
  });
  saveData('invoices', updated);
}

/**
 * وقتی چک وصول می‌شود:
 * - یک پرداخت خودکار ثبت می‌شود
 */
export function chequeToPayment(cheque: Cheque): Payment {
  return {
    id: genId(),
    contactId: cheque.contactId,
    contactName: cheque.contactName,
    type: 'چک',
    amount: cheque.amount,
    date: new Date().toLocaleDateString('fa-IR'),
    refCode: cheque.chequeNumber,
    bankName: cheque.bankName,
    chequeNumber: cheque.chequeNumber,
    chequeDueDate: cheque.dueDate,
    direction: cheque.direction === 'دریافتی' ? 'دریافت' : 'پرداخت',
    notes: `از چک ${cheque.chequeNumber}`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * ساخت پرداخت از یک فاکتور (برای ثبت سریع)
 */
export function paymentFromInvoice(invoice: Invoice, amount: number, type: 'نقد' | 'کارت' | 'چک'): Payment {
  return {
    id: genId(),
    invoiceId: invoice.id,
    contactId: invoice.contactId,
    contactName: invoice.contactName,
    type,
    amount,
    date: new Date().toLocaleDateString('fa-IR'),
    direction: invoice.type === 'خرید' ? 'پرداخت' : 'دریافت',
    notes: `بابت فاکتور ${invoice.number}`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * مانده حساب هر مشتری
 */
export function customerBalance(contactId: string): { total: number; paid: number; balance: number } {
  const invoices = loadData<Invoice[]>('invoices', []).filter(i => i.contactId === contactId);
  const payments = loadData<Payment[]>('payments', []).filter(p => p.contactId === contactId && p.direction === 'دریافت');

  const total = invoices
    .filter(i => i.type === 'فروش' || i.type === 'پیش‌فاکتور')
    .reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);

  const paid = payments.reduce((s, p) => s + p.amount, 0);

  return { total, paid, balance: total - paid };
}

/**
 * محاسبه سررسید چک‌های نزدیک (۷ روز آینده)
 */
export function chequesDueSoon(days = 7): Cheque[] {
  const cheques = loadData<Cheque[]>('cheques', []).filter(c => c.status === 'در جریان');
  return cheques;
}

