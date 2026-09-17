import { readFileSync, writeFileSync } from 'node:fs';

const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');

const oldDecode = `      - name: Decode Keystore
        run: |
          mkdir -p android/keystore
          echo "\${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/keystore/divan-release.keystore
          ls -la android/keystore/`;

const newDecode = `      - name: Decode and validate Keystore
        env:
          KEYSTORE_BASE64: \${{ secrets.KEYSTORE_BASE64 }}
        run: |
          set -euo pipefail
          test -n "$KEYSTORE_BASE64" || { echo "::error::KEYSTORE_BASE64 is not configured"; exit 1; }
          mkdir -p android/keystore
          printf '%s' "$KEYSTORE_BASE64" | base64 -d > android/keystore/divan-release.keystore
          test -s android/keystore/divan-release.keystore || { echo "::error::Decoded keystore is empty"; exit 1; }
          ls -la android/keystore/

      - name: Validate signing secrets
        env:
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          set -euo pipefail
          test -n "$KEYSTORE_PASSWORD" || { echo "::error::KEYSTORE_PASSWORD is not configured"; exit 1; }
          test -n "$KEY_ALIAS" || { echo "::error::KEY_ALIAS is not configured"; exit 1; }
          test -n "$KEY_PASSWORD" || { echo "::error::KEY_PASSWORD is not configured"; exit 1; }
          echo "✅ همه secrets موجود هستند"`;

if (src.includes(oldDecode)) {
  src = src.replace(oldDecode, newDecode);
  writeFileSync(file, src);
  console.log('✅ workflow با validation پچ شد');
} else {
  console.log('❌ بلوک Decode Keystore پیدا نشد');
  process.exit(1);
}
