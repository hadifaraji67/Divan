import { readFileSync, writeFileSync } from 'node:fs';

const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');
const log = [];

const before = "          prerelease: ${{ contains(github.ref_name, '-') }}";
const after = `          prerelease: \${{ contains(github.ref_name, '-') }}
          overwrite_files: true`;

if (src.includes('prerelease: ${{ contains')) {
  if (src.includes('overwrite_files')) {
    log.push('⏭ overwrite_files قبلاً هست');
  } else {
    src = src.replace(before, after);
    writeFileSync(file, src);
    log.push('✅ overwrite_files اضافه شد');
  }
} else {
  log.push('❌ بلوک prerelease پیدا نشد');
}

console.log(log.join('\n'));
