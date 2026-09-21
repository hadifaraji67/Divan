import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/layout/Sidebar.tsx';

if (!existsSync(file)) {
  console.log('❌ Sidebar پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('animate-slide-in-right')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// اضافه کردن animation به sidebar
src = src.replace(
  /className="[^"]*fixed[^"]*inset-y-0[^"]*"/,
  (match) => {
    return match.replace(/"$/, ' animate-slide-in-right"');
  }
);

// اگر پیدا نشد، یک class به بالاترین div اضافه کن
if (!src.includes('animate-slide-in-right')) {
  src = src.replace(
    /(<div className=")/,
    '$1animate-slide-in-right '
  );
}

writeFileSync(file, src);
console.log('✅ Sidebar animation اضافه شد');
