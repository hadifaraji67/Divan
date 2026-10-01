import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  invoiceSubtotal,
  invoiceDiscount,
  invoiceTax,
  invoiceTotal,
  roundRial,
  filterActive,
  filterVoided,
} from '../src/types/models.ts';

function line(quantity, unitPrice) {
  return { productId: 'p1', productName: 'کالا', unit: 'عدد', quantity, unitPrice, discountPercent: 0, taxPercent: 0 };
}

test('roundRial رند می‌کند و NaN/undefined را صفر در نظر می‌گیرد', () => {
  assert.equal(roundRial(100.4), 100);
  assert.equal(roundRial(100.5), 101);
  assert.equal(roundRial(undefined), 0);
  assert.equal(roundRial(NaN), 0);
});

test('invoiceSubtotal جمع ساده‌ی ردیف‌هاست', () => {
  const items = [line(2, 10000), line(3, 5000)];
  assert.equal(invoiceSubtotal(items), 2 * 10000 + 3 * 5000);
});

test('invoiceDiscount روی جمع کل اعمال می‌شود، نه هر ردیف جدا', () => {
  const items = [line(1, 100000)];
  assert.equal(invoiceDiscount(items, 10), 10000);
});

test('invoiceTax بعد از کسر تخفیف محاسبه می‌شود', () => {
  const items = [line(1, 100000)];
  // بعد از ۱۰٪ تخفیف: ۹۰٬۰۰۰ — مالیات ۹٪ روی همین مبلغ
  assert.equal(invoiceTax(items, 10, 9), 8100);
});

test('invoiceTotal = جمع - تخفیف + مالیات + هزینه ارسال', () => {
  const items = [line(1, 100000)];
  const total = invoiceTotal(items, 10, 9, 5000);
  // subtotal=100000, discount=10000, tax=8100(on 90000), shipping=5000
  assert.equal(total, 100000 - 10000 + 8100 + 5000);
});

test('invoiceTotal با هزینه ارسال نامعتبر (رشته/خالی) کرش نمی‌کند', () => {
  const items = [line(1, 10000)];
  assert.equal(invoiceTotal(items, 0, 0, undefined), 10000);
  assert.equal(invoiceTotal(items, 0, 0, NaN), 10000);
});

test('فاکتور بدون ردیف، جمع صفر می‌دهد', () => {
  assert.equal(invoiceTotal([], 10, 9, 1000), 1000);
});

test('filterActive آیتم باطل‌شده را کنار می‌گذارد', () => {
  const items = [{ id: 1, void: false }, { id: 2, void: true }, { id: 3 }];
  assert.deepEqual(filterActive(items).map(i => i.id), [1, 3]);
});

test('filterVoided فقط آیتم‌های باطل‌شده را برمی‌گرداند', () => {
  const items = [{ id: 1, void: false }, { id: 2, void: true }, { id: 3 }];
  assert.deepEqual(filterVoided(items).map(i => i.id), [2]);
});
