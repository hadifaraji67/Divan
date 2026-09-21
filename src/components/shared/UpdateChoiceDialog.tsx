import React, { useState } from 'react';
import { X, Loader2, Zap, Package, Download } from 'lucide-react';
import type { UpdateInfo } from '../../lib/update/update-v2';
import { applyApkUpdate } from '../../lib/update/update-v2';
import { notify } from '../../lib/toast';

interface Props {
  info: UpdateInfo;
  onClose: () => void;
  onSuccess: () => void;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

export const UpdateChoiceDialog: React.FC<Props> = ({ info, onClose, onSuccess }) => {
  const [busy, setBusy] = useState<'full' | 'light' | null>(null);

  const handleDownload = async (url: string | undefined, mode: 'full' | 'light') => {
    if (!url) return;
    setBusy(mode);
    notify.info('در حال باز کردن لینک دانلود...');
    const result = await applyApkUpdate(url);
    setBusy(null);
    if (result.success) {
      notify.success('لینک دانلود در مرورگر باز شد');
      onSuccess();
    } else {
      notify.error(result.error || 'خطا');
    }
  };

  const handleOtaComingSoon = () => {
    notify.info('به‌زودی در دسترس است', 'بروزرسانی خودکار در نسخه‌های بعدی فعال می‌شود');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-b border-black/5 dark:border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs opacity-60 mb-1">نسخه جدید در دسترس</div>
              <div className="font-bold text-lg">دیوان {info.latestVersion}</div>
              <div className="text-xs opacity-60 mt-1">
                نسخه فعلی: <span dir="ltr" className="inline-block">{info.currentVersion}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" disabled={busy !== null}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-xs text-center opacity-60 mb-1">
            نسخه مناسب دستگاهت را انتخاب کن
          </div>

          {/* FULL */}
          <button
            onClick={() => handleDownload(info.apkUrl, 'full')}
            disabled={busy !== null}
            className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 hover:border-emerald-500/60 disabled:opacity-60 text-right transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                {busy === 'full' ? (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                ) : (
                  <Package className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-bold text-sm">📦 نسخه کامل</div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                    توصیه می‌شود
                  </span>
                </div>
                <div className="text-[11px] opacity-70 mt-0.5">
                  {formatSize(info.apkSize)} — همه‌جا کار می‌کند
                </div>
                <div className="text-[10px] opacity-50 mt-1">
                  ✓ بدون نیاز به Google Play Services
                </div>
              </div>
            </div>
          </button>

          {/* LIGHT */}
          

          {/* OTA */}
          <button
            onClick={handleOtaComingSoon}
            className="w-full p-3 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-2 border-dashed border-amber-500/30 text-right transition-all opacity-70"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <div className="font-bold text-xs opacity-70">⚡ بروزرسانی سریع</div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 font-bold mr-auto">
                🚧 به‌زودی
              </span>
            </div>
          </button>

          <button
            onClick={onClose}
            disabled={busy !== null}
            className="w-full py-2.5 text-xs opacity-60 hover:opacity-100 disabled:opacity-30 transition-opacity"
          >
            بعداً
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateChoiceDialog;
