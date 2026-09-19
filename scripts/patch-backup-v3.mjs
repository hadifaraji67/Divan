import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/backup/filesystem.ts';
const newFile = `/**
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

export async function requestStoragePermission(): Promise<boolean> {
  return true;
}

/** wrapper با timeout برای جلوگیری از hang */
function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(\`timeout: \${name}\`)), ms)),
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

  const w = window as any;
  const { Filesystem, Directory, Encoding } = w.Capacitor?.Plugins || {};
  if (!Filesystem) {
    console.error('[FS] Filesystem plugin not available');
    return null;
  }

  // ترتیب تلاش: External → Data → Cache
  const dirs = [Directory.External, Directory.Data, Directory.Cache].filter(Boolean);

  for (const dir of dirs) {
    try {
      console.log('[FS] trying dir:', dir);
      const result = await withTimeout(
        Filesystem.writeFile({
          path: \`\${BACKUP_DIR}/\${filename}\`,
          data: content,
          directory: dir,
          encoding: Encoding?.UTF8 || 'utf8',
          recursive: true,
        }),
        15000,
        \`writeFile-\${dir}\`
      );
      console.log('[FS] ✅ saved to', dir, result.uri);
      return { path: result.uri, filename, size: content.length };
    } catch (err: any) {
      console.warn('[FS] failed dir', dir, ':', err?.message);
    }
  }

  console.error('[FS] saveToDevice: all directories failed');
  return null;
}

export async function readFromDevice(path: string): Promise<string | null> {
  if (!isCapacitor()) return null;
  try {
    const w = window as any;
    const { Filesystem, Encoding } = w.Capacitor?.Plugins || {};
    if (!Filesystem) return null;
    const result = await Filesystem.readFile({ path, encoding: Encoding?.UTF8 || 'utf8' });
    return typeof result.data === 'string' ? result.data : null;
  } catch {
    return null;
  }
}

export async function readBackupFile(filename: string): Promise<string | null> {
  if (!isCapacitor()) return null;
  const w = window as any;
  const { Filesystem, Encoding, Directory } = w.Capacitor?.Plugins || {};
  if (!Filesystem) return null;

  for (const dir of [Directory.External, Directory.Data, Directory.Cache].filter(Boolean)) {
    try {
      const result = await withTimeout(
        Filesystem.readFile({
          path: \`\${BACKUP_DIR}/\${filename}\`,
          directory: dir,
          encoding: Encoding?.UTF8 || 'utf8',
        }),
        10000,
        \`read-\${dir}\`
      );
      if (typeof result.data === 'string') return result.data;
    } catch { /* next */ }
  }
  return null;
}

export async function listBackups(): Promise<{ name: string; uri: string; size: number; mtime: number }[]> {
  if (!isCapacitor()) return [];
  const w = window as any;
  const { Filesystem, Directory } = w.Capacitor?.Plugins || {};
  if (!Filesystem) return [];

  for (const dir of [Directory.External, Directory.Data, Directory.Cache].filter(Boolean)) {
    try {
      const result = await withTimeout(
        Filesystem.readdir({ path: BACKUP_DIR, directory: dir }),
        10000,
        \`readdir-\${dir}\`
      );
      const files = (result.files || []).filter((f: any) => f.name?.endsWith('.divan'));
      if (files.length > 0) {
        return files.map((f: any) => ({
          name: f.name,
          uri: \`\${BACKUP_DIR}/\${f.name}\`,
          size: f.size || 0,
          mtime: f.mtime || 0,
        }));
      }
    } catch { /* next */ }
  }
  return [];
}

export async function deleteBackup(path: string): Promise<boolean> {
  if (!isCapacitor()) return false;
  const w = window as any;
  const { Filesystem, Directory } = w.Capacitor?.Plugins || {};
  if (!Filesystem) return false;
  for (const dir of [Directory.External, Directory.Data, Directory.Cache].filter(Boolean)) {
    try {
      await Filesystem.deleteFile({ path, directory: dir });
      return true;
    } catch { /* next */ }
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
`;
writeFileSync(file, newFile);
console.log('✅ filesystem.ts با timeout + 3 fallback + بدون Share خودکار');
