import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/print/InvoicePrintPro.tsx';

if (!existsSync(file)) {
  console.log('❌ InvoicePrintPro پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('InvoiceQRCode')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

const log = [];

// ─── ۱. import ───
if (!src.includes("from './InvoiceQRCode'")) {
  src = src.replace(
    /import \{ notify \} from ['"]\.\.\/\.\.\/lib\/toast['"];/,
    `import { notify } from '../../lib/toast';\nimport { InvoiceQRCode } from './InvoiceQRCode';`
  );
  log.push('✅ import');
}

// ─── ۲. افزودن QR به JSX ───
// روش: پیدا کردن آخرین `</div>` قبل از `);` انتهای return
// و اضافه کردن QR قبل از آن

const returnRegex = /(return \(\s*<[\s\S]*?)(<\/div>\s*\)\s*;?\s*\}\s*(?:;\s*)?(?:export default|$))/;

if (returnRegex.test(src)) {
  src = src.replace(
    returnRegex,
    (match, content, ending) => {
      // اضافه کردن QR قبل از ending
      return content + `\n\n      {/* QR تأیید اصالت */}\n      <div className="flex justify-center mt-4 mb-2 print:mt-2">\n        <InvoiceQRCode invoice={invoice} size={90} />\n      </div>\n\n      ` + ending;
    }
  );
  log.push('✅ QR به JSX اضافه شد (روش ۱)');
} else {
  // روش جایگزین: پیدا کردن اولین `<div` در return
  const altRegex = /(return \(\s*)(<div[^>]*>)/;
  if (altRegex.test(src)) {
    src = src.replace(
      altRegex,
      (m, ret, div) => ret + div + '\n      <div className="fixed top-2 left-2 z-50"><InvoiceQRCode invoice={invoice} size={70} /></div>'
    );
    log.push('✅ QR در گوشه (روش ۲)');
  } else {
    log.push('❌ anchor پیدا نشد — نیاز به بررسی دستی');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
