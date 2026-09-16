/**
 * جستجوی بکاپ‌های موجود در گوشی
 */

import { listBackups, readBackupFile } from './filesystem';
import { inspectBackup } from './backup-core';

export interface DiscoveredBackup {
  filename: string;
  uri: string;
  size: number;
  mtime: number;
  createdAt?: string;
  appVersion?: string;
  encrypted: boolean;
  stats?: any;
  valid: boolean;
  error?: string;
}

/**
 * جستجوی همه بکاپ‌ها + خواندن metadata
 */
export async function discoverBackups(): Promise<DiscoveredBackup[]> {
  const files = await listBackups();

  const discovered: DiscoveredBackup[] = [];

  for (const file of files) {
    try {
      const content = await readBackupFile(file.name);
      if (!content) {
        discovered.push({
          filename: file.name,
          uri: file.uri,
          size: file.size,
          mtime: file.mtime,
          encrypted: false,
          valid: false,
          error: 'فایل قابل خواندن نیست',
        });
        continue;
      }

      const meta = inspectBackup(content);

      discovered.push({
        filename: file.name,
        uri: file.uri,
        size: file.size,
        mtime: file.mtime,
        createdAt: meta.createdAt,
        appVersion: meta.appVersion,
        encrypted: meta.encrypted,
        stats: meta.stats,
        valid: meta.valid,
        error: meta.error,
      });
    } catch (err: any) {
      discovered.push({
        filename: file.name,
        uri: file.uri,
        size: file.size,
        mtime: file.mtime,
        encrypted: false,
        valid: false,
        error: err.message,
      });
    }
  }

  // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
  return discovered.sort((a, b) => {
    const aTime = a.mtime > 10000000000 ? a.mtime : a.mtime * 1000;
    const bTime = b.mtime > 10000000000 ? b.mtime : b.mtime * 1000;
    return bTime - aTime;
  });
}

/**
 * بازگردانی محتوای یک بکاپ
 */
export async function loadBackupContent(filename: string): Promise<string | null> {
  return readBackupFile(filename);
}

/**
 * فرمت حجم
 */
export function formatSize(bytes: number, persian = true): string {
  const fa = (n: number | string) => {
    const s = String(n);
    if (!persian) return s;
    const digits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return s.replace(/[0-9]/g, d => digits[Number(d)]);
  };

  if (bytes < 1024) return `${fa(bytes)} B`;
  if (bytes < 1024 * 1024) return `${fa(Math.round(bytes / 1024))} KB`;
  return `${fa((bytes / 1024 / 1024).toFixed(1))} MB`;
}

/**
 * فرمت تاریخ از timestamp
 */
export function formatBackupDate(ms: number, persian = true): string {
  try {
    const d = new Date(ms > 10000000000 ? ms : ms * 1000);
    return d.toLocaleDateString('fa-IR') + ' — ' + d.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * دسته‌بندی: ۳ اخیر + قدیمی‌تر
 */
export function categorizeBackups(list: DiscoveredBackup[]): {
  recent: DiscoveredBackup[];
  older: DiscoveredBackup[];
} {
  return {
    recent: list.slice(0, 3),
    older: list.slice(3),
  };
}

/**
 * بررسی اینکه آیا پیشنهاد بازیابی نشان داده شده
 */
const DISMISSED_KEY = 'divan_backup_suggestion_dismissed';
const SETUP_KEY = 'divan_setup_completed';

export function wasSuggestionDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DISMISSED_KEY) === 'true';
}

export function dismissSuggestion(): void {
  localStorage.setItem(DISMISSED_KEY, 'true');
}

export function resetSuggestionDismissed(): void {
  localStorage.removeItem(DISMISSED_KEY);
}

/**
 * آیا باید صفحه بازیابی خودکار نشان داده شود؟
 */
export function shouldSuggestBackup(): boolean {
  if (typeof window === 'undefined') return false;
  // فقط اگر setup کامل نشده باشد
  return localStorage.getItem(SETUP_KEY) !== 'true';
}
