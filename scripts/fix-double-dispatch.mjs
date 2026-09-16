import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/sync/queue.ts';
let src = readFileSync(file, 'utf8');

const doubleBlock = `    window.dispatchEvent(new CustomEvent('divan-queue-changed', { detail: limited.length }));
    // رویداد sync بلافاصله بعد از تغییر
    if (limited.length > 0) {
      window.dispatchEvent(new CustomEvent('divan-sync-needed'));
    }
    // رویداد sync بلافاصله بعد از تغییر
    if (limited.length > 0) {
      window.dispatchEvent(new CustomEvent('divan-sync-needed'));
    }`;

const singleBlock = `    window.dispatchEvent(new CustomEvent('divan-queue-changed', { detail: limited.length }));
    // رویداد sync بلافاصله بعد از تغییر
    if (limited.length > 0) {
      window.dispatchEvent(new CustomEvent('divan-sync-needed'));
    }`;

if (src.includes(doubleBlock)) {
  src = src.replace(doubleBlock, singleBlock);
  writeFileSync(file, src);
  console.log('✅ dispatch تکراری حذف شد');
} else {
  console.log('⏭ نیازی نیست');
}
