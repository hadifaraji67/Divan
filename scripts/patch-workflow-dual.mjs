import { readFileSync, writeFileSync } from 'node:fs';
const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');
const log = [];

// حذف مرحله قدیمی build
const oldBuild = `      - name: Build Signed Release APK
        working-directory: android
        env:
          KEYSTORE_PATH: \${{ github.workspace }}/android/keystore/divan-release.keystore
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: ./gradlew assembleRelease --stacktrace --no-daemon`;

const newBuild = `      - name: Build FULL APK (bundled MLKit)
        working-directory: android
        env:
          MLKIT_MODE: full
          KEYSTORE_PATH: \${{ github.workspace }}/android/keystore/divan-release.keystore
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          npx cap sync android
          ./gradlew assembleRelease --stacktrace --no-daemon

      - name: ذخیره APK کامل
        run: |
          VERSION="\${{ steps.version.outputs.version }}"
          mkdir -p release
          cp android/app/build/outputs/apk/release/app-release.apk "release/divan-\${VERSION}-full.apk"
          ls -lh release/

      - name: Build LIGHT APK (unbundled MLKit)
        working-directory: android
        env:
          MLKIT_MODE: light
          KEYSTORE_PATH: \${{ github.workspace }}/android/keystore/divan-release.keystore
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          npx cap sync android
          ./gradlew clean
          ./gradlew assembleRelease --stacktrace --no-daemon

      - name: ذخیره APK سبک
        run: |
          VERSION="\${{ steps.version.outputs.version }}"
          cp android/app/build/outputs/apk/release/app-release.apk "release/divan-\${VERSION}-light.apk"
          ls -lh release/`;

if (src.includes(oldBuild)) {
  src = src.replace(oldBuild, newBuild);
  log.push('✅ build دوگانه');
} else {
  log.push('❌ build قدیمی پیدا نشد');
}

// نام APK
const oldName = `APK_NAME="divan-\${VERSION}.apk"`;
const newName = `APK_NAME="divan-\${VERSION}-full.apk"`;
if (src.includes(oldName)) {
  src = src.replace(oldName, newName);
  log.push('✅ نام APK full');
}

writeFileSync(file, src);
console.log(log.join('\n'));
