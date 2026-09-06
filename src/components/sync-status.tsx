import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { subscribeSyncStatus, type SyncStatus } from "@/lib/app-state-client-sync";

/** Small, quiet indicator — only shows up when something's worth flagging. */
export function SyncStatusBadge() {
  const [status, setStatus] = useState<SyncStatus>("idle");

  useEffect(() => subscribeSyncStatus(setStatus), []);

  if (status === "idle" || status === "syncing") return null;

  return (
    <div className="flex items-center justify-center gap-1.5 border-b border-border bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
      {status === "offline" ? (
        <>
          <CloudOff className="size-3.5" />
          آفلاین — تغییرات با اتصال بعدی ذخیره می‌شود
        </>
      ) : (
        <>
          <RefreshCw className="size-3.5" />
          ذخیره‌سازی ناموفق بود — در حال تلاش مجدد
        </>
      )}
    </div>
  );
}
