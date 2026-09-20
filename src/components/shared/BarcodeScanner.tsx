import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<Props> = ({ onDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'init' | 'scanning' | 'error'>('init');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let animId = 0;

    const start = async () => {
      try {
        const BD = (window as any).BarcodeDetector;
        if (!BD) throw new Error('BarcodeDetector در این دستگاه پشتیبانی نمی‌شود');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });

        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus('scanning');

        let formats = ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'];
        try {
          const supported: string[] = await BD.getSupportedFormats();
          if (supported.length) formats = formats.filter((f) => supported.includes(f));
        } catch {}

        const detector = new BD({ formats });

        const scan = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes?.length && codes[0].rawValue) {
              if (navigator.vibrate) navigator.vibrate(100);
              onDetected(codes[0].rawValue);
              return;
            }
          } catch {}
          animId = requestAnimationFrame(scan);
        };
        scan();
      } catch (err: any) {
        setError(err?.message || 'خطا در دوربین');
        setStatus('error');
      }
    };

    start();
    return () => {
      cancelled = true;
      if (animId) cancelAnimationFrame(animId);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" dir="rtl">
      <div className="flex items-center justify-between p-4 text-white bg-black/70">
        <div className="font-bold text-sm">📷 اسکن بارکد</div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />

        {status === 'scanning' && (
          <div className="relative z-10 w-72 h-44 border-2 border-emerald-400 rounded-xl shadow-2xl shadow-emerald-400/30">
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400 animate-pulse" />
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
          </div>
        )}

        {status === 'init' && (
          <div className="relative z-10 text-white text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
            <div className="text-sm">راه‌اندازی دوربین...</div>
          </div>
        )}

        {status === 'error' && (
          <div className="relative z-10 bg-rose-500/95 text-white p-5 rounded-2xl max-w-xs mx-4 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <div className="font-bold mb-1 text-sm">دوربین در دسترس نیست</div>
            <div className="text-[11px] opacity-90 leading-relaxed">{error}</div>
            <div className="text-[10px] mt-3 pt-3 border-t border-white/20 opacity-80">
              می‌تونی کد را دستی وارد کنی
            </div>
          </div>
        )}
      </div>

      <div className="p-4 text-center text-white/70 text-[11px] bg-black/70">
        بارکد را داخل کادر قرار بده
      </div>
    </div>
  );
};

export default BarcodeScanner;
