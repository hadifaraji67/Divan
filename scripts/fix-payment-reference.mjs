import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// ─── اول فیلدهای واقعی Payment را ببین ───
const modelFile = 'src/types/models.ts';
let realFields = [];
if (existsSync(modelFile)) {
  const modelSrc = readFileSync(modelFile, 'utf8');
  const match = modelSrc.match(/interface Payment\s*\{([\s\S]*?)\}/);
  if (match) {
    realFields = (match[1].match(/\w+\??:/g) || []).map((f) => f.replace(/[?:]/g, ''));
    console.log('Payment fields:', realFields.join(', '));
  }
}

// ─── fix CommandPalette ───
const file = 'src/components/shared/CommandPalette.tsx';
if (!existsSync(file)) {
  console.log('❌ CommandPalette پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');
const log = [];

// اگر `reference` وجود ندارد
if (!realFields.includes('reference')) {
  // از id یا method استفاده کن
  const fallback = realFields.includes('method') ? 'method' : 'id';

  src = src.replace(/p\.reference/g, `p.${fallback}`);
  log.push(`✅ p.reference → p.${fallback}`);
}

// اگر `contactName` هم نیست
if (!realFields.includes('contactName')) {
  // حذف از filter
  src = src.replace(/p\.contactName\?\.toLowerCase\(\)\.includes\(q\)\s*\|\|\s*/g, '');
  log.push('✅ contactName حذف شد از filter');
}

writeFileSync(file, src);
console.log(log.join('\n'));
