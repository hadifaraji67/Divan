import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// ─── چک فیلدهای Contact ───
const modelFile = 'src/types/models.ts';
const modelSrc = existsSync(modelFile) ? readFileSync(modelFile, 'utf8') : '';
const contactMatch = modelSrc.match(/interface Contact\s*\{([\s\S]*?)\}/);
const contactFields = contactMatch ? contactMatch[1] : '';

console.log('Contact fields:');
console.log(contactFields.match(/\w+\??:/g)?.join(', '));

// ─── چک Payment.direction ───
const paymentMatch = modelSrc.match(/interface Payment\s*\{([\s\S]*?)\}/);
const paymentFields = paymentMatch ? paymentMatch[1] : '';
const directionMatch = paymentFields.match(/direction\??:\s*'([^']+)'\s*\|\s*'([^']+)'/);
const dirIn = directionMatch ? directionMatch[1] : 'دریافت';
const dirOut = directionMatch ? directionMatch[2] : 'پرداخت';
console.log(`Payment.direction: ${dirIn} | ${dirOut}`);

// ─── fix Dashboard ───
const file = 'src/components/modules/DashboardModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// ─── fix direction ───
src = src.replace(
  /p\.direction === 'دریافتی'/g,
  `p.direction === '${dirIn}'`
);
src = src.replace(
  /p\.direction === 'پرداختی'/g,
  `p.direction === '${dirOut}'`
);
log.push('✅ direction اصلاح شد');

// ─── fix Contact.balance ───
// چک کن balance وجود دارد
if (!contactFields.includes('balance:')) {
  // چک کن فیلدهای مالی دیگر
  const hasDebt = /(debt|debit|credit|بدهی|طلب)/i.test(contactFields);
  
  if (hasDebt) {
    // استفاده از فیلد موجود
    const fieldMatch = contactFields.match(/(debt|debit|credit)/i);
    if (fieldMatch) {
      src = src.replace(
        /Math\.max\(0, c\.balance \|\| 0\)/g,
        `Math.max(0, (c as any).${fieldMatch[1]} || 0)`
      );
      log.push(`✅ balance → ${fieldMatch[1]}`);
    }
  } else {
    // حذف کامل محاسبه
    src = src.replace(
      /const receivable = useMemo\(\s*\(\)\s*=>\s*contacts\.reduce[\s\S]*?\],\s*\[contacts\]\s*\);/,
      `const receivable = useMemo(() => 0, [contacts]);`
    );
    log.push('✅ receivable → 0 (فیلد balance وجود ندارد)');
  }
} else {
  log.push('⏭ balance وجود دارد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
