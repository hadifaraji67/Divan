import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/shared/UpdateBanner.tsx';
let src = readFileSync(file, 'utf8');

// حذف بلوک otaAvailable
const regex = /\{info\.otaAvailable && \([\s\S]*?\)\}/g;
src = src.replace(regex, '');

writeFileSync(file, src);
console.log('✅ UpdateBanner — otaAvailable حذف شد');
