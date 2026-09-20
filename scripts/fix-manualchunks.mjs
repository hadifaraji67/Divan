import { readFileSync, writeFileSync } from 'node:fs';
const file = 'vite.config.ts';
let src = readFileSync(file, 'utf8');

// حذف rollupOptions.manualChunks
src = src.replace(/rollupOptions:\s*\{[\s\S]*?manualChunks\(id\)\s*\{[\s\S]*?\},\s*\},?\s*\}?\s*\},?\s*\}/, '}');

writeFileSync(file, src);
console.log('✅ manualChunks حذف شد');
