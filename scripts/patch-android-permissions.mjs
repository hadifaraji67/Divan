import { readFileSync, writeFileSync } from 'node:fs';

const file = 'android/app/src/main/AndroidManifest.xml';
let src = readFileSync(file, 'utf8');

if (!src.includes('READ_MEDIA_IMAGES')) {
  const permissionBlock = `
    <!-- Permissions for Android 13+ -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <!-- Legacy permissions for Android 12 and below -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
`;
  src = src.replace('</manifest>', permissionBlock + '</manifest>');
  writeFileSync(file, src);
  console.log('✅ مجوزها به AndroidManifest اضافه شد');
} else {
  console.log('⏭ مجوزها قبلاً اضافه شده‌اند');
}
