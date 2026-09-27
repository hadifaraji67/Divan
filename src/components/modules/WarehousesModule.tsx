import React, { useState, useEffect, useMemo } from 'react';
import { Factory, Plus, Edit, Trash2, X, Package, Star } from 'lucide-react';
import type { Warehouse, Product } from '../../types/models';
import { loadData, saveData, genId } from '../../lib/storage';
import { notify } from '../../lib/toast';
import { RBACGate } from '../shared/RBACGate';
import { EmptyState } from '../shared/EmptyState';
import { ensureDefaultWarehouse, getProductStockByWarehouse } from '../../lib/warehouse-stock';

const emptyWarehouse = (): Warehouse => ({
  id: '', name: '', code: '', address: '', isDefault: false, isActive: true, createdAt: '',
});

export const WarehousesModule: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Warehouse>(emptyWarehouse());
  const [viewingId, setViewingId] = useState<string>('');

  useEffect(() => {
    ensureDefaultWarehouse();
    setWarehouses(loadData<Warehouse[]>('warehouses', []));
    setProducts(loadData<Product[]>('products', []));
  }, []);

  useEffect(() => { saveData('warehouses', warehouses); }, [warehouses]);

  const openNew = () => {
    const w = emptyWarehouse();
    w.id = genId();
    w.code = `WH-${(warehouses.length + 1).toString().padStart(3, '0')}`;
    w.createdAt = new Date().toISOString();
    setEditing(w);
    setShowForm(true);
  };

  const openEdit = (w: Warehouse) => { setEditing({ ...w }); setShowForm(true); };

  const save = () => {
    if (!editing.name.trim()) {
      notify.warning('نام انبار الزامی است');
      return;
    }
    setWarehouses(prev => prev.some(w => w.id === editing.id)
      ? prev.map(w => w.id === editing.id ? editing : w)
      : [...prev, editing]);
    setShowForm(false);
  };

  const remove = (w: Warehouse) => {
    if (w.isDefault) {
      notify.warning('انبار مرکزی پیش‌فرض قابل حذف نیست');
      return;
    }
    if (!confirm(`حذف انبار «${w.name}»؟ موجودی ثبت‌شده در آن از دست می‌رود.`)) return;
    setWarehouses(prev => prev.filter(x => x.id !== w.id));
    if (viewingId === w.id) setViewingId('');
  };

  const viewingStock = useMemo(() => {
    if (!viewingId) return [];
    return products
      .map(p => {
        const entries = getProductStockByWarehouse(p.id, p);
        const qty = entries.find(e => e.warehouseId === viewingId)?.quantity || 0;
        return { product: p, quantity: qty };
      })
      .filter(x => x.quantity > 0);
  }, [viewingId, products]);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-bold text-base flex items-center gap-2"><Factory className="w-5 h-5" /> انبارها</h2>
        <RBACGate permission="product.create">
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
            <Plus className="w-4 h-4" /> انبار جدید
          </button>
        </RBACGate>
      </div>

      {warehouses.length === 0 ? (
        <EmptyState icon={Factory} title="هنوز انباری تعریف نشده" description="اولین انبار خودت رو اضافه کن" />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
          {warehouses.map(w => (
            <div key={w.id}>
              <div className={`p-4 flex flex-wrap gap-3 items-center justify-between ${viewingId === w.id ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}>
                <button className="flex items-center gap-3 flex-1 min-w-[200px] text-right" onClick={() => setViewingId(v => v === w.id ? '' : w.id)}>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                    <Factory className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      {w.name}
                      {w.isDefault && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                      {!w.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">غیرفعال</span>}
                    </div>
                    <div className="text-xs text-slate-500 flex gap-3 mt-1">
                      <span className="font-mono">{w.code}</span>
                      {w.address && <span className="truncate">{w.address}</span>}
                    </div>
                  </div>
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(w)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600" title="ویرایش">
                    <Edit className="w-4 h-4" />
                  </button>
                  <RBACGate permission="product.delete">
                    <button onClick={() => remove(w)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600" title="حذف">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </RBACGate>
                </div>
              </div>
              {viewingId === w.id && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold mb-2 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> موجودی این انبار</div>
                  {viewingStock.length === 0 ? (
                    <p className="text-xs opacity-50">هیچ کالایی در این انبار ثبت نشده.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {viewingStock.map(({ product, quantity }) => (
                        <div key={product.id} className="flex justify-between text-xs bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800">
                          <span>{product.name}</span>
                          <span className="font-mono font-bold">{quantity.toLocaleString('fa-IR')} {product.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg my-3 md:my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
              <h3 className="font-bold text-base">{warehouses.some(w => w.id === editing.id) ? 'ویرایش انبار' : 'انبار جدید'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">نام انبار *</span>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">کد</span>
                <input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">آدرس</span>
                <input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
                <span className="text-sm">فعال</span>
              </label>
            </div>
            <div className="p-4 border-t dark:border-slate-700 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">لغو</button>
              <button onClick={save} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesModule;
