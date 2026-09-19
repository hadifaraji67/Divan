import { execSync } from 'node:child_process';

const RUN_ID = '35449828554';
const REPO = 'hadifaraji67/Divan';

console.log('═══════════════════════════════════════════════');
console.log('  تشخیص خطای workflow beta.14');
console.log('═══════════════════════════════════════════════\n');

// ۱. اطلاعات کلی run
console.log('═══ ۱. اطلاعات run ═══');
try {
  const runInfo = JSON.parse(execSync(
    `curl -s "https://api.github.com/repos/${REPO}/actions/runs/${RUN_ID}"`,
    { encoding: 'utf8' }
  ));
  console.log(`   نام: ${runInfo.name}`);
  console.log(`   وضعیت: ${runInfo.status}`);
  console.log(`   نتیجه: ${runInfo.conclusion}`);
  console.log(`   شاخه: ${runInfo.head_branch}`);
  console.log(`   commit: ${runInfo.head_sha?.slice(0, 8)}`);
  console.log(`   زمان شروع: ${runInfo.run_started_at}`);
  console.log(`   زمان پایان: ${runInfo.updated_at}`);
} catch (e) {
  console.log('   ❌ خطا:', e.message);
}

// ۲. لیست job ها و مرحله‌هایشان
console.log('\n═══ ۲. job ها و مراحل ═══');
try {
  const jobs = JSON.parse(execSync(
    `curl -s "https://api.github.com/repos/${REPO}/actions/runs/${RUN_ID}/jobs"`,
    { encoding: 'utf8' }
  ));

  for (const job of jobs.jobs || []) {
    console.log(`\n   📦 Job: ${job.name}`);
    console.log(`   نتیجه: ${job.conclusion}`);
    console.log('   مراحل:');
    for (const step of job.steps || []) {
      const icon = step.conclusion === 'success' ? '✅'
        : step.conclusion === 'failure' ? '❌'
        : step.conclusion === 'skipped' ? '⏭'
        : '⏳';
      console.log(`     ${icon} ${step.name} (${step.conclusion})`);
    }
  }
} catch (e) {
  console.log('   ❌ خطا:', e.message);
}

// ۳. چک manifest محلی
console.log('\n═══ ۳. چک manifest محلی ═══');
try {
  const writeCount = execSync('grep -c "WRITE_EXTERNAL_STORAGE" android/app/src/main/AndroidManifest.xml', { encoding: 'utf8' }).trim();
  const readCount = execSync('grep -c "READ_EXTERNAL_STORAGE" android/app/src/main/AndroidManifest.xml', { encoding: 'utf8' }).trim();
  const mediaCount = execSync('grep -c "READ_MEDIA_IMAGES" android/app/src/main/AndroidManifest.xml', { encoding: 'utf8' }).trim();
  const pkgCount = execSync('grep -c "package=" android/app/src/main/AndroidManifest.xml || echo 0', { encoding: 'utf8' }).trim();
  console.log(`   WRITE_EXTERNAL_STORAGE: ${writeCount} (باید 1)`);
  console.log(`   READ_EXTERNAL_STORAGE:  ${readCount} (باید 1)`);
  console.log(`   READ_MEDIA_IMAGES:      ${mediaCount} (باید 1)`);
  console.log(`   package=:               ${pkgCount} (باید 0)`);
} catch (e) {
  console.log('   ❌ خطا:', e.message);
}

// ۴. چک filesystem.ts
console.log('\n═══ ۴. چک filesystem.ts ═══');
try {
  const fsSrc = execSync('cat src/lib/backup/filesystem.ts', { encoding: 'utf8' });
  console.log(`   Directory.External: ${(fsSrc.match(/Directory\.External/g) || []).length} مورد`);
  console.log(`   Directory.Documents: ${(fsSrc.match(/Directory\.Documents/g) || []).length} مورد`);
  console.log(`   Directory.Data:      ${(fsSrc.match(/Directory\.Data/g) || []).length} مورد`);
  console.log(`   Share:               ${(fsSrc.match(/Share/g) || []).length} مورد`);
} catch (e) {
  console.log('   ❌ خطا:', e.message);
}

// ۵. چک typecheck
console.log('\n═══ ۵. typecheck ═══');
try {
  execSync('npm run typecheck', { stdio: 'pipe' });
  console.log('   ✅ typecheck سبز');
} catch (e) {
  console.log('   ❌ typecheck خطا:');
  console.log(e.stdout?.toString() || e.message);
}

// ۶. چک build
console.log('\n═══ ۶. build ═══');
try {
  const out = execSync('npm run build 2>&1', { encoding: 'utf8' });
  const lastLines = out.trim().split('\n').slice(-3).join('\n   ');
  console.log('   ✅ build موفق');
  console.log('   ' + lastLines);
} catch (e) {
  console.log('   ❌ build خطا:');
  console.log(e.stdout?.toString() || e.message);
}

// ۷. چک تغییرات نسبت به commit قبلی
console.log('\n═══ ۷. تفاوت با commit قبلی موفق ═══');
try {
  const diff = execSync('git diff 8c8a20ee fff6130e --stat', { encoding: 'utf8' });
  console.log(diff.split('\n').map(l => '   ' + l).join('\n'));
} catch (e) {
  console.log('   ❌ خطا:', e.message);
}

// ۸. چک release.yml
console.log('\n═══ ۸. release.yml — مراحل ساخت ═══');
try {
  const yml = execSync('cat .github/workflows/release.yml', { encoding: 'utf8' });
  const steps = yml.match(/- name: .+/g) || [];
  console.log('   مراحل:');
  steps.forEach(s => console.log('   ' + s.replace('- name: ', '• ')));
} catch (e) {
  console.log('   ❌ خطا:', e.message);
}

// ۹. چک فایل‌های commit
console.log('\n═══ ۹. فایل‌های commit fff6130e ═══');
try {
  const files = execSync('git show --stat --oneline fff6130e', { encoding: 'utf8' });
  console.log(files.split('\n').map(l => '   ' + l).join('\n'));
} catch (e) {
  console.log('   ❌ خطا:', e.message);
}

// ۱۰. توصیه‌های حل
console.log('\n═══════════════════════════════════════════════');
console.log('  📋 چک‌لیست بعدی');
console.log('═══════════════════════════════════════════════');
console.log('   ۱. برای لاگ دقیق خطا، در مرورگر باز کن:');
console.log(`      https://github.com/${REPO}/actions/runs/${RUN_ID}`);
console.log('   ۲. روی "build-and-release" کلیک کن');
console.log('   ۳. مرحله‌ای که ❌ دارد را کلیک کن');
console.log('   ۴. متن خطا را کپی کن');
console.log('');
