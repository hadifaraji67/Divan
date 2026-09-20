/**
 * Update — APK فقط
 * پشتیبانی از دو نسخه: full (کامل) + light (سبک)
 */

declare const __APP_VERSION__: string;
export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

const GITHUB_OWNER = 'hadifaraji67';
const GITHUB_REPO = 'Divan';
const RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

export type Platform = 'pwa' | 'native' | 'web';

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion?: string;
  platform: Platform;
  releaseNotes?: string;
  apkAvailable: boolean;
  apkSize?: number;
  apkUrl?: string;
  apkLightAvailable: boolean;
  apkLightSize?: number;
  apkLightUrl?: string;
}

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  const w = window as any;
  if (w.Capacitor?.isNativePlatform?.()) return 'native';
  if (w.Capacitor?.platform === 'android' || w.Capacitor?.platform === 'ios') return 'native';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'pwa';
  return 'web';
}

export function compareVersions(a: string, b: string): number {
  const [aBase, aPre] = a.replace(/^v/, '').split('-');
  const [bBase, bPre] = b.replace(/^v/, '').split('-');
  const pa = aBase.split('.').map((n) => parseInt(n) || 0);
  const pb = bBase.split('.').map((n) => parseInt(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }
  const order: Record<string, number> = { '': 4, rc: 3, beta: 2, alpha: 1 };
  const aT = aPre?.split('.')[0] || '';
  const bT = bPre?.split('.')[0] || '';
  const aN = parseInt(aPre?.split('.')[1] || '0');
  const bN = parseInt(bPre?.split('.')[1] || '0');
  if (order[aT] !== order[bT]) return order[aT] > order[bT] ? 1 : -1;
  return aN > bN ? 1 : aN < bN ? -1 : 0;
}

let cachedManifest: UpdateInfo | null = null;
let cachedTime = 0;
const CACHE_MS = 5 * 60 * 1000;

export async function checkForUpdates(force = false): Promise<UpdateInfo> {
  const platform = detectPlatform();
  const base: UpdateInfo = {
    available: false,
    currentVersion: APP_VERSION,
    platform,
    apkAvailable: false,
    apkLightAvailable: false,
  };

  if (!force && cachedManifest && Date.now() - cachedTime < CACHE_MS) {
    return cachedManifest;
  }

  try {
    const res = await fetch(RELEASES_API + '?per_page=10', {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-cache',
    });
    if (!res.ok) return base;

    const releases: any[] = await res.json();

    for (const rel of releases) {
      // full APK: فایلی که به .apk ختم می‌شود ولی -light ندارد
      const fullApk = rel.assets?.find(
        (a: any) => a.name?.endsWith('.apk') && !a.name?.includes('-light')
      );
      const lightApk = rel.assets?.find((a: any) => a.name?.endsWith('-light.apk'));

      if (!fullApk) continue;

      const version = (rel.tag_name || '').replace(/^v/, '');
      if (!version) continue;

      const result: UpdateInfo = {
        ...base,
        available: compareVersions(version, APP_VERSION) > 0,
        latestVersion: version,
        releaseNotes: rel.body || '',
        apkAvailable: true,
        apkSize: fullApk.size,
        apkUrl: fullApk.browser_download_url,
        apkLightAvailable: !!lightApk,
        apkLightSize: lightApk?.size,
        apkLightUrl: lightApk?.browser_download_url,
      };

      cachedManifest = result;
      cachedTime = Date.now();
      return result;
    }
    return base;
  } catch (err) {
    console.error('[Update] fetch error:', err);
    return base;
  }
}

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

export function clearManifestCache(): void {
  cachedManifest = null;
  cachedTime = 0;
}
