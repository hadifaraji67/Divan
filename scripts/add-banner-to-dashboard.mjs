import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/DashboardModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// import
if (!src.includes('UpdateBanner')) {
  // پیدا کردن آخرین import
  const imports = src.match(/^import[\s\S]*?;$/gm);
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    src = src.replace(
      lastImport,
      lastImport + "\nimport { UpdateBanner } from '../shared/UpdateBanner';"
    );
    log.push('✅ import');
  }
}

// رندر — بالای همه چیز در Dashboard
if (!src.includes('<UpdateBanner')) {
  const before = 'return (\n    <div className="space-y-5" dir="rtl">';
  const after = 'return (\n    <div className="space-y-5" dir="rtl">\n\n      {/* بنر بروزرسانی — فقط در داشبورد */}\n      <UpdateBanner />';
  
  if (src.includes(before)) {
    src = src.replace(before, after);
    log.push('✅ رندر در Dashboard');
  } else if (src.includes('return (\n    <div className="space-y-4" dir="rtl">')) {
    src = src.replace(
      'return (\n    <div className="space-y-4" dir="rtl">',
      'return (\n    <div className="space-y-4" dir="rtl">\n\n      <UpdateBanner />'
    );
    log.push('✅ رندر (space-y-4)');
  } else {
    // جستجوی الگوی return
    const returnMatch = src.match(/(return \(\s*<div[^>]*dir="rtl">)/);
    if (returnMatch) {
      src = src.replace(returnMatch[1], returnMatch[1] + '\n\n      <UpdateBanner />');
      log.push('✅ رندر (regex)');
    } else {
      log.push('❌ الگوی return پیدا نشد');
    }
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
