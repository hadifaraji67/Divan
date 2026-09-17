import React, { useState, useEffect, useRef } from 'react';
import { Download, Share2, Copy, QrCode, FileText, Check, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { buildRecoveryQRText } from '../../lib/security/recovery-code';
import { notify } from '../../lib/toast';
import { isCapacitor } from '../../lib/server/biometric';

interface Props {
  code: string;
  username?: string;
}

export const RecoveryQR: React.FC<Props> = ({ code, username }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQR();
  }, [code, username]);

  const generateQR = async () => {
    try {
      const qrText = buildRecoveryQRText(code, username);

      // تولید Data URL برای نمایش
      const url = await QRCode.toDataURL(qrText, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      setDataUrl(url);

      // تولید روی canvas برای دانلود PNG
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrText, {
          width: 800,
          margin: 4,
          color: { dark: '#1e293b', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });
      }
    } catch (err) {
      console.error('[QR] error:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      notify.success('کد کپی شد');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify.error('کپی نشد');
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `divan-recovery-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify.success('تصویر ذخیره شد');
    }, 'image/png');
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;

    const text = `کد بازیابی دیوان:\n${code}\n\nاین کد را در جای امنی ذخیره کنید.`;

    try {
      // اگر Web Share API پشتیبانی شد (موبایل)
      if (navigator.share) {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `recovery-${Date.now()}.png`, { type: 'image/png' });
          const files = [file];

          if (navigator.canShare && navigator.canShare({ files })) {
            await navigator.share({
              files,
              title: 'کد بازیابی دیوان',
              text,
            });
          } else {
            await navigator.share({ title: 'کد بازیابی دیوان', text });
          }
        }, 'image/png');
      } else {
        await navigator.clipboard.writeText(text);
        notify.success('متن کپی شد (اشتراک‌گذاری پشتیبانی نمی‌شود)');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('[share]', err);
        notify.error('اشتراک‌گذاری ناموفق');
      }
    }
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;

    const win = window.open('', '_blank');
    if (!win) return;

    const imgData = canvasRef.current.toDataURL('image/png');
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8" />
          <title>کد بازیابی دیوان</title>
          <style>
            body { font-family: Tahoma, sans-serif; padding: 40px; text-align: center; }
            h1 { color: #1e293b; }
            .code { font-family: monospace; font-size: 24px; letter-spacing: 3px; margin: 30px 0; padding: 20px; background: #f1f5f9; border-radius: 12px; direction: ltr; }
            img { max-width: 350px; margin: 20px auto; }
            .warning { color: #dc2626; font-size: 14px; margin-top: 30px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.8; }
            .title { font-size: 20px; color: #64748b; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>کد بازیابی دیوان</h1>
          <p class="title">این کد را در جای امنی ذخیره کنید</p>
          <div class="code">${code}</div>
          <img src="${imgData}" alt="QR Code" />
          <p class="warning">⚠️ هشدار: اگر رمز قفل محلی را فراموش کنید، تنها راه بازیابی این کد است. این کد را در جای امنی نگه دارید و در اختیار دیگران قرار ندهید.</p>
          <script>setTimeout(function(){ window.print(); }, 500);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  if (!dataUrl) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs opacity-60">در حال ساخت QR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* QR Code */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 flex justify-center border-2 border-slate-200 dark:border-slate-700">
        <img
          src={dataUrl}
          alt="کد بازیابی QR"
          className="w-56 h-56 sm:w-64 sm:h-64"
        />
      </div>

      {/* کد متنی */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-center">
        <div className="text-[10px] opacity-60 mb-2">کد بازیابی (۱۶ کاراکتر)</div>
        <div className="font-mono text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-widest" dir="ltr">
          {code}
        </div>
      </div>

      {/* دکمه‌ها */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'کپی شد' : 'کپی کد'}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Share2 className="w-4 h-4" />
          اشتراک
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          دانلود PNG
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Printer className="w-4 h-4" />
          چاپ
        </button>
      </div>

      {/* هشدار */}
      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
        ⚠️ <b>هشدار:</b> این کد فقط یک بار نمایش داده می‌شود. آن را در جای امنی ذخیره کنید.
      </div>

      {/* Canvas مخفی برای دانلود */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default RecoveryQR;
