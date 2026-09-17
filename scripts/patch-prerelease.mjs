import { readFileSync, writeFileSync } from 'node:fs';
const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');

const before = '          prerelease: false';
const after = '          prerelease: ${{ contains(github.ref_name, \'-\') }}';

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ prerelease auto-detect اضافه شد');
} else if (src.includes('contains(github.ref_name')) {
  console.log('⏭ قبلاً هست');
} else {
  console.log('❌ بلوک prerelease پیدا نشد');
  process.exit(1);
}
