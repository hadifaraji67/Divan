import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/settings/BackupSettings.tsx';

if (!existsSync(file)) {
  console.log('❌ BackupSettings پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');

if (src.includes('به‌زودی') && src.includes('GoogleDriveComingSoon')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

const log = [];

// ─── افزودن کامپوننت Google Drive Coming Soon ───
// ابتدا چک کنیم Cloud icon import شده
if (!src.includes('Cloud')) {
  src = src.replace(
    "import {\n  Download, Upload, HardDrive, Shield, Clock, Trash2, RefreshCw,",
    "import {\n  Download, Upload, HardDrive, Shield, Clock, Trash2, RefreshCw, Cloud, Lock,",
  );
  log.push('✅ Cloud icon');
}

// ─── افزودن کامپوننت ───
const componentCode = `
/* ═══════════ Google Drive Coming Soon ═══════════ */

const GoogleDriveComingSoon: React.FC = () => {
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <Cloud className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-bold text-sm">پشتیبان‌گیری ابری (Google Drive)</div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
              🚧 به‌زودی
            </span>
          </div>
          <div className="text-[11px] opacity-70 leading-relaxed">
            به‌زودی می‌توانی بکاپ‌ها را به‌طور خودکار روی Google Drive خودت ذخیره کنی.
            با اتصال به حساب گوگل، بکاپ‌ها به‌طور خودکار در فضای ابری شما ذخیره می‌شوند.
          </div>
        </div>
      </div>
    </div>
  );
};
`;

// درج قبل از `export const BackupSettings`
const exportPattern = /export const BackupSettings/;
if (exportPattern.test(src) && !src.includes('GoogleDriveComingSoon')) {
  src = src.replace(exportPattern, componentCode + '\n\nexport const BackupSettings');
  log.push('✅ کامپوننت GoogleDriveComingSoon');
}

// ─── افزودن به JSX ───
// بعد از دکمه‌های backup
const afterBackup = 'onClick={handleManualBackup}';
if (src.includes(afterBackup) && !src.includes('<GoogleDriveComingSoon')) {
  // پیدا کردن آخرین `</div>` بعد از backup
  const backupBtnRegex = /(<button[^>]*onClick={handleManualBackup}[\s\S]*?<\/button>[\s\S]*?<\/div>)/;
  const match = src.match(backupBtnRegex);

  if (match) {
    src = src.replace(match[1], match[1] + '\n\n        <GoogleDriveComingSoon />');
    log.push('✅ رندر در JSX');
  } else {
    log.push('⚠️ محل درج پیدا نشد');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
