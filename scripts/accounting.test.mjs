import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isJournalEntryBalanced,
  createInvoiceJournalEntry,
  createPaymentJournalEntry,
  calculateAccountBalance,
} from '../src/lib/accounting.ts';

function sumDebit(lines) { return lines.reduce((s, l) => s + (l.debit || 0), 0); }
function sumCredit(lines) { return lines.reduce((s, l) => s + (l.credit || 0), 0); }
function byAccount(lines, accountId) { return lines.filter(l => l.accountId === accountId); }

// توجه: تخفیف/مالیات فقط از خودِ هر ردیف خوانده می‌شود — دیگر هیچ فیلد
// discountPercent/taxPercent سطح فاکتور وجود ندارد (رفع‌شده بعد از این‌که
// ناسازگاری بین نرخ سطح فاکتور و نرخ سطح ردیف باعث ثبت غلط درآمد/مالیات می‌شد).
function baseInvoice(overrides) {
  return {
    id: 'inv-1',
    number: 'INV-1',
    date: '2026-01-01',
    contactId: 'c1',
    contactName: 'مشتری تست',
    items: [
      { productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 2, unitPrice: 100000, discountPercent: 0, taxPercent: 9 },
    ],
    shippingCost: 0,
    createdAt: '2026-01-01',
    ...overrides,
  };
}

test('isJournalEntryBalanced بدهکار و بستانکار برابر را تایید می‌کند', () => {
  assert.equal(isJournalEntryBalanced([{ debit: 100, credit: 0 }, { debit: 0, credit: 100 }]), true);
  assert.equal(isJournalEntryBalanced([{ debit: 100, credit: 0 }, { debit: 0, credit: 90 }]), false);
});

test('isJournalEntryBalanced اختلاف زیر ۱ ریال (گرد شدن) را متوازن می‌داند', () => {
  assert.equal(isJournalEntryBalanced([{ debit: 100.4, credit: 0 }, { debit: 0, credit: 100 }]), true);
});

for (const type of ['فروش', 'خرید', 'برگشت از فروش', 'مرجوعی به تامین‌کننده']) {
  test(`سند «${type}» همیشه متوازن است (بدهکار = بستانکار)`, () => {
    const je = createInvoiceJournalEntry(baseInvoice({ type }), 1);
    assert.equal(sumDebit(je.lines), sumCredit(je.lines));
    assert.ok(je.lines.length >= 2);
  });
}

test('سند فروش: بدهکار مشتری (۱۰۲) و بستانکار درآمد (۴۰۱) + مالیات (۶۰۱)', () => {
  const inv = baseInvoice({ type: 'فروش' });
  const je = createInvoiceJournalEntry(inv, 1);
  const total = sumDebit(byAccount(je.lines, '102'));
  assert.equal(total, 218000); // subtotal 200000 + 9% مالیات هر ردیف
  assert.equal(sumCredit(byAccount(je.lines, '401')), 200000);
  assert.equal(sumCredit(byAccount(je.lines, '601')), 18000);
});

test('سند خرید: بدهکار موجودی کالا (۱۰۳) و بستانکار تامین‌کننده (۲۰۱)', () => {
  const inv = baseInvoice({ type: 'خرید', contactName: 'تامین‌کننده تست' });
  const je = createInvoiceJournalEntry(inv, 1);
  assert.equal(sumDebit(byAccount(je.lines, '103')), 200000);
  assert.equal(sumCredit(byAccount(je.lines, '201')), 218000);
});

test('سند «مرجوعی به تامین‌کننده» دقیقاً معکوس سند خرید است', () => {
  const purchase = createInvoiceJournalEntry(baseInvoice({ type: 'خرید' }), 1);
  const supplierReturn = createInvoiceJournalEntry(baseInvoice({ type: 'مرجوعی به تامین‌کننده' }), 2);
  assert.equal(sumDebit(byAccount(purchase.lines, '103')), sumCredit(byAccount(supplierReturn.lines, '103')));
  assert.equal(sumCredit(byAccount(purchase.lines, '201')), sumDebit(byAccount(supplierReturn.lines, '201')));
});

