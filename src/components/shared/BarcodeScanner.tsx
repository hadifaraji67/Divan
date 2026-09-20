import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner as MLKit, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

interface Props {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<Props> = ({ onDetected, onClose }) => {
  const [status, setStatus] = useState<'init' | 'error'>('init');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const scan = async () => {
      try {
        // ─── ۱. چک پلتفرم ───
        if (!Capacitor.isNativePlatform()) {
          // در Web: Fallback به پیام خطا
          setError('اسکنر فقط در نسخه اندروید');
          setStatus('error');
          return;
        }

        // ─── ۲. درخواست مجوز دوربین ───
        const perm = await MLKit.requestPermissions();
        if (perm.camera !== 'granted') {
          if (!cancelled) {
            setError('برای اسکن بارکد، دسترسی دوربین را از تنظیمات گوشی فعال کن');
            setStatus('error');
          }
          return;
        }

        // ─── ۳. چک پشتیبانی ───
        const { supported } = await MLKit.isSupported();
        if (!supported) {
          if (!cancelled) {
            setError('دوربین این دستگاه از اسکن بارکد پشتیبانی نمی‌کند');
            setStatus('error');
          }
          return;
        }

        if (cancelled) return;

        // ─── ۴. شروع اسکن ───
        // MLKit خودش یک modal کامل باز می‌کند
        const result = await MLKit.scan({
          formats: [
            BarcodeFormat.Ean13,
            BarcodeFormat.Ean8,
            BarcodeFormat.Code128,
            BarcodeFormat.Code39,
            BarcodeFormat.UpcA,
            BarcodeFormat.UpcE,
            BarcodeFormat.QrCode,
          ],
        });

        if (cancelled) return;

        if (result.barcodes && result.barcodes.length > 0) {
          const code = result.barcodes[0].rawValue || result.barcodes[0].displayValue || '';
          if (code) {
            if (navigator.vibrate) navigator.vibrate(100);
            onDetected(code);
            return;
          }
        }

        // کاربر انصراف داد
        onClose();
      } catch (err: any) {
        if (cancelled) return;
        const msg = err?.message || 'خطا در اسکن';
        console.error('[BarcodeScanner]', msg, err);
        setError(msg);
        setStatus('error');
      }
    };

    scan();

    return () => { cancelled = true; };
  }, [onDetected, onClose]);

  // ─── نمایش UI ───
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" dir="rtl">
      <div className="flex items-center justify-between p-4 text-white bg-black/70">
        <div className="font-bold text-sm">📷 اسکن بارکد</div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {status === 'init' && (
          <div className="text-white text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
            <div className="text-sm">راه‌اندازی اسکنر...</div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-rose-500/95 text-white p-5 rounded-2xl max-w-xs mx-4 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <div className="font-bold mb-1 text-sm">اسکنر در دسترس نیست</div>
            <div className="text-[11px] opacity-90 leading-relaxed">{error}</div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-white text-rose-600 rounded-lg font-bold text-xs"
            >
              بستن
            </button>
          </div>
        )}
      </div>

      {status === 'init' && (
        <div className="p-4 text-center text-white/70 text-[11px] bg-black/70">
          بارکد را داخل کادر قرار بده
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
