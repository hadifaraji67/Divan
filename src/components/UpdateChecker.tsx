import React, { useEffect, useState } from 'react';
import { checkForUpdates, UpdateInfo } from '../services/updateService';
import { RefreshCw, Download } from 'lucide-react';

export const UpdateChecker: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    const result = await checkForUpdates();
    if (result.hasUpdate) {
      setUpdateInfo(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    check();
  }, []);

  if (!updateInfo?.hasUpdate) return null;

  return (
    <div className="p-3 m-2 bg-indigo-900/80 border border-indigo-500/50 rounded-xl text-white text-xs flex flex-col gap-2">
      <div className="flex items-center justify-between font-semibold">
        <span className="flex items-center gap-1">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          نسخه جدید {updateInfo.version} موجود است
        </span>
      </div>
      <a
        href={updateInfo.downloadUrl}
        target="_blank"
        rel="noreferrer"
        className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-center font-medium flex items-center justify-center gap-1 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        دریافت و بروزرسانی
      </a>
    </div>
  );
};
