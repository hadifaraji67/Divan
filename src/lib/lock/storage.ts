/**
 * ذخیره‌سازی امن تنظیمات قفل
 */

import {
  type LockSettings,
  type LockCredential,
  type RecoveryCredential,
  DEFAULT_LOCK_SETTINGS,
} from './types';

const LOCK_SETTINGS_KEY = 'divan_lock_settings';
const LOCK_CRED_KEY = 'divan_lock_credential';
const RECOVERY_CRED_KEY = 'divan_lock_recovery';
const RECOVERY_SHOWN_KEY = 'divan_lock_recovery_shown';
const LOCK_STATE_KEY = 'divan_lock_state';

/**
 * بارگذاری تنظیمات قفل
 */
export function loadLockSettings(): LockSettings {
  if (typeof window === 'undefined') return DEFAULT_LOCK_SETTINGS;
  try {
    const raw = localStorage.getItem(LOCK_SETTINGS_KEY);
    return raw ? { ...DEFAULT_LOCK_SETTINGS, ...JSON.parse(raw) } : DEFAULT_LOCK_SETTINGS;
  } catch {
    return DEFAULT_LOCK_SETTINGS;
  }
}

/**
 * ذخیره تنظیمات قفل
 */
export function saveLockSettings(settings: Partial<LockSettings>): void {
  if (typeof window === 'undefined') return;
  const current = loadLockSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(LOCK_SETTINGS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('divan-lock-changed'));
}

/**
 * ذخیره رمز قفل (هش شده)
 */
export function saveLockCredential(cred: LockCredential): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCK_CRED_KEY, JSON.stringify(cred));
}

/**
 * بارگذاری رمز قفل
 */
export function loadLockCredential(): LockCredential | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCK_CRED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * ذخیره کد بازیابی (هش شده)
 */
export function saveRecoveryCredential(cred: RecoveryCredential): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECOVERY_CRED_KEY, JSON.stringify(cred));
}

/**
 * بارگذاری کد بازیابی
 */
export function loadRecoveryCredential(): RecoveryCredential | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RECOVERY_CRED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * بررسی نمایش داده شدن کد بازیابی
 */
export function isRecoveryShown(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(RECOVERY_SHOWN_KEY) === 'true';
}

export function markRecoveryShown(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECOVERY_SHOWN_KEY, 'true');
}

/**
 * حذف کامل قفل (غیرفعال‌سازی)
 */
export function clearLock(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCK_SETTINGS_KEY);
  localStorage.removeItem(LOCK_CRED_KEY);
  localStorage.removeItem(RECOVERY_CRED_KEY);
  localStorage.removeItem(RECOVERY_SHOWN_KEY);
  localStorage.removeItem(LOCK_STATE_KEY);
  window.dispatchEvent(new CustomEvent('divan-lock-changed'));
}

/**
 * وضعیت قفل (باز / قفل)
 */
export function isUnlocked(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = localStorage.getItem(LOCK_STATE_KEY);
  if (!raw) return false;
  try {
    const state = JSON.parse(raw);
    return state.unlocked === true;
  } catch {
    return false;
  }
}

export function setUnlocked(unlocked: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCK_STATE_KEY, JSON.stringify({
    unlocked,
    at: Date.now(),
  }));
}

/**
 * بررسی فعال بودن قفل
 */
export function isLockEnabled(): boolean {
  const settings = loadLockSettings();
  return settings.enabled === true;
}
