import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/components/settings/LockSettings.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// ── ۱. import QRCodeCanvas به‌جای/کنار QRCodeSVG ──
if (src.includes("import { QRCodeSVG } from 'qrcode.react';")) {
  src = src.replace(
    "import { QRCodeSVG } from 'qrcode.react';",
    "import { QRCodeCanvas } from 'qrcode.react';"
  );
  log.push('✅ import → QRCodeCanvas');
} else {
  log.push('❌ import qrcode.react پیدا نشد');
}

// ── ۲. handler دانلود: مستقیم از canvas ──
const oldHandler = `  const handleDownloadQR = async () => {
    if (!qrWrapRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(qrWrapRef.current, { backgroundColor: '#ffffff', scale: 3 });
      const link = document.createElement('a');
      link.download = 'divan-recovery-' + Date.now() + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      notify.success('تصویر QR ذخیره شد');
    } catch {
      notify.error('خطا در ذخیره تصویر');
    }
  };`;

const newHandler = `  const handleDownloadQR = async () => {
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

if (src.includes(oldHandler)) {
  src = src.replace(oldHandler, newHandler);
  log.push('✅ handler دانلود → canvas مستقیم');
} else {
  log.push('❌ handler قدیمی پیدا نشد');
}

// ── ۳. تبدیل QRCodeSVG به QRCodeCanvas در JSX ──
const oldQR = `<QRCodeSVG
                value={buildRecoveryQRText(recoveryCode)}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#1e1b4b"
              />`;

const newQR = `<QRCodeCanvas
                value={buildRecoveryQRText(recoveryCode)}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#1e1b4b"
                style={{ width: 200, height: 200 }}
              />`;

if (src.includes(oldQR)) {
  src = src.replace(oldQR, newQR);
  log.push('✅ QRCodeSVG → QRCodeCanvas در JSX');
} else {
  log.push('❌ JSX QRCodeSVG پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
const failed = log.filter(l => l.startsWith('❌'));
if (failed.length) process.exit(1);
console.log('\n🎉 patch موفق');
