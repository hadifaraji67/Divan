/**
 * Helper برای اشتراک‌گذاری فایل با رویکرد صحیح
 */
import { Capacitor } from '@capacitor/core';
import { Directory } from '@capacitor/filesystem';
import { logError, logWarn, logInfo } from '../error-logger';

export async function shareBackupFile(uri: string, filename: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const w = window as any;
  const Share = w.Capacitor?.Plugins?.Share;
  const Filesystem = w.Capacitor?.Plugins?.Filesystem;

  if (!Share) {
    logError('backup', 'Share plugin نیست');
    return false;
  }

  logInfo('backup', 'شروع اشتراک', { uri, filename });

  // اطمینان از file:// URI کامل
  let fileUri = uri;
  if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
    if (Filesystem) {
      for (const dir of [Directory.Documents, Directory.External, Directory.Data].filter(Boolean)) {
        try {
          const r = await Filesystem.getUri({
            path: `Divan-Backups/${filename}`,
            directory: dir,
          });
          if (r?.uri) {
            fileUri = r.uri;
            break;
          }
        } catch {}
      }
    }
  }

  logInfo('backup', 'URI نهایی', { fileUri });

  // روش ۱: با url — استاندارد Capacitor
  try {
    await Share.share({
      title: 'بکاپ دیوان',
      text: `بکاپ دیوان — ${filename}`,
      url: fileUri,
      dialogTitle: 'اشتراک‌گذاری بکاپ',
    });
    logInfo('backup', '✅ share موفق (url)');
    return true;
  } catch (e1: any) {
    logWarn('backup', 'url fail', { err: e1?.message });
  }

  // روش ۲: با files — Capacitor 6+
  try {
    await Share.share({
      title: 'بکاپ دیوان',
      files: [fileUri],
      dialogTitle: 'اشتراک‌گذاری بکاپ',
    });
    logInfo('backup', '✅ share موفق (files)');
    return true;
  } catch (e2: any) {
    logWarn('backup', 'files fail', { err: e2?.message });
  }

  logError('backup', '❌ همه روش‌ها fail', { fileUri });
  return false;
}
