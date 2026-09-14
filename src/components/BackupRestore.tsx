import React, { useState, useRef } from 'react';
import { Download, Upload, Database, AlertTriangle, CheckCircle2, FileJson, Trash2 } from 'lucide-react';
import { notify } from '../lib/toast';

const STORAGE_KEYS = [
  'divan_contacts', 'divan_products', 'divan_invoices',
  'divan_payments', 'divan_cheques', 'divan_settings_v1',
  'divan_update_state',
];

export const BackupRestore: React.FC = () => {
  const [backupData, setBackupData] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBackup = () => {
    try {
      const data: Record<string, any> = {};
      STORAGE_KEYS.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) {
          try { data[key] = JSON.parse(val); }
          catch { data[key] = val; }
        }
      });

      const backup = {
        version: '1.0.0',
        app: 'divan',
        createdAt: new Date().toISOString(),
        data,
      };

      const json = JSON.stringify(backup, null, 2);
      setBackupData(json);

      // آمار
      setStats({
        contacts: Array.isArray(data.divan_contacts) ? data.divan_contacts.length : 0,
        products: Array.isArray(data.divan_products) ? data.divan_products.length : 0,
        invoices: Array.isArray(data.divan_invoices) ? data.divan_invoices.length : 0,
        payments: Array.isArray(data.divan_payments) ? data.divan_payments.length : 0,
        cheques: Array.isArray(data.divan_cheques) ? data.divan_cheques.length : 0,
        size: (json.length / 1024).toFixed(1),
      });

      notify.success('پشتیبان ساخته شد');
    } catch (err) {
      console.error(err);
      notify.error('خطا در ساخت پشتیبان');
    }
  };

  const downloadBackup = () => {
    if (!backupData) { createBackup(); return; }
    const blob = new Blob([backupData], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `divan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify.success('فایل پشتیبان دانلود شد');
  };

  const restoreFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('تمام داده‌های فعلی جایگزین خواهند شد. مطمئنید؟')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (backup.app !== 'divan' || !backup.data) {
          notify.error('فایل پشتیبان معتبر نیست');
          return;
        }
        Object.entries(backup.data).forEach(([key, val]) => {
          if (key.startsWith('divan_')) {
            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          }
        });
        notify.success('بازیابی انجام شد. صفحه رفرش می‌شود...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error(err);
        notify.error('خطا در خواندن فایل');
      }
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    if (!confirm('⚠️ هشدار: تمام داده‌ها پاک خواهند شد!\n\nاین عمل قابل بازگشت نیست. مطمئنید؟')) return;
    if (!confirm('یک بار دیگر تأیید کنید.')) return;
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    notify.success('همه داده‌ها پاک شد');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto" dir="rtl">
      <div className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <Database className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-bold text-base">پشتیبان‌گیری و بازیابی</h3>
            <p className="text-xs opacity-60 mt-0.5">همه داده‌ها در یک فایل JSON ذخیره یا بازیابی می‌شوند</p>
          </div>
        </div>
      </div>

      {/* پشتیبان‌گیری */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-sm">ساخت پشتیبان</h3>
        </div>
        <p className="text-xs opacity-60 mb-3">
          یک فایل JSON شامل تمام مشتریان، کالاها، فاکتورها، پرداخت‌ها، چک‌ها و تنظیمات
        </p>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02]">
            <Stat label="مشتریان" value={stats.contacts} />
            <Stat label="کالاها" value={stats.products} />
            <Stat label="فاکتورها" value={stats.invoices} />
            <Stat label="پرداخت‌ها" value={stats.payments} />
            <Stat label="حجم (KB)" value={stats.size} />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={createBackup}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm rounded-lg">
            <FileJson className="w-4 h-4" /> ساخت پشتیبان
          </button>
          <button onClick={downloadBackup}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg">
            <Download className="w-4 h-4" /> دانلود فایل پشتیبان
          </button>
        </div>
      </div>

      {/* بازیابی */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Upload className="w-4 h-4 text-sky-500" />
          <h3 className="font-bold text-sm">بازیابی از فایل</h3>
        </div>
        <p className="text-xs opacity-60 mb-3">
          فایل پشتیبان JSON را انتخاب کنید. <b className="text-rose-500">توجه: تمام داده‌های فعلی جایگزین می‌شوند.</b>
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={restoreFromFile}
          className="hidden"
        />
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-lg">
          <Upload className="w-4 h-4" /> انتخاب فایل پشتیبان
        </button>
      </div>

      {/* خطر */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <h3 className="font-bold text-sm text-rose-600 dark:text-rose-400">منطقه خطر</h3>
        </div>
        <p className="text-xs opacity-70 mb-3">حذف کامل تمام داده‌ها (غیرقابل بازگشت)</p>
        <button onClick={clearAll}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg">
          <Trash2 className="w-4 h-4" /> حذف همه داده‌ها
        </button>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div className="text-center">
    <div className="text-[10px] opacity-60">{label}</div>
    <div className="text-sm font-bold mt-0.5">{value}</div>
  </div>
);

export default BackupRestore;
