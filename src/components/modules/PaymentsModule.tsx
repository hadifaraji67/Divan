import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, X, ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react';
import type { Payment, Invoice } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { getInvoicePaymentInfo } from '../../lib/invoice-payment';
import { loadData, saveData, genId } from '../../lib/storage';
import { notify } from '../../lib/toast';
import { ArchiveToggle, VoidedItemCard, VoidConfirmDialog } from '../shared/Archive';
import { createPaymentJournalEntry } from '../../lib/accounting';
import type { JournalEntry } from '../../types/accounting';

const empty = (): Payment => ({
  id: '', invoiceId: '', contactId: '', contactName: '', type: 'نقد',
  amount: 0, date: new Date().toLocaleDateString('fa-IR'), refCode: '',
  bankName: '', chequeNumber: '', chequeDueDate: '', direction: 'دریافت', notes: '', createdAt: '',
});

type Props = { filterDirection?: 'دریافت' | 'پرداخت' };
export const PaymentsModule: React.FC<Props> = ({ filterDirection }) => {
  const [items, setItems] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Payment>(empty());
  const [showArchived, setShowArchived] = useState(false);
  const [voidTarget, setVoidTarget] = useState<Payment | null>(null);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);

  useEffect(() => {
    setItems(loadData<Payment[]>('payments', []));
    setAllInvoices(loadData<Invoice[]>('invoices', []));
    setAllContacts(loadData<any[]>('contacts', []));
  }, []);
  useEffect(() => { saveData('payments', items); }, [items]);

  const invoiceOptions = useMemo(() => {
    const direction = editing.direction;
    const types = direction === 'دریافت'
      ? ['فروش']
      : ['خرید'];
    return allInvoices.filter(i => types.includes(i.type) && i.contactId === editing.contactId);
  }, [allInvoices, editing.direction, editing.contactId]);

  const filtered = useMemo(() => {
    let list = showArchived ? items.filter(i => i.void) : items.filter(i => !i.void);
    if (filterDirection) list = list.filter(p => p.direction === filterDirection);
    if (!search.trim()) return list;
    const q = search.trim();
    return list.filter(p => p.contactName.includes(q) || p.refCode?.includes(q) || p.type.includes(q));
  }, [items, search, showArchived, filterDirection]);

  const activeItems = items.filter(p => !p.void);
  const totalIn = activeItems.filter(p => p.direction === 'دریافت').reduce((s, p) => s + p.amount, 0);
  const totalOut = activeItems.filter(p => p.direction === 'پرداخت').reduce((s, p) => s + p.amount, 0);

  const openNew = (direction: 'دریافت' | 'پرداخت') => {
    const p = empty();
    p.id = genId();
    p.direction = direction;
    p.createdAt = new Date().toISOString();
    setEditing(p); setShowForm(true);
  };
  const save = () => {
    if (!editing.contactName.trim()) { notify.warning('نام طرف حساب الزامی است'); return; }
    if (editing.amount <= 0) { notify.warning('مبلغ الزامی است'); return; }
    setItems(prev => [...prev, editing]);

    // ساخت سند حسابداری خودکار
    const entries = loadData<JournalEntry[]>('journal_entries', []);
    const je = createPaymentJournalEntry(editing, entries.length + 1);
    if (je && je.lines && je.lines.length > 0) {
      saveData('journal_entries', [...entries, je]);
    }

    setShowForm(false);
  };
  const handleVoid = (reason: string) => {
    if (!voidTarget) return;
    setItems(prev => prev.map(p =>
      p.id === voidTarget.id
        ? { ...p, void: true, voidedAt: new Date().toISOString(), voidedReason: reason }
        : p
    ));
    notify.success('پرداخت باطل شد');
    setVoidTarget(null);
  };

  const handleRestore = (id: string) => {
    if (!confirm('این پرداخت بازگردانی شود؟')) return;
    setItems(prev => prev.map(p =>
      p.id === id ? { ...p, void: false, voidedAt: undefined, voidedReason: undefined } : p
    ));
    notify.success('پرداخت بازگردانی شد');
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="text-xs text-emerald-700 flex items-center gap-1"><ArrowDownLeft className="w-4 h-4" /> مجموع دریافتی</div>
          <div className="text-lg font-bold text-emerald-700 mt-1">{totalIn.toLocaleString()} ریال</div>
        </div>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="text-xs text-rose-700 flex items-center gap-1"><ArrowUpRight className="w-4 h-4" /> مجموع پرداختی</div>
          <div className="text-lg font-bold text-rose-700 mt-1">{totalOut.toLocaleString()} ریال</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..."
            className="w-full pr-10 pl-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900" />
        </div>
        <ArchiveToggle
          showArchived={showArchived}
          onChange={setShowArchived}
          activeCount={items.filter(i => !i.void).length}
          voidedCount={items.filter(i => i.void).length}
        />
        <button onClick={() => openNew('دریافت')} className="flex items-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg">
          <Plus className="w-4 h-4" /> دریافت
        </button>
        <button onClick={() => openNew('پرداخت')} className="flex items-center gap-2 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg">
          <Plus className="w-4 h-4" /> پرداخت
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">پرداختی ثبت نشده</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(p => {
              if (showArchived) {
                return (
                  <VoidedItemCard
                    key={p.id}
                    title={`${p.direction === 'دریافت' ? 'دریافت' : 'پرداخت'} — ${p.type}`}
                    subtitle={p.contactName}
                    amount={p.amount}
                    amountUnit="ریال"
                    voidedAt={p.voidedAt}
                    voidedReason={p.voidedReason}
                    onRestore={() => handleRestore(p.id)}
                  />
                );
              }
              return (
              <div key={p.id} className="p-4 flex flex-wrap gap-3 items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.direction === 'دریافت' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{p.contactName}</div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-100">{p.type}</span>
                      <span>{p.date}</span>
                      {p.refCode && <span className="font-mono">کد: {p.refCode}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`font-bold text-sm ${p.direction === 'دریافت' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {p.direction === 'دریافت' ? '+' : '-'}{p.amount.toLocaleString()} ریال
                  </div>
                  <button onClick={() => setVoidTarget(p)} title="باطل کردن" className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      <VoidConfirmDialog
        open={!!voidTarget}
        title={voidTarget ? `پرداخت ${voidTarget.amount.toLocaleString()} ریالی` : ''}
        onConfirm={handleVoid}
        onCancel={() => setVoidTarget(null)}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-3 md:my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-slate-900 rounded-t-2xl">
              <h3 className="font-bold">ثبت {editing.direction}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block md:col-span-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">طرف حساب *</span>
                <select
                  value={editing.contactId}
                  onChange={(e) => {
                    const c = allContacts.find(x => x.id === e.target.value);
                    if (c) setEditing({ ...editing, contactId: c.id, contactName: c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`, invoiceId: '' });
                  }}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900"
                >
                  <option value="">— انتخاب —</option>
                  {allContacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`} — {c.mobile}
                    </option>
                  ))}
                </select>
                {allContacts.length === 0 && (
                  <div className="text-[10px] text-amber-600 mt-1">⚠️ ابتدا از منوی مشتریان، شخص اضافه کن</div>
                )}
              </label>

              {editing.contactId && (
                <label className="block md:col-span-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">فاکتور مرتبط (اختیاری)</span>
                  <select
                    value={editing.invoiceId || ''}
                    onChange={(e) => {
                      const inv = allInvoices.find(i => i.id === e.target.value);
                      setEditing({ ...editing, invoiceId: e.target.value, amount: inv ? invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost) : editing.amount });
                    }}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900"
                  >
                    <option value="">— بدون فاکتور —</option>
                    {invoiceOptions.map(inv => {
                      const info = getInvoicePaymentInfo(inv, items);
                      if (info.status === 'paid') return null;
                      return (
                        <option key={inv.id} value={inv.id}>
                          {inv.number} — {inv.date} — مانده: {info.remaining.toLocaleString()} ریال
                        </option>
                      );
                    })}
                  </select>
                </label>
              )}
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">نوع</span>
                <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm">
                  <option value="نقد">نقد</option>
                  <option value="کارت">کارت</option>
                  <option value="چک">چک</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">مبلغ (ریال) *</span>
                <input type="number" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">تاریخ</span>
                <input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">کد رهگیری</span>
                <input value={editing.refCode || ''} onChange={(e) => setEditing({ ...editing, refCode: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              {editing.type === 'چک' && (
                <>
                  <label className="block">
                    <span className="text-xs text-slate-600 block mb-1">بانک</span>
                    <input value={editing.bankName || ''} onChange={(e) => setEditing({ ...editing, bankName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-600 block mb-1">شماره چک</span>
                    <input value={editing.chequeNumber || ''} onChange={(e) => setEditing({ ...editing, chequeNumber: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
                  </label>
                </>
              )}
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

export default PaymentsModule;
