import type { Account, JournalEntry, JournalLine } from '../types/accounting';
import type { Invoice, Payment } from '../types/models';
import { invoiceTotal, roundRial } from '../types/models';

/**
 * حساب‌های پیش‌فرض (استاندارد ایران)
 */
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: '101', code: '101', name: 'موجودی نقد و بانک', type: 'ASSET', isSystem: true },
  { id: '10101', code: '10101', name: 'صندوق', type: 'ASSET', parentId: '101', isSystem: true },
  { id: '10102', code: '10102', name: 'بانک‌ها', type: 'ASSET', parentId: '101', isSystem: true },
  { id: '102', code: '102', name: 'حساب‌های اسناد دریافتنی (مشتریان)', type: 'ASSET', isSystem: true },
  { id: '103', code: '103', name: 'موجودی کالا (انبار)', type: 'ASSET', isSystem: true },
  { id: '201', code: '201', name: 'حساب‌های اسناد پرداختنی (تامین‌کنندگان)', type: 'LIABILITY', isSystem: true },
  { id: '401', code: '401', name: 'درآمد حاصل از فروش', type: 'REVENUE', isSystem: true },
  { id: '501', code: '501', name: 'بهای تمام شده کالای فروش رفته', type: 'EXPENSE', isSystem: true },
  { id: '502', code: '502', name: 'هزینه‌های عملیاتی و اداری', type: 'EXPENSE', isSystem: true },
  { id: '601', code: '601', name: 'مالیات و عوارض پرداختنی', type: 'LIABILITY', isSystem: true },
  { id: '701', code: '701', name: 'سرمایه', type: 'EQUITY', isSystem: true },
];

/**
 * چک کردن متوازن بودن سند (بدهکار = بستانکار)
 */
export function isJournalEntryBalanced(lines: JournalLine[]): boolean {
  const debit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const credit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  return Math.abs(debit - credit) < 1;
}

/**
 * ساخت خودکار سند حسابداری از فاکتور
 * - فروش: بدهکار مشتری، بستانکار فروش (+مالیات)
 * - خرید: بدهکار موجودی کالا، بستانکار تامین‌کننده
 * - برگشت از فروش: برعکس فروش
 */
