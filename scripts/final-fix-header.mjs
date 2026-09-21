import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/layout/Header.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// ─── fix 1: destructure ───
const before1 = 'const { settings, setSettings } = useSettings();';
const after1 = 'const { settings, update } = useSettings();';

if (src.includes(before1)) {
  src = src.replace(before1, after1);
  log.push('✅ destructure: setSettings → update');
}

// ─── fix 2: cycleTheme ───
const before2 = /const cycleTheme = \(\) => \{[\s\S]*?\};/;
const after2 = `const cycleTheme = () => {
    const next = settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
    update({ theme: next });
  };`;

if (before2.test(src)) {
  src = src.replace(before2, after2);
  log.push('✅ cycleTheme اصلاح شد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
