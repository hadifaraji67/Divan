/**
 * هسته بکاپ — استخراج، فشرده‌سازی، رمزنگاری
 */

import { gzipSync, gunzipSync, strToU8, strFromU8 } from 'fflate';
import { encrypt, decrypt, hash } from './crypto';

const STORAGE_PREFIX = 'divan_';
const BACKUP_VERSION = '1.0';
const APP_VERSION = '3.8.1';

export interface BackupPayload {
  version: string;
  appVersion: string;
  createdAt: string;
  encrypted: boolean;
  checksum?: string;
  data: Record<string, any>;
  stats: {
    contacts: number;
    products: number;
    invoices: number;
    payments: number;
    cheques: number;
    installments: number;
    cashbox: number;
    journalEntries: number;
  };
}

export function extractData(): Record<string, any> {
  const data: Record<string, any> = {};
  if (typeof window === 'undefined') return data;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

    const shortKey = key.slice(STORAGE_PREFIX.length);
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      data[shortKey] = JSON.parse(raw);
    } catch {
      data[shortKey] = raw;
    }
  }

  return data;
}

export function restoreData(data: Record<string, any>): number {
  if (typeof window === 'undefined') return 0;

  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    const fullKey = STORAGE_PREFIX + key;
    try {
      localStorage.setItem(fullKey, typeof value === 'string' ? value : JSON.stringify(value));
      count++;
    } catch (err) {
      console.error(`[backup] restore error for ${key}:`, err);
    }
  }

  return count;
}

function getStats(data: Record<string, any>) {
  const count = (key: string) => Array.isArray(data[key]) ? data[key].length : 0;
  return {
    contacts: count('contacts'),
    products: count('products'),
    invoices: count('invoices'),
    payments: count('payments'),
    cheques: count('cheques'),
    installments: count('installments'),
    cashbox: count('cashbox'),
    journalEntries: count('journal_entries'),
  };
}

export function buildPayload(): BackupPayload {
  const data = extractData();
  const stats = getStats(data);
  return {
    version: BACKUP_VERSION,
    appVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
    encrypted: false,
    data,
    stats,
  };
}

/**
 * تبدیل Uint8Array به base64 (برای حجم زیاد)
 */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function createBackup(password?: string): Promise<{
  filename: string;
  content: string;
  size: number;
  encrypted: boolean;
  stats: any;
}> {
  const payload = buildPayload();
  const json = JSON.stringify(payload);

  const compressed = gzipSync(strToU8(json));
  const compressedBase64 = uint8ToBase64(compressed);

  let finalContent: string;
  let encrypted = false;

  if (password && password.length > 0) {
    const checksum = await hash(json);
    const encryptedData = await encrypt(compressedBase64, password);

    const encryptedPayload = {
      __encrypted: true,
      version: BACKUP_VERSION,
      appVersion: APP_VERSION,
      createdAt: new Date().toISOString(),
      checksum,
      stats: payload.stats,
      blob: encryptedData,
    };

    finalContent = JSON.stringify(encryptedPayload);
    encrypted = true;
  } else {
    const plainPayload = {
      __encrypted: false,
      version: BACKUP_VERSION,
      appVersion: APP_VERSION,
      createdAt: new Date().toISOString(),
      stats: payload.stats,
      blob: compressedBase64,
    };

    finalContent = JSON.stringify(plainPayload);
  }

  const filename = `divan-backup-${formatDateForFilename(new Date())}.divan`;

  return {
    filename,
    content: finalContent,
    size: finalContent.length,
    encrypted,
    stats: payload.stats,
  };
}

export async function parseBackup(
  content: string,
  password?: string
): Promise<{ success: boolean; stats?: any; error?: string }> {
  try {
    const parsed = JSON.parse(content);

    if (!parsed.blob) {
      return { success: false, error: 'فایل بکاپ معتبر نیست' };
    }

    let jsonData: string;

    if (parsed.__encrypted) {
      if (!password) {
        return { success: false, error: 'این فایل رمزنگاری‌شده است — رمز را وارد کنید' };
      }

      let compressedBase64: string;
      try {
        compressedBase64 = await decrypt(parsed.blob, password);
      } catch {
        return { success: false, error: 'رمز اشتباه است یا فایل خراب شده' };
      }

      const compressed = base64ToUint8(compressedBase64);
      const decompressed = gunzipSync(compressed);
      jsonData = strFromU8(decompressed);

      if (parsed.checksum) {
        const currentChecksum = await hash(jsonData);
        if (currentChecksum !== parsed.checksum) {
          return { success: false, error: 'فایل دست‌کاری شده است' };
        }
      }
    } else {
      try {
        const compressed = base64ToUint8(parsed.blob);
        const decompressed = gunzipSync(compressed);
        jsonData = strFromU8(decompressed);
      } catch {
        return { success: false, error: 'خطا در باز کردن فایل فشرده' };
      }
    }

    const payload: BackupPayload = JSON.parse(jsonData);

    if (!payload.data || typeof payload.data !== 'object') {
      return { success: false, error: 'ساختار داده معتبر نیست' };
    }

    const count = restoreData(payload.data);

    return {
      success: true,
      stats: { ...payload.stats, restoredKeys: count },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'خطای ناشناخته' };
  }
}

function formatDateForFilename(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}-${h}${min}`;
}

export function inspectBackup(content: string): {
  valid: boolean;
  encrypted: boolean;
  createdAt?: string;
  appVersion?: string;
  stats?: any;
  error?: string;
} {
  try {
    const parsed = JSON.parse(content);
    if (!parsed.blob) {
      return { valid: false, encrypted: false, error: 'فایل معتبر نیست' };
    }
    return {
      valid: true,
      encrypted: !!parsed.__encrypted,
      createdAt: parsed.createdAt,
      appVersion: parsed.appVersion,
      stats: parsed.stats,
    };
  } catch {
    return { valid: false, encrypted: false, error: 'فایل قابل خواندن نیست' };
  }
}
