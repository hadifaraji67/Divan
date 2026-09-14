import React, { useEffect, useState, useCallback } from 'react';
import { Download, RefreshCw, X, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import {
  checkForUpdates,
  watchServiceWorker,
  applyPwaUpdate,
  downloadNativeUpdate,
  dismissUpdate,
  detectPlatform,
  type UpdateInfo,
} from '../lib/update-service';

interface Props {
  forceCheck?: number; // اگر تغییر کند، چک می‌کند
}

export const UpdateBanner: React.FC<Props> = ({ forceCheck }) => {
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(false);

  // ۱. PWA: پایش service worker
  useEffect(() => {
    const cleanup = watchServiceWorker((i) => {
      setInfo(i);
      setHidden(false);
    });
    return cleanup;
  }, []);

  // ۲. Native/Web: چک GitHub Releases
  const doCheck = useCallback(async () => {
    const platform = detectPlatform();
    // برای PWA فقط از service worker استفاده می‌کنیم
    if (platform === 'pwa') return;

    try {
      const i = await checkForUpdates();
      if (i.available) {
        setInfo(i);
        setHidden(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    doCheck();
  }, [doCheck, forceCheck]);

  // چک دوره‌ای
  useEffect(() => {
    const interval = setInterval(doCheck, 1000 * 60 * 60); // هر ۱ ساعت
    return () => clearInterval(interval);
  }, [doCheck]);

  if (!info || !info.available || hidden) return null;

  const handleUpdate = async () => {
    setBusy(true);
    try {
      if (info.source === 'pwa') {
        await applyPwaUpdate();
      } else if (info.downloadUrl) {
        await downloadNativeUpdate(info.downloadUrl);
      } else {
        // اگر لینک APK نبود، به صفحه Release برو
        window.open('https://github.com/hadifaraji67/Divan/releases', '_blank');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    if (info.latestVersion) dismissUpdate(info.latestVersion);
    setHidden(true);
  };

  const isPwa = info.source === 'pwa';
  const platform = detectPlatform();

  return (
    <div className="fixed left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bottom-20 md:bottom-4 animate-[fadeIn_0.3s_ease-out]" dir="rtl">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl border"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          borderColor: 'rgba(255,255,255,0.15)',
        }}>
        {/* نقطه‌های تزئینی */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 10% 20%, white 1px, transparent 1px), radial-gradient(circle at 90% 80%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        <div className="relative p-4 text-white">
          <button
            onClick={handleDismiss}
            className="absolute top-3 left-3 p-1.5 rounded-lg hover:bg-white/15 transition-colors"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              {isPwa ? <Sparkles className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <div className="font-bold text-sm">
                {isPwa ? 'نسخه جدید برنامه آماده است' : 'به‌روزرسانی در دسترس است'}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {isPwa
                  ? 'برای اعمال تغییرات، صفحه را دوباره بارگذاری کن'
                  : `نسخه ${info.latestVersion} منتشر شد (شما: ${info.currentVersion})`}
              </div>
            </div>
          </div>

          {info.releaseNotes && (
            <div className="mb-3 p-2.5 rounded-lg bg-black/20 backdrop-blur-sm max-h-24 overflow-y-auto">
              <div className="text-[10px] opacity-70 mb-1 font-bold">تغییرات:</div>
              <div className="text-[11px] leading-relaxed whitespace-pre-wrap opacity-90">
                {info.releaseNotes.slice(0, 300)}
                {info.releaseNotes.length > 300 ? '...' : ''}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-indigo-700 text-xs font-bold rounded-lg hover:bg-white/95 transition-colors disabled:opacity-50"
            >
              {busy ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> در حال...</>
              ) : isPwa ? (
                <><RefreshCw className="w-3.5 h-3.5" /> به‌روزرسانی</>
              ) : (
                <><Download className="w-3.5 h-3.5" /> دانلود نسخه جدید</>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2.5 text-xs rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
            >
              بعداً
            </button>
          </div>

          {platform === 'native' && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] opacity-80">
              <AlertCircle className="w-3 h-3" />
              پس از دانلود، فایل APK را نصب کن
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateBanner;
