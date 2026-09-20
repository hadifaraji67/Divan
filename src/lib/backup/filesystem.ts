/**
 * لایه دسترسی به فایل‌سیستم
 * - استفاده از API رسمی @capacitor/filesystem
 * - در مرورگر: دانلود
 */

import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { logError, logWarn, logInfo } from '../error-logger';

export interface SaveResult {
  path: string;
  filename: string;
  size: number;
}

const isCapacitor = (): boolean => {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.Capacitor?.isNativePlatform?.() || w.Capacitor?.platform);
};

const BACKUP_DIR = 'Divan-Backups';

const BACKUP_DIRECTORIES = [
  Directory.Data,
  Directory.Documents,
  Directory.Cache,
].filter(Boolean) as Directory[];

export async function requestStoragePermission(): Promise<boolean> {
  return true;
}

function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout: ${name}`)), ms)
    ),
  ]);
}

export async function saveToDevice(
  filename: string,
  content: string,
  mimeType = 'application/octet-stream'
): Promise<SaveResult | null> {
  if (!isCapacitor()) {
    return downloadInBrowser(filename, content, mimeType);
  }

  for (const directory of BACKUP_DIRECTORIES) {
    try {
      const result = await withTimeout(
        Filesystem.writeFile({
          path: `${BACKUP_DIR}/${filename}`,
          data: content,
          directory,
          encoding: Encoding.UTF8,
          recursive: true,
        }),
        15000,
        `write-${directory}`
      );

      logInfo('backup', 'saved backup to native directory', {
        directory,
        uri: result.uri,
      });
      return { path: result.uri, filename, size: content.length };
    } catch (err: any) {
      logWarn('backup', `directory failed: ${directory}`, {
        err: err?.message,
      });
    }
  }

  logError('backup', 'saveToDevice: all directories failed', { filename });
  return downloadInBrowser(filename, content, mimeType);
}

export async function readFromDevice(path: string): Promise<string | null> {
  if (!isCapacitor()) return null;

  try {
    const result = await Filesystem.readFile({
      path,
      encoding: Encoding.UTF8,
    });
    return typeof result.data === 'string' ? result.data : null;
  } catch (err: any) {
    logError('backup', 'readFromDevice failed', { path }, err);
    return null;
  }
}

export async function readBackupFile(filename: string): Promise<string | null> {
  if (!isCapacitor()) return null;

  for (const directory of BACKUP_DIRECTORIES) {
    try {
      const result = await withTimeout(
        Filesystem.readFile({
          path: `${BACKUP_DIR}/${filename}`,
          directory,
          encoding: Encoding.UTF8,
        }),
        10000,
        `read-${directory}`
      );
      if (typeof result.data === 'string') return result.data;
    } catch {
      /* try the next directory */
    }
  }

  return null;
}

export async function listBackups(): Promise<
  { name: string; uri: string; size: number; mtime: number }[]
> {
  if (!isCapacitor()) return [];

  for (const directory of BACKUP_DIRECTORIES) {
    try {
      const result = await withTimeout(
        Filesystem.readdir({ path: BACKUP_DIR, directory }),
        10000,
        `readdir-${directory}`
      );
      const files = (result.files || []).filter((file: any) =>
        file.name?.endsWith('.divan')
      );

      if (files.length > 0) {
        return files.map((file: any) => ({
          name: file.name,
          uri: `${BACKUP_DIR}/${file.name}`,
          size: file.size || 0,
          mtime: file.mtime || 0,
        }));
      }
    } catch {
      /* try the next directory */
    }
  }

  return [];
}

export async function deleteBackup(path: string): Promise<boolean> {
  if (!isCapacitor()) return false;

  for (const directory of BACKUP_DIRECTORIES) {
    try {
      await Filesystem.deleteFile({ path, directory });
      return true;
    } catch {
      /* try the next directory */
    }
  }

  return false;
}

export async function shareFile(
  path: string,
  title = 'بکاپ دیوان'
): Promise<boolean> {
  if (!isCapacitor()) return false;

  try {
    const Share = (window as any).Capacitor?.Plugins?.Share;
    if (!Share) return false;
    await Share.share({
      title,
      url: path,
      dialogTitle: 'اشتراک‌گذاری بکاپ',
    });
    return true;
  } catch {
    return false;
  }
}

function downloadInBrowser(
  filename: string,
  content: string,
  mimeType: string
): SaveResult | null {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { path: filename, filename, size: content.length };
  } catch {
    return null;
  }
}

export { isCapacitor };
