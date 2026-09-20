import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/settings/BackupSettings.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// ═══ ۱. import readBackupFile ═══
if (!src.includes('readBackupFile')) {
  src = src.replace(
    "import { saveToDevice, listBackups, deleteBackup, shareFile, isCapacitor, requestStoragePermission } from '../../lib/backup/filesystem';",
    "import { saveToDevice, listBackups, deleteBackup, shareFile, readBackupFile, isCapacitor, requestStoragePermission } from '../../lib/backup/filesystem';"
  );
  log.push('✅ import readBackupFile');
}

// ═══ ۲. import RotateCcw icon ═══
if (!src.includes('RotateCcw')) {
  src = src.replace(
    "  Unlock, Share2, Eye, Calendar, Zap,\n} from 'lucide-react';",
    "  Unlock, Share2, Eye, Calendar, Zap, RotateCcw,\n} from 'lucide-react';"
  );
  log.push('✅ import RotateCcw');
}

// ═══ ۳. افزودن handleRestoreFromList ═══
if (!src.includes('handleRestoreFromList')) {
  // پیدا کردن تابع handleDelete
  const handleDeleteMatch = src.match(/const handleDelete\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\s*\};/);
  
  if (handleDeleteMatch) {
    const insertion = `${handleDeleteMatch[0]}

  const handleRestoreFromList = async (backup: StoredBackup) => {
    setBusy(true);
    const toastId = notify.loading('در حال خواندن بکاپ...');
    try {
      const content = await readBackupFile(backup.name);
      notify.dismiss(toastId);

      if (!content) {
        notify.error('خواندن فایل ناموفق بود');
        setBusy(false);
        return;
      }

      const meta = inspectBackup(content);
      if (!meta.valid) {
        notify.error(meta.error || 'فایل معتبر نیست');
        setBusy(false);
        return;
      }

      setRestoreFile({ name: backup.name, content, meta });
      setRestorePassword('');
      setShowRestoreDialog(true);
    } catch (err: any) {
      notify.dismiss(toastId);
      notify.error(err?.message || 'خطای ناشناخته');
    } finally {
      setBusy(false);
    }
  };`;
    
    src = src.replace(handleDeleteMatch[0], insertion);
    log.push('✅ handleRestoreFromList');
  } else {
    log.push('❌ handleDelete پیدا نشد');
  }
}

// ═══ ۴. افزودن دکمه Restore در لیست ═══
if (!src.includes('handleRestoreFromList(b)')) {
  // پیدا کردن دکمه اشتراک‌گذاری در لیست
  const shareBtnRegex = /(<button[^>]*onClick={\(\) => handleShare\(b\)}[\s\S]*?<\/button>)/;
  const shareMatch = src.match(shareBtnRegex);

  if (shareMatch) {
    const restoreBtn = `<button
                        onClick={() => handleRestoreFromList(b)}
                        disabled={busy}
                        className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 disabled:opacity-50"
                        title="بازیابی از این بکاپ"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      ${shareMatch[1]}`;

    src = src.replace(shareMatch[1], restoreBtn);
    log.push('✅ دکمه Restore در لیست');
  } else {
    log.push('❌ دکمه اشتراک‌گذاری پیدا نشد');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
