const PREFIX = 'divan_';

export function loadData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}

export function useLocalState<T>(key: string, fallback: T) {
  return {
    load: () => loadData<T>(key, fallback),
    save: (v: T) => saveData<T>(key, v),
  };
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ═══════════════════════════════════════════════
// توابع باطل کردن / بازگردانی (Soft Delete)
// ═══════════════════════════════════════════════

/**
 * آیتم را باطل می‌کند (به جای حذف)
 */
export function voidItem<T extends { id: string; void?: boolean; voidedAt?: string; voidedReason?: string }>(
  key: string,
  id: string,
  reason?: string
): void {
  const items = loadData<T[]>(key, []);
  const updated = items.map(item =>
    item.id === id
      ? { ...item, void: true, voidedAt: new Date().toISOString(), voidedReason: reason }
      : item
  );
  saveData(key, updated);
}

/**
 * آیتم باطل‌شده را بازمی‌گرداند
 */
export function restoreItem<T extends { id: string; void?: boolean; voidedAt?: string; voidedReason?: string }>(
  key: string,
  id: string
): void {
  const items = loadData<T[]>(key, []);
  const updated = items.map(item =>
    item.id === id
      ? { ...item, void: false, voidedAt: undefined, voidedReason: undefined }
      : item
  );
  saveData(key, updated);
}

/**
 * فقط آیتم‌های فعال (باطل‌نشده) را برمی‌گرداند
 */
export function loadActiveData<T extends { void?: boolean }>(
  key: string,
  fallback: T[]
): T[] {
  return loadData<T[]>(key, fallback).filter(item => !item.void);
}

/**
 * فقط آیتم‌های باطل‌شده را برمی‌گرداند
 */
export function loadVoidedData<T extends { void?: boolean }>(
  key: string,
  fallback: T[]
): T[] {
  return loadData<T[]>(key, fallback).filter(item => item.void);
}

/**
 * فرمت تاریخ برای نمایش باطل شدن
 */
export function formatVoidedAt(voidedAt?: string): string {
  if (!voidedAt) return '';
  try {
    const d = new Date(voidedAt);
    return d.toLocaleDateString('fa-IR') + ' - ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
