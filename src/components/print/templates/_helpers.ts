// ═══════════════════════════════════════════════════════════
//  توابع و انواع مشترک قالب‌های فاکتور
// ═══════════════════════════════════════════════════════════

import type { Invoice, Contact, Product } from '../../../types/models';
import { invoiceTotal, invoiceSubtotal, invoiceDiscount, invoiceTax } from '../../../types/models';
import { roundRial } from '../../../lib/format';

export interface TemplateProps {
  invoice: Invoice;
  contact?: Contact;
  products?: Product[];
}

export interface TemplateMeta {
  key: 'classic' | 'modern' | 'thermal' | 'minimal';
  name: string;
  description: string;
  icon: string;
  bestFor: string;
}

export const TEMPLATES: TemplateMeta[] = [
  { key: 'classic', name: 'رسمی', description: 'قالب استاندارد با جدول‌های کامل', icon: '📋', bestFor: 'سازمانی، دولتی، رسمی' },
  { key: 'modern', name: 'مدرن', description: 'کارت‌های گرد، بدون خط‌کشی، آیکون', icon: '🎨', bestFor: 'استارتاپ، فروشگاه مدرن' },
  { key: 'thermal', name: 'حرارتی', description: 'تک‌ستونه، compact، برای صندوق', icon: '🧾', bestFor: 'فروشگاه، رستوران' },
  { key: 'minimal', name: 'مینیمال', description: 'فقط اطلاعات ضروری، بدون تزئین', icon: '✨', bestFor: 'فریلنسر، فاکتور ساده' },
];

export function computeTotals(invoice: Invoice) {
  const subtotal = invoiceSubtotal(invoice.items);
  const discount = invoiceDiscount(invoice.items, invoice.discountPercent);
  const afterDiscount = subtotal - discount;
  const tax = invoiceTax(invoice.items, invoice.discountPercent, invoice.taxPercent);
  const shipping = roundRial(invoice.shippingCost || 0);
  const total = invoiceTotal(
    invoice.items,
    invoice.discountPercent,
    invoice.taxPercent,
    invoice.shippingCost,
  );

  return {
    subtotal,
    discountAmount: discount,
    afterDiscount,
    taxAmount: tax,
    shipping,
    total,
    itemCount: invoice.items.length,
    totalQty: invoice.items.reduce((s, it) => s + it.quantity, 0),
  };
}

export function formatInvoiceDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function invoiceTitle(invoice: Invoice): string {
  switch (invoice.type) {
    case 'فروش': return 'فاکتور فروش';
    case 'خرید': return 'فاکتور خرید';
    case 'برگشت از فروش': return 'برگشت از فروش';
    case 'پیش‌فاکتور فروش': return 'پیش‌فاکتور فروش';
    case 'پیش‌فاکتور خرید': return 'پیش‌فاکتور خرید';
    default: return 'فاکتور';
  }
}

export function contactFullName(contact?: Contact): string {
  if (!contact) return '—';
  const parts = [contact.name, contact.lastName].filter(Boolean);
  return parts.join(' ') || contact.companyName || '—';
}

export function contactAddress(contact?: Contact): string {
  if (!contact) return '—';
  const parts = [contact.province, contact.county, contact.city, contact.address].filter(Boolean);
  return parts.join(' - ') || '—';
}
