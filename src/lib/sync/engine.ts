/**
 * موتور همگام‌سازی
 */

import { serverClient } from '../server/server-client';
import { getQueue, saveQueue, type SyncChange } from './queue';
import { getMode } from '../server/mode';
import { saveData, loadData } from '../storage';

const LAST_SYNC_KEY = 'divan_last_sync';
const AUTO_SYNC_INTERVAL = 5 * 60 * 1000;

export type SyncState = 'idle' | 'syncing' | 'error' | 'offline';

let currentState: SyncState = 'idle';
let isSyncing = false;
let autoSyncTimer: any = null;
let debounceTimer: any = null;
const SYNC_DEBOUNCE_MS = 1500; // ۱.۵ ثانیه تأخیر بعد از آخرین تغییر

export function getSyncState(): SyncState { return currentState; }

export function setSyncState(s: SyncState) {
  currentState = s;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('divan-sync-state', { detail: s }));
  }
}

export function getLastSync(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function setLastSync(t: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_SYNC_KEY, t);
}

export async function pushChanges(): Promise<{ pushed: number; failed: boolean }> {
  if (getMode() !== 'server') return { pushed: 0, failed: false };
  if (!serverClient.isAuthenticated) return { pushed: 0, failed: false };

  const queue = getQueue();
  if (queue.length === 0) return { pushed: 0, failed: false };

  try {
    const result = await serverClient.push(queue);

    if (result.results.errors.length > 0) {
      console.warn('[sync] برخی موارد خطا داشتند:', result.results.errors);
    }

    saveQueue([]);
    setLastSync(result.serverTime);
    return { pushed: queue.length, failed: false };
  } catch (err: any) {
    console.error('[sync] push خطا:', err.message);
    return { pushed: 0, failed: true };
  }
}

export async function pullChanges(): Promise<{ pulled: number; failed: boolean }> {
  if (getMode() !== 'server') return { pulled: 0, failed: false };
  if (!serverClient.isAuthenticated) return { pulled: 0, failed: false };

  try {
    const since = getLastSync();
    const result = await serverClient.pull(since || undefined);

    let total = 0;
    for (const [collection, records] of Object.entries(result.data)) {
      if (!Array.isArray(records) || records.length === 0) continue;

      const current = loadData<any[]>(collection, []);
      const map = new Map(current.map((r: any) => [String(r.id), r]));

      for (const record of records) {
        const id = String((record as any).id);
        const existing = map.get(id);

        const serverTime = new Date((record as any)._updatedAt || result.serverTime);
        const localTime = existing?._updatedAt ? new Date(existing._updatedAt) : new Date(0);

        if (!existing || serverTime > localTime) {
          const clean = { ...record };
          delete clean._updatedAt;
          map.set(id, clean);
          total++;
        }
      }

      saveData(collection, Array.from(map.values()));
    }

    setLastSync(result.serverTime);
    return { pulled: total, failed: false };
  } catch (err: any) {
    console.error('[sync] pull خطا:', err.message);
    return { pulled: 0, failed: true };
  }
}

export async function syncNow(): Promise<{ success: boolean; pushed: number; pulled: number; error?: string }> {
  if (getMode() !== 'server') {
    return { success: false, pushed: 0, pulled: 0, error: 'حالت محلی است' };
  }

  if (isSyncing) {
    return { success: false, pushed: 0, pulled: 0, error: 'در حال sync است' };
  }

  isSyncing = true;
  setSyncState('syncing');

  try {
    const pushResult = await pushChanges();
    if (pushResult.failed) throw new Error('push ناموفق');

    const pullResult = await pullChanges();
    if (pullResult.failed) throw new Error('pull ناموفق');

    setSyncState('idle');
    return { success: true, pushed: pushResult.pushed, pulled: pullResult.pulled };
  } catch (err: any) {
    setSyncState('error');
    return { success: false, pushed: 0, pulled: 0, error: err.message || 'خطای ناشناخته' };
  } finally {
    isSyncing = false;
  }
}

/**
 * درخواست sync با debounce — بعد از آخرین تغییر اجرا می‌شود
 * اگر در همین بازه تغییر جدیدی بیاید، تایمر ریست می‌شود
 */
export function requestSync(delayMs: number = SYNC_DEBOUNCE_MS): void {
  if (typeof window === 'undefined') return;
  if (getMode() !== 'server') return;
  if (!serverClient.isAuthenticated) return;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    if (getMode() === 'server' && serverClient.isAuthenticated) {
      // اگر در حال sync هستیم، نادیده بگیر (sync بعدی به‌صورت خودکار در interval می‌آید)
      if (!isSyncing) {
        syncNow().catch(() => {});
      }
    }
  }, delayMs);
}

/**
 * لغو sync در انتظار (مثلاً هنگام خروج)
 */
export function cancelPendingSync(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

export function startAutoSync(): () => void {
  if (autoSyncTimer) return () => {};

  // ۱. interval چک دوره‌ای (شبکه امن — هر ۵ دقیقه)
  autoSyncTimer = setInterval(() => {
    if (getMode() === 'server' && serverClient.isAuthenticated) {
      syncNow().catch(() => {});
    }
  }, AUTO_SYNC_INTERVAL);

  // ۲. رویدادمحور: بلافاصله بعد از تغییر
  const onSyncNeeded = () => requestSync();
  if (typeof window !== 'undefined') {
    window.addEventListener('divan-sync-needed', onSyncNeeded);
  }

  return () => {
    if (autoSyncTimer) clearInterval(autoSyncTimer);
    autoSyncTimer = null;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('divan-sync-needed', onSyncNeeded);
    }
  };
}

export function stopAutoSync() {
  if (autoSyncTimer) clearInterval(autoSyncTimer);
  autoSyncTimer = null;
}

export function onSyncStateChange(cb: (s: SyncState) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener('divan-sync-state', handler);
  return () => window.removeEventListener('divan-sync-state', handler);
}
