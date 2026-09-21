import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/shared/UpdateChoiceDialog.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// حذف بلوک Light (کل دکمه)
const lightBtnRegex = /\{info\.apkLightAvailable && \([\s\S]*?<\/button>\s*\)\}/;
if (lightBtnRegex.test(src)) {
  src = src.replace(lightBtnRegex, '');
  log.push('✅ دکمه Light حذف شد');
}

// حذف Feather icon از import
src = src.replace(/, Feather/, '');
src = src.replace(/Feather,\s*/, '');

writeFileSync(file, src);
console.log(log.join('\n'));
