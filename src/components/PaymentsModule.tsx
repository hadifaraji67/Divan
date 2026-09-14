import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, X, ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react';
import type { Payment } from '../types/models';
import { loadData, saveData, genId } from '../lib/storage';
import { notify } from '../lib/toast';

const empty = (): Payment => ({
  id: '', invoiceId: '', contactId: '', contactName: '', type: 'نقد',
  amount: 0, date: new Date().toLocaleDateString('fa-IR'), refCode: '',
  bankName: '', chequeNumber: '', chequeDueDate: '', direction: 'دریافت', notes: '', createdAt: '',
});

export const PaymentsModule: React.FC = () => {
  const [items, setItems] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Payment>(empty());

  useEffect(() => { setItems(loadData<Payment[]>('payments', [])); }, []);
  useEffect(() => { saveData('payments', items); }, [items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim();
    return items.filter(p => p.contactName.includes(q) || p.refCode?.includes(q) || p.type.includes(q));
  }, [items, search]);

  const totalIn = items.filter(p => p.direction === 'دریافت').reduce((s, p) => s + p.amount, 0);
  const totalOut = items.filter(p => p.direction === 'پرداخت').reduce((s, p) => s + p.amount, 0);

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
    setShowForm(false);
  };
  const remove = (id: string) => {
    if (!confirm('حذف این پرداخت؟')) return;
    setItems(p => p.filter(x => x.id !== id));
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
            className="w-full pr-10 pl-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>
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
            {filtered.map(p => (
              <div key={p.id} className="p-4 flex flex-wrap gap-3 items-center justify-between hover:bg-slate-50">
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
                  <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-3 md:my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-slate-900 rounded-t-2xl">
              <h3 className="font-bold">ثبت {editing.direction}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block md:col-span-2">
                <span className="text-xs text-slate-600 block mb-1">طرف حساب *</span>
                <input value={editing.contactName} onChange={(e) => setEditing({ ...editing, contactName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
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
