import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface Props {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<Props> = ({ onDetected, onClose }) => {
  const [status, setStatus] = useState<'init' | 'error'>('init');
  const [error, setError] = useState('');
  const [showSettingsHint, setShowSettingsHint] = useState(false);
  const scanStartedRef = useRef(false);
  const doneRef = useRef(false);

  useEffect(() => {
    // جلوگیری از اجرای دوباره در React.StrictMode
    if (scanStartedRef.current) return;
    scanStartedRef.current = true;

    let cancelled = false;

    const finish = (detectedCode?: string) => {
      if (doneRef.current || cancelled) return;
      doneRef.current = true;

      if (detectedCode) {
        onDetected(detectedCode);
      } else {
        onClose();
      }
    };

    const scan = async () => {
      try {
        if (!Capacitor.isNativePlatform()) {
          setError('اسکنر فقط در نسخه اندروید');
          setStatus('error');
          return;
        }

        const { BarcodeScanner: MLKit, BarcodeFormat } = await import(
          '@capacitor-mlkit/barcode-scanning'
        );

        if (cancelled) return;

        // چک مجوز
        const check = await MLKit.checkPermissions();
        let permStatus = check.camera;

        if (permStatus !== 'granted') {
          const req = await MLKit.requestPermissions();
          permStatus = req.camera;
        }

        if (permStatus !== 'granted') {
          if (!cancelled) {
            setError('دسترسی دوربین غیرفعال است');
            setShowSettingsHint(true);
            setStatus('error');
          }
          return;
        }

        if (cancelled) return;

        // چک پشتیبانی
        const { supported } = await MLKit.isSupported();
        if (!supported) {
          if (!cancelled) {
            setError('دوربین این دستگاه از اسکن بارکد پشتیبانی نمی‌کند');
            setStatus('error');
          }
          return;
        }

        if (cancelled) return;

        // اسکن
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
            finish(code);
            return;
          }
        }

        finish();
      } catch (err: any) {
        if (cancelled) return;
        const msg = err?.message || 'خطا در اسکن';
        console.error('[BarcodeScanner]', msg, err);

        // اگر لغو شد → بی‌صدا ببند
        const lowMsg = msg.toLowerCase();
        if (
          lowMsg.includes('cancel') ||
          lowMsg.includes('dismiss') ||
          lowMsg.includes('closed') ||
          lowMsg.includes('user cancel')
        ) {
          finish();
          return;
        }

        if (lowMsg.includes('permission') || lowMsg.includes('denied')) {
          setError('دسترسی دوربین غیرفعال است');
          setShowSettingsHint(true);
        } else {
          setError(msg);
        }
        setStatus('error');
      }
    };

    const timer = setTimeout(scan, 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    doneRef.current = true;
    onClose();
  };

  const openAppSettings = async () => {
    try {
      const w = window as any;
      if (w.Capacitor?.Plugins?.App?.openSettings) {
        await w.Capacitor.Plugins.App.openSettings();
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" dir="rtl">
      <div className="flex items-center justify-between p-4 text-white bg-black/70">
        <div className="font-bold text-sm">📷 اسکن بارکد</div>
        <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
        {status === 'init' && (
          <div className="text-white text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
            <div className="text-sm">راه‌اندازی اسکنر...</div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-rose-500/95 text-white p-5 rounded-2xl max-w-sm w-full text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <div className="font-bold mb-2 text-sm">اسکنر در دسترس نیست</div>
            <div className="text-[11px] opacity-90 leading-relaxed mb-3">{error}</div>

            {showSettingsHint && (
              <div className="bg-white/10 rounded-lg p-3 mb-3 text-right">
                <div className="text-[10px] font-bold mb-2">📋 مراحل فعال‌سازی:</div>
                <div className="text-[10px] leading-relaxed space-y-1">
                  <div>۱. Settings → Apps → دیوان</div>
                  <div>۲. Permissions → Camera → <b>Allow</b></div>
                  <div>۳. به اپ برگرد</div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {showSettingsHint && (
                <button
                  onClick={openAppSettings}
                  className="flex-1 px-4 py-2 bg-white text-rose-600 rounded-lg font-bold text-xs"
                >
                  ⚙️ تنظیمات
                </button>
              )}
              <button
                onClick={handleClose}
                className={`${showSettingsHint ? 'flex-1' : 'w-full'} px-4 py-2 bg-white/20 text-white rounded-lg font-bold text-xs`}
              >
                بستن
              </button>
            </div>
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
