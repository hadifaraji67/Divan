import { readFileSync, writeFileSync } from 'node:fs';
const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');
const log = [];

// ─── ۲.1: حذف بلوک Build LIGHT ───
const lightBuildRegex = /      - name: Build LIGHT APK \(unbundled MLKit\)[\s\S]*?run: \|\s*\n\s*\.\/gradlew clean\n\s*\.\/gradlew assembleRelease --stacktrace --no-daemon\n/;
if (lightBuildRegex.test(src)) {
  src = src.replace(lightBuildRegex, '');
  log.push('✅ Build LIGHT حذف شد');
} else {
  log.push('⚠️ Build LIGHT پیدا نشد');
}

// ─── ۲.2: حذف بلوک ذخیره Light ───
const lightSaveRegex = /      - name: ذخیره APK سبک[\s\S]*?ls -lh "release\/divan-\$\{VERSION\}-light\.apk"\n/;
if (lightSaveRegex.test(src)) {
  src = src.replace(lightSaveRegex, '');
  log.push('✅ ذخیره LIGHT حذف شد');
} else {
  log.push('⚠️ ذخیره LIGHT پیدا نشد');
}

// ─── ۲.3: rename APK full → ساده ───
// حالا که فقط full داریم، اسمش `divan-X.X.X.apk` بشه
src = src.replace(
  /cp android\/app\/build\/outputs\/apk\/release\/app-release\.apk "release\/divan-\$\{VERSION\}-full\.apk"/g,
  'cp android/app/build/outputs/apk/release/app-release.apk "release/divan-${VERSION}.apk"'
);
log.push('✅ نام APK → ساده');

// ─── ۲.4: حذف -full از APK_NAME در manifest ───
src = src.replace(
  /APK_NAME="divan-\$\{VERSION\}-full\.apk"/g,
  'APK_NAME="divan-${VERSION}.apk"'
);
log.push('✅ APK_NAME اصلاح شد');

writeFileSync(file, src);
console.log(log.join('\n'));
