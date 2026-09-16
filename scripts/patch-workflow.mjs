import { readFileSync, writeFileSync } from 'node:fs';

const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');
const log = [];

// ── ۱. Decode keystore قبل از build ──
const oldBuild = `      - name: Grant execute permission for gradlew
        run: chmod +x android/gradlew

      - name: Build Release APK
        working-directory: android
        run: ./gradlew assembleDebug --stacktrace --no-daemon`;

const newBuild = `      - name: Decode Keystore
        run: |
          mkdir -p android/keystore
          echo "\${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/keystore/divan-release.keystore
          ls -la android/keystore/

      - name: Grant execute permission for gradlew
        run: chmod +x android/gradlew

      - name: Build Signed Release APK
        working-directory: android
        env:
          KEYSTORE_PATH: \${{ github.workspace }}/android/keystore/divan-release.keystore
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: ./gradlew assembleRelease --stacktrace --no-daemon`;

if (src.includes(oldBuild)) {
  src = src.replace(oldBuild, newBuild);
  log.push('✅ workflow: decode keystore + assembleRelease');
} else {
  log.push('❌ بلوک build قدیمی پیدا نشد');
}

// ── ۲. مسیر APK: debug → release ──
const oldRename = `          cp android/app/build/outputs/apk/debug/app-debug.apk "release/divan-\${VERSION}.apk"`;
const newRename = `          cp android/app/build/outputs/apk/release/app-release.apk "release/divan-\${VERSION}.apk"`;

if (src.includes(oldRename)) {
  src = src.replace(oldRename, newRename);
  log.push('✅ مسیر APK: debug → release');
} else {
  log.push('⚠️  مسیر APK debug پیدا نشد (ممکنه متفاوت باشه)');
}

writeFileSync(file, src);
console.log(log.join('\n'));
const failed = log.filter(l => l.startsWith('❌'));
if (failed.length) process.exit(1);
console.log('\n🎉 workflow patch موفق');
