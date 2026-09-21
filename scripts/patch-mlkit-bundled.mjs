import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'android/app/build.gradle';

if (!existsSync(file)) {
  console.log('❌ build.gradle پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');

// چک قبلی
if (src.includes('barcode-scanning:17')) {
  console.log('⏭ MLKit قبلاً اعمال شده');
  process.exit(0);
}

// حذف mlkit قدیمی (اگر باشد)
src = src.replace(/\n\s*implementation ['"]com\.google\.mlkit:barcode-scanning:[^'"]+['"]\s*\n?/g, '\n');

// اضافه کردن bundled MLKit
const depBlock = /(dependencies\s*\{)/;
if (depBlock.test(src)) {
  src = src.replace(
    depBlock,
    `$1
    // MLKit Barcode Scanner — bundled (بدون Play Services)
    implementation 'com.google.mlkit:barcode-scanning:17.3.0'`
  );
  console.log('✅ MLKit bundled اضافه شد');
} else {
  console.log('❌ dependencies پیدا نشد');
  process.exit(1);
}

writeFileSync(file, src);
