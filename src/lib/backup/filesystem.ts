/**
 * لایه دسترسی به فایل‌سیستم
 * - اولویت: Documents (عمومی) → External (اپ) → Data (خصوصی)
 */

import { Directory, Encoding } from '@capacitor/filesystem';
import { logError, logWarn, logInfo } from '../error-logger';

export interface SaveResult {
  path: string;
  filename: string;
  size: number;
  directory: string;
}

export interface StoredBackup {
  name: string;
  uri: string;
  size: number;
  mtime: number;
}

const isCapacitor = (): boolean => {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.Capacitor?.isNativePlatform?.() || w.Capacitor?.platform);
};

const getFilesystem = (): any => {
  const w = window as any;
  return w.Capacitor?.Plugins?.Filesystem;
};

const BACKUP_DIR = 'Divan-Backups';

const TRY_DIRS = (): Directory[] => {
  const w = window as any;
  const Filesystem = w.Capacitor?.Plugins?.Filesystem;
  if (!Filesystem) return [];
  return [Directory.Documents, Directory.External, Directory.Data].filter(Boolean) as Directory[];
};

const DIR_NAME: Record<string, string> = {};
DIR_NAME[Directory.Documents] = 'DOCUMENTS';
DIR_NAME[Directory.External] = 'EXTERNAL';
DIR_NAME[Directory.Data] = 'DATA';

function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<any> {
  return Promise.race([
    p as Promise<any>,
    new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout: ${name}`)), ms)
    ),
  ]);
}

export async function requestStoragePermission(): Promise<boolean> {
  return true;
}

export async function saveToDevice(
  filename: string,
  content: string,
  mimeType = 'application/octet-stream'
): Promise<SaveResult | null> {
  if (!isCapacitor()) {
    return downloadInBrowser(filename, content, mimeType);
  }

  const Filesystem = getFilesystem();
  if (!Filesystem) {
    logError('backup', 'Filesystem plugin نیست');
    return null;
  }

  for (const dir of TRY_DIRS()) {
    try {
      const result = await withTimeout(
        Filesystem.writeFile({
          path: `${BACKUP_DIR}/${filename}`,
          data: content,
          directory: dir,
          encoding: Encoding.UTF8,
          recursive: true,
        }),
        15000,
        `write-${dir}`
      );

      const dirName = DIR_NAME[dir] || String(dir);
      logInfo('backup', `saved to ${dirName}`, { uri: result.uri });

      return {
        path: result.uri,
        filename,
        size: content.length,
        directory: dirName,
      };
    } catch (err: any) {
      logWarn('backup', `dir fail: ${dir}`, { err: err?.message });
    }
  }

  logError('backup', 'همه پوشه‌ها fail', { filename });
  return null;
}

export async function readFromDevice(path: string): Promise<string | null> {
  if (!isCapacitor()) return null;
  const Filesystem = getFilesystem();
  if (!Filesystem) return null;

  try {
    const result = await Filesystem.readFile({ path, encoding: Encoding.UTF8 });
    return typeof result.data === 'string' ? result.data : null;
  } catch (err: any) {
    logError('backup', 'read fail', { path }, err);
    return null;
  }
}

export async function readBackupFile(filename: string): Promise<string | null> {
  if (!isCapacitor()) return null;
  const Filesystem = getFilesystem();
  if (!Filesystem) return null;

  for (const dir of TRY_DIRS()) {
    try {
      const result = await withTimeout(
        Filesystem.readFile({
          path: `${BACKUP_DIR}/${filename}`,
          directory: dir,
          encoding: Encoding.UTF8,
        }),
        10000,
        `read-${dir}`
      );
      if (typeof result.data === 'string') return result.data;
    } catch {}
  }
  logError('backup', 'readBackupFile fail', { filename });
  return null;
}

export async function listBackups(): Promise<StoredBackup[]> {
  if (!isCapacitor()) return [];
  const Filesystem = getFilesystem();
  if (!Filesystem) return [];

  const seen = new Set<string>();
  const result: StoredBackup[] = [];

  for (const dir of TRY_DIRS()) {
    try {
      const readResult = await withTimeout(
        Filesystem.readdir({ path: BACKUP_DIR, directory: dir }),
        10000,
        `readdir-${dir}`
      );
      const files = (readResult.files || []).filter((f: any) => f.name?.endsWith('.divan'));

      for (const f of files) {
        if (seen.has(f.name)) continue;
        seen.add(f.name);

        let uri = `${BACKUP_DIR}/${f.name}`;
        try {
          const uriResult = await Filesystem.getUri({
            path: `${BACKUP_DIR}/${f.name}`,
            directory: dir,
          });
          uri = uriResult.uri;
        } catch (e: any) {
          logWarn('backup', 'getUri fail', { err: e?.message });
        }

        result.push({
          name: f.name,
          uri,
          size: f.size || 0,
          mtime: f.mtime || 0,
        });
      }
    } catch {}
  }

  return result;
}

export async function deleteBackup(path: string): Promise<boolean> {
  if (!isCapacitor()) return false;
  const Filesystem = getFilesystem();
  if (!Filesystem) return false;

  const filename = path.split('/').pop() || path;

  for (const dir of TRY_DIRS()) {
    try {
      await Filesystem.deleteFile({
        path: `${BACKUP_DIR}/${filename}`,
        directory: dir,
      });
      return true;
    } catch {}
  }
  return false;
}

export async function shareFile(uri: string, title = 'بکاپ دیوان'): Promise<boolean> {
  if (!isCapacitor()) return false;
  try {
    const w = window as any;
    const Share = w.Capacitor?.Plugins?.Share;
    if (!Share) {
      logWarn('backup', 'Share plugin نیست');
      return false;
    }

    logInfo('backup', 'sharing', { uri });

    // اطمینان از فرمت file://
    let shareUri = uri;
    if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
      const Filesystem = getFilesystem();
      const filename = uri.split('/').pop() || uri;
      if (Filesystem) {
        for (const dir of TRY_DIRS()) {
          try {
            const result = await Filesystem.getUri({
              path: `${BACKUP_DIR}/${filename}`,
              directory: dir,
            });
            if (result?.uri) {
              shareUri = result.uri;
              break;
            }
          } catch {}
        }
      }
    }

    // تلاش ۱: با url
    try {
      await Share.share({
        title,
        url: shareUri,
        dialogTitle: 'اشتراک‌گذاری بکاپ',
      });
      logInfo('backup', 'share موفق (url)');
      return true;
    } catch (err1: any) {
      logWarn('backup', 'url fail، تلاش با files', { err: err1?.message });

      // تلاش ۲: با files
      try {
        await Share.share({
          title,
          files: [shareUri],
          dialogTitle: 'اشتراک‌گذاری بکاپ',
        });
        logInfo('backup', 'share موفق (files)');
        return true;
      } catch (err2: any) {
        // تلاش ۳: فقط متن
        try {
          await Share.share({
            title,
            text: `مسیر فایل: ${shareUri}`,
            dialogTitle: 'اشتراک‌گذاری',
          });
          logInfo('backup', 'share با متن');
          return true;
        } catch (err3: any) {
          logError('backup', 'share fail کامل', { uri: shareUri }, err3);
          return false;
        }
      }
    }
  } catch (err: any) {
    logError('backup', 'share outer fail', { uri }, err);
    return false;
  }
}

function downloadInBrowser(filename: string, content: string, mimeType: string): SaveResult | null {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { path: filename, filename, size: content.length, directory: 'BROWSER' };
  } catch {
    return null;
  }
}

export { isCapacitor };
