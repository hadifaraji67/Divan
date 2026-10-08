import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getInvoicePaymentInfo,
  computeContactBalance,
  computeTotalPayable,
  computeTotalReceivable,
} from '../src/lib/invoice-payment.ts';

function inv(overrides) {
  return {
    id: 'i1', number: 'N1', date: '2026-01-01', contactId: 'c1', contactName: 'طرف‌حساب',
    items: [{ productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 1, unitPrice: 100000, discountPercent: 0, taxPercent: 0 }],
    shippingCost: 0, createdAt: '2026-01-01',
    ...overrides,
  };
}

function pay(overrides) {
  return { id: 'p1', contactId: 'c1', contactName: 'طرف‌حساب', type: 'نقد', amount: 0, date: '2026-01-01', direction: 'دریافت', createdAt: '2026-01-01', ...overrides };
}

// ─── رگرسیون: مرجوعی به تامین‌کننده باید از بدهی کم شود ───
// این دقیقاً همان باگی بود که در همین نشست پیدا و دو بار رفع شد
// (یک‌بار در تابع مرده‌ی invoice-logic.ts، بار دوم در این فایل که واقعاً استفاده می‌شود)

test('رگرسیون: مرجوعی به تامین‌کننده باید از بدهی (payable) کم شود', () => {
  const invoices = [
    inv({ id: 'i1', type: 'خرید' }), // بدهی: 100000
    inv({ id: 'i2', type: 'مرجوعی به تامین‌کننده', items: [{ productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 1, unitPrice: 30000, discountPercent: 0, taxPercent: 0 }] }), // کاهش: 30000
  ];
  const { payable } = computeContactBalance('c1', invoices, []);
  assert.equal(payable, 70000, 'بدهی باید ۱۰۰۰۰۰ منهای ۳۰۰۰۰ مرجوعی = ۷۰۰۰۰ شود');
});

test('رگرسیون: computeTotalPayable هم مرجوعی به تامین‌کننده را کم می‌کند', () => {
  const invoices = [
    inv({ id: 'i1', type: 'خرید', contactId: 'c1' }),
    inv({ id: 'i2', type: 'خرید', contactId: 'c2', items: [{ productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 1, unitPrice: 50000, discountPercent: 0, taxPercent: 0 }] }),
    inv({ id: 'i3', type: 'مرجوعی به تامین‌کننده', contactId: 'c1', items: [{ productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 1, unitPrice: 20000, discountPercent: 0, taxPercent: 0 }] }),
  ];
  const total = computeTotalPayable(invoices, []);
  assert.equal(total, (100000 - 20000) + 50000);
});

// ─── رگرسیون: فاکتور/پرداخت باطل‌شده نباید در مانده اثر بگذارد ───

test('رگرسیون: فاکتور باطل‌شده در مانده‌حساب لحاظ نمی‌شود', () => {
  const invoices = [inv({ id: 'i1', type: 'فروش', void: true })];
  const { receivable } = computeContactBalance('c1', invoices, []);
  assert.equal(receivable, 0);
});

test('رگرسیون: پرداخت باطل‌شده در مانده‌حساب لحاظ نمی‌شود', () => {
  const invoices = [inv({ id: 'i1', type: 'فروش' })]; // طلب: 100000
  const payments = [pay({ amount: 100000, direction: 'دریافت', void: true })];
  const { receivable } = computeContactBalance('c1', invoices, payments);
  assert.equal(receivable, 100000, 'پرداخت باطل‌شده نباید طلب را کم کند');
});

test('رگرسیون: computeTotalReceivable هم void را فیلتر می‌کند', () => {
  const invoices = [inv({ id: 'i1', type: 'فروش' }), inv({ id: 'i2', type: 'فروش', void: true, items: [{ productId: 'p1', productName: 'ک', unit: 'عدد', quantity: 1, unitPrice: 999999, discountPercent: 0, taxPercent: 0 }] })];
  assert.equal(computeTotalReceivable(invoices, []), 100000);
});

// ─── رفتار عمومی ───

test('برگشت از فروش طلب مشتری را کم می‌کند', () => {
  const invoices = [
    inv({ id: 'i1', type: 'فروش' }),
    inv({ id: 'i2', type: 'برگشت از فروش', items: [{ productId: 'p1', productName: 'ک', unit: 'عدد', quantity: 1, unitPrice: 40000, discountPercent: 0, taxPercent: 0 }] }),
  ];
  assert.equal(computeContactBalance('c1', invoices, []).receivable, 60000);
});

test('پیش‌فاکتور در هیچ مانده‌ای اثر ندارد', () => {
  const invoices = [inv({ id: 'i1', type: 'پیش‌فاکتور فروش' })];
  const { receivable, payable } = computeContactBalance('c1', invoices, []);
  assert.equal(receivable, 0);
  assert.equal(payable, 0);
});

test('مانده هیچ‌وقت منفی نمی‌شود (پرداخت بیش از طلب)', () => {
  const invoices = [inv({ id: 'i1', type: 'فروش' })]; // 100000
  const payments = [pay({ amount: 500000, direction: 'دریافت' })];
  assert.equal(computeContactBalance('c1', invoices, payments).receivable, 0);
});

test('getInvoicePaymentInfo فقط پرداخت‌های وصل‌شده به همان فاکتور را می‌شمارد', () => {
  const invoice = inv({ id: 'i1', type: 'فروش' });
  const payments = [
    pay({ id: 'p1', invoiceId: 'i1', amount: 40000 }),
    pay({ id: 'p2', invoiceId: 'other-invoice', amount: 100000 }),
  ];
  const info = getInvoicePaymentInfo(invoice, payments);
  assert.equal(info.paid, 40000);
  assert.equal(info.status, 'partial');
  assert.equal(info.remaining, 60000);
});

test('getInvoicePaymentInfo پیش‌فاکتور را همیشه پرداخت‌نشده می‌داند', () => {
  const info = getInvoicePaymentInfo(inv({ type: 'پیش‌فاکتور فروش' }), []);
  assert.equal(info.status, 'unpaid');
  assert.equal(info.paid, 0);
});
