import { Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { notify } from './toast';

export interface ExportColumn<T = any> {
  key: keyof T | string;
  label: string;
  format?: (value: any, row: T) => string;
}

function escapeCSV(value: string): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function buildCSV<T>(data: T[], columns: ExportColumn<T>[]): string {
  const BOM = '\uFEFF'; // UTF-8 BOM برای Excel فارسی
  const headerRow = columns.map((c) => escapeCSV(c.label)).join(',');

  const rows = data.map((row) =>
    columns
      .map((c) => {
        const raw = (row as any)[c.key as string];
        const value = c.format ? c.format(raw, row) : raw;
        return escapeCSV(value);
      })
      .join(',')
  );

  return BOM + [headerRow, ...rows].join('\r\n');
}

export async function exportToCSV<T>(
  filename: string,
  data: T[],
  columns: ExportColumn<T>[]
): Promise<boolean> {
  try {
    if (!data.length) {
      notify.warning('داده‌ای برای خروجی نیست');
      return false;
    }

    const csv = buildCSV(data, columns);
    const safeName = filename.replace(/[^\w\u0600-\u06FF-]/g, '_');
    const fullName = `${safeName}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (Capacitor.isNativePlatform()) {
      const Filesystem = (Capacitor as any).Plugins?.Filesystem;
      if (!Filesystem) throw new Error('Filesystem plugin نیست');

      // تلاش در External → Data
      const dirs = [Directory.External, Directory.Data].filter(Boolean);
      for (const dir of dirs) {
        try {
          const result = await Filesystem.writeFile({
            path: `Divan-Exports/${fullName}`,
            data: csv,
            directory: dir,
            encoding: Encoding.UTF8,
            recursive: true,
          });
          notify.success(`ذخیره شد: ${fullName}`);
          return true;
        } catch (err: any) {
          console.warn('[Export] dir fail:', dir, err?.message);
        }
      }
      throw new Error('ذخیره ناموفق');
    }

    // Web: download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fullName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify.success(`دانلود شد: ${fullName}`);
    return true;
  } catch (err: any) {
    console.error('[Export]', err);
    notify.error(err?.message || 'خطا در خروجی');
    return false;
  }
}

/* ═══════════ فرمت‌کننده‌های آماده ═══════════ */

export function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fa-IR');
  } catch {
    return iso;
  }
}

export function formatNumber(n: any): string {
  if (n == null || isNaN(Number(n))) return '';
  return Number(n).toLocaleString('en-US');
}
