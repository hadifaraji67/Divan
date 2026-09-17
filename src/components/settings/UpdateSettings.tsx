import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Download, CheckCircle2, AlertCircle, ExternalLink,
  Smartphone, Globe, Clock, Sparkles, Info, GitBranch, Zap,
} from 'lucide-react';
import {
  APP_VERSION, checkForUpdates, detectPlatform,
  type UpdateInfo,
} from '../../lib/update/update-v2';
import { notify } from '../../lib/toast';
import { UpdateChoiceDialog } from '../shared/UpdateChoiceDialog';

const GITHUB_REPO = 'hadifaraji67/Divan';

export const UpdateSettings: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [lastCheck, setLastCheck] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const platform = detectPlatform();

  const doCheck = async () => {
    setChecking(true);
    try {
      const i = await checkForUpdates(true);
      setInfo(i);
      setLastCheck(Date.now());
      if (i.available) {
        notify.info('نسخه جدید یافت شد', `نسخه ${i.latestVersion} در دسترس است`);
      } else {
        notify.success('برنامه به‌روز است');
      }
    } catch (err) {
      console.error(err);
      notify.error('خطا در بررسی به‌روزرسانی');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => doCheck(), 500);
    return () => clearTimeout(t);
  }, []);

  const handleUpdate = () => {
    if (!info?.available) return;
    setShowDialog(true);
  };

  const formatTime = (ts: number | null) => {
    if (!ts) return 'هرگز';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'همین الان';
    if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
    return `${Math.floor(diff / 86400)} روز پیش`;
  };

  const PlatformIcon = platform === 'native' ? Smartphone : Globe;
  const platformLabel = platform === 'native' ? 'اپلیکیشن اندروید' : platform === 'pwa' ? 'وب‌اپ (PWA)' : 'مرورگر';

  return (
    <div className="max-w-2xl mx-auto space-y-4" dir="rtl">
      {showDialog && info && (
        <UpdateChoiceDialog
          info={info}
          onClose={() => setShowDialog(false)}
          onSuccess={() => { setShowDialog(false); setLastCheck(Date.now()); }}
        />
      )}

      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <div className="p-5 border-b bg-gradient-to-br from-indigo-500/5 to-violet-500/5" style={{ borderColor: 'inherit' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20">
              د
            </div>
            <div className="flex-1">
              <div className="text-xs opacity-60">نسخه فعلی</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {APP_VERSION}
                {info && !info.available && !checking && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                {info && info.available && (
                  <Sparkles className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] opacity-60 mt-1">
                <PlatformIcon className="w-3 h-3" />
                {platformLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              آخرین بررسی: {formatTime(lastCheck)}
            </span>
            <button
              onClick={doCheck}
              disabled={checking}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'در حال بررسی...' : 'بررسی به‌روزرسانی'}
            </button>
          </div>

          {info && info.available && (
            <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-amber-700 dark:text-amber-400">
                    نسخه جدید در دسترس است
                  </div>
                  <div className="text-xs mt-1 opacity-80">
                    نسخه {info.latestVersion} منتشر شده — شما روی {APP_VERSION} هستید
                  </div>
                  <div className="flex gap-3 mt-2 text-[10px] opacity-70">
                    {info.otaAvailable && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" /> بروزرسانی سریع
                      </span>
                    )}
                    {info.apkAvailable && (
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> دانلود کامل
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpdate}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                مشاهده گزینه‌های بروزرسانی
              </button>
            </div>
          )}

          {info && !info.available && !checking && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              شما آخرین نسخه را دارید
            </div>
          )}

          {!info && !checking && (
            <div className="mt-3 p-3 rounded-xl bg-slate-500/5 border border-slate-500/20 flex items-center gap-2 text-xs opacity-70">
              <AlertCircle className="w-4 h-4" />
              برای بررسی، دکمه بالا را بزنید
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-500" />
          اطلاعات سیستم
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
            <span className="opacity-60">نسخه نرم‌افزار</span>
            <b>{APP_VERSION}</b>
          </div>
          <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
            <span className="opacity-60">پلتفرم</span>
            <b>{platformLabel}</b>
          </div>
          <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
            <span className="opacity-60">منبع آپدیت</span>
            <b dir="ltr" className="text-[10px]">github.com/{GITHUB_REPO}</b>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="opacity-60">وضعیت</span>
            <b className={info?.available ? 'text-amber-600' : 'text-emerald-600'}>
              {info?.available ? 'آپدیت موجود' : 'به‌روز'}
            </b>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-violet-500" />
          لینک‌های مفید
        </h3>
        <div className="space-y-2">
          <a href={`https://github.com/${GITHUB_REPO}/releases`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm">
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-500" />
              <span>تاریخچه نسخه‌ها (Releases)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-50" />
          </a>
          <a href="https://divan-one.vercel.app" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-500" />
              <span>نسخه وب (PWA)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-50" />
          </a>
          <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm">
            <span className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-slate-500" />
              <span>مخزن GitHub</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-50" />
          </a>
        </div>
      </div>

      <div className="text-center text-[11px] opacity-40">
        سیستم بروزرسانی ترکیبی — OTA + APK
      </div>
    </div>
  );
};

export default UpdateSettings;
