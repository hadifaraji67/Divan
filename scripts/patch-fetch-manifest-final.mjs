import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');

// حذف fetchManifest قدیمی
const startMarker = 'async function fetchManifest(';
const startIdx = src.indexOf(startMarker);
if (startIdx === -1) {
  console.log('❌ fetchManifest پیدا نشد');
  process.exit(1);
}

// پیدا کردن انتهای تابع
let depth = 0, endIdx = startIdx, started = false;
for (let i = startIdx; i < src.length; i++) {
  const c = src[i];
  if (c === '{') { depth++; started = true; }
  else if (c === '}') { depth--; if (started && depth === 0) { endIdx = i + 1; break; } }
}

const newFunc = `async function fetchManifest(force = false): Promise<UpdateManifest | null> {
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

    // manifest از API ساخته می‌شود — بدون fetch جداگانه (CORS fix)
    for (const rel of releases) {
      const apkAsset = rel.assets?.find((a: any) => a.name?.endsWith('.apk'));
      const zipAsset = rel.assets?.find((a: any) => a.name?.endsWith('.zip'));
      if (!apkAsset || !zipAsset) continue;

      const version = (rel.tag_name || rel.name || '').replace(/^v/, '');
      if (!version) continue;

      const versionCode = computeVersionCode(version);

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
          versionCode,
        },
        requiresNativeUpdate: false,
      };

      console.log('[OTA] manifest از API:', version, '| vCode:', versionCode);
      cachedManifest = { data, time: Date.now() };
      return data;
    }

    console.log('[OTA] هیچ release با APK + ZIP پیدا نشد');
    return null;
  } catch (err: any) {
    console.error('[OTA] fetchManifest:', err?.message);
    return null;
  }
}

function computeVersionCode(version: string): number {
  const match = version.match(/^(\\d+)\\.(\\d+)\\.(\\d+)(?:-(\\w+)\\.(\\d+))?/);
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
}`;

src = src.slice(0, startIdx) + newFunc + src.slice(endIdx);
writeFileSync(file, src);
console.log('✅ fetchManifest از API بازنویسی شد');
console.log('✅ computeVersionCode اضافه شد');
