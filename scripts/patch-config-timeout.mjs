import { readFileSync, writeFileSync } from 'node:fs';
const file = 'capacitor.config.ts';
let src = readFileSync(file, 'utf8');

src = src.replace(/readyTimeout:\s*\d+/, 'readyTimeout: 30000');
// اطمینان از resetWhenUpdate
if (!src.includes('resetWhenUpdate')) {
  src = src.replace(/autoUpdateStrategy:\s*'[^']*',/, "autoUpdateStrategy: 'none',\n      resetWhenUpdate: false,");
}

writeFileSync(file, src);
console.log('✅ readyTimeout = 30s, resetWhenUpdate = false');
