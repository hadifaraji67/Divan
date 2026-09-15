/**
 * رصد تغییرات localStorage
 * هر تغییری که saveData می‌کند، این watcher آن را به صف می‌فرستد
 */

import { enqueue } from './queue';
import { getMode } from '../server/mode';

const WATCHED_COLLECTIONS = [
  'contacts', 'products', 'invoices', 'payments', 'cheques',
  'installments', 'cashbox', 'journal_entries', 'settings_v1',
];

let watching = false;

/**
 * استخراج recordId از key و value
 */
function getRecordId(key: string, value: any): string | null {
  if (!value) return null;
  if (typeof value === 'object' && value.id) return String(value.id);
  return null;
}

/**
 * پردازش یک collection (مقایسه قبل و بعد)
 */
function processCollection(collection: string, oldValue: any, newValue: any) {
  const oldArr = Array.isArray(oldValue) ? oldValue : [];
  const newArr = Array.isArray(newValue) ? newValue : [];

  const oldMap = new Map(oldArr.map((item: any) => [String(item.id), item]));
  const newMap = new Map(newArr.map((item: any) => [String(item.id), item]));

  const now = new Date().toISOString();

  // موارد جدید یا تغییر یافته
  for (const [id, item] of newMap) {
    const old = oldMap.get(id);
    if (!old || JSON.stringify(old) !== JSON.stringify(item)) {
      enqueue({
        collection,
        recordId: id,
        data: item,
        updatedAt: now,
      });
    }
  }

  // موارد حذف‌شده (soft delete — فقط اگر void داریم)
  for (const [id, item] of oldMap) {
    if (!newMap.has(id)) {
      // اگر رکورد جدید void دارد → از قبل پردازش شده
      if ((item as any).void) continue;

      // حذف نرم — علامت‌گذاری
      enqueue({
        collection,
        recordId: id,
        data: { ...item, void: true, voidedAt: now },
        updatedAt: now,
        deleted: true,
      });
    }
  }
}

/**
 * شروع رصد
 */
export function startWatcher(): () => void {
  if (watching) return () => {};
  if (typeof window === 'undefined') return () => {};

  watching = true;
  const original = localStorage.setItem.bind(localStorage);

  // Monkey-patch برای رصد setItem
  (localStorage as any).setItem = function (key: string, value: string) {
    try {
      const shortKey = key.startsWith('divan_') ? key.slice(6) : '';

      if (shortKey && WATCHED_COLLECTIONS.includes(shortKey) && getMode() === 'server') {
        const oldRaw = localStorage.getItem(key);
        let oldValue: any = null;
        let newValue: any = null;

        try { oldValue = oldRaw ? JSON.parse(oldRaw) : null; } catch {}
        try { newValue = value ? JSON.parse(value) : null; } catch {}

        // پردازش در tick بعدی (تا write کامل شود)
        setTimeout(() => {
          try { processCollection(shortKey, oldValue, newValue); } catch (e) {
            console.error('[watcher] خطا:', e);
          }
        }, 0);
      }
    } catch (err) {
      console.error('[watcher] خطا در پردازش:', err);
    }

    return original(key, value);
  };

  return () => {
    (localStorage as any).setItem = original;
    watching = false;
  };
}
