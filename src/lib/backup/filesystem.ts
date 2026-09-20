import { logError, logWarn, logInfo } from '../error-logger';

/**
 * لایه دسترسی به فایل‌سیستم
 * - ساده، بدون hang، بدون Share خودکار
 */

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

const getCapacitorFilesystem = () => {
  const w = window as any;
  return w.Capacitor?.Plugins?.Filesystem ?? w.Capacitor?.Filesystem ?? null;
};

const getCapacitorDirectories = (): string[] => {
  const w = window as any;
  const dirObj =
    w.Capacitor?.Plugins?.Directory ??
    w.Capacitor?.Filesystem?.Directory ??
    w.Capacitor?.Directory ??
    {};

  const dirs: string[] = [];
  for (const key of ['External', 'Documents', 'Data', 'Cache']) {
    const value = dirObj[key];
    if (value != null && !dirs.includes(value)) {
      dirs.push(value);
    }
  }

  return dirs;
};

export async function requestStoragePermission(): Promise<boolean> {
  return true;
}

/** wrapper با timeout برای جلوگیری از hang */
function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<any> {
  return Promise.race([
    p as Promise<any>,
    new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout: ${name}`)), ms)
    ),
  ]);
}

export async function saveToDevice(
  filename: string,
  content: string,
  _mimeType = 'application/octet-stream'
): Promise<SaveResult | null> {
  if (!isCapacitor()) {
    return downloadInBrowser(filename, content, _mimeType);
  }

  const filesystem = getCapacitorFilesystem();
  const dirs = getCapacitorDirectories();

  if (!filesystem || dirs.length === 0) {
    logWarn('backup', 'Filesystem or directory API unavailable in this Capacitor environment', {
      hasFilesystem: !!filesystem,
      dirs,
    });
    return downloadInBrowser(filename, content, _mimeType);
  }

  const w = window as any;
  const { Encoding } = w.Capacitor?.Plugins || {};

  for (const dir of dirs) {
    try {
      const result = await withTimeout(
        filesystem.writeFile({
          path: `${BACKUP_DIR}/${filename}`,
          data: content,
          directory: dir,
          encoding: Encoding?.UTF8 || 'utf8',
          recursive: true,
        }),
        15000,
        `writeFile-${dir}`
      );
      logInfo('backup', 'saved backup to native dir', { dir, uri: result?.uri });
      return { path: result.uri, filename, size: content.length };
    } catch (err: any) {
      logWarn('backup', `dir failed: ${dir}`, { err: err?.message });
    }
  }

  logError('backup', 'saveToDevice: all directories failed', { dirs });
  return downloadInBrowser(filename, content, _mimeType);
}

export async function readFromDevice(path: string): Promise<string | null> {
  if (!isCapacitor()) return null;
  try {
    const w = window as any;
    const filesystem = getCapacitorFilesystem();
    const { Encoding } = w.Capacitor?.Plugins || {};
    if (!filesystem) return null;
    const result = await filesystem.readFile({ path, encoding: Encoding?.UTF8 || 'utf8' });
    return typeof result.data === 'string' ? result.data : null;
  } catch {
    return null;
  }
}

export async function readBackupFile(filename: string): Promise<string | null> {
  if (!isCapacitor()) return null;

  const w = window as any;
  const filesystem = getCapacitorFilesystem();
  const { Encoding } = w.Capacitor?.Plugins || {};
  if (!filesystem) return null;

  for (const dir of getCapacitorDirectories()) {
    try {
      const result = await withTimeout(
        filesystem.readFile({
          path: `${BACKUP_DIR}/${filename}`,
          directory: dir,
          encoding: Encoding?.UTF8 || 'utf8',
        }),
        10000,
        `read-${dir}`
      );
      if (typeof result.data === 'string') return result.data;
    } catch {
      /* next */
    }
  }
  return null;
}

export async function listBackups(): Promise<{ name: string; uri: string; size: number; mtime: number }[]> {
  if (!isCapacitor()) return [];

  const filesystem = getCapacitorFilesystem();
  if (!filesystem) return [];

  for (const dir of getCapacitorDirectories()) {
    try {
      const result = await withTimeout(
        filesystem.readdir({ path: BACKUP_DIR, directory: dir }),
        10000,
        `readdir-${dir}`
      );
      const files = (result.files || []).filter((f: any) => f.name?.endsWith('.divan'));
      if (files.length > 0) {
        return files.map((f: any) => ({
          name: f.name,
          uri: `${BACKUP_DIR}/${f.name}`,
          size: f.size || 0,
          mtime: f.mtime || 0,
        }));
      }
    } catch {
      /* next */
    }
  }
  return [];
}

export async function deleteBackup(path: string): Promise<boolean> {
  if (!isCapacitor()) return false;

  const filesystem = getCapacitorFilesystem();
  if (!filesystem) return false;

  for (const dir of getCapacitorDirectories()) {
    try {
      await filesystem.deleteFile({ path, directory: dir });
      return true;
    } catch {
      /* next */
    }
  }
  return false;
}

export async function shareFile(path: string, title = 'بکاپ دیوان'): Promise<boolean> {
  if (!isCapacitor()) return false;
  try {
    const w = window as any;
    const { Share } = w.Capacitor?.Plugins || {};
    if (!Share) return false;
    await Share.share({ title, url: path, dialogTitle: 'اشتراک‌گذاری بکاپ' });
    return true;
  } catch {
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
    return { path: filename, filename, size: content.length };
  } catch {
    return null;
  }
}

export { isCapacitor };
