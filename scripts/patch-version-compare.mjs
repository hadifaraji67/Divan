import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');

const before = `export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  const pb = b.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}`;

const after = `export function compareVersions(a: string, b: string): number {
  const cleanA = a.replace(/^v/, '');
  const cleanB = b.replace(/^v/, '');

  const [aBase, aPre] = cleanA.split('-');
  const [bBase, bPre] = cleanB.split('-');

  // مقایسه base (x.y.z)
  const pa = aBase.split('.').map(n => parseInt(n) || 0);
  const pb = bBase.split('.').map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }

  // اگر base مساوی: stable > rc > beta > alpha
  const order: Record<string, number> = { '': 4, 'rc': 3, 'beta': 2, 'alpha': 1 };
  const aType = aPre?.split('.')[0] || '';
  const bType = bPre?.split('.')[0] || '';
  const aN = parseInt(aPre?.split('.')[1] || '0');
  const bN = parseInt(bPre?.split('.')[1] || '0');

  if (order[aType] !== order[bType]) {
    return order[aType] > order[bType] ? 1 : -1;
  }
  return aN > bN ? 1 : aN < bN ? -1 : 0;
}`;

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ compareVersions با pre-release support');
} else if (src.includes('Pre-release support')) {
  console.log('⏭ قبلاً patch شده');
} else {
  console.log('❌ compareVersions پیدا نشد');
  process.exit(1);
}
