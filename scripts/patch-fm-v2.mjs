import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');

const start = src.indexOf('async function fetchManifest(');
if (start === -1) { console.log('❌ پیدا نشد'); process.exit(1); }

let depth = 0, end = start, started = false;
for (let i = start; i < src.length; i++) {
  if (src[i] === '{') { depth++; started = true; }
  else if (src[i] === '}') { depth--; if (started && depth === 0) { end = i + 1; break; } }
}

const fn = `async function fetchManifest(force = false): Promise<UpdateManifest | null> {
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
  const m = version.match(/^(\\d+)\\.(\\d+)\\.(\\d+)(?:-(\\w+)\\.(\\d+))?/);
  if (!m) return 0;
  const major = +m[1], minor = +m[2], patch = +m[3], preType = m[4], preNum = +(m[5] || 0);
  let phase = 99;
  if (preType === 'beta') phase = 50 + preNum;
  else if (preType === 'rc') phase = 80 + preNum;
  else if (preType === 'alpha') phase = preNum;
  return major * 1000000 + minor * 10000 + patch * 100 + phase;
}`;

src = src.slice(0, start) + fn + src.slice(end);
writeFileSync(file, src);
console.log('✅ fetchManifest از API');
