import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/settings/UpdateSettings.tsx';
let src = readFileSync(file, 'utf8');

// ایمپورت
if (!src.includes('UpdateDebug')) {
  src = src.replace(
    "import { UpdateChoiceDialog } from '../shared/UpdateChoiceDialog';",
    "import { UpdateChoiceDialog } from '../shared/UpdateChoiceDialog';\nimport { UpdateDebug } from '../shared/UpdateDebug';"
  );
  console.log('✅ import اضافه شد');
}

// افزودن به JSX — قبل از بسته شدن div اصلی
const before = '      <div className="text-center text-[11px] opacity-40">\n        سیستم بروزرسانی ترکیبی — OTA + APK\n      </div>';
const after = '      <UpdateDebug />\n\n      <div className="text-center text-[11px] opacity-40">\n        سیستم بروزرسانی ترکیبی — OTA + APK\n      </div>';

if (src.includes(before) && !src.includes('<UpdateDebug />')) {
  src = src.replace(before, after);
  console.log('✅ پنل دیباگ اضافه شد');
} else if (src.includes('<UpdateDebug />')) {
  console.log('⏭ قبلاً اضافه شده');
} else {
  console.log('❌ anchor پیدا نشد — دنبال marker');
}

writeFileSync(file, src);
