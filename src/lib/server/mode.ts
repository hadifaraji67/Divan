/**
 * مدیریت حالت ذخیره‌سازی
 * - local: فقط localStorage
 * - server: متصل به سرور دیوان
 */

export type AppMode = 'local' | 'server';

const MODE_KEY = 'divan_mode';

export function getMode(): AppMode {
  if (typeof window === 'undefined') return 'local';
  const mode = localStorage.getItem(MODE_KEY);
  return mode === 'server' ? 'server' : 'local';
}

export function setMode(mode: AppMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MODE_KEY, mode);
  window.dispatchEvent(new CustomEvent('divan-mode-changed', { detail: mode }));
}

export function isServerMode(): boolean {
  return getMode() === 'server';
}

export function isLocalMode(): boolean {
  return getMode() === 'local';
}

/**
 * رویداد تغییر حالت
 */
export function onModeChange(callback: (mode: AppMode) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => callback((e as CustomEvent).detail);
  window.addEventListener('divan-mode-changed', handler);
  return () => window.removeEventListener('divan-mode-changed', handler);
}
