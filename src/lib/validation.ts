/**
 * اعتبارسنجی ورودی‌ها — فرمت‌های ایرانی
 */

export function isValidMobile(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-()]/g, '');
  return /^(?:\+?98|0)?9\d{9}$/.test(clean);
}

export function normalizeMobile(phone: string): string {
  const clean = phone.replace(/[\s\-()]/g, '');
  if (clean.startsWith('+98')) return '0' + clean.slice(3);
  if (clean.startsWith('98') && clean.length === 12) return '0' + clean.slice(2);
  if (clean.startsWith('9') && clean.length === 10) return '0' + clean;
  return clean;
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-()]/g, '');
  return /^0\d{2,3}\d{7,8}$/.test(clean) || isValidMobile(phone);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '');
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidNationalId(code: string): boolean {
  if (!code) return false;
  const clean = code.replace(/\D/g, '');
  if (clean.length !== 10) return false;
  if (/^(\d)\1{9}$/.test(clean)) return false;
  const check = parseInt(clean[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  const rem = sum % 11;
  return (rem < 2 && check === rem) || (rem >= 2 && check === 11 - rem);
}

export function isValidPostalCode(code: string): boolean {
  if (!code) return false;
  const clean = code.replace(/\D/g, '');
  return clean.length === 10 && !/^(\d)\1{9}$/.test(clean);
}

export function isValidAmount(value: any, allowZero = false): boolean {
  const n = Number(value);
  if (isNaN(n)) return false;
  return allowZero ? n >= 0 : n > 0;
}

export function isValidPositiveInt(value: any): boolean {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

export function validateMobile(value: string): ValidationResult {
  if (!value?.trim()) return { valid: true };
  if (!isValidMobile(value)) return { valid: false, error: 'شماره موبایل نامعتبر (مثال: ۰۹۱۲۳۴۵۶۷۸۹)' };
  return { valid: true, normalized: normalizeMobile(value) };
}

export function validatePhone(value: string): ValidationResult {
  if (!value?.trim()) return { valid: true };
  if (!isValidPhone(value)) return { valid: false, error: 'شماره تلفن نامعتبر' };
  return { valid: true, normalized: normalizePhone(value) };
}

export function validateEmail(value: string): ValidationResult {
  if (!value?.trim()) return { valid: true };
  if (!isValidEmail(value)) return { valid: false, error: 'ایمیل نامعتبر' };
  return { valid: true, normalized: value.trim().toLowerCase() };
}

export function validateNationalId(value: string): ValidationResult {
  if (!value?.trim()) return { valid: true };
  if (!isValidNationalId(value)) return { valid: false, error: 'کد ملی نامعتبر' };
  return { valid: true };
}

export function validatePostalCode(value: string): ValidationResult {
  if (!value?.trim()) return { valid: true };
  if (!isValidPostalCode(value)) return { valid: false, error: 'کد پستی نامعتبر (۱۰ رقم)' };
  return { valid: true };
}
