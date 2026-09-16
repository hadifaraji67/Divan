import { readFileSync, writeFileSync } from 'node:fs';

const file = 'android/app/build.gradle';
let src = readFileSync(file, 'utf8');

const before = `    buildTypes {
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

const after = `    buildTypes {
        release {
            if (!hasSigning) {
                throw new GradleException("Keystore not configured. release build requires signing config.")
            }
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }`;

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ build.gradle اصلاح شد');
} else {
  console.log('❌ بلوک پیدا نشد');
  process.exit(1);
}
