/**
 * صف تغییرات محلی
 * هر تغییر در localStorage اینجا ثبت می‌شود
 * تا وقتی سرور در دسترس باشد، ارسال شود
 */

export interface SyncChange {
  collection: string;
  recordId: string;
  data: any;
  updatedAt: string;
  deleted?: boolean;
}

const QUEUE_KEY = 'divan_sync_queue';
const MAX_QUEUE_SIZE = 5000;

export function getQueue(): SyncChange[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveQueue(queue: SyncChange[]): void {
  if (typeof window === 'undefined') return;
  try {
    // محدود کردن اندازه صف (اگر خیلی زیاد شد، قدیمی‌ها را حذف کن)
    const limited = queue.length > MAX_QUEUE_SIZE
      ? queue.slice(-MAX_QUEUE_SIZE)
      : queue;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(limited));
    window.dispatchEvent(new CustomEvent('divan-queue-changed', { detail: limited.length }));
  } catch (err) {
    console.error('[queue] خطا در ذخیره:', err);
  }
}

export function enqueue(change: SyncChange): void {
  const queue = getQueue();

  // حذف تغییرات قبلی برای همین رکورد (آخرین برنده)
  const filtered = queue.filter(
    c => !(c.collection === change.collection && c.recordId === change.recordId)
  );

  filtered.push(change);
  saveQueue(filtered);
}

export function enqueueMany(changes: SyncChange[]): void {
  const queue = getQueue();
  const key = (c: SyncChange) => `${c.collection}::${c.recordId}`;
  const newKeys = new Set(changes.map(key));

  const filtered = queue.filter(c => !newKeys.has(key(c)));
  filtered.push(...changes);
  saveQueue(filtered);
}

export function clearQueue(): void {
  saveQueue([]);
}

export function queueSize(): number {
  return getQueue().length;
}

/**
 * رویداد تغییر اندازه صف
 */
export function onQueueChange(callback: (size: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => callback((e as CustomEvent).detail);
  window.addEventListener('divan-queue-changed', handler);
  return () => window.removeEventListener('divan-queue-changed', handler);
}
