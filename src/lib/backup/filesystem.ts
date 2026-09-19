/**
 * لایه دسترسی به فایل‌سیستم
 * - در APK: Capacitor Filesystem
 * - در مرورگر: دانلود
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

export async function requestStoragePermission(): Promise<boolean> {
  if (!isCapacitor()) return true;
  try {
    const w = window as any;
    const { Filesystem } = w.Capacitor?.Plugins || {};
    if (!Filesystem) return false;
    if (Filesystem.requestPermissions) {
      await Filesystem.requestPermissions();
    }
    return true;
  } catch (err) {
    console.error('[FS] permission error:', err);
    return false;
  }
}

export async function saveToDevice(
  filename: string,
  content: string,
  mimeType = 'application/octet-stream'
): Promise<SaveResult | null> {
  if (isCapacitor()) {
    try {
      const w = window as any;
      const { Filesystem, Directory, Encoding } = w.Capacitor?.Plugins || {};
      if (!Filesystem) return null;

      // ساخت پوشه
      try {
        await Filesystem.mkdir({
          path: BACKUP_DIR,
          directory: Directory.Documents || 'DOCUMENTS',
          recursive: true,
        });
      } catch { /* exists */ }

      const result = await Filesystem.writeFile({
        path: `${BACKUP_DIR}/${filename}`,
        data: content,
        directory: Directory.Documents || 'DOCUMENTS',
        encoding: Encoding?.UTF8 || 'utf8',
      });

      return { path: result.uri, filename, size: content.length };
    } catch (err) {
      console.error('[FS] save error:', err);
      return null;
    }
  }

  return downloadInBrowser(filename, content, mimeType);
}

export async function readFromDevice(path: string): Promise<string | null> {
  if (!isCapacitor()) return null;
  try {
    const w = window as any;
    const { Filesystem, Encoding } = w.Capacitor?.Plugins || {};
    if (!Filesystem) return null;

    const result = await Filesystem.readFile({
      path,
      encoding: Encoding?.UTF8 || 'utf8',
    });

    return typeof result.data === 'string' ? result.data : null;
  } catch (err) {
    console.error('[FS] read error:', err);
    return null;
  }
}

/**
 * خواندن محتوای یک فایل بکاپ از روی گوشی
 */
export async function readBackupFile(filename: string): Promise<string | null> {
  if (!isCapacitor()) return null;

  try {
    const w = window as any;
    const { Filesystem, Encoding, Directory } = w.Capacitor?.Plugins || {};
    if (!Filesystem) return null;

    const result = await Filesystem.readFile({
      path: `${BACKUP_DIR}/${filename}`,
      directory: Directory.Documents || 'DOCUMENTS',
      encoding: Encoding?.UTF8 || 'utf8',
    });

    return typeof result.data === 'string' ? result.data : null;
  } catch (err) {
    console.error('[FS] readBackupFile error:', err);
    return null;
  }
}

export async function listBackups(): Promise<{ name: string; uri: string; size: number; mtime: number }[]> {
  if (!isCapacitor()) return [];
  try {
    const w = window as any;
    const { Filesystem, Directory } = w.Capacitor?.Plugins || {};
    if (!Filesystem) return [];

    const result = await Filesystem.readdir({
      path: BACKUP_DIR,
      directory: Directory.Documents || 'DOCUMENTS',
    });

    const files = (result.files || []).filter((f: any) => f.name?.endsWith('.divan'));

    return files.map((f: any) => ({
      name: f.name,
      uri: `${BACKUP_DIR}/${f.name}`,
      size: f.size || 0,
      mtime: f.mtime || 0,
    }));
  } catch (err) {
    console.error('[FS] list error:', err);
    return [];
  }
}

export async function deleteBackup(path: string): Promise<boolean> {
  if (!isCapacitor()) return false;
  try {
    const w = window as any;
    const { Filesystem, Directory } = w.Capacitor?.Plugins || {};
    if (!Filesystem) return false;

    await Filesystem.deleteFile({
      path,
      directory: Directory.Documents || 'DOCUMENTS',
    });
    return true;
  } catch (err) {
    console.error('[FS] delete error:', err);
    return false;
  }
}

export async function shareFile(path: string, title = 'بکاپ دیوان'): Promise<boolean> {
  if (!isCapacitor()) return false;
  try {
    const w = window as any;
    const { Share } = w.Capacitor?.Plugins || {};
    if (!Share) return false;

    await Share.share({ title, url: path, dialogTitle: 'اشتراک‌گذاری بکاپ' });
    return true;
  } catch (err) {
    console.error('[FS] share error:', err);
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
  } catch (err) {
    console.error('[download] error:', err);
    return null;
  }
}

export { isCapacitor };
