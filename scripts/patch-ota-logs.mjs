import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');

// ── لاگ در fetchManifest ──
const before1 = `    const releases: any[] = await res.json();`;
const after1 = `    const releases: any[] = await res.json();
    console.log('[OTA] releases دریافت شد:', releases.length);`;

if (src.includes(before1) && !src.includes("releases دریافت شد")) {
  src = src.replace(before1, after1);
  console.log('✅ لاگ releases');
}

// ── لاگ در حلقه releases ──
const before2 = `      const data = (await mRes.json()) as UpdateManifest;
      cachedManifest = { data, time: Date.now() };
      return data;`;
const after2 = `      const data = (await mRes.json()) as UpdateManifest;
      console.log('[OTA] manifest پیدا شد — version:', data.version);
      cachedManifest = { data, time: Date.now() };
      return data;`;

if (src.includes(before2) && !src.includes("manifest پیدا شد")) {
  src = src.replace(before2, after2);
  console.log('✅ لاگ manifest پیدا شد');
}

// ── لاگ در checkForUpdates ──
const before3 = `  const latest = manifest.version.replace(/^v/, '');
  const hasUpdate = compareVersions(latest, APP_VERSION) > 0;`;
const after3 = `  const latest = manifest.version.replace(/^v/, '');
  console.log('[OTA] مقایسه:', latest, 'vs', APP_VERSION, '| platform:', platform);
  const hasUpdate = compareVersions(latest, APP_VERSION) > 0;
  console.log('[OTA] hasUpdate:', hasUpdate);`;

if (src.includes(before3) && !src.includes("مقایسه:")) {
  src = src.replace(before3, after3);
  console.log('✅ لاگ مقایسه');
}

// ── لاگ خطا در fetchManifest ──
const before4 = `  } catch {
    return null;
  }
}

/* ═══════════ بررسی آپدیت ═══════════ */`;
const after4 = `  } catch (err) {
    console.error('[OTA] fetchManifest خطا:', err);
    return null;
  }
}

/* ═══════════ بررسی آپدیت ═══════════ */`;

if (src.includes(before4) && !src.includes("fetchManifest خطا")) {
  src = src.replace(before4, after4);
  console.log('✅ لاگ خطا');
}

writeFileSync(file, src);
