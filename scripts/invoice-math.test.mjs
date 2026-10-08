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

// توجه: تخفیف و مالیات فقط از خودِ هر ردیف خوانده می‌شود (نه یک درصد سطح فاکتور)
// این دقیقاً همان چیزی است که فیکس «ناسازگاری نرخ مالیات سطح فاکتور/ردیف» به آن رسید.
function line(quantity, unitPrice, discountPercent = 0, taxPercent = 0) {
  return { productId: 'p1', productName: 'کالا', unit: 'عدد', quantity, unitPrice, discountPercent, taxPercent };
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

test('invoiceDiscount از درصد تخفیف خودِ هر ردیف محاسبه می‌شود', () => {
  const items = [line(1, 100000, 10), line(1, 50000, 0)];
  assert.equal(invoiceDiscount(items), 10000); // فقط ردیف اول ۱۰٪ تخفیف دارد
});

test('invoiceTax بعد از کسر تخفیف همان ردیف محاسبه می‌شود', () => {
  const items = [line(1, 100000, 10, 9)];
  assert.equal(invoiceTax(items), 8100);
});

test('هر ردیف می‌تواند نرخ مالیات/تخفیف جدا داشته باشد', () => {
  const items = [line(1, 100000, 0, 9), line(1, 100000, 0, 0)];
  assert.equal(invoiceTax(items), 9000);
});

test('invoiceTotal = جمع - تخفیف + مالیات + هزینه ارسال', () => {
  const items = [line(1, 100000, 10, 9)];
  const total = invoiceTotal(items, 5000);
  assert.equal(total, 100000 - 10000 + 8100 + 5000);
});

test('invoiceTotal با هزینه ارسال نامعتبر (رشته/خالی) کرش نمی‌کند', () => {
  const items = [line(1, 10000)];
  assert.equal(invoiceTotal(items, undefined), 10000);
  assert.equal(invoiceTotal(items, NaN), 10000);
});

test('فاکتور بدون ردیف، جمع صفر می‌دهد', () => {
  assert.equal(invoiceTotal([], 1000), 1000);
});

test('filterActive آیتم باطل‌شده را کنار می‌گذارد', () => {
  const items = [{ id: 1, void: false }, { id: 2, void: true }, { id: 3 }];
  assert.deepEqual(filterActive(items).map(i => i.id), [1, 3]);
});

test('filterVoided فقط آیتم‌های باطل‌شده را برمی‌گرداند', () => {
  const items = [{ id: 1, void: false }, { id: 2, void: true }, { id: 3 }];
  assert.deepEqual(filterVoided(items).map(i => i.id), [2]);
});
