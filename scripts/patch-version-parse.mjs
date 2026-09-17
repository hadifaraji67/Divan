import { readFileSync, writeFileSync } from 'node:fs';

const file = 'android/app/build.gradle';
let src = readFileSync(file, 'utf8');

const before = `// ─── خواندن نسخه از package.json ───
def pkgJson = new groovy.json.JsonSlurper().parseText(file('../../package.json').text)
def pkgVersion = pkgJson.version
def versionParts = pkgVersion.tokenize('.')
def vCode = (versionParts[0].toInteger() * 10000) + (versionParts[1].toInteger() * 100) + (versionParts.size() > 2 ? versionParts[2].toInteger() : 0)
def vName = pkgVersion`;

const after = `// ─── خواندن نسخه از package.json ───
def pkgJson = new groovy.json.JsonSlurper().parseText(file('../../package.json').text)
def pkgVersion = pkgJson.version.toString()
// حذف suffix های pre-release/build: 5.0.0-beta.1 → 5.0.0
def numericVersion = pkgVersion.split(/[-+]/)[0]
def versionParts = numericVersion.tokenize('.')
if (versionParts.size() < 2 || versionParts.any { !it.isInteger() }) {
    throw new GradleException("Invalid package.json version '\${pkgVersion}'")
}
def major = versionParts[0].toInteger()
def minor = versionParts[1].toInteger()
def patch = versionParts.size() > 2 ? versionParts[2].toInteger() : 0
def vCode = (major * 10000) + (minor * 100) + patch
def vName = pkgVersion`;

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ version parsing اصلاح شد');
} else if (src.includes('numericVersion')) {
  console.log('⏭ قبلاً patch شده');
} else {
  console.log('❌ بلوک version پیدا نشد');
  console.log('');
  console.log('=== محتوای فعلی ===');
  const lines = src.split('\n').slice(0, 20);
  console.log(lines.join('\n'));
  process.exit(1);
}
