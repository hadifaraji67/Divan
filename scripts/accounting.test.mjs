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

// نکته: createInvoiceJournalEntry مبلغ کل را از invoice.taxPercent (سطح فاکتور)
// حساب می‌کند، ولی taxAmount را جداگانه از item.taxPercent (سطح ردیف) جمع می‌زند.
// برای این‌که فیکسچرها رفتار واقعی و امروزِ کد را توصیف کنند، این دو باید یکی باشند؛
// ناسازگاری بین این دو خودش یک باگ واقعی است که پایین‌تر مستند شده.
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
    discountPercent: 0,
    taxPercent: 9,
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
  assert.equal(total, 218000); // subtotal 200000 + 9% مالیات
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

  // جایی که خرید بدهکار بود (۱۰۳)، مرجوعی باید بستانکار همان مبلغ باشد
  assert.equal(sumDebit(byAccount(purchase.lines, '103')), sumCredit(byAccount(supplierReturn.lines, '103')));
  // جایی که خرید بستانکار بود (۲۰۱)، مرجوعی باید بدهکار همان مبلغ باشد
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

test('یافته: اگر taxPercent سطح فاکتور با taxPercent ردیف‌ها فرق کند، درآمد/مالیات اشتباه تفکیک می‌شود (سند هنوز متوازن است، ولی غلط)', () => {
  // invoice.taxPercent=0 ولی ردیف taxPercent=9 دارد — دقیقاً چیزی که UI اجازه می‌دهد
  // (InvoicesModule یک input برای taxPercent سطح فاکتور و یک input جدا برای هر ردیف دارد)
  const inv = baseInvoice({ type: 'فروش', taxPercent: 0 });
  const je = createInvoiceJournalEntry(inv, 1);

  const customerOwes = sumDebit(byAccount(je.lines, '102')); // از invoice.taxPercent (=0) محاسبه می‌شود
  const revenue = sumCredit(byAccount(je.lines, '401'));
  const taxBooked = sumCredit(byAccount(je.lines, '601'));

  assert.equal(customerOwes, 200000, 'چون سطح فاکتور taxPercent=0 است، مشتری فقط ۲۰۰۰۰۰ بدهکار می‌شود');
  // ولی taxAmount داخلی از روی taxPercent=9 هر ردیف محاسبه شده، پس بخشی از همین ۲۰۰۰۰۰
  // به‌اشتباه «مالیات» حساب می‌شود و درآمد واقعی کمتر از چیزی که باید باشد ثبت می‌شود:
  assert.equal(taxBooked, 18000, 'مالیات ثبت‌شده از نرخ ردیف می‌آید، نه نرخ فاکتور');
  assert.equal(revenue, 182000, 'درآمد واقعی باید ۲۰۰۰۰۰ باشد، ولی چون taxAmount از منبع دیگری آمده، کمتر ثبت می‌شود');
  assert.notEqual(revenue, customerOwes, 'وقتی مالیات صفر باید باشد، درآمد باید برابر کل مبلغ باشد — اینجا نیست');
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
