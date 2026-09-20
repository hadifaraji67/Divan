import React, { useState } from 'react';
import { Download, X, Loader2, Zap, Clock } from 'lucide-react';
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
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (!info.apkUrl) return;
    setBusy(true);
    notify.info('در حال باز کردن لینک دانلود...');
    const result = await applyApkUpdate(info.apkUrl);
    setBusy(false);
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-b border-black/5 dark:border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs opacity-60 mb-1">نسخه جدید در دسترس</div>
              <div className="font-bold text-lg">دیوان {info.latestVersion}</div>
              <div className="text-xs opacity-60 mt-1">
                نسخه فعلی: <span dir="ltr" className="inline-block">{info.currentVersion}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" disabled={busy}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-xs text-center opacity-60 mb-1">
            نوع بروزرسانی را انتخاب کنید
          </div>

          {/* APK — Active */}
          <button
            onClick={handleDownload}
            disabled={busy}
            className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 hover:border-emerald-500/60 disabled:opacity-60 text-right transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                {busy ? (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">📦 دانلود و نصب</div>
                <div className="text-[11px] opacity-70 mt-0.5">
                  {formatSize(info.apkSize)} — حدود ۱ دقیقه
                </div>
                <div className="text-[10px] opacity-50 mt-1">
                  بدون حذف داده‌ها — نصب مستقیم
                </div>
              </div>
            </div>
          </button>

          {/* OTA — Coming Soon */}
          <button
            onClick={handleOtaComingSoon}
            className="w-full p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-2 border-dashed border-amber-500/30 hover:border-amber-500/50 text-right transition-all relative overflow-hidden"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 relative">
                <Zap className="w-5 h-5 text-amber-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <Clock className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-bold text-sm opacity-70">⚡ بروزرسانی سریع</div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
                    🚧 به‌زودی
                  </span>
                </div>
                <div className="text-[11px] opacity-50 mt-0.5">
                  فقط ۴۹۳ KB — ۲ ثانیه
                </div>
                <div className="text-[10px] opacity-40 mt-1">
                  در حال توسعه — به‌زودی در دسترس
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={onClose}
            disabled={busy}
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
