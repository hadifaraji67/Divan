import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, X, CheckSquare, Calendar } from 'lucide-react';
import type { Cheque } from '../../types/models';
import { loadData, saveData, genId } from '../../lib/storage';
import { notify } from '../../lib/toast';
import { logActivity } from '../../lib/activity-log';
import { ArchiveToggle, VoidedItemCard, VoidConfirmDialog } from '../shared/Archive';

const empty = (): Cheque => ({
  id: '', contactId: '', contactName: '', bankName: '', chequeNumber: '',
  amount: 0, dueDate: new Date().toLocaleDateString('fa-IR'), direction: 'دریافتی',
  status: 'در جریان', notes: '', createdAt: '',
});

const STATUS_COLORS: Record<string, string> = {
  'در جریان': 'bg-amber-100 text-amber-700',
  'وصول شده': 'bg-emerald-100 text-emerald-700',
  'برگشتی': 'bg-rose-100 text-rose-700',
  'خرج شده': 'bg-slate-100 text-slate-700',
};

export const ChequesModule: React.FC = () => {
  const [items, setItems] = useState<Cheque[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cheque>(empty());
  const [filter, setFilter] = useState<'all' | 'دریافتی' | 'پرداختی'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [voidTarget, setVoidTarget] = useState<Cheque | null>(null);

  useEffect(() => { setItems(loadData<Cheque[]>('cheques', [])); }, []);

  const inProgressStats = useMemo(() => {
    const now = new Date();
    const active = items.filter(ch => !ch.void && ch.status === 'در جریان');
    const totalReceive = active.filter(ch => ch.direction === 'دریافتی').reduce((s, ch) => s + ch.amount, 0);
    const totalPay = active.filter(ch => ch.direction === 'پرداختی').reduce((s, ch) => s + ch.amount, 0);
    
    // سررسید نزدیک (۷ روز)
    const soon = active.filter(ch => {
      if (!ch.dueDate) return false;
      const due = new Date(ch.dueDate);
      const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    });
    
    // معوق (گذشته)
    const overdue = active.filter(ch => {
      if (!ch.dueDate) return false;
      const due = new Date(ch.dueDate);
      return due.getTime() < now.getTime();
    });
    
    return {
      count: active.length,
      totalReceive,
      totalPay,
      soonCount: soon.length,
      overdueCount: overdue.length,
    };
  }, [items]);
  useEffect(() => { saveData('cheques', items); }, [items]);

  const filtered = useMemo(() => {
    let r = showArchived ? items.filter(i => i.void) : items.filter(i => !i.void);
    if (filter !== 'all') r = r.filter(c => c.direction === filter);
    if (search.trim()) {
      const q = search.trim();
      r = r.filter(c => c.contactName.includes(q) || c.chequeNumber.includes(q) || c.bankName.includes(q));
    }
    return r;
  }, [items, search, filter, showArchived]);

  const openNew = () => { const c = empty(); c.id = genId(); c.createdAt = new Date().toISOString(); setEditing(c); setShowForm(true); };
  const save = () => {
    if (!editing.contactName.trim()) { notify.warning('نام طرف حساب الزامی است'); return; }
    if (editing.amount <= 0) { notify.warning('مبلغ الزامی است'); return; }
    const isEdit = items.some(ch => ch.id === editing.id);
    setItems(prev => prev.find(c => c.id === editing.id)
      ? prev.map(c => c.id === editing.id ? editing : c)
      : [...prev, editing]);
    setShowForm(false);

    logActivity(
      isEdit ? 'update' : 'create',
      'cheque',
      {
        entityId: editing.id,
        entityLabel: editing.chequeNumber || editing.contactName,
        summary: isEdit
          ? `ویرایش چک ${editing.chequeNumber} — ${editing.contactName}`
          : `ایجاد چک ${editing.chequeNumber} — ${editing.contactName}`,
        amount: editing.amount,
      },
    );
  };
  const handleVoid = (reason: string) => {
    if (!voidTarget) return;
    setItems(prev => prev.map(c =>
      c.id === voidTarget.id
        ? { ...c, void: true, voidedAt: new Date().toISOString(), voidedReason: reason }
        : c
    ));
    logActivity('void', 'cheque', {
      entityId: voidTarget.id,
      entityLabel: voidTarget.chequeNumber,
      summary: `باطل کردن چک ${voidTarget.chequeNumber}`,
      amount: voidTarget.amount,
      details: { reason },
    });
    notify.success('چک باطل شد');
    setVoidTarget(null);
  };

  const handleRestore = (id: string) => {
    if (!confirm('این چک بازگردانی شود؟')) return;
    setItems(prev => prev.map(c =>
      c.id === id ? { ...c, void: false, voidedAt: undefined, voidedReason: undefined } : c
    ));
    notify.success('چک بازگردانی شد');
  };
  const changeStatus = (id: string, status: Cheque['status']) => {
    const target = items.find(c => c.id === id);
    setItems(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (target) {
      logActivity('status_change', 'cheque', {
        entityId: id,
        entityLabel: target.chequeNumber,
        summary: `تغییر وضعیت چک ${target.chequeNumber} به «${status}»`,
        amount: target.amount,
      });
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* کارت خلاصه چک‌های در جریان */}
      {inProgressStats.count > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
          <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
            <div className="text-[10px] text-amber-700 mb-1">در جریان</div>
            <div className="font-bold text-lg text-amber-900">{inProgressStats.count}</div>
          </div>
          <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-200">
            <div className="text-[10px] text-emerald-700 mb-1">دریافتی</div>
            <div className="font-bold text-sm text-emerald-900 font-mono">{inProgressStats.totalReceive.toLocaleString('fa-IR')}</div>
          </div>
          <div className="rounded-xl p-3 bg-rose-50 border border-rose-200">
            <div className="text-[10px] text-rose-700 mb-1">پرداختی</div>
            <div className="font-bold text-sm text-rose-900 font-mono">{inProgressStats.totalPay.toLocaleString('fa-IR')}</div>
          </div>
          <div className={`rounded-xl p-3 border ${inProgressStats.overdueCount > 0 ? 'bg-red-100 border-red-300' : inProgressStats.soonCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-[10px] mb-1 text-slate-700">سررسید نزدیک / معوق</div>
            <div className="font-bold text-lg">
              {inProgressStats.soonCount > 0 && <span className="text-orange-700">{inProgressStats.soonCount}</span>}
              {inProgressStats.soonCount > 0 && inProgressStats.overdueCount > 0 && <span className="text-slate-400 mx-1">/</span>}
              {inProgressStats.overdueCount > 0 && <span className="text-red-700">{inProgressStats.overdueCount}</span>}
              {inProgressStats.soonCount === 0 && inProgressStats.overdueCount === 0 && <span className="text-slate-400">—</span>}
            </div>
          </div>
        </div>
      )}
      
      <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..."
            className="w-full pr-10 pl-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {(['all', 'دریافتی', 'پرداختی'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-md ${filter === f ? 'bg-white dark:bg-slate-700 shadow font-bold' : 'opacity-70'}`}>
              {f === 'all' ? 'همه' : f}
            </button>
          ))}
        </div>
        <ArchiveToggle
          showArchived={showArchived}
          onChange={setShowArchived}
          activeCount={items.filter(i => !i.void).length}
          voidedCount={items.filter(i => i.void).length}
        />
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
          <Plus className="w-4 h-4" /> چک جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">چکی ثبت نشده</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs">
                <tr>
                  <th className="p-3 text-right">طرف حساب</th>
                  <th className="p-3 text-right">بانک</th>
                  <th className="p-3 text-right">شماره</th>
                  <th className="p-3 text-right">مبلغ</th>
                  <th className="p-3 text-right">سررسید</th>
                  <th className="p-3 text-right">جهت</th>
                  <th className="p-3 text-right">وضعیت</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(c => {
                  if (showArchived) {
                    return (
                      <tr key={c.id}>
                        <td colSpan={8} className="p-0">
                          <VoidedItemCard
                            title={`چک ${c.chequeNumber} — ${c.bankName}`}
                            subtitle={`${c.contactName} — ${c.direction}`}
                            amount={c.amount}
                            amountUnit="ریال"
                            voidedAt={c.voidedAt}
                            voidedReason={c.voidedReason}
                            onRestore={() => handleRestore(c.id)}
                          />
                        </td>
                      </tr>
                    );
                  }
                  return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold">{c.contactName}</td>
                    <td className="p-3 text-slate-600">{c.bankName}</td>
                    <td className="p-3 font-mono text-xs">{c.chequeNumber}</td>
                    <td className="p-3 font-bold text-indigo-600">{c.amount.toLocaleString()}</td>
                    <td className="p-3 text-xs"><Calendar className="inline w-3 h-3 ml-1" />{c.dueDate}</td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${c.direction === 'دریافتی' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{c.direction}</span></td>
                    <td className="p-3">
                      <select value={c.status} onChange={(e) => changeStatus(c.id, e.target.value as any)}
                        className={`text-xs px-2 py-1 rounded border-0 ${STATUS_COLORS[c.status]}`}>
                        <option value="در جریان">در جریان</option>
                        <option value="وصول شده">وصول شده</option>
                        <option value="برگشتی">برگشتی</option>
                        <option value="خرج شده">خرج شده</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button onClick={() => setVoidTarget(c)} title="باطل کردن" className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-3 md:my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-slate-900 rounded-t-2xl">
              <h3 className="font-bold flex items-center gap-2"><CheckSquare className="w-4 h-4" /> چک جدید</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block md:col-span-2">
                <span className="text-xs text-slate-600 block mb-1">طرف حساب *</span>
                <input value={editing.contactName} onChange={(e) => setEditing({ ...editing, contactName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">جهت</span>
                <select value={editing.direction} onChange={(e) => setEditing({ ...editing, direction: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm">
                  <option value="دریافتی">دریافتی</option>
                  <option value="پرداختی">پرداختی</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">مبلغ (ریال) *</span>
                <input type="number" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">بانک</span>
                <input value={editing.bankName} onChange={(e) => setEditing({ ...editing, bankName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">شماره چک</span>
                <input value={editing.chequeNumber} onChange={(e) => setEditing({ ...editing, chequeNumber: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">سررسید</span>
                <input value={editing.dueDate} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">وضعیت</span>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm">
                  <option value="در جریان">در جریان</option>
                  <option value="وصول شده">وصول شده</option>
                  <option value="برگشتی">برگشتی</option>
                  <option value="خرج شده">خرج شده</option>
                </select>
              </label>
            </div>
            <div className="p-4 border-t flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">لغو</button>
              <button onClick={save} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChequesModule;
