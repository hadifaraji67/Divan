import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/settings/UpdateSettings.tsx';
let src = readFileSync(file, 'utf8');

// حذف رفرنس به otaAvailable
src = src.replace(/\{info\.otaAvailable && \([\s\S]*?\)\}/g, '');
src = src.replace(/\{info\.otaSize && \([\s\S]*?\)\}/g, '');

writeFileSync(file, src);
console.log('✅ UpdateSettings ساده شد');
