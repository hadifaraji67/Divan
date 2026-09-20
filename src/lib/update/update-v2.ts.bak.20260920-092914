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
const RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

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
  if (!force && cachedManifest && Date.now() - cachedManifest.time < MANIFEST_CACHE_MS) {
    return cachedManifest.data;
  }
  try {
    const res = await fetch(RELEASES_API + '?per_page=10', {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-cache',
    });
    if (!res.ok) { console.error('[OTA] status:', res.status); return null; }
    const releases: any[] = await res.json();

    for (const rel of releases) {
      const apk = rel.assets?.find((a: any) => a.name?.endsWith('.apk'));
      const zip = rel.assets?.find((a: any) => a.name?.endsWith('.zip'));
      if (!apk || !zip) continue;
      const version = (rel.tag_name || '').replace(/^v/, '');
      if (!version) continue;

      const data: UpdateManifest = {
        version,
        releaseNotes: rel.body || '',
        ota: { available: true, url: zip.browser_download_url, size: zip.size || 0, minNativeVersion: '4.9.0' },
        apk: { available: true, url: apk.browser_download_url, size: apk.size || 0, versionCode: computeVersionCode(version) },
        requiresNativeUpdate: false,
      };
      console.log('[OTA] manifest:', version);
      cachedManifest = { data, time: Date.now() };
      return data;
    }
    return null;
  } catch (err: any) {
    console.error('[OTA] fetchManifest:', err?.message);
    return null;
  }
}

function computeVersionCode(version: string): number {
  const m = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(\w+)\.(\d+))?/);
  if (!m) return 0;
  const major = +m[1], minor = +m[2], patch = +m[3], preType = m[4], preNum = +(m[5] || 0);
  let phase = 99;
  if (preType === 'beta') phase = 50 + preNum;
  else if (preType === 'rc') phase = 80 + preNum;
  else if (preType === 'alpha') phase = preNum;
  return major * 1000000 + minor * 10000 + patch * 100 + phase;
}

function computeVersionCode(version: string): number {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(\w+)\.(\d+))?/);
  if (!match) return 0;
  const major = parseInt(match[1]) || 0;
  const minor = parseInt(match[2]) || 0;
  const patch = parseInt(match[3]) || 0;
  const preType = match[4];
  const preNum = parseInt(match[5] || '0');
  let phase = 99;
  if (preType === 'beta') phase = 50 + preNum;
  else if (preType === 'rc') phase = 80 + preNum;
  else if (preType === 'alpha') phase = preNum;
  return major * 1000000 + minor * 10000 + patch * 100 + phase;
}

/** محاسبه versionCode از string نسخه */
function computeVersionCode(version: string): number {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(\w+)\.(\d+))?/);
  if (!match) return 0;
  const major = parseInt(match[1]) || 0;
  const minor = parseInt(match[2]) || 0;
  const patch = parseInt(match[3]) || 0;
  const preType = match[4];
  const preNum = parseInt(match[5] || '0');

  let phase = 99;
  if (preType === 'beta') phase = 50 + preNum;
  else if (preType === 'rc') phase = 80 + preNum;
  else if (preType === 'alpha') phase = preNum;

  return major * 1000000 + minor * 10000 + patch * 100 + phase;
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
  console.log('[OTA] مقایسه:', latest, 'vs', APP_VERSION, '| platform:', platform);
  const hasUpdate = compareVersions(latest, APP_VERSION) > 0;
  console.log('[OTA] hasUpdate:', hasUpdate);
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

    // ⚠️ مهم: bundleId باید یکسان باشد بین download و setNext
    const bundleId = `ota-${Date.now()}`;
    console.log('[OTA] شروع دانلود با bundleId:', bundleId);

    // ۱. دانلود bundle
    await LiveUpdate.downloadBundle({ url, bundleId });
    console.log('[OTA] دانلود موفق');

    // ۲. تنظیم به عنوان bundle بعدی
    await LiveUpdate.setNextBundle({ bundleId });
    console.log('[OTA] setNextBundle موفق');

    // ۳. ری‌استارت اپ برای اعمال
    await LiveUpdate.reload();

    return { success: true };
  } catch (err: any) {
    console.error('[OTA] خطا:', err);
    const msg = err?.message || err?.errorMessage || 'خطا در OTA';
    return { success: false, error: msg };
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
