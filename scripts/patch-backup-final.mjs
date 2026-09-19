import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/backup/filesystem.ts';
const newFile = `/**
 * لایه دسترسی به فایل‌سیستم
 * - در APK: Directory.External + Share
 * - در مرورگر: دانلود
 */

export interface SaveResult {
  path: string;
  filename: string;
  size: number;
  shared?: boolean;
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

export async function saveToDevice(
  filename: string,
  content: string,
  mimeType = 'application/octet-stream'
): Promise<SaveResult | null> {
  if (isCapacitor()) {
    try {
      const w = window as any;
      const { Filesystem, Directory, Encoding, Share } = w.Capacitor?.Plugins || {};
      if (!Filesystem) return null;

      let uri = '';
      try {
        const result = await Filesystem.writeFile({
          path: \`\${BACKUP_DIR}/\${filename}\`,
          data: content,
          directory: Directory.External,
          encoding: Encoding?.UTF8 || 'utf8',
          recursive: true,
        });
        uri = result.uri;
      } catch (err) {
        console.error('[FS] external failed, fallback to Data:', err);
        const result = await Filesystem.writeFile({
          path: \`\${BACKUP_DIR}/\${filename}\`,
          data: content,
          directory: Directory.Data,
          encoding: Encoding?.UTF8 || 'utf8',
        });
        uri = result.uri;
      }

      let shared = false;
      if (Share?.share && uri) {
        try {
          await Share.share({
            title: 'بکاپ دیوان',
            url: uri,
            dialogTitle: 'ذخیره بکاپ در...',
          });
          shared = true;
        } catch (shareErr) {
          console.warn('[FS] share canceled');
        }
      }

      return { path: uri, filename, size: content.length, shared };
    } catch (err) {
      console.error('[FS] saveToDevice error:', err);
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
    const result = await Filesystem.readFile({ path, encoding: Encoding?.UTF8 || 'utf8' });
    return typeof result.data === 'string' ? result.data : null;
  } catch (err) {
    console.error('[FS] read error:', err);
    return null;
  }
}

export async function readBackupFile(filename: string): Promise<string | null> {
  if (!isCapacitor()) return null;
  const w = window as any;
  const { Filesystem, Encoding, Directory } = w.Capacitor?.Plugins || {};
  if (!Filesystem) return null;

  for (const dir of [Directory.External, Directory.Data]) {
    try {
      const result = await Filesystem.readFile({
        path: \`\${BACKUP_DIR}/\${filename}\`,
        directory: dir,
        encoding: Encoding?.UTF8 || 'utf8',
      });
      if (typeof result.data === 'string') return result.data;
    } catch {}
  }
  return null;
}

export async function listBackups(): Promise<{ name: string; uri: string; size: number; mtime: number }[]> {
  if (!isCapacitor()) return [];
  const w = window as any;
  const { Filesystem, Directory } = w.Capacitor?.Plugins || {};
  if (!Filesystem) return [];

  for (const dir of [Directory.External, Directory.Data]) {
    try {
      const result = await Filesystem.readdir({ path: BACKUP_DIR, directory: dir });
      const files = (result.files || []).filter((f: any) => f.name?.endsWith('.divan'));
      if (files.length > 0) {
        return files.map((f: any) => ({
          name: f.name,
          uri: \`\${BACKUP_DIR}/\${f.name}\`,
          size: f.size || 0,
          mtime: f.mtime || 0,
        }));
      }
    } catch {}
  }
  return [];
}

export async function deleteBackup(path: string): Promise<boolean> {
  if (!isCapacitor()) return false;
  const w = window as any;
  const { Filesystem, Directory } = w.Capacitor?.Plugins || {};
  if (!Filesystem) return false;
  for (const dir of [Directory.External, Directory.Data]) {
    try {
      await Filesystem.deleteFile({ path, directory: dir });
      return true;
    } catch {}
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
`;

writeFileSync(file, newFile);
console.log('✅ filesystem.ts با Directory.External + Share');
