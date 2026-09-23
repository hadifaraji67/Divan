import {
  type LockConfig, type LockCredentials, type LockState, type RecoveryInfo,
  type LockMethod, type AutoLockDelay,
  LOCK_CONFIG_KEY, LOCK_CRED_KEY, LOCK_RECOVERY_KEY, LOCK_STATE_KEY,
  DEFAULT_CONFIG, MAX_FAILED_ATTEMPTS, LOCKOUT_DURATION_MS,
} from './lock-types';
import { generateSalt, hashPassword, verifyPassword } from './crypto-utils';
import { generateRecoveryCode, normalizeRecoveryCode } from './recovery-code';

export function loadConfig(): LockConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(LOCK_CONFIG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfig(config: LockConfig): void {
  localStorage.setItem(LOCK_CONFIG_KEY, JSON.stringify(config));
}

function loadCred(): LockCredentials | null {
  try {
    const raw = localStorage.getItem(LOCK_CRED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCred(cred: LockCredentials): void {
  localStorage.setItem(LOCK_CRED_KEY, JSON.stringify(cred));
}

function loadRecovery(): RecoveryInfo | null {
  try {
    const raw = localStorage.getItem(LOCK_RECOVERY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRecovery(info: RecoveryInfo): void {
  localStorage.setItem(LOCK_RECOVERY_KEY, JSON.stringify(info));
}

function loadState(): LockState {
  try {
    const raw = localStorage.getItem(LOCK_STATE_KEY);
    return raw ? JSON.parse(raw) : { locked: false, failedAttempts: 0 };
  } catch {
    return { locked: false, failedAttempts: 0 };
  }
}

function saveState(state: LockState): void {
  localStorage.setItem(LOCK_STATE_KEY, JSON.stringify(state));
}

export function isLockEnabled(): boolean {
  return loadConfig().enabled;
}

export function isLocked(): boolean {
  const config = loadConfig();
  if (!config.enabled) return false;
  return loadState().locked;
}

export async function enableLock(
  secret: string,
  method: LockMethod,
  options?: {
    autoLockDelay?: AutoLockDelay;
    hint?: string;
    biometricEnabled?: boolean;
  }
): Promise<{ success: boolean; recoveryCode?: string; error?: string }> {
  try {
    const salt = generateSalt();
    const hash = await hashPassword(secret, salt);
    const now = new Date().toISOString();
    saveCred({ hash, salt, iterations: 100000 });

    const code = generateRecoveryCode();
    const codeSalt = generateSalt();
    const codeHash = await hashPassword(normalizeRecoveryCode(code), codeSalt);
    saveRecovery({ codeHash, codeSalt, createdAt: now });

    const config: LockConfig = {
      enabled: true,
      method,
      autoLockDelay: options?.autoLockDelay ?? 5,
      biometricEnabled: options?.biometricEnabled ?? false,
      biometricPreferred: false,
      hint: options?.hint,
      createdAt: now,
      lastChangedAt: now,
    };
    saveConfig(config);
    saveState({ locked: true, failedAttempts: 0 });

    return { success: true, recoveryCode: code };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function disableLock(secret: string): Promise<{ success: boolean; error?: string }> {
  const ok = await verifySecret(secret);
  if (!ok) return { success: false, error: 'رمز اشتباه است' };

  localStorage.removeItem(LOCK_CONFIG_KEY);
  localStorage.removeItem(LOCK_CRED_KEY);
  localStorage.removeItem(LOCK_RECOVERY_KEY);
  localStorage.removeItem(LOCK_STATE_KEY);

  return { success: true };
}

export async function changeSecret(
  oldSecret: string,
  newSecret: string
): Promise<{ success: boolean; error?: string }> {
  const ok = await verifySecret(oldSecret);
  if (!ok) return { success: false, error: 'رمز فعلی اشتباه است' };

  const salt = generateSalt();
  const hash = await hashPassword(newSecret, salt);
  saveCred({ hash, salt, iterations: 100000 });

  const config = loadConfig();
  config.lastChangedAt = new Date().toISOString();
  saveConfig(config);

  return { success: true };
}

export async function verifySecret(secret: string): Promise<boolean> {
  const cred = loadCred();
  if (!cred) return false;
  return verifyPassword(secret, cred.hash, cred.salt, cred.iterations);
}

/**
 * Progressive lockout: هر سری خطا، مدت قفل بیشتر می‌شه
 * - ۵ خطا  → ۳۰ ثانیه
 * - ۱۰ خطا → ۲ دقیقه
 * - ۱۵ خطا → ۱۰ دقیقه
 * - ۲۰ خطا → ۱ ساعت
 * - ۳۰+ خطا → ۲۴ ساعت
 */
function calculateLockoutDuration(failedAttempts: number): number {
  if (failedAttempts < 5) return 0;
  if (failedAttempts < 10) return 30 * 1000;        // 30s
  if (failedAttempts < 15) return 2 * 60 * 1000;    // 2min
  if (failedAttempts < 20) return 10 * 60 * 1000;   // 10min
  if (failedAttempts < 30) return 60 * 60 * 1000;   // 1hour
  return 24 * 60 * 60 * 1000;                       // 24hours
}

function formatDuration(ms: number): string {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return s + ' ثانیه';
  const m = Math.ceil(s / 60);
  if (m < 60) return m + ' دقیقه';
  const h = Math.ceil(m / 60);
  return h + ' ساعت';
}

export async function unlockWithSecret(secret: string): Promise<{
  success: boolean;
  error?: string;
  lockedUntil?: string;
  attemptsLeft?: number;
}> {
  const state = loadState();

  // چک قفل فعال
  if (state.lockedUntil) {
    const until = new Date(state.lockedUntil).getTime();
    if (Date.now() < until) {
      const remaining = until - Date.now();
      return {
        success: false,
        error: `قفل فعال — ${formatDuration(remaining)} دیگر تلاش کن`,
        lockedUntil: state.lockedUntil,
      };
    }
    // زمان قفل تمام شده — پاک کن
    delete state.lockedUntil;
  }

  const ok = await verifySecret(secret);

  if (ok) {
    saveState({ locked: false, failedAttempts: 0, lastUnlockAt: new Date().toISOString() });
    return { success: true };
  }

  // خطا — افزایش شمارنده
  const failedAttempts = (state.failedAttempts || 0) + 1;
  const lockoutMs = calculateLockoutDuration(failedAttempts);

  if (lockoutMs > 0) {
    const lockedUntil = new Date(Date.now() + lockoutMs).toISOString();
    saveState({
      ...state,
      failedAttempts,
      lockedUntil,
    });
    return {
      success: false,
      error: `${failedAttempts} تلاش اشتباه — ${formatDuration(lockoutMs)} قفل شد`,
      lockedUntil,
    };
  }

  saveState({ ...state, failedAttempts });
  const left = 5 - failedAttempts;
  return {
    success: false,
    error: `رمز اشتباه — ${left} تلاش باقی‌مانده`,
    attemptsLeft: left,
  };
}

export async function unlockBiometric(): Promise<{ success: boolean; error?: string }> {
  const config = loadConfig();
  if (!config.biometricEnabled) {
    return { success: false, error: 'بیومتریک فعال نیست' };
  }

  try {
    const w = window as any;
    const plugin = w.Capacitor?.Plugins?.NativeBiometric;
    if (!plugin) return { success: false, error: 'بیومتریک در دسترس نیست' };

    await plugin.verifyIdentity({
      reason: 'برای ورود به دیوان',
      title: 'ورود با اثر انگشت',
      subtitle: 'انگشت خود را روی سنسور قرار دهید',
    });

    saveState({ locked: false, failedAttempts: 0, lastUnlockAt: new Date().toISOString() });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'تأیید هویت ناموفق' };
  }
}

export function lockNow(): void {
  const config = loadConfig();
  if (!config.enabled) return;
  saveState({ ...loadState(), locked: true });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('divan-lock-changed', { detail: true }));
  }
}

export async function verifyRecoveryCode(code: string): Promise<boolean> {
  const recovery = loadRecovery();
  if (!recovery) return false;
  const normalized = normalizeRecoveryCode(code);
  return verifyPassword(normalized, recovery.codeHash, recovery.codeSalt, 50000);
}

export async function resetLockWithRecoveryCode(
  code: string,
  newSecret: string,
  method: LockMethod
): Promise<{ success: boolean; error?: string }> {
  const ok = await verifyRecoveryCode(code);
  if (!ok) return { success: false, error: 'کد بازیابی اشتباه است' };

  const salt = generateSalt();
  const hash = await hashPassword(newSecret, salt);
  saveCred({ hash, salt, iterations: 100000 });

  const config = loadConfig();
  config.lastChangedAt = new Date().toISOString();
  config.method = method;
  saveConfig(config);

  saveState({ locked: false, failedAttempts: 0, lastUnlockAt: new Date().toISOString() });

  return { success: true };
}

/**
 * چک قفل در استارت اپ
 * - اگر از آخرین unlock بیشتر از autoLockDelay گذشته → قفل شود
 * - در حالت «فوری» → همیشه قفل شود (اگر ۵ ثانیه گذشته باشد)
 */
export function checkStartupLock(): boolean {
  const config = loadConfig();
  if (!config.enabled) return false;

  const state = loadState();
  if (state.locked) return true;

  if (config.autoLockDelay === 'never') return false;

  // اگر lastUnlockAt نیست، یعنی بعد از فعال‌سازی هنوز باز نشده → باید قفل باشد
  if (!state.lastUnlockAt) {
    saveState({ ...state, locked: true });
    return true;
  }

  const elapsed = Date.now() - new Date(state.lastUnlockAt).getTime();

  const thresholdMs = config.autoLockDelay === 'immediate'
    ? 5000
    : (config.autoLockDelay as number) * 60 * 1000;

  if (elapsed > thresholdMs) {
    saveState({ ...state, locked: true });
    return true;
  }

  return false;
}

export function wipeAllAndReset(): void {
  localStorage.clear();
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export function getLockInfo(): {
  enabled: boolean;
  method: LockMethod;
  autoLockDelay: AutoLockDelay;
  hint?: string;
  createdAt: string;
  lastChangedAt: string;
} {
  const config = loadConfig();
  return {
    enabled: config.enabled,
    method: config.method,
    autoLockDelay: config.autoLockDelay,
    hint: config.hint,
    createdAt: config.createdAt,
    lastChangedAt: config.lastChangedAt,
  };
}

export function hasRecoveryInfo(): boolean {
  return !!loadRecovery();
}

export function getRecoveryCreatedAt(): string | null {
  return loadRecovery()?.createdAt || null;
}
