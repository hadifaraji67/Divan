import { readFileSync, writeFileSync } from 'node:fs';

const file = 'android/app/build.gradle';
let src = readFileSync(file, 'utf8');

// الگوی فعلی
const before = `def pkgVersion = pkgJson.version.toString()
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

const after = `def pkgVersion = pkgJson.version.toString()
def numericVersion = pkgVersion.split(/[-+]/)[0]
def versionParts = numericVersion.tokenize('.')
if (versionParts.size() < 2 || versionParts.any { !it.isInteger() }) {
    throw new GradleException("Invalid package.json version '\${pkgVersion}'")
}

def major = versionParts[0].toInteger()
def minor = versionParts[1].toInteger()
def patch = versionParts.size() > 2 ? versionParts[2].toInteger() : 0

// ─── محاسبه phase برای pre-release ───
// alpha.N → 1..49
// beta.N  → 51..79
// rc.N    → 81..98
// stable  → 99
def phase = 99
def preMatch = pkgVersion =~ /-(alpha|beta|rc)\\.(\\d+)/
if (preMatch.find()) {
    def preType = preMatch.group(1)
    def preNum = preMatch.group(2).toInteger()
    switch (preType) {
        case 'alpha': phase = preNum; break
        case 'beta':  phase = 50 + preNum; break
        case 'rc':    phase = 80 + preNum; break
    }
}

def vCode = (major * 1000000) + (minor * 10000) + (patch * 100) + phase
def vName = pkgVersion
println "📦 versionCode=\${vCode} versionName=\${vName} (phase=\${phase})"`;

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ versionCode با phase pre-release');
} else {
  console.log('❌ بلوک پیدا نشد');
  console.log('');
  console.log('=== محتوای فعلی ===');
  console.log(src.split('\n').slice(0, 25).join('\n'));
  process.exit(1);
}
