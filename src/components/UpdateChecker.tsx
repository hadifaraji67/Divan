import React, { useState, useEffect } from 'react';
import { checkForUpdates, UpdateInfo } from '../lib/updater';

export const UpdateChecker: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    const info = await checkForUpdates();
    setUpdateInfo(info);
    setLoading(false);
  };

  useEffect(() => { handleCheck(); }, []);

  return (
    <div className="p-4 border rounded-xl bg-card text-right dir-rtl space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold text-sm">بروزرسانی نرم‌افزار</h4>
          <p className="text-xs text-muted-foreground">نسخه فعلی: v{updateInfo?.currentVersion || '...'}</p>
        </div>
        <button onClick={handleCheck} disabled={loading} className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg">
          {loading ? 'در حال بررسی...' : 'بررسی آپدیت'}
        </button>
      </div>
      {updateInfo?.hasUpdate && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-2">
          <p className="font-bold text-amber-600">نسخه جدید v{updateInfo.latestVersion} موجود است!</p>
          <a href={updateInfo.downloadUrl} target="_blank" rel="noreferrer" className="inline-block px-3 py-1 bg-amber-600 text-white rounded font-bold">
            دریافت نسخه جدید
          </a>
        </div>
      )}
    </div>
  );
};
