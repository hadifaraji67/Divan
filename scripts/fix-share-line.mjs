import { readFileSync, writeFileSync } from 'node:fs';

// اول چک کن InvoiceLine چیه
const modelsFile = 'src/types/models.ts';
const modelsSrc = readFileSync(modelsFile, 'utf8');
const match = modelsSrc.match(/interface InvoiceLine\s*\{[\s\S]*?\}/);
console.log('InvoiceLine fields:', match ? match[0].slice(0, 300) : 'not found');

// fix invoice-share
const file = 'src/lib/invoice-share.ts';
let src = readFileSync(file, 'utf8');

// جایگزینی item.qty → item.quantity و item.price → item.unitPrice
src = src.replace(/item\.qty \|\| 1/g, 'item.quantity || 1');
src = src.replace(/item\.price \|\| 0/g, 'item.unitPrice || 0');
src = src.replace(/item\.name/g, 'item.productName');

writeFileSync(file, src);
console.log('✅ invoice-share اصلاح شد');
