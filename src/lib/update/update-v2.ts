/**
 * سیستم Update v2 — OTA + APK با انتخاب کاربر
 *
 * جریان:
 * ۱. از manifest.json روی GitHub می‌خواند
 * ۲. نسخه فعلی را با نسخه جدید مقایسه می‌کند
 * ۳. اگر OTA در دسترس است → گزینه «بروزرسانی سریع»
 * ۴. اگر APK در دسترس است → گزینه «دانلود کامل»
 * ۵. اگر هر دو → کاربر انتخاب می‌کند
 */

declare const __APP_VERSION__: string;
export const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

const GITHUB_OWNER = 'hadifaraji67';
const GITHUB_REPO = 'Divan';
const MANIFEST_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/manifest.json`;

export type Platform = 'pwa' | 'native' | 'web';

export interface UpdateManifest {
  version: string;
  releaseNotes?: string;
  ota: {
    available: boolean;
    url: string;
    size: number;
    checksum?: string;
    minNativeVersion?: string;
  };
  apk: {
    available: boolean;
    url: string;
    size: number;
    versionCode: number;
  };
  requiresNativeUpdate: boolean;
}

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion?: string;
  platform: Platform;
  releaseNotes?: string;
  otaAvailable: boolean;
  apkAvailable: boolean;
  otaSize?: number;
  apkSize?: number;
  otaUrl?: string;
  apkUrl?: string;
}

/* ═══════════ تشخیص پلتفرم ═══════════ */

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  const w = window as any;
  if (w.Capacitor?.isNativePlatform?.()) return 'native';
  if (w.Capacitor?.platform === 'android' || w.Capacitor?.platform === 'ios') return 'native';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'pwa';
  if ((navigator as any).standalone === true) return 'pwa';
  return 'web';
}

/* ═══════════ مقایسه نسخه ═══════════ */

export function compareVersions(a: string, b: string): number {
  const cleanA = a.replace(/^v/, '');
  const cleanB = b.replace(/^v/, '');

  const [aBase, aPre] = cleanA.split('-');
  const [bBase, bPre] = cleanB.split('-');

  // مقایسه base (x.y.z)
  const pa = aBase.split('.').map(n => parseInt(n) || 0);
  const pb = bBase.split('.').map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }

  // اگر base مساوی: stable > rc > beta > alpha
  const order: Record<string, number> = { '': 4, 'rc': 3, 'beta': 2, 'alpha': 1 };
  const aType = aPre?.split('.')[0] || '';
  const bType = bPre?.split('.')[0] || '';
  const aN = parseInt(aPre?.split('.')[1] || '0');
  const bN = parseInt(bPre?.split('.')[1] || '0');

  if (order[aType] !== order[bType]) {
    return order[aType] > order[bType] ? 1 : -1;
  }
  return aN > bN ? 1 : aN < bN ? -1 : 0;
}

/* ═══════════ خواندن manifest ═══════════ */

let cachedManifest: { data: UpdateManifest; time: number } | null = null;
const MANIFEST_CACHE_MS = 1000 * 60 * 5;

async function fetchManifest(force = false): Promise<UpdateManifest | null> {
  // cache
  if (!force && cachedManifest && Date.now() - cachedManifest.time < MANIFEST_CACHE_MS) {
    return cachedManifest.data;
  }

  try {
    const res = await fetch(MANIFEST_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as UpdateManifest;
    cachedManifest = { data, time: Date.now() };
    return data;
  } catch {
    return null;
  }
}

/* ═══════════ بررسی آپدیت ═══════════ */

export async function checkForUpdates(force = false): Promise<UpdateInfo> {
  const platform = detectPlatform();
  const base: UpdateInfo = {
    available: false,
    currentVersion: APP_VERSION,
    platform,
    otaAvailable: false,
    apkAvailable: false,
  };

  const manifest = await fetchManifest(force);
  if (!manifest) return base;

  const latest = manifest.version.replace(/^v/, '');
  const hasUpdate = compareVersions(latest, APP_VERSION) > 0;
  if (!hasUpdate) {
    return { ...base, latestVersion: latest };
  }

  // در حالت web (نه PWA نه native): فقط APK را نشان بده اگر وجود دارد
  const isNative = platform === 'native';
  const isPwa = platform === 'pwa';

  // چک minNativeVersion — اگر اپ فعلی از حداقل نسخه native قدیمی‌تر است، OTA کار نمی‌کند
  const minNative = manifest.ota.minNativeVersion;
  const nativeOk = !minNative || compareVersions(APP_VERSION, minNative) >= 0;

  const otaAvailable = isNative
    && manifest.ota.available
    && !manifest.requiresNativeUpdate
    && !!manifest.ota.url
    && nativeOk;

  const apkAvailable = manifest.apk.available && !!manifest.apk.url;

  return {
    ...base,
    available: true,
    latestVersion: latest,
    releaseNotes: manifest.releaseNotes,
    otaAvailable,
    apkAvailable,
    otaSize: manifest.ota.size,
    apkSize: manifest.apk.size,
    otaUrl: manifest.ota.url,
    apkUrl: manifest.apk.url,
  };
}

/* ═══════════ اعمال OTA ═══════════ */

export async function applyOtaUpdate(url: string): Promise<{ success: boolean; error?: string }> {
  const w = window as any;
  if (!w.Capacitor?.isNativePlatform?.()) {
    return { success: false, error: 'OTA فقط در APK' };
  }

  try {
    const { LiveUpdate } = w.Capacitor.Plugins;
    if (!LiveUpdate) return { success: false, error: 'پلاگین LiveUpdate یافت نشد' };

    // دانلود و اعمال
    await LiveUpdate.downloadBundle({ url, bundleId: `v${Date.now()}` });
    await LiveUpdate.setNextBundle({ bundleId: `v${Date.now()}` });
    await LiveUpdate.reload();

    return { success: true };
  } catch (err: any) {
    console.error('[OTA] خطا:', err);
    return { success: false, error: err?.message || 'خطا در OTA' };
  }
}

/* ═══════════ اعمال APK ═══════════ */

export async function applyApkUpdate(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    const w = window as any;
    if (w.Capacitor?.Plugins?.Browser?.open) {
      await w.Capacitor.Plugins.Browser.open({ url });
      return { success: true };
    }
    window.open(url, '_blank');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'خطا' };
  }
}

/* ═══════════ بررسی وجود bundle فعال ═══════════ */

export async function getActiveBundleInfo(): Promise<{ bundleId: string | null; version: string | null }> {
  const w = window as any;
  if (!w.Capacitor?.isNativePlatform?.()) {
    return { bundleId: null, version: null };
  }

  try {
    const { LiveUpdate } = w.Capacitor.Plugins;
    if (!LiveUpdate) return { bundleId: null, version: null };
    const result = await LiveUpdate.getCurrentBundle();
    return { bundleId: result?.bundleId || null, version: result?.version || null };
  } catch {
    return { bundleId: null, version: null };
  }
}

/* ═══════════ پاک‌سازی کش ═══════════ */

export function clearManifestCache(): void {
  cachedManifest = null;
}
