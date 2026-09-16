import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/sync/engine.ts';
let src = readFileSync(file, 'utf8');
const log = [];

// ─── ۱. متغیرهای debounce ───
const varBefore = 'let autoSyncTimer: any = null;';
const varAfter = `let autoSyncTimer: any = null;
let debounceTimer: any = null;
const SYNC_DEBOUNCE_MS = 1500;`;

if (src.includes(varBefore) && !src.includes('let debounceTimer')) {
  src = src.replace(varBefore, varAfter);
  log.push('✅ متغیرهای debounce');
} else if (src.includes('let debounceTimer')) {
  log.push('⏭ متغیرها قبلاً هستند');
} else {
  log.push('❌ متغیر autoSyncTimer پیدا نشد');
}

// ─── ۲. جایگزینی startAutoSync ───
const startRegex = /export function startAutoSync\(\): \(\) => void \{[\s\S]*?autoSyncTimer = null;\s*\n\s*\};?\s*\n\}/;

const startNew = `export function requestSync(delayMs: number = SYNC_DEBOUNCE_MS): void {
  if (typeof window === 'undefined') return;
  if (getMode() !== 'server') return;
  if (!serverClient.isAuthenticated) return;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    if (getMode() === 'server' && serverClient.isAuthenticated && !isSyncing) {
      syncNow().catch(() => {});
    }
  }, delayMs);
}

export function cancelPendingSync(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

export function startAutoSync(): () => void {
  if (autoSyncTimer) return () => {};

  autoSyncTimer = setInterval(() => {
    if (getMode() === 'server' && serverClient.isAuthenticated) {
      syncNow().catch(() => {});
    }
  }, AUTO_SYNC_INTERVAL);

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

if (src.match(startRegex)) {
  src = src.replace(startRegex, startNew);
  log.push('✅ startAutoSync جایگزین شد');
} else {
  log.push('❌ startAutoSync پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) process.exit(1);
console.log('\n🎉 patch موفق');
