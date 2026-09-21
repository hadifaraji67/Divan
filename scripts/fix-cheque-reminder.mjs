import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/lib/cheque-reminder.ts';

if (!existsSync(file)) {
  console.log('❌ cheque-reminder پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');
const log = [];

// ─── ۱. fix status ───
// مدل Cheque: status = "در جریان" | "وصول شده" | "برگشتی" | "خرج شده"
const oldStatus = `if (cheque.status !== 'در انتظار' && cheque.status !== 'pending' && cheque.status !== 'نزدیک سررسید') {
      continue;
    }`;
const newStatus = `if (cheque.status !== 'در جریان') {
      continue;
    }`;

if (src.includes(oldStatus)) {
  src = src.replace(oldStatus, newStatus);
  log.push('✅ status اصلاح شد');
} else {
  // جستجوی الگو
  const statusRegex = /if \(cheque\.status !== [^)]+\)/;
  if (statusRegex.test(src)) {
    src = src.replace(statusRegex, "if (cheque.status !== 'در جریان')");
    log.push('✅ status (regex)');
  }
}

// ─── ۲. fix cheque.number ───
// چک کن فیلد واقعی چیست
const modelFile = 'src/types/models.ts';
if (existsSync(modelFile)) {
  const modelSrc = readFileSync(modelFile, 'utf8');
  const chequeMatch = modelSrc.match(/interface Cheque\s*\{([\s\S]*?)\}/);
  if (chequeMatch) {
    const fields = chequeMatch[1];
    log.push(`Cheque fields: ${fields.match(/\w+\??:/g)?.join(', ')}`);
  }
}

// جایگزینی `cheque.number` با فیلد درست
// اگر فیلد واقعی `chequeNumber` یا `serial` است
const fields = [
  'number', 'chequeNumber', 'serial', 'serialNumber', 'chequeSerial'
];

// چک کن کدام در مدل هست
const modelSrc = existsSync(modelFile) ? readFileSync(modelFile, 'utf8') : '';
const chequeMatch = modelSrc.match(/interface Cheque\s*\{([\s\S]*?)\}/);
const chequeFields = chequeMatch ? chequeMatch[1] : '';

let realField = 'number';
for (const f of fields) {
  if (chequeFields.includes(`${f}:`) || chequeFields.includes(`${f}?:`)) {
    realField = f;
    break;
  }
}

if (realField !== 'number') {
  src = src.replace(/cheque\.number/g, `cheque.${realField}`);
  log.push(`✅ cheque.number → cheque.${realField}`);
} else if (!chequeFields.includes('number:')) {
  // فیلد وجود ندارد → از id استفاده کن
  src = src.replace(/cheque\.number/g, 'cheque.id');
  log.push('✅ cheque.number → cheque.id (fallback)');
} else {
  log.push('⏭ cheque.number موجود است');
}

writeFileSync(file, src);
console.log(log.join('\n'));
