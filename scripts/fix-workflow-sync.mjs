import { readFileSync, writeFileSync } from 'node:fs';
const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');
const log = [];

// ─── fix 1: FULL APK build ───
const fullBefore = `      - name: Build FULL APK (bundled MLKit)
        working-directory: android
        env:
          MLKIT_MODE: full
          KEYSTORE_PATH: \${{ github.workspace }}/android/keystore/divan-release.keystore
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          npx cap sync android
          ./gradlew assembleRelease --stacktrace --no-daemon`;

const fullAfter = `      - name: Build FULL APK (bundled MLKit)
        working-directory: android
        env:
          MLKIT_MODE: full
          KEYSTORE_PATH: \${{ github.workspace }}/android/keystore/divan-release.keystore
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: ./gradlew assembleRelease --stacktrace --no-daemon`;

if (src.includes(fullBefore)) {
  src = src.replace(fullBefore, fullAfter);
  log.push('✅ FULL APK build fix');
} else {
  log.push('⏭ FULL قبلاً fix شده');
}

// ─── fix 2: LIGHT APK build ───
const lightBefore = `      - name: Build LIGHT APK (unbundled MLKit)
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
          ./gradlew assembleRelease --stacktrace --no-daemon`;

const lightAfter = `      - name: Build LIGHT APK (unbundled MLKit)
        working-directory: android
        env:
          MLKIT_MODE: light
          KEYSTORE_PATH: \${{ github.workspace }}/android/keystore/divan-release.keystore
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          ./gradlew clean
          ./gradlew assembleRelease --stacktrace --no-daemon`;

if (src.includes(lightBefore)) {
  src = src.replace(lightBefore, lightAfter);
  log.push('✅ LIGHT APK build fix');
} else {
  log.push('⏭ LIGHT قبلاً fix شده');
}

writeFileSync(file, src);
console.log(log.join('\n'));
