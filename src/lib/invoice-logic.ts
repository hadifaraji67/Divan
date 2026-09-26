import type { Invoice, Payment, Product, Cheque } from '../types/models';
import { invoiceTypeEffect } from '../types/models';
import { loadData, saveData, genId } from './storage';

/**
 * وقتی فاکتور ذخیره می‌شود:
 * - موجودی کالاها بر اساس نوع فاکتور تغییر می‌کند
 *   - فروش: کاهش
 *   - خرید: افزایش
 *   - برگشت از فروش: افزایش
 *   - پیش‌فاکتورها: بدون تغییر
 */
export function applyInvoiceEffects(invoice: Invoice, payments?: Payment[], cheques?: Cheque[]) {
  const effect = invoiceTypeEffect(invoice.type);

  // فقط اگر اثر روی موجودی دارد
  if (effect !== 'none') {
    const products = loadData<Product[]>('products', []);
    const updated = products.map(p => {
      const lines = invoice.items.filter(it => it.productId === p.id);
      if (lines.length === 0) return p;
      const qtyDelta = lines.reduce((s, l) => s + l.quantity, 0);
      const newStock = effect === 'decrease'
        ? Math.max(0, p.stock - qtyDelta)
        : p.stock + qtyDelta;
      return { ...p, stock: newStock };
    });
    saveData('products', updated);
  }

  // اضافه کردن پرداخت‌ها
  if (payments && payments.length > 0) {
    const all = loadData<Payment[]>('payments', []);
    saveData('payments', [...payments, ...all]);
  }

  // اضافه کردن چک‌ها
  if (cheques && cheques.length > 0) {
    const all = loadData<Cheque[]>('cheques', []);
    saveData('cheques', [...cheques, ...all]);
  }
}

/**
 * تبدیل پیش‌فاکتور به فاکتور واقعی
 */
export function convertToFinalInvoice(invoice: Invoice): Invoice {
  let newType: Invoice['type'] = invoice.type;
  let newNumber = invoice.number;

  if (invoice.type === 'پیش‌فاکتور فروش') {
    newType = 'فروش';
    newNumber = invoice.number.replace(/^PF-?/i, 'INV-').replace(/^پیش-?/, '');
  } else if (invoice.type === 'پیش‌فاکتور خرید') {
    newType = 'خرید';
    newNumber = invoice.number.replace(/^PF-?/i, 'PUR-').replace(/^پیش-?/, '');
  }

  return {
    ...invoice,
    id: genId(),
    type: newType,
    number: newNumber,
    createdAt: new Date().toISOString(),
  };
}

/**
 * تبدیل چک به پرداخت (هنگام وصول)
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

export function paymentFromInvoice(invoice: Invoice, amount: number, type: 'نقد' | 'کارت' | 'چک'): Payment {
  return {
    id: genId(),
    invoiceId: invoice.id,
    contactId: invoice.contactId,
    contactName: invoice.contactName,
    type,
    amount,
    date: new Date().toLocaleDateString('fa-IR'),
    direction: invoice.type === 'خرید' || invoice.type === 'پیش‌فاکتور خرید' ? 'پرداخت' : 'دریافت',
    notes: `بابت ${invoice.type} ${invoice.number}`,
    createdAt: new Date().toISOString(),
  };
}

// نکته: محاسبه مانده‌حساب مشتری/تامین‌کننده در واقعیت اینجا نیست —
// نسخه‌ی زنده و استفاده‌شده در Dashboard/ContactsModule تابع
// computeContactBalance در src/lib/invoice-payment.ts است.
// دو تابع customerBalance/supplierBalance که قبلاً اینجا بودند
// در هیچ‌جای پروژه import نمی‌شدند (کد مرده) و حذف شدند تا
// دو نسخه‌ی موازی از یک منطق مالی وجود نداشته باشد.
