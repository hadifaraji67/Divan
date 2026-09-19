import { readFileSync, writeFileSync } from 'node:fs';

const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');

const blockRegex = /\n      - name: Commit manifest\.json به main[\s\S]*?push origin HEAD:main[^\n]*\n/;

if (blockRegex.test(src)) {
  src = src.replace(blockRegex, '\n');
  writeFileSync(file, src);
  console.log('✅ commit manifest از workflow حذف شد');
} else {
  console.log('⏭ بلوک پیدا نشد');
}
