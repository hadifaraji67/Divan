import { readFileSync, writeFileSync } from 'node:fs';

const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');
const log = [];

// ── لنگر جدید: انتهای workflow (بعد از env GITHUB_TOKEN) ──
const beforeEnd = `        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

const afterEnd = `        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Commit manifest.json به main
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          cp manifest.json manifest-staging.json 2>/dev/null || true
          git checkout main
          cp manifest-staging.json manifest.json 2>/dev/null || true
          rm -f manifest-staging.json
          git add manifest.json
          git diff --staged --quiet || git commit -m "chore: update manifest.json for \${{ steps.version.outputs.version }}"
          git push origin HEAD:main || echo "⚠️ push نشد"`;

if (src.includes(beforeEnd)) {
  src = src.replace(beforeEnd, afterEnd);
  log.push('✅ commit manifest به main اضافه شد');
} else {
  log.push('❌ env GITHUB_TOKEN پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) {
  console.log('');
  console.log('=== خطوط آخر workflow ===');
  const lines = src.split('\n');
  console.log(lines.slice(-30).join('\n'));
  process.exit(1);
}
console.log('\n🎉 patch موفق');
