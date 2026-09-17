import { readFileSync, writeFileSync } from 'node:fs';

const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');
const log = [];

// ── ۱. افزودن مرحله ساخت ZIP + manifest قبل از Release ──
const beforeRelease = `      - name: ایجاد Release خودکار`;

const otaSteps = `      - name: ساخت ZIP برای OTA
        run: |
          mkdir -p release
          cd dist && zip -r -q "../release/web-\${{ steps.version.outputs.version }}.zip" .
          cd ..
          echo "ZIP ساخته شد:"
          ls -la release/

      - name: به‌روزرسانی manifest.json
        run: |
          VERSION="\${{ steps.version.outputs.version }}"
          VERSION_NO_V="\${VERSION#v}"
          ZIP_NAME="web-\${VERSION}.zip"
          ZIP_SIZE=$(stat -c%s "release/\${ZIP_NAME}")
          APK_NAME="divan-\${VERSION}.apk"
          APK_SIZE=$(stat -c%s "release/\${APK_NAME}")
          CHECKSUM="sha256:$(sha256sum release/\${ZIP_NAME} | cut -d' ' -f1)"

          cat > manifest.json << EOF
          {
            "version": "\${VERSION_NO_V}",
            "releaseNotes": "نسخه \${VERSION} — برای جزئیات: github.com/hadifaraji67/Divan/releases/tag/\${VERSION}",
            "ota": {
              "available": true,
              "url": "https://github.com/hadifaraji67/Divan/releases/download/\${VERSION}/\${ZIP_NAME}",
              "size": \${ZIP_SIZE},
              "checksum": "\${CHECKSUM}",
              "minNativeVersion": "4.9.0"
            },
            "apk": {
              "available": true,
              "url": "https://github.com/hadifaraji67/Divan/releases/download/\${VERSION}/\${APK_NAME}",
              "size": \${APK_SIZE},
              "versionCode": 40900
            },
            "requiresNativeUpdate": false,
            "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
          }
          EOF

          echo "manifest.json:"
          cat manifest.json
          echo ""
          echo "📌 این فایل باید در commit جدید روی main قرار بگیرد (workflow جداگانه انجام می‌دهد)"

      - name: ذخیره manifest به عنوان artifact
        uses: actions/upload-artifact@v4
        with:
          name: manifest
          path: manifest.json

      - name: ایجاد Release خودکار`;

if (src.includes(beforeRelease)) {
  src = src.replace(beforeRelease, otaSteps);
  log.push('✅ مرحله ZIP + manifest اضافه شد');
} else {
  log.push('❌ بلوک Release پیدا نشد');
}

// ── ۲. افزودن ZIP + manifest به فایل‌های Release ──
const oldFiles = `          files: |
            release/*.apk`;
const newFiles = `          files: |
            release/*.apk
            release/*.zip
            manifest.json`;

if (src.includes(oldFiles)) {
  src = src.replace(oldFiles, newFiles);
  log.push('✅ فایل‌های Release به‌روز شد');
} else {
  log.push('❌ بلوک files پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) process.exit(1);
console.log('\n🎉 release.yml patch موفق');
