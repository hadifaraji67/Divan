import React, { useState, useEffect, useMemo } from 'react';
import { History, Search, Filter, Trash2, Download, X } from 'lucide-react';
import {
  type ActivityEntry,
  type ActivityEntity,
  type ActivityAction,
  getActivityLog,
  clearActivityLog,
  getActivityStats,
  getActivityLogFiltered,
  entityLabel,
  actionLabel,
} from '../../lib/activity-log';
import { ActivityTimeline } from '../shared/ActivityTimeline';
import { exportToCSV } from '../../lib/export';
import { notify } from '../../lib/toast';

const ENTITIES: { key: ActivityEntity | 'all'; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'invoice', label: 'فاکتور' },
  { key: 'contact', label: 'اشخاص' },
  { key: 'product', label: 'کالا' },
  { key: 'payment', label: 'پرداخت' },
  { key: 'cheque', label: 'چک' },
  { key: 'user', label: 'کاربران' },
];

const ACTIONS: { key: ActivityAction | 'all'; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'create', label: 'ایجاد' },
  { key: 'update', label: 'ویرایش' },
  { key: 'delete', label: 'حذف' },
  { key: 'void', label: 'باطل' },
  { key: 'payment', label: 'پرداخت' },
];

export const ActivityLogSettings: React.FC = () => {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<ActivityEntity | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<ActivityAction | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const load = () => {
    setEntries(getActivityLog());
  };

  useEffect(() => {
    load();

    const handler = () => load();
    window.addEventListener('divan-activity-log', handler);
    return () => window.removeEventListener('divan-activity-log', handler);
  }, []);

  const stats = useMemo(() => getActivityStats(), [entries]);

  const filtered = useMemo(() => {
    return getActivityLogFiltered({
      entity: entityFilter === 'all' ? undefined : entityFilter,
      action: actionFilter === 'all' ? undefined : actionFilter,
      search: search || undefined,
      limit: 500,
    });
  }, [entries, entityFilter, actionFilter, search]);

  const handleClear = () => {
    if (!confirm('همه تاریخچه پاک شود؟ این کار قابل بازگشت نیست.')) return;
    clearActivityLog();
    load();
    notify.success('تاریخچه پاک شد');
  };

  const handleExport = async () => {
    if (filtered.length === 0) {
      notify.warning('داده‌ای برای خروجی نیست');
      return;
    }
    await exportToCSV('تاریخچه-فعالیت', filtered, [
      { key: 'at', label: 'زمان' },
      { key: 'action', label: 'عملیات', format: (v: any) => actionLabel(v) },
      { key: 'entity', label: 'نوع', format: (v: any) => entityLabel(v) },
      { key: 'entityLabel', label: 'مورد' },
      { key: 'summary', label: 'توضیحات' },
      { key: 'user', label: 'کاربر' },
      { key: 'amount', label: 'مبلغ' },
    ]);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-2xl p-4 bg-gradient-to-l from-sky-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6" />
          <div>
            <h2 className="font-bold text-lg">تاریخچه فعالیت‌ها</h2>
            <p className="text-xs opacity-80 mt-0.5">
              ثبت خودکار همه تغییرات در نرم‌افزار
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-[10px] text-slate-500 dark:text-slate-400">کل</div>
          <div className="font-bold text-lg">{stats.total.toLocaleString('fa-IR')}</div>
        </div>
        <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-center">
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400">امروز</div>
          <div className="font-bold text-lg text-emerald-800 dark:text-emerald-300">
            {stats.today.toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="rounded-xl p-3 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-center">
          <div className="text-[10px] text-sky-700 dark:text-sky-400">۷ روز اخیر</div>
          <div className="font-bold text-lg text-sky-800 dark:text-sky-300">
            {stats.thisWeek.toLocaleString('fa-IR')}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در تاریخچه..."
            className="w-full pr-10 pl-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`px-3 py-2.5 rounded-lg border text-sm font-bold flex items-center gap-1.5 ${
            showFilters
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          فیلتر
        </button>
      </div>

      {showFilters && (
        <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">نوع</div>
            <div className="flex flex-wrap gap-1.5">
              {ENTITIES.map((e) => (
                <button
                  key={e.key}
                  onClick={() => setEntityFilter(e.key)}
                  className={`text-xs px-2.5 py-1 rounded-lg border ${
                    entityFilter === e.key
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">عملیات</div>
            <div className="flex flex-wrap gap-1.5">
              {ACTIONS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setActionFilter(a.key)}
                  className={`text-xs px-2.5 py-1 rounded-lg border ${
                    actionFilter === a.key
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg"
        >
          <Download className="w-4 h-4" />
          خروجی Excel
        </button>
        <button
          onClick={handleClear}
          disabled={entries.length === 0}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
          پاک کردن
        </button>
      </div>

      <div className="rounded-xl p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
          نمایش {filtered.length.toLocaleString('fa-IR')} از {entries.length.toLocaleString('fa-IR')} رکورد
        </div>
        <ActivityTimeline entries={filtered} />
      </div>
    </div>
  );
};

export default ActivityLogSettings;
