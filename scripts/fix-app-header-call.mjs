import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/App.tsx';

if (!existsSync(file)) {
  console.log('❌ App.tsx پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// پیدا کردن خط Header — روش ساده
const headerRegex = /<Header[^>]*\/>/;
const headerMatch = src.match(headerRegex);

if (headerMatch) {
  const newHeader = `<Header
          title={VIEW_TITLES[active]}
          onMenuClick={() => setSidebarOpen(true)}
          onOpenSearch={() => setShowPalette(true)}
        />`;

  src = src.replace(headerMatch[0], newHeader);
  log.push('✅ Header call بازنویسی شد');
} else {
  // شاید multiline باشد
  const multiLineRegex = /<Header[\s\S]*?\/>/;
  const multiMatch = src.match(multiLineRegex);

  if (multiMatch) {
    const newHeader = `<Header
          title={VIEW_TITLES[active]}
          onMenuClick={() => setSidebarOpen(true)}
          onOpenSearch={() => setShowPalette(true)}
        />`;

    src = src.replace(multiMatch[0], newHeader);
    log.push('✅ Header call (multiline) بازنویسی شد');
  } else {
    log.push('❌ Header call پیدا نشد');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
