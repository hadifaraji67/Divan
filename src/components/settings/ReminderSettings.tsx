import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Calendar, TestTube, Check, AlertTriangle } from 'lucide-react';
import {
  loadReminderSettings,
  saveReminderSettings,
  requestNotificationPermission,
  rescheduleAllReminders,
  sendTestNotification,
  type ReminderSettings as RSettings,
} from '../../lib/cheque-reminder';
import { Capacitor } from '@capacitor/core';
import { notify } from '../../lib/toast';

export const ReminderSettings: React.FC = () => {
  const [settings, setSettings] = useState<RSettings>(loadReminderSettings());
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [busy, setBusy] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (!isNative) return;
    try {
      const w = window as any;
      const LN = w.Capacitor?.Plugins?.LocalNotifications;
      if (!LN) return;
      const perm = await LN.checkPermissions();
      setPermission(perm.display === 'granted' ? 'granted' : 'prompt');
    } catch {}
  };

  const updateSetting = (patch: Partial<RSettings>) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    saveReminderSettings(patch);
  };

  const handleEnable = async () => {
    if (!isNative) {
      notify.warning('فقط در اپ اندروید');
      return;
    }

    setBusy(true);
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        notify.error('مجوز اعلان رد شد');
        setBusy(false);
        return;
      }
      setPermission('granted');
      updateSetting({ enabled: true });

      const result = await rescheduleAllReminders();
      setScheduledCount(result.scheduled);
      notify.success(`${result.scheduled} یادآوری زمان‌بندی شد`);
    } catch (err: any) {
      notify.error(err?.message || 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const handleReschedule = async () => {
    setBusy(true);
    try {
      const result = await rescheduleAllReminders();
      setScheduledCount(result.scheduled);
      notify.success(`${result.scheduled} یادآوری زمان‌بندی شد`);
    } catch (err: any) {
      notify.error(err?.message || 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setBusy(true);
    await sendTestNotification();
    setBusy(false);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className={`rounded-2xl border p-5 ${
        settings.enabled
          ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5'
          : 'border-slate-200 dark:border-slate-700'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            settings.enabled ? 'bg-emerald-500/20' : 'bg-slate-500/10'
          }`}>
            {settings.enabled ? (
              <Bell className="w-6 h-6 text-emerald-600" />
            ) : (
              <BellOff className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm mb-1">یادآوری چک‌ها</div>
            <div className="text-xs opacity-70 leading-relaxed">
              قبل از سررسید هر چک، اعلان دریافت کن
            </div>
          </div>
        </div>
      </div>

      {/* Permission Warning */}
      {isNative && permission !== 'granted' && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 opacity-80 leading-relaxed">
            برای دریافت اعلان‌ها، باید مجوز Notification را فعال کنی
          </div>
        </div>
      )}

      {/* Settings */}
      {settings.enabled && (
        <>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
            <div>
              <div className="text-xs font-bold mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                چند روز قبل از سررسید؟
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => updateSetting({ daysBefore: d })}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                      settings.daysBefore === d
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d} روز
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                ساعت اعلان
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[8, 9, 12, 18].map((h) => (
                  <button
                    key={h}
                    onClick={() => updateSetting({ hour: h })}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                      settings.hour === h
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {h}:۰۰
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {!settings.enabled ? (
          <button
            onClick={handleEnable}
            disabled={busy || !isNative}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl"
          >
            <Bell className="w-4 h-4" />
            فعال‌سازی یادآوری
          </button>
        ) : (
          <>
            <button
              onClick={handleReschedule}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl"
            >
              <Check className="w-4 h-4" />
              {busy ? 'در حال...' : 'زمان‌بندی مجدد'}
            </button>

            <button
              onClick={handleTest}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl"
            >
              <TestTube className="w-4 h-4" />
              ارسال اعلان تستی
            </button>

            <button
              onClick={() => {
                updateSetting({ enabled: false });
                notify.info('یادآوری غیرفعال شد');
              }}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 text-rose-600 text-sm font-bold rounded-xl"
            >
              <BellOff className="w-4 h-4" />
              غیرفعال‌سازی
            </button>
          </>
        )}
      </div>

      {scheduledCount > 0 && (
        <div className="text-center text-[11px] opacity-60">
          {scheduledCount} یادآوری فعال است
        </div>
      )}
    </div>
  );
};

export default ReminderSettings;
