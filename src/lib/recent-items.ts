/**
 * ردیابی «موارد اخیر» — آخرین رکوردهایی که کاربر باز کرده (فاکتور، شخص، کالا و...)
 * برای بازگشت سریع به چیزی که همین الان روش کار می‌کرد
 */
import { loadData, saveData } from './storage';

const MAX_RECENT = 8;

export interface RecentEntry {
  id: string;
  label: string;
  at: string; // ISO timestamp
}

function storageKey(scope: string): string {
  return `recent_items_${scope}`;
}

/**
 * ثبت این‌که یک رکورد باز شده — اگر قبلاً تو لیست بوده، به بالای لیست منتقل می‌شود
 */
export function recordRecentItem(scope: string, id: string, label: string): void {
  if (!id) return;
  const list = loadData<RecentEntry[]>(storageKey(scope), []);
  const withoutCurrent = list.filter(e => e.id !== id);
  const updated: RecentEntry[] = [
    { id, label: label || '—', at: new Date().toISOString() },
    ...withoutCurrent,
  ].slice(0, MAX_RECENT);
  saveData(storageKey(scope), updated);
}

export function getRecentItems(scope: string): RecentEntry[] {
  return loadData<RecentEntry[]>(storageKey(scope), []);
}

/**
 * حذف یک مورد خاص (مثلاً وقتی خودِ رکورد حذف می‌شود)
 */
export function removeRecentItem(scope: string, id: string): void {
  const list = loadData<RecentEntry[]>(storageKey(scope), []);
  saveData(storageKey(scope), list.filter(e => e.id !== id));
}

export function clearRecentItems(scope: string): void {
  saveData(storageKey(scope), []);
}
