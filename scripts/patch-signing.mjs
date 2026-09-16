import { readFileSync, writeFileSync } from 'node:fs';

const file = 'android/app/build.gradle';
let src = readFileSync(file, 'utf8');
const log = [];

// ── ۱. افزودن خواندن keystore.properties + env ──
const header = `apply plugin: 'com.android.application'

// ─── Signing Config ───
def keystoreProps = new Properties()
def keystorePropsFile = rootProject.file("keystore.properties")
if (keystorePropsFile.exists()) {
    keystoreProps.load(new FileInputStream(keystorePropsFile))
}

// خواندن از env (CI) یا keystore.properties (local)
def getSigningProp = { key ->
    def env = System.getenv(key.toUpperCase().replace('.', '_'))
    return env ?: keystoreProps[key]
}

def ksPath = getSigningProp('storeFile') ?: System.getenv('KEYSTORE_PATH')
def ksPass = getSigningProp('storePassword') ?: System.getenv('KEYSTORE_PASSWORD')
def kAlias = getSigningProp('keyAlias') ?: System.getenv('KEY_ALIAS')
def kPass  = getSigningProp('keyPassword') ?: System.getenv('KEY_PASSWORD')
def hasSigning = ksPath && new File(ksPath).exists() && ksPass && kAlias && kPass
`;

if (src.includes("apply plugin: 'com.android.application'")) {
  src = src.replace("apply plugin: 'com.android.application'", header);
  log.push('✅ header + signing props');
} else {
  log.push('❌ apply plugin پیدا نشد');
}

// ── ۲. افزودن signingConfigs + release buildType ──
const signingBlock = `    signingConfigs {
        release {
            if (hasSigning) {
                storeFile file(ksPath)
                storePassword ksPass
                keyAlias kAlias
                keyPassword kPass
            }
        }
    }
    buildTypes {
        release {
            if (hasSigning) {
                signingConfig signingConfigs.release
            } else {
                // fallback به debug تا لوکال بیلد شود
                signingConfig signingConfigs.debug
            }
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }`;

const oldBlock = `    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }`;

if (src.includes(oldBlock)) {
  src = src.replace(oldBlock, signingBlock);
  log.push('✅ signingConfigs + release block');
} else {
  log.push('❌ buildTypes release پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
const failed = log.filter(l => l.startsWith('❌'));
if (failed.length) process.exit(1);
console.log('\n🎉 patch build.gradle موفق');
