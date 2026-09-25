/**
 * لایه مدیریت پیوست‌های فاکتور
 * - در اپ نیتیو (Capacitor): فایل واقعی روی دیسک ذخیره می‌شود (مثل backup/filesystem.ts)
 * - در وب/PWA: چون دسترسی مستقیم به فایل‌سیستم نیست، خود فایل به‌صورت base64 داخل رکورد ذخیره می‌شود
 */

import { Directory } from '@capacitor/filesystem';
import { logError, logWarn, logInfo } from './error-logger';
import { genId } from './storage';
import type { Attachment } from '../types/models';

const ATTACH_DIR = 'Divan-Attachments';

const isCapacitor = (): boolean => {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.Capacitor?.isNativePlatform?.() || w.Capacitor?.platform);
};

const getFilesystem = (): any => {
  const w = window as any;
  return w.Capacitor?.Plugins?.Filesystem;
};

const getCamera = (): any => {
  const w = window as any;
  return w.Capacitor?.Plugins?.Camera;
};

const TRY_DIRS = (): Directory[] => {
  const Filesystem = getFilesystem();
  if (!Filesystem) return [];
  return [Directory.Data, Directory.External, Directory.Documents].filter(Boolean) as Directory[];
};

const DIR_NAME: Record<string, string> = {};
DIR_NAME[Directory.Data] = 'DATA';
DIR_NAME[Directory.External] = 'EXTERNAL';
DIR_NAME[Directory.Documents] = 'DOCUMENTS';

function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<any> {
  return Promise.race([
    p as Promise<any>,
    new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout: ${name}`)), ms)
    ),
  ]);
}

function safeFileName(id: string, fileName: string): string {
  return `${id}-${fileName}`.replace(/[^\w.\-\u0600-\u06FF]/g, '_');
}

/**
 * ذخیره یک پیوست جدید برای یک فاکتور (یا هر موجودیت دیگر با scopeId)
 * base64Data باید بدون پیشوند "data:...;base64," باشد
 */
export async function saveAttachment(
  scopeId: string,
  fileName: string,
  mimeType: string,
  base64Data: string,
): Promise<Attachment | null> {
  const id = genId();
  const size = Math.round((base64Data.length * 3) / 4);
  const createdAt = new Date().toISOString();

  if (isCapacitor()) {
    const Filesystem = getFilesystem();
    if (!Filesystem) {
      logError('attachments', 'Filesystem plugin نیست');
      return null;
    }
    const safeName = safeFileName(id, fileName);

    for (const dir of TRY_DIRS()) {
      try {
        await withTimeout(
          Filesystem.writeFile({
            path: `${ATTACH_DIR}/${scopeId}/${safeName}`,
            data: base64Data,
            directory: dir,
            recursive: true,
          }),
          15000,
          `write-${dir}`
        );
        logInfo('attachments', 'saved', { fileName: safeName, dir });
        return {
          id, fileName, mimeType, size, createdAt,
          path: `${ATTACH_DIR}/${scopeId}/${safeName}`,
          directory: DIR_NAME[dir] || String(dir),
        };
      } catch (err: any) {
        logWarn('attachments', `dir fail: ${dir}`, { err: err?.message });
      }
    }
    logError('attachments', 'همه پوشه‌ها fail', { fileName });
    return null;
  }

  // وب/PWA — فایل‌سیستم واقعی نداریم، خود دیتا رو نگه می‌داریم
  return {
    id, fileName, mimeType, size, createdAt,
    data: `data:${mimeType};base64,${base64Data}`,
  };
}

/**
 * خواندن محتوای یک پیوست به‌صورت data URL (برای نمایش/دانلود)
 */
export async function readAttachment(att: Attachment): Promise<string | null> {
  if (att.data) return att.data;
  if (!att.path) return null;

  const Filesystem = getFilesystem();
  if (!Filesystem) return null;

  const dir = (att.directory as Directory) || Directory.Data;
  try {
    const result = await Filesystem.readFile({ path: att.path, directory: dir });
    if (typeof result.data === 'string') {
      return `data:${att.mimeType};base64,${result.data}`;
    }
    return null;
  } catch (err: any) {
    logError('attachments', 'read fail', { path: att.path }, err);
    return null;
  }
}

/**
 * حذف فایل فیزیکی یک پیوست (اگر روی دیسک باشد)
 */
export async function deleteAttachmentFile(att: Attachment): Promise<boolean> {
  if (att.data) return true; // چیزی روی دیسک نیست
  if (!att.path) return true;

  const Filesystem = getFilesystem();
  if (!Filesystem) return false;

  const dir = (att.directory as Directory) || Directory.Data;
  try {
    await Filesystem.deleteFile({ path: att.path, directory: dir });
    return true;
  } catch (err: any) {
    logWarn('attachments', 'delete fail', { path: att.path, err: err?.message });
    return false;
  }
}

/**
 * تبدیل یک File (از input فایل) به base64 خام + متادیتا
 */
export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve({ base64, mimeType: file.type || 'application/octet-stream', fileName: file.name });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * گرفتن عکس از دوربین (فقط در اپ نیتیو در دسترس است)
 */
export async function isCameraAvailable(): Promise<boolean> {
  return isCapacitor() && !!getCamera();
}

export async function captureFromCamera(): Promise<{ base64: string; mimeType: string; fileName: string } | null> {
  const Camera = getCamera();
  if (!Camera) return null;
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: 'base64',
      source: 'PROMPT',
      saveToGallery: false,
    });
    const format = photo?.format || 'jpeg';
    if (!photo?.base64String) return null;
    return {
      base64: photo.base64String,
      mimeType: `image/${format}`,
      fileName: `photo-${Date.now()}.${format}`,
    };
  } catch (err: any) {
    // کاربر لغو کرده یا دسترسی رد شده — خطای مهمی نیست
    logWarn('attachments', 'camera cancelled/denied', { err: err?.message });
    return null;
  }
}

export { isCapacitor as isAttachmentCapacitor };
