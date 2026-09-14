import React, { useState } from 'react';
import { Calendar, Check } from 'lucide-react';
import { useSettings } from '../../lib/theme-context';
import { notify } from '../../lib/toast';
import { fiscalYearRange } from '../../lib/fiscal-year';

export const FiscalSettings: React.FC = () => {
  const { settings, update } = useSettings();
  const [saved, setSaved] = useState(false);
  const flash = () => { setSaved(true); notify.success('ذخیره شد'); setTimeout(() => setSaved(false), 1200); };

  const startYear = Number(settings.fiscalYearLabel) || 1405;
  const range = fiscalYearRange(settings.fiscalYearStartMonth === 1 ? startYear : startYear, settings.fiscalYearStartMonth, settings.fiscalYearStartDay);

  return (
    <div className="max-w-2xl mx-auto space-y-4" dir="rtl">
      {saved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg shadow-lg text-sm">
          <Check className="w-4 h-4" /> ذخیره شد
        </div>
      )}

      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-black/5 dark:border-white/5">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm">تنظیمات سال مالی</h3>
        </div>

        <p className="text-xs opacity-60 leading-relaxed mb-4">
          تاریخ شروع سال مالی کسب‌وکار خود را تنظیم کنید. تمام گزارش‌ها و بستن سال بر این اساس محاسبه می‌شوند.
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">ماه شروع سال مالی</div>
              <div className="text-[11px] opacity-50 mt-0.5">پیش‌فرض: فروردین</div>
            </div>
            <select
              value={settings.fiscalYearStartMonth}
              onChange={(e) => { update({ fiscalYearStartMonth: Number(e.target.value) }); flash(); }}
              className="w-full md:w-64 p-2.5 border rounded-lg text-sm"
            >
              <option value={1}>فروردین (استاندارد ایران)</option>
              <option value={2}>اردیبهشت</option>
              <option value={3}>خرداد</option>
              <option value={4}>تیر</option>
              <option value={5}>مرداد</option>
              <option value={6}>شهریور</option>
              <option value={7}>مهر</option>
              <option value={8}>آبان</option>
              <option value={9}>آذر</option>
              <option value={10}>دی</option>
              <option value={11}>بهمن</option>
              <option value={12}>اسفند</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">روز شروع</div>
              <div className="text-[11px] opacity-50 mt-0.5">۱ تا ۳۱</div>
            </div>
            <input
              type="number" min={1} max={31}
              value={settings.fiscalYearStartDay}
              onChange={(e) => update({ fiscalYearStartDay: Number(e.target.value) })}
              onBlur={flash}
              className="w-24 p-2.5 border rounded-lg text-sm text-center"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">عنوان سال مالی</div>
              <div className="text-[11px] opacity-50 mt-0.5">مثلاً: ۱۴۰۵</div>
            </div>
            <input
              value={settings.fiscalYearLabel}
              onChange={(e) => update({ fiscalYearLabel: e.target.value })}
              onBlur={flash}
              className="w-full md:w-64 p-2.5 border rounded-lg text-sm"
              placeholder="۱۴۰۵"
            />
          </div>
        </div>

        <div className="mt-5 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs">
          <div className="font-bold text-violet-700 dark:text-violet-400 mb-1">بازه سال مالی فعلی:</div>
          <div className="font-mono" dir="ltr">{range.from} → {range.to}</div>
        </div>
      </div>
    </div>
  );
};

export default FiscalSettings;
