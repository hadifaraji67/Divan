/**
 * سیستم Update v2 — OTA + APK
 * - manifest از GitHub API ساخته می‌شود (بدون CORS)
 * - LiveUpdate از پکیج import می‌شود
 */

import { LiveUpdate } from '@capawesome/capacitor-live-update';
import { Capacitor } from '@capacitor/core';

declare const __APP_VERSION__: string;
export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

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

/* ═══════════ Platform ═══════════ */

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  const w = window as any;
  if (w.Capacitor?.isNativePlatform?.()) return 'native';
  if (w.Capacitor?.platform === 'android' || w.Capacitor?.platform === 'ios') return 'native';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'pwa';
  if ((navigator as any).standalone === true) return 'pwa';
  return 'web';
}

/* ═══════════ Version Compare ═══════════ */

export function compareVersions(a: string, b: string): number {
  const [aBase, aPre] = a.replace(/^v/, '').split('-');
  const [bBase, bPre] = b.replace(/^v/, '').split('-');

  const pa = aBase.split('.').map((n) => parseInt(n) || 0);
  const pb = bBase.split('.').map((n) => parseInt(n) || 0);

  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }

  const order: Record<string, number> = { '': 4, rc: 3, beta: 2, alpha: 1 };
  const aType = aPre?.split('.')[0] || '';
  const bType = bPre?.split('.')[0] || '';
  const aN = parseInt(aPre?.split('.')[1] || '0');
  const bN = parseInt(bPre?.split('.')[1] || '0');

  if (order[aType] !== order[bType]) {
    return order[aType] > order[bType] ? 1 : -1;
  }
  return aN > bN ? 1 : aN < bN ? -1 : 0;
}

function computeVersionCode(version: string): number {
  const m = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(\w+)\.(\d+))?/);
  if (!m) return 0;
  const major = parseInt(m[1]) || 0;
  const minor = parseInt(m[2]) || 0;
  const patch = parseInt(m[3]) || 0;
  const preType = m[4];
  const preNum = parseInt(m[5] || '0');

  let phase = 99;
  if (preType === 'beta') phase = 50 + preNum;
  else if (preType === 'rc') phase = 80 + preNum;
  else if (preType === 'alpha') phase = preNum;

  return major * 1000000 + minor * 10000 + patch * 100 + phase;
}

/* ═══════════ Manifest Fetch ═══════════ */

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
    if (!res.ok) {
      console.error('[OTA] API status:', res.status);
      return null;
    }

    const releases: any[] = await res.json();

    for (const rel of releases) {
      const apkAsset = rel.assets?.find((a: any) => a.name?.endsWith('.apk'));
      const zipAsset = rel.assets?.find((a: any) => a.name?.endsWith('.zip'));
      if (!apkAsset || !zipAsset) continue;

      const version = (rel.tag_name || rel.name || '').replace(/^v/, '');
      if (!version) continue;

      const data: UpdateManifest = {
        version,
        releaseNotes: rel.body || '',
        ota: {
          available: true,
          url: zipAsset.browser_download_url,
          size: zipAsset.size || 0,
          checksum: zipAsset.digest || '',
          minNativeVersion: '4.9.0',
        },
        apk: {
          available: true,
          url: apkAsset.browser_download_url,
          size: apkAsset.size || 0,
          versionCode: computeVersionCode(version),
        },
        requiresNativeUpdate: false,
      };

      cachedManifest = { data, time: Date.now() };
      return data;
    }
    return null;
  } catch (err: any) {
    console.error('[OTA] fetchManifest:', err?.message);
    return null;
  }
}

/* ═══════════ Check Update ═══════════ */

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
  if (compareVersions(latest, APP_VERSION) <= 0) {
    return { ...base, latestVersion: latest };
  }

  const isNative = platform === 'native';
  const minNative = manifest.ota.minNativeVersion;
  const nativeOk = !minNative || compareVersions(APP_VERSION, minNative) >= 0;

  const otaAvailable =
    isNative &&
    manifest.ota.available &&
    !manifest.requiresNativeUpdate &&
    !!manifest.ota.url &&
    nativeOk;

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

/* ═══════════ OTA Apply ═══════════ */

export async function applyOtaUpdate(
  url: string
): Promise<{ success: boolean; error?: string }> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'OTA فقط در APK' };
  }

  try {
    const bundleId = `ota-${Date.now()}`;
    console.log('[OTA] bundleId:', bundleId);

    await LiveUpdate.downloadBundle({ url, bundleId });
    console.log('[OTA] دانلود موفق');

    await LiveUpdate.setNextBundle({ bundleId });
    console.log('[OTA] setNextBundle موفق');

    await LiveUpdate.reload();
    return { success: true };
  } catch (err: any) {
    console.error('[OTA] خطا:', err);
    return { success: false, error: err?.message || 'خطا در OTA' };
  }
}

/* ═══════════ APK Apply ═══════════ */

export async function applyApkUpdate(
  url: string
): Promise<{ success: boolean; error?: string }> {
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

/* ═══════════ Bundle Info ═══════════ */

export async function getActiveBundleInfo(): Promise<{
  bundleId: string | null;
  version: string | null;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { bundleId: null, version: null };
  }
  try {
    const result = await LiveUpdate.getCurrentBundle();
    return {
      bundleId: result?.bundleId || null,
      version: (result as any)?.version || null,
    };
  } catch {
    return { bundleId: null, version: null };
  }
}

export function clearManifestCache(): void {
  cachedManifest = null;
}
