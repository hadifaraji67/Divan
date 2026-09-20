import React, { useEffect, useState, useCallback } from 'react';
import { Download, X, Sparkles, Zap } from 'lucide-react';
import {
  checkForUpdates, detectPlatform,
  type UpdateInfo,
} from '../../lib/update/update-v2';
import { UpdateChoiceDialog } from './UpdateChoiceDialog';

interface Props {
  forceCheck?: number;
}

export const UpdateBanner: React.FC<Props> = ({ forceCheck }) => {
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [hidden, setHidden] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const doCheck = useCallback(async () => {
    const platform = detectPlatform();
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

  useEffect(() => {
    const interval = setInterval(doCheck, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [doCheck]);

  if (!info || !info.available || hidden) return null;

  return (
    <>
      {showDialog && (
        <UpdateChoiceDialog
          info={info}
          onClose={() => setShowDialog(false)}
          onSuccess={() => { setShowDialog(false); setHidden(true); }}
        />
      )}

      <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden" dir="rtl">
        <button
          onClick={() => setHidden(true)}
          className="absolute top-2 left-2 p-1.5 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <div className="font-bold text-sm">نسخه <span dir="ltr" className="inline-block">{info.latestVersion}</span> آماده است</div>
            <div className="text-[11px] opacity-80 mt-0.5">
              شما روی نسخه <span dir="ltr" className="inline-block">{info.currentVersion}</span> هستید
            </div>
            <div className="flex gap-3 mt-1.5 text-[10px] opacity-70">
              
              {info.apkAvailable && (
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" /> دانلود کامل
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowDialog(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-indigo-700 text-sm font-bold rounded-xl hover:bg-white/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          مشاهده گزینه‌های بروزرسانی
        </button>
      </div>
    </>
  );
};

export default UpdateBanner;
