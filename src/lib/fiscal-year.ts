import { loadData } from './storage';
import { invoiceTotal } from '../types/models';
import type { Invoice, Payment, Cheque } from '../types/models';

const FA_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

export function faMonth(idx: number): string {
  return FA_MONTHS[(idx - 1) % 12] || '';
}

/**
 * چک کردن اینکه یک تاریخ شمسی در بازه سال مالی هست یا نه
 * @param dateString تاریخ شمسی به فرمت ۱۴۰۵/۰۳/۱۵
 */
export function isInFiscalYear(
  dateString: string,
  startYear: number,
  startMonth: number,
  startDay: number
): boolean {
  if (!dateString) return false;
  const parts = dateString.split('/');
  if (parts.length < 3) return false;

  const toEn = (s: string) => s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const y = Number(toEn(parts[0]));
  const m = Number(toEn(parts[1]));
  const d = Number(toEn(parts[2]));

  if (y > startYear) return true;
  if (y < startYear) return false;
  if (m > startMonth) return true;
  if (m < startMonth) return false;
  return d >= startDay;
}

/**
 * بازه سال مالی به فرمت نمایشی
 */
export function fiscalYearRange(
  startYear: number,
  startMonth: number,
  startDay: number
): { from: string; to: string } {
  const endYear = startMonth === 1 ? startYear : startYear + 1;
  const endMonth = startMonth === 1 ? 12 : startMonth - 1;
  const endDay = 29; // اسفند ۲۹ یا ۳۰

  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    from: `${startYear}/${pad(startMonth)}/${pad(startDay)}`,
    to: `${endYear}/${pad(endMonth)}/${endDay}`,
  };
}

/**
 * خلاصه کامل سال مالی
 */
export function fiscalYearSummary(startYear: number, startMonth: number, startDay: number) {
  const invoices = loadData<Invoice[]>('invoices', []);
  const payments = loadData<Payment[]>('payments', []);
  const cheques = loadData<Cheque[]>('cheques', []);

  const filteredInvoices = invoices.filter(i => isInFiscalYear(i.date, startYear, startMonth, startDay));
  const filteredPayments = payments.filter(p => isInFiscalYear(p.date, startYear, startMonth, startDay));

  const sales = filteredInvoices.filter(i => i.type === 'فروش');
  const purchases = filteredInvoices.filter(i => i.type === 'خرید');

  const salesTotal = sales.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
  const purchaseTotal = purchases.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
  const received = filteredPayments.filter(p => p.direction === 'دریافت').reduce((s, p) => s + p.amount, 0);
  const paid = filteredPayments.filter(p => p.direction === 'پرداخت').reduce((s, p) => s + p.amount, 0);
  const taxTotal = sales.reduce((s, i) => s + invoiceTotal(i.items, 0, i.taxPercent, 0) * 0, 0); // placeholder

  return {
    salesTotal,
    purchaseTotal,
    received,
    paid,
    balance: received - paid,
    salesCount: sales.length,
    purchaseCount: purchases.length,
    invoices: filteredInvoices,
    payments: filteredPayments,
    cheques,
    range: fiscalYearRange(startYear, startMonth, startDay),
    monthName: faMonth(startMonth),
  };
}
