import { readFileSync, writeFileSync } from 'node:fs';
const log = [];

// ═══ ۱. filesystem.ts — تغییر Directory.ExternalStorage به Documents ═══
{
  const file = 'src/lib/backup/filesystem.ts';
  let src = readFileSync(file, 'utf8');
  const before = src;

  // جایگزینی همه
  src = src.replace(/Directory\.ExternalStorage \|\| 'EXTERNAL_STORAGE'/g, "Directory.Documents || 'DOCUMENTS'");
  src = src.replace(/directory:\s*Directory\.ExternalStorage/g, 'directory: Directory.Documents');
  src = src.replace(/directory:\s*'EXTERNAL_STORAGE'/g, "directory: 'DOCUMENTS'");

  if (src !== before) {
    writeFileSync(file, src);
    log.push('✅ filesystem.ts — Directory.Documents');
  } else {
    log.push('⏭ filesystem.ts — تغییر نکرد');
  }
}

// ═══ ۲. AndroidManifest.xml — مجوزهای صحیح ═══
{
  const file = 'android/app/src/main/AndroidManifest.xml';
  let src = readFileSync(file, 'utf8');
  const before = src;

  // حذف بلوک قدیمی مجوزها
  const oldPerms = `    <!-- مجوزهای بکاپ و ذخیره‌سازی -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />`;

  const newPerms = `    <!-- مجوزهای بکاپ و ذخیره‌سازی -->
    <!-- Android 13+ -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <!-- Android 12 and below -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />`;

  if (src.includes(oldPerms)) {
    src = src.replace(oldPerms, newPerms);
    log.push('✅ AndroidManifest — مجوزهای جدید');
  } else if (src.includes('READ_MEDIA_IMAGES')) {
    log.push('⏭ AndroidManifest — مجوزها قبلاً اضافه شده');
  } else {
    log.push('⚠️ AndroidManifest — بلوک قدیمی پیدا نشد');
  }

  writeFileSync(file, src);
}

console.log(log.join('\n'));
console.log('\n🎉 patch موفق');