export function createInvoiceJournalEntry(
  invoice: Invoice,
  entryNumber: number,
): JournalEntry {
  const total = invoiceTotal(invoice.items, invoice.discountPercent, invoice.taxPercent, invoice.shippingCost);
  const taxAmount = roundRial(invoice.items.reduce((s, it) => {
    const lineTotal = roundRial(it.quantity * it.unitPrice);
    const discountAmt = roundRial((lineTotal * it.discountPercent) / 100);
    const afterDiscount = roundRial(lineTotal - discountAmt);
    return s + roundRial((afterDiscount * it.taxPercent) / 100);
  }, 0));
  const netAmount = roundRial(total - taxAmount);

  const lines: JournalLine[] = [];
  let entryDescription = '';

  if (invoice.type === 'فروش') {
    entryDescription = `فاکتور فروش ${invoice.number} به ${invoice.contactName}`;
    // بدهکار: حساب‌های دریافتنی (مشتری)
    lines.push({
      id: '1',
      accountId: '102',
      description: `طلب از ${invoice.contactName}`,
      debit: total,
      credit: 0,
    });
    // بستانکار: درآمد فروش
    lines.push({
      id: '2',
      accountId: '401',
      description: 'درآمد فروش',
      debit: 0,
      credit: netAmount,
    });
    // بستانکار: مالیات (اگر > 0)
    if (taxAmount > 0) {
      lines.push({
        id: '3',
        accountId: '601',
        description: 'مالیات و عوارض فروش',
        debit: 0,
        credit: taxAmount,
      });
    }
  } else if (invoice.type === 'خرید') {
    entryDescription = `فاکتور خرید ${invoice.number} از ${invoice.contactName}`;
    // بدهکار: موجودی کالا
    lines.push({
      id: '1',
      accountId: '103',
      description: 'خرید کالا',
      debit: netAmount,
      credit: 0,
    });
    // بدهکار: مالیات (اگر قابل اعتبار باشد)
    if (taxAmount > 0) {
      lines.push({
        id: '2',
        accountId: '601',
        description: 'مالیات خرید',
        debit: taxAmount,
        credit: 0,
      });
    }
    // بستانکار: حساب‌های پرداختنی
    lines.push({
      id: '3',
      accountId: '201',
      description: `بدهی به ${invoice.contactName}`,
      debit: 0,
      credit: total,
    });
  } else if (invoice.type === 'برگشت از فروش') {
    entryDescription = `برگشت از فروش ${invoice.number} از ${invoice.contactName}`;
    // برعکس فروش
    lines.push({
      id: '1',
      accountId: '401',
      description: 'برگشت از فروش',
      debit: netAmount,
      credit: 0,
    });
    if (taxAmount > 0) {
      lines.push({
        id: '2',
        accountId: '601',
        description: 'برگشت مالیات',
        debit: taxAmount,
        credit: 0,
      });
    }
    lines.push({
      id: '3',
      accountId: '102',
      description: `کاهش طلب از ${invoice.contactName}`,
      debit: 0,
      credit: total,
    });
  } else {
    // پیش‌فاکتورها سند نمی‌سازند
    return {
      id: '',
      entryNumber: 0,
      date: invoice.date,
      description: '',
      lines: [],
      referenceType: 'INVOICE',
      referenceId: invoice.id,
      createdAt: new Date().toISOString(),
    } as any;
  }

  return {
    id: `je-${invoice.id}`,
    entryNumber,
    date: invoice.date,
    description: entryDescription,
    lines,
    referenceType: 'INVOICE',
    referenceId: invoice.id,
    createdAt: new Date().toISOString(),
  } as JournalEntry;
}

/**
 * ساخت سند از پرداخت
 * - دریافت: بدهکار صندوق، بستانکار حساب‌های دریافتنی
 * - پرداخت: بدهکار حساب‌های پرداختنی، بستانکار صندوق
 */
export function createPaymentJournalEntry(
  payment: Payment,
  entryNumber: number,
): JournalEntry {
  const lines: JournalLine[] = [];
  const description = payment.direction === 'دریافت'
    ? `دریافت از ${payment.contactName} (${payment.type})`
    : `پرداخت به ${payment.contactName} (${payment.type})`;

  if (payment.direction === 'دریافت') {
    lines.push({
      id: '1',
      accountId: '10101', // صندوق
      description: 'دریافت نقدی',
      debit: payment.amount,
      credit: 0,
    });
    lines.push({
      id: '2',
      accountId: '102', // حساب‌های دریافتنی
      description: `کاهش طلب از ${payment.contactName}`,
      debit: 0,
      credit: payment.amount,
    });
  } else {
    lines.push({
      id: '1',
      accountId: '201', // حساب‌های پرداختنی
      description: `کاهش بدهی به ${payment.contactName}`,
      debit: payment.amount,
      credit: 0,
    });
    lines.push({
      id: '2',
      accountId: '10101', // صندوق
      description: 'پرداخت نقدی',
      debit: 0,
      credit: payment.amount,
    });
  }

  return {
    id: `je-${payment.id}`,
    entryNumber,
    date: payment.date,
    description,
    lines,
    referenceType: 'PAYMENT',
    referenceId: payment.id,
    createdAt: new Date().toISOString(),
  } as JournalEntry;
}

/**
 * محاسبه مانده حساب از اسناد
 */
export function calculateAccountBalance(entries: JournalEntry[], accountId: string) {
  let debit = 0;
  let credit = 0;
  for (const entry of entries) {
    if (entry.void) continue;
    for (const line of entry.lines) {
      if (line.accountId === accountId) {
        debit += Number(line.debit) || 0;
        credit += Number(line.credit) || 0;
      }
    }
  }
  return { debit, credit, balance: debit - credit };
}
