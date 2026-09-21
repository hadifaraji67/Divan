import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/hubs/SettingsHub.tsx';

if (!existsSync(file)) {
  console.log('❌ SettingsHub پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// ─── ۱. Users icon import ───
const lucideImport = src.match(/import \{([^}]*)\} from ['"]lucide-react['"];/);
if (lucideImport) {
  const content = lucideImport[1];
  if (!content.includes('Users')) {
    src = src.replace(
      lucideImport[0],
      `import {${content.trim()}, Users } from 'lucide-react';`
    );
    log.push('✅ Users icon');
  } else {
    log.push('⏭ Users قبلاً import شده');
  }
}

// ─── ۲. fix TABS_BASE structure ───
// چک کن ساختار فعلی چیست
const tabsMatch = src.match(/const TABS_BASE[^=]*=\s*\[([\s\S]*?)\];/);
if (tabsMatch) {
  const content = tabsMatch[1];
  // چک کن `users` هست
  if (!content.includes("'users'")) {
    // اضافه کردن users به TABS_BASE
    src = src.replace(
      tabsMatch[0],
      tabsMatch[0].replace(
        /\];$/,
        `,\n  { id: 'users', title: 'کاربران', icon: Users, adminOnly: true },\n];`
      )
    );
    log.push('✅ users tab در TABS_BASE');
  } else {
    log.push('⏭ users tab قبلاً هست');
  }
}

// ─── ۳. اطمینان از TABS assignment ───
if (!src.includes('const TABS =')) {
  src = src.replace(
    /const TABS_BASE[^;]+;/,
    `$&

const TABS = TABS_BASE;`
  );
  log.push('✅ TABS assignment');
}

writeFileSync(file, src);
console.log(log.join('\n'));
