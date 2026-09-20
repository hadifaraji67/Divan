import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { notify } from './toast';
import type { Invoice, Contact } from '../types/models';
import { invoiceTotal } from '../types/models';
import { formatNum } from './theme-context';

export function buildInvoiceText(invoice: Invoice, contact?: Contact, storeName?: string): string {
  const total = invoiceTotal(
    invoice.items,
    invoice.discountPercent || 0,
    invoice.taxPercent || 0,
    invoice.shippingCost || 0
  );

  const lines: string[] = [];
  lines.push(`🧾 *فاکتور ${invoice.type}*`);
  if (storeName) lines.push(`🏪 ${storeName}`);
  lines.push('');
  lines.push(`📋 شماره: ${invoice.number}`);
  lines.push(`📅 تاریخ: ${invoice.date}`);
  if (contact) lines.push(`👤 مشتری: ${contact.name}`);
  lines.push('');
  lines.push('*اقلام:*');

  invoice.items?.slice(0, 20).forEach((item, i) => {
    const qty = item.quantity || 1;
    const price = item.unitPrice || 0;
    lines.push(`${i + 1}. ${item.productName} — ${qty} × ${formatNum(price, true)}`);
  });

  if (invoice.items?.length > 20) {
    lines.push(`... و ${invoice.items.length - 20} قلم دیگر`);
  }

  lines.push('');
  lines.push(`💰 *جمع کل: ${formatNum(Math.round(total), true)} ریال*`);

  return lines.join('\n');
}

function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('98')) return digits;
  if (digits.startsWith('0')) return '98' + digits.slice(1);
  if (digits.startsWith('9') && digits.length === 10) return '98' + digits;
  return digits;
}

export async function shareInvoiceWhatsApp(text: string, phone?: string): Promise<boolean> {
  try {
    const normalized = normalizePhone(phone);
    const url = normalized
      ? `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    if (Capacitor.isNativePlatform()) {
      const w = window as any;
      if (w.Capacitor?.Plugins?.Browser?.open) {
        await w.Capacitor.Plugins.Browser.open({ url });
        return true;
      }
    }
    window.open(url, '_blank');
    return true;
  } catch (err: any) {
    notify.error('خطا در واتساپ: ' + (err?.message || ''));
    return false;
  }
}

export async function shareInvoiceSMS(text: string, phone?: string): Promise<boolean> {
  try {
    const normalized = phone ? phone.replace(/[^\d+]/g, '') : '';
    const url = normalized
      ? `sms:${normalized}?body=${encodeURIComponent(text)}`
      : `sms:?body=${encodeURIComponent(text)}`;

    window.location.href = url;
    return true;
  } catch (err: any) {
    notify.error('خطا در پیامک: ' + (err?.message || ''));
    return false;
  }
}

export async function shareInvoiceGeneric(text: string, title = 'اشتراک فاکتور'): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title, text, dialogTitle: 'اشتراک‌گذاری فاکتور' });
      return true;
    }
    if (navigator.share) {
      await navigator.share({ title, text });
      return true;
    }
    await navigator.clipboard.writeText(text);
    notify.success('متن کپی شد');
    return true;
  } catch {
    return false;
  }
}
