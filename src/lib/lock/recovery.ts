/**
 * مدیریت کد بازیابی
 */

import {
  generateSalt,
  hashCredential,
  verifyCredential,
  normalizeRecoveryCode,
} from './crypto';
import {
  loadRecoveryCredential,
  saveRecoveryCredential,
} from './storage';

/**
 * تنظیم کد بازیابی جدید
 */
export async function setRecoveryCode(code: string): Promise<boolean> {
  try {
    const normalized = normalizeRecoveryCode(code);
    const salt = generateSalt();
    const hash = await hashCredential(normalized, salt);

    saveRecoveryCredential({
      hash,
      salt,
      createdAt: new Date().toISOString(),
    });

    return true;
  } catch (err) {
    console.error('[recovery] خطا:', err);
    return false;
  }
}

/**
 * بررسی صحت کد بازیابی
 */
export async function verifyRecoveryCode(code: string): Promise<boolean> {
  const cred = loadRecoveryCredential();
  if (!cred) return false;

  const normalized = normalizeRecoveryCode(code);
  return verifyCredential(normalized, cred.salt, cred.hash);
}
