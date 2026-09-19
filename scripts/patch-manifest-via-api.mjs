import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');
const log = [];

const oldUrlLine = /const MANIFEST_URL = `[^`]+`;/;
if (oldUrlLine.test(src)) {
  src = src.replace(oldUrlLine, 'const RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;');
  log.push('✅ MANIFEST_URL → RELEASES_API');
} else {
  log.push('⏭ MANIFEST_URL قبلاً تغییر کرده');
}

const oldFetchRegex = /async function fetchManifest\([^)]*\): Promise<UpdateManifest \| null> \{[\s\S]*?\n\}/;

const newFetch = `async function fetchManifest(force = false): Promise<UpdateManifest | null> {
  if (!force && cachedManifest && Date.now() - cachedManifest.time < MANIFEST_CACHE_MS) {
    return cachedManifest.data;
  }

  try {
    const res = await fetch(RELEASES_API + '?per_page=10', {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-cache',
    });
    if (!res.ok) return null;

    const releases: any[] = await res.json();

    for (const rel of releases) {
      const asset = rel.assets?.find((a: any) => a.name === 'manifest.json');
      if (!asset) continue;

      const mRes = await fetch(asset.browser_download_url, { cache: 'no-cache' });
      if (!mRes.ok) continue;

      const data = (await mRes.json()) as UpdateManifest;
      cachedManifest = { data, time: Date.now() };
      return data;
    }
    return null;
  } catch {
    return null;
  }
}`;

if (oldFetchRegex.test(src)) {
  src = src.replace(oldFetchRegex, newFetch);
  log.push('✅ fetchManifest از GitHub API');
} else {
  log.push('❌ fetchManifest پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) process.exit(1);
console.log('\n🎉 patch موفق');
