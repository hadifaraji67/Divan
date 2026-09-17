import React, { useState } from 'react';
import { Zap, Package, X, Loader2, Check } from 'lucide-react';
import type { UpdateInfo } from '../../lib/update/update-v2';
import { applyOtaUpdate, applyApkUpdate } from '../../lib/update/update-v2';
import { notify } from '../../lib/toast';

interface Props {
  info: UpdateInfo;
  onClose: () => void;
  onSuccess: () => void;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

export const UpdateChoiceDialog: React.FC<Props> = ({ info, onClose, onSuccess }) => {
  const [busy, setBusy] = useState<'ota' | 'apk' | null>(null);

  const handleOta = async () => {
    if (!info.otaUrl) return;
    setBusy('ota');
    notify.info('در حال دانلود بروزرسانی سریع...');
    const result = await applyOtaUpdate(info.otaUrl);
    setBusy(null);
    if (result.success) {
      notify.success('بروزرسانی اعمال شد');
      onSuccess();
      // اپ خودکار reload می‌شود
    } else {
      notify.error(result.error || 'خطا در OTA');
    }
  };

  const handleApk = async () => {
    if (!info.apkUrl) return;
    setBusy('apk');
    notify.info('در حال باز کردن دانلود APK...');
    const result = await applyApkUpdate(info.apkUrl);
    setBusy(null);
    if (result.success) {
      notify.success('لینک دانلود باز شد');
      onSuccess();
    } else {
      notify.error(result.error || 'خطا');
    }
  };

  const showBoth = info.otaAvailable && info.apkAvailable;
  const showOnlyOta = info.otaAvailable && !info.apkAvailable;
  const showOnlyApk = !info.otaAvailable && info.apkAvailable;

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
                نسخه فعلی: {info.currentVersion}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
              disabled={busy !== null}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {info.releaseNotes && (
            <div className="mt-3 p-3 rounded-lg bg-white/60 dark:bg-slate-900/40 max-h-24 overflow-y-auto">
              <div className="text-[10px] font-bold opacity-60 mb-1">تغییرات:</div>
              <div className="text-[11px] leading-relaxed whitespace-pre-wrap">
                {info.releaseNotes.slice(0, 400)}
                {info.releaseNotes.length > 400 ? '...' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="p-4 space-y-3">
          {showBoth && (
            <div className="text-xs text-center opacity-60 mb-1">
              نوع بروزرسانی را انتخاب کنید
            </div>
          )}

          {(showBoth || showOnlyOta) && (
            <button
              onClick={handleOta}
              disabled={busy !== null}
              className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 hover:border-emerald-500/60 disabled:opacity-60 text-right transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  {busy === 'ota' ? <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" /> : <Zap className="w-5 h-5 text-emerald-600" />}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">⚡ بروزرسانی سریع</div>
                  <div className="text-[11px] opacity-70 mt-0.5">
                    فقط {formatSize(info.otaSize)} — حدود ۲ ثانیه
                  </div>
                  <div className="text-[10px] opacity-50 mt-1">
                    کد و رابط کاربری جدید — داده‌ها دست‌نخورده
                  </div>
                </div>
              </div>
            </button>
          )}

          {(showBoth || showOnlyApk) && (
            <button
              onClick={handleApk}
              disabled={busy !== null}
              className="w-full p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/10 border-2 border-slate-500/30 hover:border-slate-500/60 disabled:opacity-60 text-right transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center shrink-0">
                  {busy === 'apk' ? <Loader2 className="w-5 h-5 text-slate-600 animate-spin" /> : <Package className="w-5 h-5 text-slate-600" />}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">📦 دانلود کامل</div>
                  <div className="text-[11px] opacity-70 mt-0.5">
                    {formatSize(info.apkSize)} — حدود ۱ دقیقه
                  </div>
                  <div className="text-[10px] opacity-50 mt-1">
                    شامل همه تغییرات سیستمی و پلاگین‌ها
                  </div>
                </div>
              </div>
            </button>
          )}

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
