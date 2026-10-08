import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkStockAvailability } from '../src/lib/invoice-logic.ts';

function product(overrides) {
  return { id: 'p1', sku: 'S1', name: 'کالا', category: 'عمومی', unit: 'عدد', stock: 10, minStock: 0, buyPrice: 0, sellPrice: 0, taxPercent: 0, isActive: true, createdAt: '2026-01-01', ...overrides };
}

function invoice(type, items, overrides) {
  return { id: 'i1', number: 'N1', date: '2026-01-01', contactId: 'c1', contactName: 'طرف', type, items, shippingCost: 0, createdAt: '2026-01-01', ...overrides };
}

test('کمبود موجودی برای فروش بیش از موجودی گزارش می‌شود', () => {
  const products = [product({ stock: 5 })];
  const inv = invoice('فروش', [{ productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 8, unitPrice: 1000, discountPercent: 0, taxPercent: 0 }]);
  const shortages = checkStockAvailability(inv, products);
  assert.equal(shortages.length, 1);
  assert.equal(shortages[0].available, 5);
  assert.equal(shortages[0].requested, 8);
});

test('وقتی موجودی کافی است، کمبودی گزارش نمی‌شود', () => {
  const products = [product({ stock: 10 })];
  const inv = invoice('فروش', [{ productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 10, unitPrice: 1000, discountPercent: 0, taxPercent: 0 }]);
  assert.deepEqual(checkStockAvailability(inv, products), []);
});

test('چند ردیف از یک کالا با هم جمع زده می‌شوند', () => {
  const products = [product({ stock: 10 })];
  const inv = invoice('فروش', [
    { productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 6, unitPrice: 1000, discountPercent: 0, taxPercent: 0 },
    { productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 6, unitPrice: 1000, discountPercent: 0, taxPercent: 0 },
  ]);
  const shortages = checkStockAvailability(inv, products);
  assert.equal(shortages[0].requested, 12); // 6+6، نه هر ردیف جدا
});

test('خرید و برگشت از فروش (افزایشی) هیچ‌وقت کمبود گزارش نمی‌کنند', () => {
  const products = [product({ stock: 0 })];
  const items = [{ productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 100, unitPrice: 1000, discountPercent: 0, taxPercent: 0 }];
  assert.deepEqual(checkStockAvailability(invoice('خرید', items), products), []);
  assert.deepEqual(checkStockAvailability(invoice('برگشت از فروش', items), products), []);
});

test('پیش‌فاکتور هیچ‌وقت کمبود گزارش نمی‌کند', () => {
  const products = [product({ stock: 0 })];
  const items = [{ productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 100, unitPrice: 1000, discountPercent: 0, taxPercent: 0 }];
  assert.deepEqual(checkStockAvailability(invoice('پیش‌فاکتور فروش', items), products), []);
});

test('کالای ناموجود در لیست products نادیده گرفته می‌شود (کرش نمی‌کند)', () => {
  const inv = invoice('فروش', [{ productId: 'ghost', productName: 'حذف‌شده', unit: 'عدد', quantity: 5, unitPrice: 1000, discountPercent: 0, taxPercent: 0 }]);
  assert.deepEqual(checkStockAvailability(inv, []), []);
});
