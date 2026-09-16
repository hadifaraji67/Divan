import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/components/settings/LockSettings.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

function patch(desc, from, to) {
  if (!src.includes(from)) { log.push('❌ ' + desc); return false; }
  if (src.includes(to.split('\n')[0]) && from === to) { log.push('⏭ ' + desc + ' (قبلاً)'); return true; }
  src = src.replace(from, to);
  log.push('✅ ' + desc);
  return true;
}

patch('import React + QRCodeSVG',
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';\nimport { QRCodeSVG } from 'qrcode.react';"
);

patch('lucide Download',
  "Check, AlertTriangle, Eye, EyeOff, Copy, Loader2, X,",
  "Check, AlertTriangle, Eye, EyeOff, Copy, Loader2, X, Download,"
);

patch('import buildRecoveryQRText',
  "import { notify } from '../../lib/toast';",
  "import { notify } from '../../lib/toast';\nimport { buildRecoveryQRText } from '../../lib/security/recovery-code';"
);

patch('ref + handler',
  "  const [showSecret, setShowSecret] = useState(false);",
  `  const [showSecret, setShowSecret] = useState(false);
  const qrWrapRef = useRef<HTMLDivElement>(null);

  const handleDownloadQR = async () => {
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
  };`
);

patch('بلوک QR جایگزین نمایش ساده',
  `<div className="bg-white dark:bg-slate-900 rounded-xl p-6 mb-4 text-center">
            <div className="font-mono text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-widest" dir="ltr">
              {recoveryCode}
            </div>
          </div>`,
  `<div className="bg-white dark:bg-slate-900 rounded-xl p-5 mb-4">
            <div className="font-mono text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-widest text-center mb-4" dir="ltr">
              {recoveryCode}
            </div>
            <div ref={qrWrapRef} className="flex flex-col items-center gap-2 bg-white p-3 rounded-xl">
              <QRCodeSVG
                value={buildRecoveryQRText(recoveryCode)}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#1e1b4b"
              />
              <p className="text-[10px] text-slate-500 text-center">
                با اسکن QR، کد بازیابی خودکار وارد می‌شود
              </p>
            </div>
          </div>`
);

patch('گرید ۳ ستونه',
  '<div className="grid grid-cols-2 gap-2 mb-4">',
  '<div className="grid grid-cols-3 gap-2 mb-4">'
);

patch('دکمه دانلود QR',
  `            <button
              onClick={() => {
                const text = \`کد بازیابی دیوان:`,
  `            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              <Download className="w-4 h-4" /> دانلود
            </button>
            <button
              onClick={() => {
                const text = \`کد بازیابی دیوان:`
);

// کوچک کردن دکمه‌های کپی و اشتراک برای ۳ ستونه
src = src.replace(
  'className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl"',
  'className="flex items-center justify-center gap-2 px-3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"'
);
src = src.replace(
  'className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl"',
  'className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl"'
);

writeFileSync(file, src);
console.log(log.join('\n'));
const failed = log.filter(l => l.startsWith('❌'));
console.log('');
if (failed.length) {
  console.log('⚠️  ' + failed.length + ' مورد patch نشد');
  process.exit(1);
}
console.log('🎉 همه patch ها موفق');
