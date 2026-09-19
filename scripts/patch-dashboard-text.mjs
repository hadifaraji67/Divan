import { readFileSync, writeFileSync } from 'node:fs';
const log = [];

// ═══ ۱. اضافه کردن formatJalaliLong به jalali.ts ═══
{
  const file = 'src/lib/jalali.ts';
  let src = readFileSync(file, 'utf8');

  if (!src.includes('formatJalaliLong')) {
    const before = `export function parseJalali(str: string): { jy: number; jm: number; jd: number } | null {`;
    const after = `/** فرمت طولانی: «شنبه، ۲۸ شهریور ۱۴۰۵» */
export function formatJalaliLong(jy: number, jm: number, jd: number): string {
  const weekday = FA_WEEKDAYS[jalaliWeekday(jy, jm, jd)];
  const day = toFaDigits(jd);
  const month = FA_MONTHS[jm - 1];
  const year = toFaDigits(jy);
  return \`\${weekday}، \${day} \${month} \${year}\`;
}

export function parseJalali(str: string): { jy: number; jm: number; jd: number } | null {`;

    if (src.includes(before)) {
      src = src.replace(before, after);
      writeFileSync(file, src);
      log.push('✅ formatJalaliLong به jalali.ts');
    } else {
      log.push('❌ parseJalali پیدا نشد');
    }
  } else {
    log.push('⏭ formatJalaliLong هست');
  }
}

// ═══ ۲. تغییر Dashboard ═══
{
  const file = 'src/components/modules/DashboardModule.tsx';
  let src = readFileSync(file, 'utf8');

  // ۲-الف: import
  if (!src.includes('formatJalaliLong')) {
    const before = `import { formatNum } from '../../lib/format';`;
    const after = `import { formatNum } from '../../lib/format';\nimport { formatJalaliLong, todayJalali } from '../../lib/jalali';`;

    if (src.includes(before)) {
      src = src.replace(before, after);
      log.push('✅ import formatJalaliLong');
    } else {
      // احتمالاً import دیگری دارد
      const altBefore = `from '../../lib/format'`;
      if (src.includes(altBefore)) {
        src = src.replace(altBefore, altBefore + ";\nimport { formatJalaliLong, todayJalali } from '../../lib/jalali'");
        log.push('⚠️ import با روش جایگزین');
      } else {
        log.push('❌ import پیدا نشد');
      }
    }
  } else {
    log.push('⏭ import هست');
  }

  // ۲-ب: متن «خوش آمدید به دیوان» → «به دیوان خوش آمدید»
  const textBefore = 'خوش آمدید به دیوان 👋';
  const textAfter = 'به دیوان خوش آمدید 👋';
  if (src.includes(textBefore)) {
    src = src.replace(textBefore, textAfter);
    log.push('✅ متن خوش آمدید جابجا شد');
  } else if (src.includes(textAfter)) {
    log.push('⏭ متن قبلاً درست است');
  } else {
    log.push('❌ متن خوش آمدید پیدا نشد');
  }

  // ۲-ج: تاریخ
  const dateBefore = `{new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  const dateAfter = `{(() => { const t = todayJalali(); return formatJalaliLong(t.jy, t.jm, t.jd); })()}`;

  if (src.includes(dateBefore)) {
    src = src.replace(dateBefore, dateAfter);
    log.push('✅ تاریخ با formatJalaliLong');
  } else if (src.includes('formatJalaliLong(t.jy')) {
    log.push('⏭ تاریخ قبلاً patch شده');
  } else {
    log.push('❌ خط تاریخ پیدا نشد');
  }

  writeFileSync(file, src);
}

console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) process.exit(1);
console.log('\n🎉 patch موفق');
