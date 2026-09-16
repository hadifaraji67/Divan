import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/components/settings/LockSettings.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// ─── ۱. افزودن state های جدید ───
const stateBefore = `  const qrWrapRef = useRef<HTMLDivElement>(null);`;
const stateAfter = `  const qrWrapRef = useRef<HTMLDivElement>(null);
  const [qrDownloading, setQrDownloading] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [justShared, setJustShared] = useState(false);`;

if (src.includes(stateBefore)) {
  src = src.replace(stateBefore, stateAfter);
  log.push('✅ state های جدید');
} else {
  log.push('❌ qrWrapRef پیدا نشد');
}

// ─── ۲. handler دانلود: اضافه کردن loading ───
const dlStart = `  const handleDownloadQR = async () => {
    try {`;
const dlStartNew = `  const handleDownloadQR = async () => {
    if (qrDownloading) return;
    setQrDownloading(true);
    try {`;

if (src.includes(dlStart)) {
  src = src.replace(dlStart, dlStartNew);
  log.push('✅ handler دانلود — شروع');
} else {
  log.push('❌ شروع handleDownloadQR پیدا نشد');
}

// ─── ۳. handler دانلود: finally ───
const dlEndOld = `    } catch (e) {
      console.error(e);
      notify.error('خطا در ذخیره تصویر');
    }
  };`;
const dlEndNew = `    } catch (e) {
      console.error(e);
      notify.error('خطا در ذخیره تصویر');
    } finally {
      setQrDownloading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryCode);
    notify.success('کد کپی شد');
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = 'کد بازیابی دیوان:\\n' + recoveryCode + '\\n\\nاین کد را ذخیره کنید.';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'کد بازیابی', text });
        setJustShared(true);
        setTimeout(() => setJustShared(false), 2000);
      } else {
        navigator.clipboard.writeText(text);
        notify.success('کپی شد');
      }
    } catch {
      // کاربر انصراف داد
    }
  };`;

// فقط اولین occurrence را جایگزین کن
const dlEndIdx = src.indexOf(dlEndOld);
if (dlEndIdx !== -1) {
  src = src.slice(0, dlEndIdx) + dlEndNew + src.slice(dlEndIdx + dlEndOld.length);
  log.push('✅ handler دانلود — finally + copy + share');
} else {
  log.push('❌ پایان handleDownloadQR پیدا نشد');
}

// ─── ۴. جایگزینی بلوک دکمه‌ها ───
const btnsOld = `          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => { navigator.clipboard.writeText(recoveryCode); notify.success('کد کپی شد'); }}
              className="flex items-center justify-center gap-2 px-3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
            >
              <Copy className="w-4 h-4" /> کپی کد
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              <Download className="w-4 h-4" /> دانلود
            </button>
            <button
              onClick={() => {
                const text = \`کد بازیابی دیوان:\\n\${recoveryCode}\\n\\nاین کد را ذخیره کنید.\`;
                if (navigator.share) navigator.share({ title: 'کد بازیابی', text }).catch(() => {});
                else { navigator.clipboard.writeText(text); notify.success('کپی شد'); }
              }}
              className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl"
            >
              اشتراک‌گذاری
            </button>
          </div>`;

const btnsNew = `          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={handleCopy}
              disabled={justCopied}
              className="flex items-center justify-center gap-2 px-3 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors"
            >
              {justCopied ? <><Check className="w-4 h-4" /> کپی شد</> : <><Copy className="w-4 h-4" /> کپی کد</>}
            </button>
            <button
              onClick={handleDownloadQR}
              disabled={qrDownloading}
              className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-opacity"
            >
              {qrDownloading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> در حال...</>
              ) : (
                <><Download className="w-4 h-4" /> دانلود</>
              )}
            </button>
            <button
              onClick={handleShare}
              disabled={justShared}
              className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors"
            >
              {justShared ? <><Check className="w-4 h-4" /> شد</> : <>اشتراک‌گذاری</>}
            </button>
          </div>`;

if (src.includes(btnsOld)) {
  src = src.replace(btnsOld, btnsNew);
  log.push('✅ دکمه‌ها با loading + disabled');
} else {
  log.push('❌ بلوک دکمه‌ها پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) process.exit(1);
console.log('\n🎉 patch موفق');
