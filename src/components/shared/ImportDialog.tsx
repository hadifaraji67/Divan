import React, { useState } from 'react';
import { Upload, X, Loader2, FileText, Check, AlertTriangle, Download } from 'lucide-react';
import { importFromCSV, downloadTemplate, type ImportColumn } from '../../lib/import';
import { notify } from '../../lib/toast';

interface Props {
  title: string;
  columns: ImportColumn<any>[];
  templateName: string;
  onImported: (rows: any[]) => void;
  onClose: () => void;
}

export const ImportDialog: React.FC<Props> = ({
  title,
  columns,
  templateName,
  onImported,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: any[] } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setBusy(true);

    try {
      const res = await importFromCSV(file, columns);
      setResult({ imported: res.imported, errors: res.errors });

      if (res.imported > 0) {
        onImported(res.data);
        notify.success(`${res.imported} ردیف وارد شد`);
      } else {
        notify.error('هیچ ردیفی وارد نشد');
      }
    } catch (err: any) {
      notify.error(err?.message || 'خطا');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-sm">{title}</span>
          </div>
          <button onClick={onClose} disabled={busy} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* راهنما */}
          <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 text-xs leading-relaxed">
            <div className="font-bold text-sky-700 dark:text-sky-400 mb-1">
              📋 راهنما
            </div>
            <div className="opacity-80 space-y-1">
              <div>• فایل باید <b>CSV</b> با انکدینگ <b>UTF-8</b> باشد</div>
              <div>• ستون‌های اجباری: {columns.filter(c => c.required).map(c => c.label).join(', ')}</div>
              <div>• می‌توانید قالب نمونه را دانلود کنید</div>
            </div>
            <button
              onClick={() => downloadTemplate(templateName, columns)}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold"
            >
              <Download className="w-3 h-3" />
              دانلود قالب نمونه
            </button>
          </div>

          {/* انتخاب فایل */}
          <label className={`block p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
            file
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
          }`}>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              disabled={busy}
              className="hidden"
            />
            {file ? (
              <>
                <FileText className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {file.name}
                </div>
                <div className="text-[11px] opacity-60 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                <div className="text-sm font-bold mb-1">انتخاب فایل CSV</div>
                <div className="text-[11px] opacity-60">کلیک کنید یا فایل را اینجا رها کنید</div>
              </>
            )}
          </label>

          {/* نتیجه */}
          {result && (
            <div className={`rounded-xl p-3 border ${
              result.errors.length > 0
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              <div className="flex items-start gap-2">
                {result.errors.length > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <div className="font-bold mb-1">
                    {result.imported} ردیف وارد شد
                  </div>
                  {result.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer opacity-70">
                        {result.errors.length} خطا
                      </summary>
                      <div className="mt-2 max-h-32 overflow-auto space-y-0.5 text-[10px] opacity-70 font-mono" dir="ltr">
                        {result.errors.slice(0, 10).map((e, i) => (
                          <div key={i}>Row {e.row}: {e.error}</div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-black/5 dark:border-white/5">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold rounded-lg"
          >
            بستن
          </button>
          <button
            onClick={handleImport}
            disabled={!file || busy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال پردازش...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                شروع ورود
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;
