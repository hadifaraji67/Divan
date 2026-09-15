import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Calendar, CheckCircle2, Clock, AlertTriangle, Trash2, X, Wallet } from 'lucide-react';
import { notify } from '../../lib/toast';
import { loadData, saveData, genId } from '../../lib/storage';
import type { Contact } from '../../types/models';
import { useSettings, formatNum } from '../../lib/theme-context';
import { ArchiveToggle, VoidedItemCard, VoidConfirmDialog } from '../shared/Archive';

export interface Installment {
  id: string;
  contactId: string;
  contactName: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  installmentsCount: number;
  startDate: string;
  dueDay: number; // روز ماه
  installmentAmount: number;
  payments: { number: number; date: string; amount: number; paid: boolean; paidDate?: string }[];
  notes?: string;
  createdAt: string;
  void?: boolean;
  voidedAt?: string;
  voidedReason?: string;
}

const empty = (): Installment => ({
  id: '', contactId: '', contactName: '', title: '',
  totalAmount: 0, paidAmount: 0, installmentsCount: 12,
  startDate: new Date().toLocaleDateString('fa-IR'),
  dueDay: 1, installmentAmount: 0,
  payments: [], notes: '', createdAt: '',
});

export const InstallmentsModule: React.FC = () => {
  const { settings } = useSettings();
  const [items, setItems] = useState<Installment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Installment>(empty());
  const [showArchived, setShowArchived] = useState(false);
  const [voidTarget, setVoidTarget] = useState<Installment | null>(null);

  useEffect(() => {
    setItems(loadData<Installment[]>('installments', []));
    setContacts(loadData<Contact[]>('contacts', []));
  }, []);
  useEffect(() => { saveData('installments', items); }, [items]);

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const stats = useMemo(() => {
    let totalContract = 0, totalPaid = 0, overdue = 0, activeCount = 0;
    items.filter(i => !i.void).forEach(it => {
      totalContract += it.totalAmount;
      totalPaid += it.payments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0);
      const unpaid = it.payments.filter(p => !p.paid).length;
      if (unpaid > 0) activeCount++;
      overdue += it.payments.filter(p => !p.paid && p.date < new Date().toLocaleDateString('fa-IR')).length;
    });
    return { totalContract, totalPaid, remaining: totalContract - totalPaid, activeCount, overdue };
  }, [items]);

  const openNew = () => {
    const it = empty();
    it.id = genId();
    it.createdAt = new Date().toISOString();
    setEditing(it);
    setShowForm(true);
  };

  const handleVoid = (reason: string) => {
    if (!voidTarget) return;
    setItems(prev => prev.map(it =>
      it.id === voidTarget.id
        ? { ...it, void: true, voidedAt: new Date().toISOString(), voidedReason: reason }
        : it
    ));
    notify.success('قرارداد باطل شد');
    setVoidTarget(null);
  };

  const handleRestore = (id: string) => {
    if (!confirm('این قرارداد بازگردانی شود؟')) return;
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, void: false, voidedAt: undefined, voidedReason: undefined } : it
    ));
    notify.success('قرارداد بازگردانی شد');
  };

  const handleSave = () => {
    if (!editing.contactId) { notify.warning('مشتری را انتخاب کن'); return; }
    if (editing.totalAmount <= 0) { notify.warning('مبلغ کل باید بیشتر از صفر باشد'); return; }
    if (editing.installmentsCount < 1) { notify.warning('تعداد اقساط حداقل ۱'); return; }

    // تولید جدول اقساط
    const installmentAmount = Math.floor(editing.totalAmount / editing.installmentsCount);
    const lastAmount = editing.totalAmount - installmentAmount * (editing.installmentsCount - 1);

    // تاریخ شروع
    const [y, m] = editing.startDate.split('/').map(Number);
    const payments = Array.from({ length: editing.installmentsCount }).map((_, i) => {
      const monthIdx = (m - 1 + i + 1) % 12;
      const yearOffset = Math.floor((m - 1 + i + 1) / 12);
      const payYear = y + yearOffset;
      const payMonth = monthIdx + 1;
      return {
        number: i + 1,
        date: `${payYear}/${String(payMonth).padStart(2, '0')}/${String(editing.dueDay).padStart(2, '0')}`,
        amount: i === editing.installmentsCount - 1 ? lastAmount : installmentAmount,
        paid: false,
      };
    });

    // حفظ پرداخت‌های قبلی
    const oldPaid = editing.payments.filter(p => p.paid);
    const merged = payments.map((p, i) => {
      const old = oldPaid[i];
      if (old && old.amount === p.amount) return { ...p, paid: true, paidDate: old.paidDate };
      return p;
    });

    const contact = contacts.find(c => c.id === editing.contactId);
    const final: Installment = {
      ...editing,
      contactName: contact ? (contact.type === 'حقوقی' ? contact.companyName || contact.name : `${contact.name} ${contact.lastName || ''}`) : '',
      installmentAmount,
      payments: merged,
      paidAmount: merged.filter(p => p.paid).reduce((s, p) => s + p.amount, 0),
    };

    setItems(prev => prev.find(x => x.id === final.id) ? prev.map(x => x.id === final.id ? final : x) : [...prev, final]);
    setShowForm(false);
    notify.success('قرارداد اقساط ذخیره شد');
  };

  const togglePayment = (instId: string, payIdx: number) => {
    setItems(prev => prev.map(it => {
      if (it.id !== instId) return it;
      const payments = it.payments.map((p, i) => i === payIdx
        ? { ...p, paid: !p.paid, paidDate: !p.paid ? new Date().toLocaleDateString('fa-IR') : undefined }
        : p);
      return { ...it, payments, paidAmount: payments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0) };
    }));
  };

  const today = new Date().toLocaleDateString('fa-IR');

  return (
    <div className="space-y-4" dir="rtl">
      {/* آمار */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Wallet} label="کل قراردادها" value={f(stats.totalContract)} unit={settings.currency} color="indigo" />
        <StatCard icon={CheckCircle2} label="پرداخت‌شده" value={f(stats.totalPaid)} unit={settings.currency} color="emerald" />
        <StatCard icon={Clock} label="مانده" value={f(stats.remaining)} unit={settings.currency} color="rose" />
        <StatCard icon={AlertTriangle} label="قسط معوق" value={f(stats.overdue)} unit="عدد" color="amber" />
      </div>

      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h3 className="text-sm font-bold">قراردادهای اقساط</h3>
        <div className="flex gap-2">
          <ArchiveToggle
            showArchived={showArchived}
            onChange={setShowArchived}
            activeCount={items.filter(i => !i.void).length}
            voidedCount={items.filter(i => i.void).length}
          />
          <button onClick={openNew} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg">
            <Plus className="w-3.5 h-3.5" /> قرارداد جدید
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-12 text-center text-xs opacity-40" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          هنوز قراردادی ثبت نشده
        </div>
      ) : (
        <div className="space-y-3">
          {(showArchived ? items.filter(i => i.void) : items.filter(i => !i.void)).map(it => {
            if (showArchived) {
              return (
                <VoidedItemCard
                  key={it.id}
                  title={it.title || `قرارداد ${it.contactName}`}
                  subtitle={it.contactName}
                  amount={it.totalAmount}
                  amountUnit="ریال"
                  voidedAt={it.voidedAt}
                  voidedReason={it.voidedReason}
                  onRestore={() => handleRestore(it.id)}
                />
              );
            }
            const paid = it.payments.filter(p => p.paid).length;
            const progress = (paid / it.installmentsCount) * 100;
            return (
              <div key={it.id} className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
                <div className="p-4 border-b border-black/5 dark:border-white/5">
                  <div className="flex flex-wrap justify-between gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{it.title || `قرارداد ${it.contactName}`}</div>
                      <div className="text-xs opacity-60 mt-0.5">{it.contactName}</div>
                    </div>
                    <button onClick={() => setVoidTarget(it)} title="باطل کردن" className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                    <div><span className="opacity-60">کل:</span> <b>{f(it.totalAmount)}</b></div>
                    <div><span className="opacity-60">پرداخت‌شده:</span> <b className="text-emerald-600">{f(it.paidAmount)}</b></div>
                    <div><span className="opacity-60">مانده:</span> <b className="text-rose-600">{f(it.totalAmount - it.paidAmount)}</b></div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] opacity-60 mb-1">
                      <span>پیشرفت: {f(paid)} از {f(it.installmentsCount)} قسط</span>
                      <span>{f(progress)}٪</span>
                    </div>
                    <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {it.payments.map((p, i) => {
                    const isOverdue = !p.paid && p.date < today;
                    return (
                      <button
                        key={i}
                        onClick={() => togglePayment(it.id, i)}
                        className={`p-2 rounded-lg border text-right text-xs transition-all ${
                          p.paid
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                            : isOverdue
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">قسط {f(p.number)}</span>
                          {p.paid ? <CheckCircle2 className="w-3.5 h-3.5" /> : isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 opacity-40" />}
                        </div>
                        <div className="text-[10px] opacity-70">{p.date}</div>
                        <div className="font-bold mt-1">{f(p.amount)}</div>
                        {p.paidDate && <div className="text-[9px] opacity-60 mt-0.5">پرداخت: {p.paidDate}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* دیالوگ تایید */}
      <VoidConfirmDialog
        open={!!voidTarget}
        title={voidTarget ? (voidTarget.title || `قرارداد ${voidTarget.contactName}`) : ''}
        onConfirm={handleVoid}
        onCancel={() => setVoidTarget(null)}
      />

      {/* فرم */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg my-3 md:my-8">
            <div className="flex justify-between items-center p-4 border-b border-black/5 dark:border-white/5">
              <h3 className="font-bold text-sm">قرارداد اقساط جدید</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block md:col-span-2">
                <span className="text-xs opacity-60 block mb-1">عنوان قرارداد</span>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="مثلاً: فروش اقساطی یخچال" className="w-full p-2.5 border rounded-lg text-sm" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs opacity-60 block mb-1">مشتری *</span>
                <select value={editing.contactId} onChange={(e) => setEditing({ ...editing, contactId: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm">
                  <option value="">— انتخاب —</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs opacity-60 block mb-1">مبلغ کل (ریال)</span>
                <input type="number" value={editing.totalAmount} onChange={(e) => setEditing({ ...editing, totalAmount: Number(e.target.value) })} className="w-full p-2.5 border rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs opacity-60 block mb-1">تعداد اقساط</span>
                <input type="number" value={editing.installmentsCount} onChange={(e) => setEditing({ ...editing, installmentsCount: Number(e.target.value) })} className="w-full p-2.5 border rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs opacity-60 block mb-1">تاریخ شروع</span>
                <input value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm" placeholder="۱۴۰۵/۰۷/۰۱" />
              </label>
              <label className="block">
                <span className="text-xs opacity-60 block mb-1">روز ماه</span>
                <input type="number" min={1} max={28} value={editing.dueDay} onChange={(e) => setEditing({ ...editing, dueDay: Number(e.target.value) })} className="w-full p-2.5 border rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs opacity-60 block mb-1">یادداشت</span>
                <textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm" rows={2} />
              </label>
            </div>
            <div className="p-4 border-t border-black/5 dark:border-white/5 flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm hover:bg-black/5 rounded-lg">لغو</button>
              <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: any; label: string; value: string; unit: string; color: string }> = ({ icon: Icon, label, value, unit, color }) => {
  const colors: any = {
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${colors[color]}`} style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-xs opacity-70">{label}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="text-base font-bold">{value}</div>
      <div className="text-[10px] opacity-60">{unit}</div>
    </div>
  );
};

export default InstallmentsModule;
