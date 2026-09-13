/**
 * سیستم آپدیت خودکار
 * - PWA: با پایش service worker نسخه جدید را تشخیص می‌دهد
 * - APK: از GitHub Releases چک می‌کند و لینک دانلود می‌دهد
 */

export const APP_VERSION = '3.2.0';
const GITHUB_OWNER = 'hadifaraji67';
const GITHUB_REPO = 'Divan';
const CHECK_INTERVAL_MS = 1000 * 60 * 60; // هر ۱ ساعت
const STORAGE_KEY = 'divan_update_state';

export type Platform = 'pwa' | 'native' | 'web';

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion?: string;
  downloadUrl?: string;
  releaseNotes?: string;
  platform: Platform;
  source?: 'pwa' | 'github';
}

export interface UpdateState {
  lastCheck: number;
  dismissedVersion?: string;
  ignoredUntil?: number;
}

/* ============ تشخیص پلتفرم ============ */

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  // Capacitor native
  const w = window as any;
  if (w.Capacitor?.isNativePlatform?.()) return 'native';
  if (w.Capacitor?.platform === 'android' || w.Capacitor?.platform === 'ios') return 'native';
  // PWA installed
  if (window.matchMedia('(display-mode: standalone)').matches) return 'pwa';
  if ((navigator as any).standalone === true) return 'pwa';
  return 'web';
}

/* ============ ذخیره حالت ============ */

function loadState(): UpdateState {
  if (typeof window === 'undefined') return { lastCheck: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { lastCheck: 0 };
  } catch {
    return { lastCheck: 0 };
  }
}

function saveState(s: UpdateState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

/* ============ مقایسه نسخه ============ */

export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  const pb = b.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

/* ============ چک GitHub Releases ============ */

export async function checkGitHubRelease(): Promise<UpdateInfo> {
  const platform = detectPlatform();
  const base: UpdateInfo = {
    available: false,
    currentVersion: APP_VERSION,
    platform,
    source: 'github',
  };

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) return base;

    const data = await res.json();
    const latest = (data.tag_name || data.name || '').replace(/^v/, '');
    if (!latest) return base;

    const hasUpdate = compareVersions(latest, APP_VERSION) > 0;

    // پیدا کردن فایل APK در assets
    let downloadUrl: string | undefined;
    if (Array.isArray(data.assets)) {
      const apk = data.assets.find((a: any) => a.name?.endsWith('.apk'));
      if (apk) downloadUrl = apk.browser_download_url;
    }

    return {
      ...base,
      available: hasUpdate,
      latestVersion: latest,
      downloadUrl,
      releaseNotes: data.body || '',
    };
  } catch {
    return base;
  }
}

/* ============ تشخیص نسخه PWA جدید ============ */

export function watchServiceWorker(onUpdate: (info: UpdateInfo) => void): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  let cancelled = false;
  const platform = detectPlatform();

  navigator.serviceWorker.ready.then((reg) => {
    if (cancelled) return;

    // اگر الان waiting هست
    if (reg.waiting) {
      onUpdate({
        available: true,
        currentVersion: APP_VERSION,
        platform,
        source: 'pwa',
      });
    }

    // منتظر update جدید
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          onUpdate({
            available: true,
            currentVersion: APP_VERSION,
            platform,
            source: 'pwa',
          });
        }
      });
    });

    // هر ساعت چک کن
    const interval = setInterval(() => {
      reg.update().catch(() => {});
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  });

  return () => { cancelled = true; };
}

/* ============ اعمال آپدیت PWA ============ */

export async function applyPwaUpdate(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  // بعد از پیام، صفحه reload می‌شود
  setTimeout(() => window.location.reload(), 500);
}

/* ============ اعمال آپدیت Native ============ */

export async function downloadNativeUpdate(url: string): Promise<void> {
  const w = window as any;
  // اگر Capacitor Browser هست، از آن استفاده کن
  if (w.Capacitor?.Plugins?.Browser?.open) {
    await w.Capacitor.Plugins.Browser.open({ url });
    return;
  }
  // وگرنه در مرورگر باز کن
  window.open(url, '_blank');
}

/* ============ چک کلی ============ */

export async function checkForUpdates(): Promise<UpdateInfo> {
  const platform = detectPlatform();
  const state = loadState();

  // اگر کاربر این نسخه را نادیده گرفته بود، رد کن
  const info = platform === 'native' || platform === 'web'
    ? await checkGitHubRelease()
    : await checkGitHubRelease();

  if (info.available && state.dismissedVersion === info.latestVersion) {
    if (!state.ignoredUntil || Date.now() < state.ignoredUntil) {
      return { ...info, available: false };
    }
  }

  saveState({ ...state, lastCheck: Date.now() });
  return info;
}

export function dismissUpdate(version: string, hours = 24) {
  const state = loadState();
  saveState({
    ...state,
    dismissedVersion: version,
    ignoredUntil: Date.now() + hours * 60 * 60 * 1000,
  });
}

export function shouldCheck(): boolean {
  const state = loadState();
  return Date.now() - state.lastCheck > CHECK_INTERVAL_MS;
}
