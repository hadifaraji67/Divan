import { useEffect, useState, useCallback } from 'react';
import { createBackup } from './backup-core';
import { saveToDevice, listBackups, deleteBackup, isCapacitor, requestStoragePermission } from './filesystem';

const SETTINGS_KEY = 'divan_backup_settings';
const LAST_RUN_KEY = 'divan_backup_last_run';
const RETENTION_DAYS = 30;
const CHECK_INTERVAL_MS = 1000 * 60 * 60; // هر ساعت چک کن

export interface BackupSettings {
  autoEnabled: boolean;
  password: string;
  lastBackupAt?: string;
  keepDays: number;
}

const DEFAULT_SETTINGS: BackupSettings = {
  autoEnabled: true,
  password: '',
  keepDays: 30,
};

export function loadBackupSettings(): BackupSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveBackupSettings(s: Partial<BackupSettings>): void {
  const current = loadBackupSettings();
  const updated = { ...current, ...s };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}

function shouldRunAutoBackup(): boolean {
  const settings = loadBackupSettings();
  if (!settings.autoEnabled) return false;

  const lastRun = localStorage.getItem(LAST_RUN_KEY);
  if (!lastRun) return true;

  const lastTime = Number(lastRun);
  const now = Date.now();
  const hoursSince = (now - lastTime) / (1000 * 60 * 60);

  return hoursSince >= 24;
}

async function cleanupOldBackups() {
  if (!isCapacitor()) return;

  try {
    const backups = await listBackups();
    const settings = loadBackupSettings();
    const keepDays = settings.keepDays || RETENTION_DAYS;
    const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;

    for (const backup of backups) {
      // mtime در ثانیه است (اندروید)
      const mtimeMs = backup.mtime > 10000000000 ? backup.mtime : backup.mtime * 1000;
      if (mtimeMs < cutoff) {
        await deleteBackup(backup.uri);
        console.log(`[backup] حذف بکاپ قدیمی: ${backup.name}`);
      }
    }
  } catch (err) {
    console.error('[backup] cleanup error:', err);
  }
}

/**
 * اجرای یک باره بکاپ
 */
export async function runBackup(options?: { password?: string; silent?: boolean }): Promise<{
  success: boolean;
  error?: string;
  filename?: string;
  size?: number;
  encrypted?: boolean;
}> {
  try {
    const settings = loadBackupSettings();
    const password = options?.password !== undefined ? options.password : settings.password;

    // درخواست مجوز (فقط در APK)
    if (isCapacitor()) {
      await requestStoragePermission();
    }

    const result = await createBackup(password);
    const saved = await saveToDevice(result.filename, result.content, 'application/octet-stream');

    if (!saved) {
      return { success: false, error: 'ذخیره فایل بکاپ ناموفق بود' };
    }

    // بروزرسانی زمان آخرین اجرا
    localStorage.setItem(LAST_RUN_KEY, String(Date.now()));
    saveBackupSettings({ lastBackupAt: new Date().toISOString() });

    // پاک‌سازی قدیمی‌ها
    await cleanupOldBackups();

    return {
      success: true,
      filename: result.filename,
      size: result.size,
      encrypted: result.encrypted,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'خطای ناشناخته',
    };
  }
}

/**
 * هوک بکاپ خودکار
 * در پس‌زمینه چک می‌کند آیا ۲۴ ساعت گذشته یا نه
 */
export function useAutoBackup() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const checkAndRun = useCallback(async (silent = true) => {
    if (!shouldRunAutoBackup()) return;

    setIsRunning(true);
    try {
      const result = await runBackup({ silent });
      setLastResult(result);
      if (!silent) {
        console.log('[backup] نتیجه:', result);
      }
    } finally {
      setIsRunning(false);
    }
  }, []);

  useEffect(() => {
    // چک اولیه بعد از ۵ ثانیه (اجازه بده UI لود شود)
    const initialTimer = setTimeout(() => checkAndRun(true), 5000);

    // چک دوره‌ای هر ساعت
    const interval = setInterval(() => checkAndRun(true), CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [checkAndRun]);

  return {
    isRunning,
    lastResult,
    runNow: (password?: string) => runBackup({ password, silent: false }),
    checkAndRun,
  };
}
