import type { Invoice, Payment, Cheque, Product, Contact } from '../types/models';
import { invoiceTotal } from '../types/models';
import { loadData } from './storage';

export type NotificationType = 'cheque-due' | 'cheque-overdue' | 'low-stock' | 'debtor' | 'invoice-due' | 'no-payment';

export interface AppNotification {
  id: string;
  type: NotificationType;
  severity: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  description: string;
  amount?: number;
  entityId?: string;
  entityType?: 'cheque' | 'product' | 'contact' | 'invoice';
  action?: { label: string; view: string };
}

const toEn = (s: string) => String(s).replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

function parseJalali(s: string): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const clean = toEn(s).replace(/[^\d/]/g, '');
  const parts = clean.split('/');
  if (parts.length < 3) return null;
  return { y: Number(parts[0]), m: Number(parts[1]), d: Number(parts[2]) };
}

function todayJalali() {
  const now = new Date();
  // تخمین تقریبی — برای دقت بیشتر از jalali.ts استفاده می‌کنیم
  const y = now.getFullYear() - 621;
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return { y, m, d };
}

function daysDiff(target: { y: number; m: number; d: number }): number {
  const t = todayJalali();
  // تفاضل تخمینی بر اساس ماه‌های ۳۰/۳۱ روزه
  const daysPerYear = 365.25;
  const daysOf = (x: { y: number; m: number; d: number }) =>
    x.y * daysPerYear + x.m * 30.44 + x.d;
  return Math.round(daysOf(target) - daysOf(t));
}

export function getNotifications(): AppNotification[] {
  const notifications: AppNotification[] = [];
  const cheques = loadData<Cheque[]>('cheques', []).filter(c => !c.void).filter(c => !c.void);
  const products = loadData<Product[]>('products', []);
  const contacts = loadData<Contact[]>('contacts', []);
  const invoices = loadData<Invoice[]>('invoices', []).filter(i => !i.void).filter(i => !i.void);
  const payments = loadData<Payment[]>('payments', []).filter(p => !p.void).filter(p => !p.void);

  // ۱. چک‌های نزدیک سررسید (۷ روز)
  cheques.filter(c => c.status === 'در جریان').forEach(c => {
    const due = parseJalali(c.dueDate);
    if (!due) return;
    const days = daysDiff(due);
    if (days < 0) {
      notifications.push({
        id: `cheque-overdue-${c.id}`,
        type: 'cheque-overdue',
        severity: 'danger',
        title: `چک ${c.direction === 'دریافتی' ? 'دریافتی' : 'پرداختی'} سررسید گذشته`,
        description: `${c.contactName} — چک ${c.chequeNumber} — سررسید ${c.dueDate} (${Math.abs(days)} روز گذشته)`,
        amount: c.amount,
        entityId: c.id,
        entityType: 'cheque',
        action: { label: 'مشاهده چک‌ها', view: 'cheques' },
      });
    } else if (days <= 7) {
      notifications.push({
        id: `cheque-due-${c.id}`,
        type: 'cheque-due',
        severity: days <= 2 ? 'warning' : 'info',
        title: `چک ${c.direction === 'دریافتی' ? 'دریافتی' : 'پرداختی'} نزدیک سررسید`,
        description: `${c.contactName} — ${days === 0 ? 'امروز' : `${days} روز دیگر`} — مبلغ`,
        amount: c.amount,
        entityId: c.id,
        entityType: 'cheque',
        action: { label: 'مشاهده چک‌ها', view: 'cheques' },
      });
    }
  });

  // ۲. کالاهای زیر حد موجودی
  products.filter(p => p.isActive && p.stock <= p.minStock).forEach(p => {
    notifications.push({
      id: `low-stock-${p.id}`,
      type: 'low-stock',
      severity: p.stock === 0 ? 'danger' : 'warning',
      title: p.stock === 0 ? `کالا تمام شد: ${p.name}` : `موجودی کم: ${p.name}`,
      description: `موجودی فعلی: ${p.stock} ${p.unit} — حد هشدار: ${p.minStock}`,
      entityId: p.id,
      entityType: 'product',
      action: { label: 'مدیریت انبار', view: 'inventory' },
    });
  });

  // ۳. مشتریان بدهکار
  contacts.filter(c => c.roles.includes('مشتری')).forEach(c => {
    const sales = invoices.filter(i => i.contactId === c.id && i.type === 'فروش');
    const total = sales.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
    const paid = payments.filter(p => p.contactId === c.id && p.direction === 'دریافت').reduce((s, p) => s + p.amount, 0);
    const balance = total - paid;
    if (balance > 0 && c.creditLimit > 0 && balance > c.creditLimit * 0.8) {
      notifications.push({
        id: `debtor-${c.id}`,
        type: 'debtor',
        severity: 'warning',
        title: `مشتری بدهکار نزدیک سقف اعتبار`,
        description: `${c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`} — مانده بدهی به سقف اعتبار نزدیک است`,
        amount: balance,
        entityId: c.id,
        entityType: 'contact',
        action: { label: 'مشاهده مشتری', view: 'contacts' },
      });
    }
  });

  return notifications.sort((a, b) => {
    const sevOrder = { danger: 0, warning: 1, info: 2, success: 3 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });
}

export function getNotificationCount(): number {
  return getNotifications().length;
}
