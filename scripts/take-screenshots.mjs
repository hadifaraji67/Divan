/**
 * اسکرین‌شات خودکار — با کلیک روی ModeSelection
 */

import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = 'http://localhost:8080';
const OUT_DIR = 'screenshots';

const PATHS = [
  '/data/data/com.termux/files/usr/bin/chromium-browser',
  '/data/data/com.termux/files/usr/bin/chromium',
];

const executablePath = PATHS.find((p) => existsSync(p));
if (!executablePath) {
  console.error('❌ Chromium نیست');
  process.exit(1);
}

console.log(`✅ Chromium: ${executablePath}\n`);

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

console.log('🚀 شروع...\n');

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--no-zygote', '--single-process'],
});

const page = await browser.newPage();
await page.setViewport({ width: 400, height: 850, deviceScaleFactor: 2 });

// ─── داده‌های نمونه ───
const MOCK = {
  divan_contacts: JSON.stringify([
    { id: 'c1', code: 'C-0001', type: 'حقیقی', name: 'علی محمدی', nationalId: '0012345678', mobile: '09123456789', phone: '02112345678', email: 'ali@example.com', address: 'تهران، خیابان ولیعصر', roles: ['مشتری'], creditLimit: 0, createdAt: '2026-09-01' },
    { id: 'c2', code: 'C-0002', type: 'حقیقی', name: 'رضا احمدی', nationalId: '0023456789', mobile: '09123456790', address: 'تهران، سعادت‌آباد', roles: ['مشتری'], creditLimit: 0, createdAt: '2026-09-05' },
    { id: 'c3', code: 'C-0003', type: 'حقوقی', name: 'شرکت پارس تجارت', companyName: 'پارس تجارت', nationalId: '10101234567', mobile: '09123456791', address: 'تهران، میرداماد', roles: ['مشتری', 'تامین‌کننده'], creditLimit: 50000000, createdAt: '2026-09-10' },
  ]),
  divan_products: JSON.stringify([
    { id: 'p1', sku: 'P-0001', barcode: '6260123456789', name: 'ماوس لاجیتک MX Master', category: 'لوازم جانبی', brand: 'Logitech', unit: 'عدد', stock: 24, minStock: 5, buyPrice: 3500000, sellPrice: 4500000, wholesalePrice: 4000000, taxPercent: 9, isActive: true, createdAt: '2026-09-01' },
    { id: 'p2', sku: 'P-0002', barcode: '6260123456790', name: 'کیبورد مکانیکال Keychron', category: 'لوازم جانبی', brand: 'Keychron', unit: 'عدد', stock: 3, minStock: 5, buyPrice: 5500000, sellPrice: 7000000, taxPercent: 9, isActive: true, createdAt: '2026-09-02' },
    { id: 'p3', sku: 'P-0003', name: 'مانیتور ۲۷ اینچ LG', category: 'نمایشگر', brand: 'LG', unit: 'عدد', stock: 12, minStock: 3, buyPrice: 18000000, sellPrice: 22000000, taxPercent: 9, isActive: true, createdAt: '2026-09-03' },
  ]),
  divan_invoices: JSON.stringify([
    { id: 'i1', number: 'INV-0001', type: 'فروش', date: '1405/06/25', contactId: 'c1', contactName: 'علی محمدی', items: [{ productId: 'p1', productName: 'ماوس لاجیتک MX Master', unit: 'عدد', quantity: 2, unitPrice: 4500000, discountPercent: 0, taxPercent: 9 }], discountPercent: 0, taxPercent: 9, shippingCost: 0, status: 'paid', createdAt: '2026-09-16' },
    { id: 'i2', number: 'INV-0002', type: 'فروش', date: '1405/06/26', contactId: 'c2', contactName: 'رضا احمدی', items: [{ productId: 'p2', productName: 'کیبورد مکانیکال', unit: 'عدد', quantity: 1, unitPrice: 7000000, discountPercent: 5, taxPercent: 9 }], discountPercent: 5, taxPercent: 9, shippingCost: 0, status: 'pending', createdAt: '2026-09-17' },
    { id: 'i3', number: 'INV-0003', type: 'فروش', date: '1405/06/27', contactId: 'c3', contactName: 'پارس تجارت', items: [{ productId: 'p3', productName: 'مانیتور ۲۷ اینچ', unitPrice: 22000000, unit: 'عدد', quantity: 5, discountPercent: 10, taxPercent: 9 }], discountPercent: 10, taxPercent: 9, shippingCost: 200000, status: 'paid', createdAt: '2026-09-18' },
  ]),
  divan_payments: JSON.stringify([
    { id: 'pay1', contactId: 'c1', contactName: 'علی محمدی', invoiceId: 'i1', type: 'دریافت', amount: 9810000, date: '1405/06/25', direction: 'دریافت', method: 'نقدی', createdAt: '2026-09-16' },
  ]),
  divan_cheques: JSON.stringify([
    { id: 'ch1', contactId: 'c2', contactName: 'رضا احمدی', bankName: 'ملت', chequeNumber: '123456', amount: 7000000, dueDate: '1405/07/15', direction: 'دریافتی', status: 'در جریان', createdAt: '2026-09-17' },
    { id: 'ch2', contactId: 'c3', contactName: 'پارس تجارت', bankName: 'صادرات', chequeNumber: '789012', amount: 22000000, dueDate: '1405/07/25', direction: 'دریافتی', status: 'در جریان', createdAt: '2026-09-18' },
  ]),
  divan_settings_v1: JSON.stringify({
    storeName: 'فروشگاه من',
    theme: 'light',
    persianNumbers: true,
    animations: false,
    currency: 'ریال',
    fontSize: 'md',
  }),
  divan_mode: '"local"',
  divan_setup_completed: '"true"',
  divan_onboarding_done: '"1"',
};

