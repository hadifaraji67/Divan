import React, { useEffect, useState, useMemo } from 'react';
import { Wallet, Plus, Minus, ArrowDownRight, ArrowUpRight, Trash2, X, TrendingUp, Landmark, Banknote } from 'lucide-react';
import { notify } from '../lib/toast';
import { loadData, saveData, genId } from '../lib/storage';
import { useSettings, formatNum } from '../lib/theme-context';

export interface CashTransaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

const empty = (): CashTransaction => ({
  id: '', type: 'deposit', amount: 0, category: '',
  description: '', date: new Date().toLocaleDateString('fa-IR'), createdAt: '',
});

const CATEGORIES = {
  deposit: ['فروش نقدی', 'دریافت از مشتری', 'سرمایه', 'درآمد متفرقه', 'برگشت هزینه'],
  withdraw: ['خرید کالا', 'پرداخت به تامین‌کننده', 'حقوق و دستمزد', 'اجاره', 'قبوض', 'هزینه متفرقه'],
};

export const CashBox: React.FC = () => {
  const { settings } = useSettings();
  const [items, setItems] = useState<CashTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CashTransaction>(empty());
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');

  useEffect(() => { setItems(loadData<CashTransaction[]>('cashbox', [])); }, []);
  useEffect(() => { saveData('cashbox', items); }, [items]);

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const stats = useMemo(() => {
    const deposit = items.filter(i => i.type === 'deposit').reduce((s, i) => s + i.amount, 0);
    const withdraw = items.filter(i => i.type === 'withdraw').reduce((s, i) => s + i.amount, 0);
    return { deposit, withdraw, balance: deposit - withdraw };
  }, [items]);

  const filtered = useMemo(() => {
    const list = filter === 'all' ? items : items.filter(i => i.type === filter);
    return [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [items, filter]);

  const openNew = (type: 'deposit' | 'withdraw') => {
    const t = empty();
    t.id = genId();
    t.type = type;
    t.createdAt = new Date().toISOString();
    setEditing(t);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editing.amount <= 0) { notify.warning('مبلغ را وارد کن'); return; }
    if (editing.type === 'withdraw' && editing.amount > stats.balance) {
      if (!confirm('موجودی صندوق کمتر از مبلغ است. ادامه؟')) return;
    }
    setItems(prev => [...prev, editing]);
    setShowForm(false);
    notify.success(editing.type === 'deposit' ? 'واریز ثبت شد' : 'برداشت ثبت شد');
  };

  const remove = (id: string) => {
    if (!confirm('حذف این تراکنش؟')) return;
    setItems(prev => prev.filter(x => x.id !== id));
    notify.success('حذف شد');
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* کارت موجودی */}
      <div className="rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
            <Landmark className="w-3.5 h-3.5" />
            موجودی صندوق
          </div>
          <div className="text-3xl font-bold">{f(stats.balance)}</div>
          <div className="text-xs opacity-80 mt-1">{settings.currency}</div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[10px] opacity-80"><ArrowDownRight className="w-3 h-3" /> کل دریافتی</div>
              <div className="text-sm font-bold mt-1">{f(stats.deposit)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[10px] opacity-80"><ArrowUpRight className="w-3 h-3" /> کل پرداختی</div>
              <div className="text-sm font-bold mt-1">{f(stats.withdraw)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* دکمه‌ها */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => openNew('deposit')} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl">
          <Plus className="w-4 h-4" /> واریز / دریافت
        </button>
        <button onClick={() => openNew('withdraw')} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl">
          <Minus className="w-4 h-4" /> برداشت / پرداخت
        </button>
      </div>

      {/* فیلتر */}
      <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg w-fit">
        {([
          { v: 'all', t: 'همه' },
          { v: 'deposit', t: 'واریز' },
          { v: 'withdraw', t: 'برداشت' },
        ] as const).map(o => (
          <button key={o.v} onClick={() => setFilter(o.v)}
            className={`px-3 py-1.5 text-xs rounded-md ${filter === o.v ? 'bg-white dark:bg-slate-700 shadow font-bold' : 'opacity-70'}`}>
            {o.t}
          </button>
        ))}
      </div>

      {/* لیست */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs opacity-40">هنوز تراکنشی ثبت نشده</div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {filtered.map(t => (
              <div key={t.id} className="p-3 flex items-center gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {t.type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{t.description || t.category}</div>
                  <div className="text-[11px] opacity-60 flex flex-wrap gap-2 mt-0.5">
                    {t.category && <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">{t.category}</span>}
                    <span>{t.date}</span>
                  </div>
                </div>
                <div className="text-left shrink-0 flex items-center gap-2">
                  <div className={`font-bold text-sm ${t.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`} dir="ltr">
                    {t.type === 'deposit' ? '+' : '-'}{f(t.amount)}
                  </div>
                  <button onClick={() => remove(t.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* فرم */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md my-3 md:my-8">
            <div className="flex justify-between items-center p-4 border-b border-black/5 dark:border-white/5">
              <h3 className="font-bold text-sm flex items-center gap-2">
                {editing.type === 'deposit' ? <><ArrowDownRight className="w-4 h-4 text-emerald-600" /> واریز جدید</> : <><ArrowUpRight className="w-4 h-4 text-rose-600" /> برداشت جدید</>}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block">
                <span className="text-xs opacity-60 block mb-1">مبلغ (ریال) *</span>
                <input type="number" value={editing.amount || ''} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })}
                  className="w-full p-3 border rounded-lg text-lg font-bold text-center" dir="ltr" autoFocus />
              </label>
              <label className="block">
                <span className="text-xs opacity-60 block mb-1">دسته</span>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm">
                  <option value="">— انتخاب —</option>
                  {CATEGORIES[editing.type].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs opacity-60 block mb-1">توضیحات</span>
                <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs opacity-60 block mb-1">تاریخ</span>
                <input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm" />
              </label>
            </div>
            <div className="p-4 border-t border-black/5 dark:border-white/5 flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm hover:bg-black/5 rounded-lg">لغو</button>
              <button onClick={handleSave} className={`px-5 py-2 text-white text-sm font-bold rounded-lg ${editing.type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashBox;
