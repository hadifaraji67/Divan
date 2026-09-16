import { readFileSync, writeFileSync } from 'node:fs';

const log = [];

// ─── PATCH 1: queue.ts — dispatch sync-needed ───
{
  const file = 'src/lib/sync/queue.ts';
  let src = readFileSync(file, 'utf8');

  const before = `    localStorage.setItem(QUEUE_KEY, JSON.stringify(limited));
    window.dispatchEvent(new CustomEvent('divan-queue-changed', { detail: limited.length }));`;

  const after = `    localStorage.setItem(QUEUE_KEY, JSON.stringify(limited));
    window.dispatchEvent(new CustomEvent('divan-queue-changed', { detail: limited.length }));
    // رویداد sync بلافاصله بعد از تغییر
    if (limited.length > 0) {
      window.dispatchEvent(new CustomEvent('divan-sync-needed'));
    }`;

  if (src.includes(before)) {
    src = src.replace(before, after);
    writeFileSync(file, src);
    log.push('✅ queue.ts — dispatch sync-needed');
  } else {
    log.push('❌ queue.ts — بلوک dispatch پیدا نشد');
  }
}

// ─── PATCH 2: engine.ts — requestSync + listener ───
{
  const file = 'src/lib/sync/engine.ts';
  let src = readFileSync(file, 'utf8');

  // ۲-الف: افزودن متغیر debounce
  const varBefore = `let autoSyncTimer: any = null;`;
  const varAfter = `let autoSyncTimer: any = null;
let debounceTimer: any = null;
const SYNC_DEBOUNCE_MS = 1500; // ۱.۵ ثانیه تأخیر بعد از آخرین تغییر`;

  if (src.includes(varBefore)) {
    src = src.replace(varBefore, varAfter);
    log.push('✅ engine.ts — متغیر debounce');
  } else {
    log.push('❌ engine.ts — متغیر autoSyncTimer پیدا نشد');
  }

  // ۲-ب: تابع requestSync قبل از startAutoSync
  const startBefore = `export function startAutoSync(): () => void {
  if (autoSyncTimer) return () => {};

  autoSyncTimer = setInterval(() => {
    if (getMode() === 'server' && serverClient.isAuthenticated) {
      syncNow().catch(() => {});
    }
  }, AUTO_SYNC_INTERVAL);

  return () => {
    if (autoSyncTimer) clearInterval(autoSyncTimer);
    autoSyncTimer = null;
  };
}`;

  const startAfter = `/**
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
}`;

  if (src.includes(startBefore)) {
    src = src.replace(startBefore, startAfter);
    log.push('✅ engine.ts — requestSync + listener');
  } else {
    log.push('❌ engine.ts — startAutoSync پیدا نشد');
  }

  writeFileSync(file, src);
}

console.log(log.join('\n'));
const failed = log.filter(l => l.startsWith('❌'));
if (failed.length) process.exit(1);
console.log('\n🎉 patch موفق');
