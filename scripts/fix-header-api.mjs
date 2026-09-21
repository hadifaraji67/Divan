import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// ─── چک theme-context برای API واقعی ───
const themeFile = 'src/lib/theme-context.tsx';
const themeSrc = existsSync(themeFile) ? readFileSync(themeFile, 'utf8') : '';

// پیدا کردن تابع‌های export شده
const hasToggleTheme = /toggleTheme/.test(themeSrc);
const hasSetSettings = /setSettings/.test(themeSrc);
const hasUpdateSettings = /updateSettings/.test(themeSrc);

console.log(`theme-context: setSettings=${hasSetSettings}, updateSettings=${hasUpdateSettings}, toggleTheme=${hasToggleTheme}`);

// ─── fix Header ───
const file = 'src/components/layout/Header.tsx';
if (!existsSync(file)) {
  console.log('❌ Header پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// ─── fix setSettings ───
if (hasToggleTheme) {
  // استفاده از toggleTheme
  src = src.replace(
    /const \{ settings, setSettings \} = useSettings\(\);/,
    'const { settings, toggleTheme } = useSettings();'
  );

  src = src.replace(
    /const cycleTheme = \(\) => \{[\s\S]*?\};/,
    'const cycleTheme = () => toggleTheme();'
  );

  log.push('✅ useSettings → toggleTheme');
} else if (hasUpdateSettings) {
  src = src.replace(
    /const \{ settings, setSettings \} = useSettings\(\);/,
    'const { settings, updateSettings } = useSettings();'
  );

  src = src.replace(
    /setSettings\(\{ theme: next \}\);/,
    'updateSettings({ theme: next });'
  );

  log.push('✅ setSettings → updateSettings');
} else {
  log.push('⚠️ API theme-context پیدا نشد — باید بررسی شود');
}

// ─── fix NotificationsPanel ───
// اگر `onClose` ندارد → با onClick یا هوک متفاوت
if (!src.includes('<NotificationsPanel')) {
  // شاید اصلاً لازم نیست
  log.push('⏭ NotificationsPanel استفاده نشده');
} else {
  // چک Props
  const npFile = 'src/components/shared/NotificationsPanel.tsx';
  if (existsSync(npFile)) {
    const npSrc = readFileSync(npFile, 'utf8');
    const propsMatch = npSrc.match(/interface Props\s*\{([\s\S]*?)\}/);

    if (propsMatch) {
      const fields = propsMatch[1];
      const hasOnClose = /onClose/.test(fields);

      if (!hasOnClose) {
        // حذف onClose از Header
        src = src.replace(
          /<NotificationsPanel\s+onClose=\{[^}]+\}\s*\/>/,
          '<NotificationsPanel />'
        );
        log.push('✅ onClose از NotificationsPanel حذف شد');
      } else {
        log.push('⏭ NotificationsPanel onClose معتبر است');
      }
    }
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
