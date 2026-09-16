import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/components/settings/LockSettings.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// ── handler قدیمی که باید حذف شود ──
const oldHandler = `  const handleDownloadQR = async () => {
    try {
      const canvas = qrWrapRef.current?.querySelector('canvas');
      if (!canvas) { notify.error('QR یافت نشد'); return; }
      // canvas را روی یک canvas جدید با پس‌زمینه سفید بزرگ می‌کنیم
      const size = canvas.width;
      const padding = 40;
      const out = document.createElement('canvas');
      out.width = size + padding * 2;
      out.height = size + padding * 2;
      const ctx = out.getContext('2d');
      if (!ctx) { notify.error('خطا در ساخت تصویر'); return; }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(canvas, padding, padding);
      const url = out.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'divan-recovery-' + Date.now() + '.png';
      link.href = url;
      link.click();
      notify.success('تصویر QR ذخیره شد');
    } catch (e) {
      console.error(e);
      notify.error('خطا در ذخیره تصویر');
    }
  };`;

const newHandler = `  const handleDownloadQR = async () => {
    try {
      const canvas = qrWrapRef.current?.querySelector('canvas');
      if (!canvas) { notify.error('QR یافت نشد'); return; }

      // canvas با padding سفید
      const size = canvas.width;
      const padding = 40;
      const out = document.createElement('canvas');
      out.width = size + padding * 2;
      out.height = size + padding * 2;
      const ctx = out.getContext('2d');
      if (!ctx) { notify.error('خطا در ساخت تصویر'); return; }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(canvas, padding, padding);

      const dataUrl = out.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      const filename = 'divan-recovery-' + Date.now() + '.png';
      const w = window as any;

      // ── APK: Capacitor Filesystem + Share ──
      if (w.Capacitor?.isNativePlatform?.() && w.Capacitor?.Plugins) {
        const { Filesystem, Share, Directory } = w.Capacitor.Plugins;

        // ۱. ذخیره در Documents
        try {
          const res = await Filesystem.writeFile({
            path: filename,
            data: base64,
            directory: Directory.Documents,
            recursive: true,
          });
          notify.success('ذخیره شد در Documents/' + filename);

          // ۲. باز کردن منوی اشتراک‌گذاری
          if (Share) {
            try {
              await Share.share({
                title: 'کد بازیابی دیوان',
                text: 'تصویر QR کد بازیابی دیوان — آن را در جای امنی نگه دارید.',
                url: res.uri,
                dialogTitle: 'ذخیره یا اشتراک‌گذاری QR',
              });
            } catch {
              // کاربر انصراف داد
            }
          }
          return;
        } catch (fsErr) {
          console.warn('Filesystem failed, fallback to browser', fsErr);
        }
      }

      // ── Web: روش قبلی ──
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      notify.success('تصویر QR ذخیره شد');
    } catch (e) {
      console.error(e);
      notify.error('خطا در ذخیره تصویر');
    }
  };`;

if (src.includes(oldHandler)) {
  src = src.replace(oldHandler, newHandler);
  log.push('✅ handler دانلود → Filesystem + Share');
} else {
  log.push('❌ handler قدیمی پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) process.exit(1);
console.log('\n🎉 patch موفق');