async function shot(name) {
  await page.screenshot({ path: join(OUT_DIR, `${name}.png`) });
  console.log(`  ✅ ${name}.png`);
}

async function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function clickByText(text) {
  return page.evaluate((t) => {
    const els = document.querySelectorAll('button, a, [role="button"], div[role="button"]');
    for (const el of els) {
      const txt = el.textContent?.trim() || '';
      if (txt === t || txt.includes(t)) { el.click(); return true; }
    }
    return false;
  }, text);
}

async function clickByAria(label) {
  return page.evaluate((l) => {
    const el = document.querySelector(`[aria-label="${l}"]`);
    if (el) { el.click(); return true; }
    return false;
  }, label);
}

try {
  console.log('📱 بارگذاری اپ...');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(2000);

  // تزریق داده
  await page.evaluate((data) => {
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
  }, MOCK);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await wait(3000);

  // ─── چک صفحه ModeSelection ───
  const onModeSelection = await page.evaluate(() => {
    return document.body.innerText.includes('حالت استفاده خود را انتخاب کنید');
  });

  if (onModeSelection) {
    console.log('📋 صفحه انتخاب حالت — کلیک روی «شروع»...');
    await clickByText('شروع');
    await wait(3000);
  }

  // ─── چک Onboarding ───
  const onOnboarding = await page.evaluate(() => {
    return document.body.innerText.includes('آشنایی با دیوان') ||
           document.body.innerText.includes('رد کردن آموزش');
  });

  if (onOnboarding) {
    console.log('🎓 Onboarding — رد کردن...');
    await clickByText('رد کردن');
    await wait(1500);
  }

  // ─── چک BackupDiscovery ───
  const onDiscovery = await page.evaluate(() => {
    return document.body.innerText.includes('بکاپ‌های قبلی') &&
           document.body.innerText.includes('شروع از صفر');
  });

  if (onDiscovery) {
    console.log('📂 Backup Discovery — رد کردن...');
    await clickByText('شروع از صفر');
    await wait(1500);
  }

  // ─── چک LockScreen ───
  const onLockScreen = await page.evaluate(() => {
    return document.body.innerText.includes('رمز') &&
           document.body.innerText.includes('ورود');
  });

  if (onLockScreen) {
    console.log('🔒 LockScreen فعال — این معمولاً رخ نمی‌دهد');
  }

  // ─── الان باید در داشبورد باشیم ───
  const currentPage = await page.evaluate(() => document.body.innerText.slice(0, 200));
  console.log('📄 صفحه فعلی:', currentPage.slice(0, 80));

  // ═══════════ اسکرین‌شات‌ها ═══════════

  // ۰۱ داشبورد
  console.log('\n📸 داشبورد');
  await shot('01-dashboard');

  await page.evaluate(() => window.scrollBy(0, 700));
  await wait(500);
  await shot('02-dashboard-scroll');

  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // ۰۳ فاکتورها
  console.log('\n📸 فاکتورها');
  await clickByAria('منو');
  await wait(800);
  await clickByText('مدیریت فاکتورها');
  await wait(1500);
  await shot('03-invoices');

  // ۰۴ فرم فاکتور
  console.log('\n📸 فرم فاکتور');
  await clickByText('فاکتور جدید');
  await wait(1500);
  await shot('04-invoice-form');
  await page.keyboard.press('Escape');
  await wait(800);

  // ۰۵ کالاها
  console.log('\n📸 کالاها');
  await clickByAria('منو');
  await wait(800);
  await clickByText('انبار و کالا');
  await wait(1500);
  await shot('05-products');

  // ۰۶ مشتریان
  console.log('\n📸 مشتریان');
  await clickByAria('منو');
  await wait(800);
  await clickByText('مشتریان');
  await wait(1500);
  await shot('06-contacts');

  // ۰۷ Command Palette
  console.log('\n📸 Command Palette');
  await page.keyboard.down('Control');
  await page.keyboard.press('k');
  await page.keyboard.up('Control');
  await wait(1000);
  await shot('07-command-palette');
  await page.keyboard.press('Escape');
  await wait(500);

  // ۰۸ گزارش‌ها
  console.log('\n📸 گزارش‌ها');
  await clickByAria('منو');
  await wait(800);
  await clickByText('گزارش');
  await wait(1500);
  await shot('08-reports');

  // ۰۹ تنظیمات
  console.log('\n📸 تنظیمات');
  await clickByAria('منو');
  await wait(800);
  await clickByText('تنظیمات');
  await wait(1500);
  await shot('09-settings');

  // ۱۰ امنیت
  console.log('\n📸 امنیت');
  await clickByText('امنیت');
  await wait(1200);
  await shot('10-lock-settings');

  // ۱۱ درباره
  console.log('\n📸 درباره');
  await clickByText('درباره');
  await wait(1200);
  await shot('11-about');

  // ۱۲ دارک مود
  console.log('\n📸 دارک مود');
  await clickByAria('تغییر تم');
  await wait(1000);
  await shot('12-dark-mode');

  console.log('\n✅ همه اسکرین‌شات‌ها ذخیره شدند!');
  console.log(`📁 ${OUT_DIR}/`);

} catch (err) {
  console.error('\n❌ خطا:', err.message);
  // اسکرین‌شات خطا برای دیباگ
  try {
    await page.screenshot({ path: 'screenshots/error-debug.png' });
    console.error('📸 error-debug.png گرفته شد');
  } catch {}
} finally {
  await browser.close();
}
