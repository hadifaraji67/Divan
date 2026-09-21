/**
 * QR فاکتور — تأیید اصالت
 * payload: JSON با hash برای تشخیص دستکاری
 */

import type { Invoice } from '../types/models';
import { invoiceTotal } from '../types/models';

/* ═══════════ Hash ۶۴ بیتی (همگام) ═══════════ */

function simpleHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

/* ═══════════ Payload ═══════════ */

export interface InvoiceQRPayload {
  a: 'divan';
  t: 'inv';
  v: 1;
  i: string; // invoice id
  n: string; // number
  d: string; // date
  m: number; // amount
  h: string; // hash
}

export function computeInvoiceHash(invoice: Invoice): string {
  const total = invoiceTotal(
    invoice.items || [],
    invoice.discountPercent || 0,
    invoice.taxPercent || 0,
    invoice.shippingCost || 0
  );
  const parts = [
    invoice.id || '',
    invoice.number || '',
    invoice.date || '',
    invoice.contactId || '',
    String(Math.round(total)),
  ];
  return simpleHash(parts.join('|'));
}

export function buildInvoiceQRPayload(invoice: Invoice): InvoiceQRPayload {
  const total = invoiceTotal(
    invoice.items || [],
    invoice.discountPercent || 0,
    invoice.taxPercent || 0,
    invoice.shippingCost || 0
  );
  return {
    a: 'divan',
    t: 'inv',
    v: 1,
    i: invoice.id || '',
    n: invoice.number || '',
    d: invoice.date || '',
    m: Math.round(total),
    h: computeInvoiceHash(invoice),
  };
}

export function buildInvoiceQRText(invoice: Invoice): string {
  return JSON.stringify(buildInvoiceQRPayload(invoice));
}

export function parseInvoiceQRText(text: string): InvoiceQRPayload | null {
  try {
    const data = JSON.parse(text);
    if (data?.a !== 'divan' || data?.t !== 'inv' || data?.v !== 1) return null;
    if (!data.i || !data.h) return null;
    return data as InvoiceQRPayload;
  } catch {
    return null;
  }
}

/* ═══════════ تأیید ═══════════ */

export interface VerifyResult {
  valid: boolean;
  status: 'verified' | 'tampered' | 'not-found' | 'invalid-qr';
  message: string;
  invoice?: Invoice;
}

export function verifyInvoiceQR(
  payload: InvoiceQRPayload,
  localInvoice: Invoice | null
): VerifyResult {
  if (!localInvoice) {
    return {
      valid: false,
      status: 'not-found',
      message: 'فاکتور در سیستم پیدا نشد',
    };
  }

  const expected = computeInvoiceHash(localInvoice);
  if (expected !== payload.h) {
    return {
      valid: false,
      status: 'tampered',
      message: 'اطلاعات فاکتور تغییر کرده — احتمال دستکاری',
      invoice: localInvoice,
    };
  }

  return {
    valid: true,
    status: 'verified',
    message: 'فاکتور معتبر است',
    invoice: localInvoice,
  };
}
