/**
 * ورود داده از Excel/CSV
 */

import { notify } from './toast';

export interface ImportColumn<T = any> {
  key: string;
  label: string;
  required?: boolean;
  aliases?: string[]; // اسامی دیگر در فایل
  parse?: (value: string) => any;
}

export interface ImportResult<T> {
  success: boolean;
  imported: number;
  errors: { row: number; error: string }[];
  data: T[];
}

/* ═══════════ Parse CSV ═══════════ */

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  // حذف BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        current.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (field || current.length) {
          current.push(field);
          rows.push(current);
          current = [];
          field = '';
        }
        if (c === '\r' && text[i + 1] === '\n') i++;
      } else {
        field += c;
      }
    }
  }

  if (field || current.length) {
    current.push(field);
    rows.push(current);
  }

  return rows;
}

/* ═══════════ خواندن فایل ═══════════ */

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(String(e.target?.result || ''));
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
    reader.readAsText(file, 'utf-8');
  });
}

/* ═══════════ Import مشتریان ═══════════ */

export interface ContactRow {
  name: string;
  mobile?: string;
  phone?: string;
  email?: string;
  nationalId?: string;
  postalCode?: string;
  address?: string;
  type?: string;
}

export const CONTACT_COLUMNS: ImportColumn<ContactRow>[] = [
  { key: 'name', label: 'نام', required: true, aliases: ['name', 'نام', 'نام کامل'] },
  { key: 'mobile', label: 'موبایل', aliases: ['mobile', 'موبایل', 'شماره موبایل', 'همراه'] },
  { key: 'phone', label: 'تلفن', aliases: ['phone', 'تلفن', 'تلفن ثابت'] },
  { key: 'email', label: 'ایمیل', aliases: ['email', 'ایمیل', 'پست الکترونیک'] },
  { key: 'nationalId', label: 'کد ملی', aliases: ['nationalId', 'کد ملی', 'کدملی', 'ملی'] },
  { key: 'postalCode', label: 'کد پستی', aliases: ['postalCode', 'کد پستی', 'کدپستی', 'پستی'] },
  { key: 'address', label: 'آدرس', aliases: ['address', 'آدرس', 'نشانی'] },
  { key: 'type', label: 'نوع', aliases: ['type', 'نوع', 'نوع مشتری'] },
];

/* ═══════════ Import کالاها ═══════════ */

export interface ProductRow {
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  unit?: string;
  stock?: number;
  minStock?: number;
  buyPrice?: number;
  sellPrice?: number;
  wholesalePrice?: number;
  taxPercent?: number;
  location?: string;
  warehouseName?: string;
}

export const PRODUCT_COLUMNS: ImportColumn<ProductRow>[] = [
  { key: 'name', label: 'نام کالا', required: true, aliases: ['name', 'نام', 'نام کالا'] },
  { key: 'sku', label: 'کد', aliases: ['sku', 'کد', 'کد کالا'] },
  { key: 'barcode', label: 'بارکد', aliases: ['barcode', 'بارکد', 'بارکد کالا'] },
  { key: 'category', label: 'دسته', aliases: ['category', 'دسته', 'دسته‌بندی'] },
  { key: 'brand', label: 'برند', aliases: ['brand', 'برند', 'مارک'] },
  { key: 'unit', label: 'واحد', aliases: ['unit', 'واحد', 'واحد شمارش'] },
  { key: 'stock', label: 'موجودی', aliases: ['stock', 'موجودی', 'تعداد'], parse: (v) => parseFloat(v) || 0 },
  { key: 'minStock', label: 'حد بحرانی', aliases: ['minStock', 'حد بحرانی', 'حداقل'], parse: (v) => parseFloat(v) || 0 },
  { key: 'buyPrice', label: 'قیمت خرید', aliases: ['buyPrice', 'قیمت خرید', 'خرید'], parse: (v) => parseFloat(v.replace(/[^\d.]/g, '')) || 0 },
  { key: 'sellPrice', label: 'قیمت فروش', aliases: ['sellPrice', 'قیمت فروش', 'فروش'], parse: (v) => parseFloat(v.replace(/[^\d.]/g, '')) || 0 },
  { key: 'wholesalePrice', label: 'قیمت عمده', aliases: ['wholesalePrice', 'عمده', 'قیمت عمده'], parse: (v) => parseFloat(v.replace(/[^\d.]/g, '')) || 0 },
  { key: 'taxPercent', label: 'مالیات %', aliases: ['taxPercent', 'مالیات', 'درصد مالیات'], parse: (v) => parseFloat(v) || 0 },
  { key: 'location', label: 'محل', aliases: ['location', 'محل', 'موقعیت'] },
  { key: 'warehouseName', label: 'انبار', aliases: ['warehouseName', 'انبار'] },
];

/* ═══════════ Import عمومی ═══════════ */

export async function importFromCSV<T>(
  file: File,
  columns: ImportColumn<T>[]
): Promise<ImportResult<T>> {
  const errors: { row: number; error: string }[] = [];
  const data: T[] = [];

  try {
    const text = await readFileAsText(file);
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return { success: false, imported: 0, errors: [{ row: 0, error: 'فایل خالی است' }], data: [] };
    }

    // ─── تشخیص header ───
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const colMap: Record<string, number> = {};

    for (const col of columns) {
      const aliases = [col.key, col.label, ...(col.aliases || [])].map((a) => a.toLowerCase());
      const idx = header.findIndex((h) => aliases.includes(h) || aliases.some((a) => h.includes(a.toLowerCase())));
      if (idx >= 0) colMap[col.key] = idx;
    }

    // ─── چک ستون‌های اجباری ───
    for (const col of columns) {
      if (col.required && colMap[col.key] === undefined) {
        errors.push({
          row: 0,
          error: `ستون اجباری «${col.label}» پیدا نشد`,
        });
      }
    }

    if (errors.length > 0) {
      return { success: false, imported: 0, errors, data: [] };
    }

    // ─── پردازش ردیف‌ها ───
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((c) => !c?.trim())) continue; // خالی

      const item: any = {};
      let hasError = false;

      for (const col of columns) {
        const idx = colMap[col.key];
        if (idx === undefined) continue;

        const raw = (row[idx] || '').trim();
        if (col.required && !raw) {
          errors.push({ row: i + 1, error: `${col.label} خالی است` });
          hasError = true;
          break;
        }

        item[col.key] = col.parse ? col.parse(raw) : raw;
      }

      if (!hasError) data.push(item as T);
    }

    return {
      success: data.length > 0,
      imported: data.length,
      errors: errors.slice(0, 20),
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      imported: 0,
      errors: [{ row: 0, error: err?.message || 'خطا' }],
      data: [],
    };
  }
}

/* ═══════════ دانلود قالب نمونه ═══════════ */

export function downloadTemplate(
  filename: string,
  columns: ImportColumn<any>[]
): void {
  const headers = columns.map((c) => c.label).join(',');
  const sample = columns.map((c) => {
    if (c.key === 'name') return 'مثال: علی محمدی';
    if (c.key === 'mobile') return '09123456789';
    if (c.key === 'email') return 'ali@example.com';
    if (c.key === 'stock' || c.key === 'minStock') return '10';
    if (c.key.includes('Price')) return '150000';
    return '';
  }).join(',');

  const BOM = '\uFEFF';
  const csv = BOM + [headers, sample].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  notify.success('قالب دانلود شد');
}
