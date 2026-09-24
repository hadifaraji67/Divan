import type { Contact, Product } from '../types/models';

/**
 * نرمال‌سازی رشته برای مقایسه
 * - حذف فاصله‌های اضافی
 * - تبدیل اعداد فارسی به انگلیسی
 * - حذف کاراکترهای غیرضروری
 */
export function normalizeForCompare(s?: string | null): string {
  if (!s) return '';
  return s
    .trim()
    .toLowerCase()
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[يى]/g, 'ی')
    .replace(/[كک]/g, 'ک')
    .replace(/[\s\-_.]+/g, ' ')
    .trim();
}

/**
 * نرمال‌سازی موبایل: 09123456789
 */
export function normalizeMobile(m?: string | null): string {
  if (!m) return '';
  const digits = m
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/\D/g, '');
  return digits;
}

/**
 * پیدا کردن مشتری تکراری بر اساس:
 * 1. موبایل یکسان
 * 2. کد ملی یکسان
 * 3. نام + تلفن یکسان
 */
export function findDuplicateContact(
  candidate: Contact,
  contacts: Contact[],
): Contact | null {
  const mobile = normalizeMobile(candidate.mobile || '');
  const nationalId = normalizeForCompare(candidate.nationalId || '');
  const name = normalizeForCompare(candidate.name || '');
  const lastName = normalizeForCompare(candidate.lastName || '');

  for (const c of contacts) {
    // خودش رو skip کن (در حالت ویرایش)
    if (c.id === candidate.id) continue;

    // موبایل یکسان (اگر موبایل معتبر باشه)
    if (mobile.length >= 10 && normalizeMobile(c.mobile) === mobile) {
      return c;
    }

    // کد ملی یکسان
    if (nationalId.length >= 10 && normalizeForCompare(c.nationalId) === nationalId) {
      return c;
    }

    // نام + نام خانوادگی یکسان (اگر هر دو پر باشن)
    if (name && lastName) {
      const cName = normalizeForCompare(c.name);
      const cLastName = normalizeForCompare(c.lastName || '');
      if (cName === name && cLastName === lastName) {
        return c;
      }
    }
  }

  return null;
}

/**
 * پیدا کردن کالای تکراری بر اساس:
 * 1. SKU یکسان
 * 2. بارکد یکسان
 * 3. نام یکسان
 */
export function findDuplicateProduct(
  candidate: Product,
  products: Product[],
): Product | null {
  const sku = normalizeForCompare(candidate.sku || '');
  const barcode = normalizeForCompare(candidate.barcode || '');
  const name = normalizeForCompare(candidate.name || '');

  for (const p of products) {
    if (p.id === candidate.id) continue;

    // SKU یکسان
    if (sku && normalizeForCompare(p.sku) === sku) {
      return p;
    }

    // بارکد یکسان
    if (barcode && normalizeForCompare(p.barcode) === barcode) {
      return p;
    }

    // نام یکسان
    if (name && normalizeForCompare(p.name) === name) {
      return p;
    }
  }

  return null;
}
