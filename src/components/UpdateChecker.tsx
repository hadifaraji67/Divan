import React, { useState, useEffect } from 'react';
import { checkForUpdates, UpdateInfo } from '../lib/updater';

export const UpdateChecker: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await checkForUpdates();
      setUpdateInfo(info);
    } catch (err) {
      setError('امکان برقراری ارتباط با سرور بروزرسانی وجود ندارد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCheck();
  }, []);

  return (
    <div className="p-5 border rounded-2xl bg-card dir-rtl text-right space-y-4 max-w-xl mx-auto shadow-sm">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h3 className="text-base font-bold">بروزرسانی نرم‌افزار دیوان</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            نسخه فعلی شما: <span className="font-mono font-bold text-primary">v{updateInfo?.currentVersion || '...'}</span>
          </p>
        </div>
        <button
          onClick={handleCheck}
          disabled={loading}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
        >
          {loading ? 'در حال بررسی...' : '🔄 بررسی نسخه جدید'}
        </button>
      </div>

      {error && <div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive">{error}</div>}

      {updateInfo && (
        <div>
          {updateInfo.hasUpdate ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  🎉 نسخه جدید v{updateInfo.latestVersion} در دسترس است!
                </span>
              </div>

              <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded-lg border space-y-1">
                <p className="font-semibold text-foreground">تغییرات این نسخه:</p>
                <p className="whitespace-pre-line text-xs font-sans leading-relaxed">{updateInfo.releaseNotes}</p>
              </div>

              <a
                href={updateInfo.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
              >
                دریافت و نصب آخرین نسخه از گیت‌هاب
              </a>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 text-center">
              ✔ شما از آخرین نسخه نرم‌افزار استفاده می‌کنید.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