test('فاکتور بدون مالیات، ردیف حساب ۶۰۱ (مالیات) نمی‌سازد', () => {
  const inv = baseInvoice({
    type: 'فروش',
    items: [{ productId: 'p1', productName: 'کالا', unit: 'عدد', quantity: 1, unitPrice: 1000, discountPercent: 0, taxPercent: 0 }],
  });
  const je = createInvoiceJournalEntry(inv, 1);
  assert.equal(byAccount(je.lines, '601').length, 0);
});

test('پیش‌فاکتور هیچ سندی نمی‌سازد (lines خالی)', () => {
  const je = createInvoiceJournalEntry(baseInvoice({ type: 'پیش‌فاکتور فروش' }), 1);
  assert.deepEqual(je.lines, []);
});

test('سند پرداخت «دریافت»: بدهکار صندوق، بستانکار طلب مشتری', () => {
  const je = createPaymentJournalEntry(
    { id: 'pay-1', contactId: 'c1', contactName: 'مشتری', type: 'نقد', amount: 50000, date: '2026-01-01', direction: 'دریافت', createdAt: '2026-01-01' },
    1,
  );
  assert.equal(sumDebit(byAccount(je.lines, '10101')), 50000);
  assert.equal(sumCredit(byAccount(je.lines, '102')), 50000);
  assert.equal(sumDebit(je.lines), sumCredit(je.lines));
});

test('سند پرداخت «پرداخت»: بدهکار بدهی تامین‌کننده، بستانکار صندوق', () => {
  const je = createPaymentJournalEntry(
    { id: 'pay-2', contactId: 's1', contactName: 'تامین‌کننده', type: 'نقد', amount: 30000, date: '2026-01-01', direction: 'پرداخت', createdAt: '2026-01-01' },
    2,
  );
  assert.equal(sumDebit(byAccount(je.lines, '201')), 30000);
  assert.equal(sumCredit(byAccount(je.lines, '10101')), 30000);
});

test('رگرسیون: هر ردیف نرخ مالیات/تخفیف خودش را دارد و دیگر هیچ نرخ سطح فاکتوری برای ناسازگاری وجود ندارد', () => {
  // قبلاً یک فیلد discountPercent/taxPercent جدا روی خودِ Invoice بود که با نرخ
  // هر ردیف می‌توانست فرق کند و باعث ثبت غلط درآمد/مالیات می‌شد (سند هنوز متوازن
  // می‌ماند چون netAmount = total - taxAmount تعریف شده بود، ولی تفکیک غلط بود).
  // حالا چون این فیلد از تایپ Invoice حذف شده، این سناریو اصلاً قابل‌ساخت نیست:
  // دو ردیف با نرخ‌های متفاوت را می‌سازیم و مطمئن می‌شویم total دقیقاً با جمع
  // درآمد+مالیات واقعیِ همان دو ردیف برابر است.
  const inv = baseInvoice({
    type: 'فروش',
    items: [
      { productId: 'p1', productName: 'کالای معاف', unit: 'عدد', quantity: 1, unitPrice: 100000, discountPercent: 0, taxPercent: 0 },
      { productId: 'p2', productName: 'کالای مشمول', unit: 'عدد', quantity: 1, unitPrice: 100000, discountPercent: 0, taxPercent: 9 },
    ],
  });
  const je = createInvoiceJournalEntry(inv, 1);
  const customerOwes = sumDebit(byAccount(je.lines, '102'));
  const revenue = sumCredit(byAccount(je.lines, '401'));
  const taxBooked = sumCredit(byAccount(je.lines, '601'));

  assert.equal(customerOwes, 209000); // 100000 (معاف) + 100000*1.09 (مشمول)
  assert.equal(taxBooked, 9000);      // فقط از ردیف دوم
  assert.equal(revenue, 200000);      // کل subtotal، بدون کسر اشتباه
  assert.equal(revenue + taxBooked, customerOwes);
});

test('calculateAccountBalance سند باطل‌شده را نادیده می‌گیرد', () => {
  const entries = [
    { void: false, lines: [{ accountId: '102', debit: 1000, credit: 0 }] },
    { void: true, lines: [{ accountId: '102', debit: 9999, credit: 0 }] },
  ];
  const result = calculateAccountBalance(entries, '102');
  assert.equal(result.debit, 1000);
  assert.equal(result.balance, 1000);
});
