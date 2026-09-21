import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/App.tsx';

if (!existsSync(file)) {
  console.log('❌ App.tsx پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('onOpenSearch={() => setShowPalette')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// پیدا کردن <Header
const headerRegex = /(<Header\s[^>]*)(\/?>)/;
if (headerRegex.test(src)) {
  src = src.replace(
    headerRegex,
    (m, before, end) => {
      if (before.includes('onOpenSearch')) return m;
      return `${before} onOpenSearch={() => setShowPalette(true)} ${end}`;
    }
  );
  console.log('✅ onOpenSearch به Header وصل شد');
}

writeFileSync(file, src);
