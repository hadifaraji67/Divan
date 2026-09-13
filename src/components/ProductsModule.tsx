import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X, Package, AlertTriangle } from 'lucide-react';
import type { Product } from '../types/models';
import { loadData, saveData, genId } from '../lib/storage';

const empty = (): Product => ({
  id: '', sku: '', name: '', category: '', unit: 'عدد',
  stock: 0, minStock: 0, buyPrice: 0, sellPrice: 0, taxPercent: 9,
  isActive: true, createdAt: '',
});

export const ProductsModule: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product>(empty());

  useEffect(() => { setItems(loadData<Product[]>('products', [])); }, []);
  useEffect(() => { saveData('products', items); }, [items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim();
    return items.filter(p => p.name.includes(q) || p.sku.includes(q) || p.category.includes(q));
  }, [items, search]);

  const openNew = () => {
    const p = empty();
    p.id = genId();
    p.sku = `P-${(items.length + 1).toString().padStart(4, '0')}`;
    p.createdAt = new Date().toISOString();
    setEditing(p); setShowForm(true);
  };
  const openEdit = (p: Product) => { setEditing({ ...p }); setShowForm(true); };
  const save = () => {
    if (!editing.name.trim()) { alert('نام کالا الزامی است'); return; }
    setItems(prev => prev.find(p => p.id === editing.id)
      ? prev.map(p => p.id === editing.id ? editing : p)
      : [...prev, editing]);
    setShowForm(false);
  };
  const remove = (id: string) => {
    if (!confirm('حذف این کالا؟')) return;
    setItems(prev => prev.filter(p => p.id !== id));
  };

  const lowStock = items.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="space-y-4" dir="rtl">
      {lowStock > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {lowStock} کالا زیر حد موجودی است
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو: نام، کد، دسته..."
            className="w-full pr-10 pl-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
          <Plus className="w-4 h-4" /> کالای جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 bg-slate-50 border-b text-xs text-slate-600">
          مجموع: {items.length} کالا — نمایش: {filtered.length}
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {items.length === 0 ? 'هنوز کالایی ثبت نشده' : 'چیزی پیدا نشد'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs">
                <tr>
                  <th className="p-3 text-right">کد</th>
                  <th className="p-3 text-right">نام</th>
                  <th className="p-3 text-right">دسته</th>
                  <th className="p-3 text-right">موجودی</th>
                  <th className="p-3 text-right">خرید</th>
                  <th className="p-3 text-right">فروش</th>
                  <th className="p-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs">{p.sku}</td>
                    <td className="p-3 font-bold">{p.name}</td>
                    <td className="p-3 text-slate-500">{p.category || '—'}</td>
                    <td className={`p-3 font-bold ${p.stock <= p.minStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {p.stock} {p.unit}
                    </td>
                    <td className="p-3 text-slate-600">{p.buyPrice.toLocaleString()}</td>
                    <td className="p-3 text-slate-600">{p.sellPrice.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => remove(p.id)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold">{items.find(p => p.id === editing.id) ? 'ویرایش کالا' : 'کالای جدید'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">کد (SKU)</span>
                <input value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">نام کالا *</span>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">دسته</span>
                <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">واحد</span>
                <input value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">موجودی</span>
                <input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">حد هشدار</span>
                <input type="number" value={editing.minStock} onChange={(e) => setEditing({ ...editing, minStock: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">قیمت خرید (ریال)</span>
                <input type="number" value={editing.buyPrice} onChange={(e) => setEditing({ ...editing, buyPrice: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">قیمت فروش (ریال)</span>
                <input type="number" value={editing.sellPrice} onChange={(e) => setEditing({ ...editing, sellPrice: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">مالیات (%)</span>
                <input type="number" value={editing.taxPercent} onChange={(e) => setEditing({ ...editing, taxPercent: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
                <span className="text-sm">فعال</span>
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

export default ProductsModule;
