import React from 'react';
import { Archive as ArchiveIcon, RotateCcw, Trash2, AlertTriangle, Clock } from 'lucide-react';

/**
 * دکمه سوییچ بین لیست عادی و آرشیو
 */
export const ArchiveToggle: React.FC<{
  showArchived: boolean;
  onChange: (v: boolean) => void;
  voidedCount: number;
  activeCount: number;
}> = ({ showArchived, onChange, voidedCount, activeCount }) => {
  return (
    <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
      <button
        onClick={() => onChange(false)}
        className={`px-3 py-1.5 text-xs rounded-md transition-all ${
          !showArchived
            ? 'bg-white dark:bg-slate-700 shadow font-bold'
            : 'opacity-70'
        }`}
      >
        فعال ({activeCount})
      </button>
      <button
        onClick={() => onChange(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
          showArchived
            ? 'bg-white dark:bg-slate-700 shadow font-bold'
            : 'opacity-70'
        }`}
      >
        <ArchiveIcon className="w-3.5 h-3.5" />
        آرشیو {voidedCount > 0 && `(${voidedCount})`}
      </button>
    </div>
  );
};

/**
 * کارت آیتم باطل‌شده
 */
export const VoidedItemCard: React.FC<{
  title: string;
  subtitle?: string;
  amount?: number;
  amountUnit?: string;
  voidedAt?: string;
  voidedReason?: string;
  onRestore: () => void;
  formatNum?: (n: number) => string;
}> = ({ title, subtitle, amount, amountUnit, voidedAt, voidedReason, onRestore, formatNum }) => {
  const f = formatNum || ((n: number) => n.toLocaleString());

  const formatVoidedAt = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fa-IR');
    } catch { return ''; }
  };

  return (
    <div className="p-4 border-b border-black/5 dark:border-white/5 flex flex-wrap gap-3 items-center justify-between bg-rose-500/[0.02] hover:bg-rose-500/5 transition-colors">
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-bold line-through opacity-60">{title}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            باطل‌شده
          </span>
        </div>
        {subtitle && <div className="text-xs opacity-60">{subtitle}</div>}
        {amount !== undefined && (
          <div className="text-xs mt-1">
            <span className="opacity-60">مبلغ: </span>
            <b className="line-through opacity-60">{f(amount)}</b>
            {amountUnit && <span className="text-[10px] opacity-50 ml-1">{amountUnit}</span>}
          </div>
        )}
        {(voidedAt || voidedReason) && (
          <div className="flex flex-wrap gap-3 text-[10px] opacity-50 mt-1.5">
            {voidedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatVoidedAt(voidedAt)}
              </span>
            )}
            {voidedReason && <span>دلیل: {voidedReason}</span>}
          </div>
        )}
      </div>
      <button
        onClick={onRestore}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        بازگردانی
      </button>
    </div>
  );
};

/**
 * دیالوگ دریافت دلیل باطل کردن
 */
export const VoidConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}> = ({ open, title, onConfirm, onCancel }) => {
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm">باطل کردن {title}</h3>
            <p className="text-[11px] opacity-60 mt-0.5">این آیتم در آرشیو باقی می‌ماند و قابل بازگردانی است</p>
          </div>
        </div>

        <label className="block mb-4">
          <span className="text-xs opacity-60 block mb-1">دلیل باطل کردن (اختیاری)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثلاً: اشتباه در ثبت، انصراف مشتری، ..."
            className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900"
            rows={3}
            autoFocus
          />
        </label>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-lg"
          >
            لغو
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg"
          >
            باطل کن
          </button>
        </div>
      </div>
    </div>
  );
};
