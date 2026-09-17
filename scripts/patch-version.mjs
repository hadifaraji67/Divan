import { readFileSync, writeFileSync } from 'node:fs';

const file = 'android/app/build.gradle';
let src = readFileSync(file, 'utf8');
const log = [];

// ۱. افزودن خواندن version از package.json بعد از apply plugin
const header = `apply plugin: 'com.android.application'

// ─── خواندن نسخه از package.json ───
def pkgJson = new groovy.json.JsonSlurper().parseText(file('../../package.json').text)
def pkgVersion = pkgJson.version
def versionParts = pkgVersion.tokenize('.')
def vCode = (versionParts[0].toInteger() * 10000) + (versionParts[1].toInteger() * 100) + (versionParts.size() > 2 ? versionParts[2].toInteger() : 0)
def vName = pkgVersion
`;

if (src.includes("apply plugin: 'com.android.application'") && !src.includes('pkgJson')) {
  src = src.replace("apply plugin: 'com.android.application'", header);
  log.push('✅ header + version reader اضافه شد');
} else if (src.includes('pkgJson')) {
  log.push('⏭ version reader قبلاً هست');
} else {
  log.push('❌ apply plugin پیدا نشد');
}

// ۲. جایگزینی versionCode و versionName در defaultConfig
const oldConfig = `        versionCode 1
        versionName "1.0"`;

const newConfig = `        versionCode vCode
        versionName vName`;

if (src.includes(oldConfig)) {
  src = src.replace(oldConfig, newConfig);
  log.push('✅ versionCode/Name به vCode/vName تغییر کرد');
} else if (src.includes('versionCode vCode')) {
  log.push('⏭ versionCode از قبل داینامیک است');
} else {
  log.push('❌ versionCode 1 پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) process.exit(1);
console.log('\n🎉 patch موفق');
