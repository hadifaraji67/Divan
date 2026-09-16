import { readFileSync, writeFileSync } from 'node:fs';

const log = [];

// ─── Patch 1: update-service.ts ───
{
  const file = 'src/lib/update-service.ts';
  let src = readFileSync(file, 'utf8');

  const before = `export async function checkForUpdates(): Promise<UpdateInfo> {
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
}`;

  const after = `export async function checkForUpdates(options?: { ignoreDismiss?: boolean }): Promise<UpdateInfo> {
  const state = loadState();

  const info = await checkGitHubRelease();

  // اگر ignoreDismiss=true باشد (مثلاً از دکمه «بررسی به‌روزرسانی»)، dismiss را نادیده بگیر
  if (!options?.ignoreDismiss && info.available && state.dismissedVersion === info.latestVersion) {
    if (!state.ignoredUntil || Date.now() < state.ignoredUntil) {
      return { ...info, available: false };
    }
  }

  saveState({ ...state, lastCheck: Date.now() });
  return info;
}`;

  if (!src.includes(before)) {
    log.push('❌ update-service.ts: بلوک checkForUpdates پیدا نشد');
  } else {
    src = src.replace(before, after);
    writeFileSync(file, src);
    log.push('✅ update-service.ts — checkForUpdates با گزینه ignoreDismiss');
  }
}

// ─── Patch 2: UpdateSettings.tsx ───
{
  const file = 'src/components/settings/UpdateSettings.tsx';
  let src = readFileSync(file, 'utf8');

  const before = `const i = await checkForUpdates();
      setInfo(i);
      setLastCheck(Date.now());`;

  const after = `const i = await checkForUpdates({ ignoreDismiss: true });
      setInfo(i);
      setLastCheck(Date.now());`;

  if (!src.includes(before)) {
    log.push('❌ UpdateSettings.tsx: بلوک doCheck پیدا نشد');
  } else {
    src = src.replace(before, after);
    writeFileSync(file, src);
    log.push('✅ UpdateSettings.tsx — دکمه بررسی، dismiss را نادیده می‌گیرد');
  }
}

console.log(log.join('\n'));
const failed = log.filter(l => l.startsWith('❌'));
if (failed.length) process.exit(1);
console.log('\n🎉 هر دو patch موفق');
