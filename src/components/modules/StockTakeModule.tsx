import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Save, ArrowRight } from 'lucide-react';
import type { Warehouse, Product } from '../../types/models';
import { loadData } from '../../lib/storage';
import { notify } from '../../lib/toast';
import { EmptyState } from '../shared/EmptyState';
import { RBACGate } from '../shared/RBACGate';
import { ensureDefaultWarehouse, getWarehouseStock, recordStockTake, seedProductIfUntracked } from '../../lib/warehouse-stock';

export const StockTakeModule: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ensureDefaultWarehouse();
    setWarehouses(loadData<Warehouse[]>('warehouses', []));
    setProducts(loadData<Product[]>('products', []).filter(p => p.isActive));
  }, []);

  const systemQuantities = useMemo(() => {
    if (!warehouseId) return {} as Record<string, number>;
    const map: Record<string, number> = {};
    for (const p of products) {
      seedProductIfUntracked(p);
      map[p.id] = getWarehouseStock(warehouseId, p.id);
    }
    return map;
  }, [warehouseId, products]);

  const startCount = (id: string) => {
    setWarehouseId(id);
    // شمارش رو با همون مقدار سیستم پیش‌پر می‌کنیم؛ کاربر فقط مواردی که فرق داره رو تغییر می‌ده
    const initial: Record<string, number> = {};
    for (const p of products) {
      seedProductIfUntracked(p);
      initial[p.id] = getWarehouseStock(id, p.id);
    }
    setCounts(initial);
  };

  const diffCount = useMemo(() => {
    return Object.entries(counts).filter(([pid, val]) => val !== (systemQuantities[pid] ?? 0)).length;
  }, [counts, systemQuantities]);

  const submit = () => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (!warehouse) return;
    if (diffCount === 0) {
      notify.info('هیچ اختلافی برای ثبت وجود ندارد');
      return;
    }
    if (!confirm(`${diffCount.toLocaleString('fa-IR')} کالا اختلاف موجودی دارند. اصلاح ثبت شود؟`)) return;

    setSubmitting(true);
    let applied = 0;
    for (const p of products) {
      const counted = counts[p.id];
      if (counted === undefined || counted === (systemQuantities[p.id] ?? 0)) continue;
      const result = recordStockTake(p, warehouse, counted);
      if (result.diff !== 0) applied++;
    }
    setSubmitting(false);
    notify.success(`انبارگردانی ثبت شد — ${applied.toLocaleString('fa-IR')} اصلاح انجام شد`);
    setWarehouseId('');
    setCounts({});
  };

  if (!warehouseId) {
    return (
      <div className="space-y-4" dir="rtl">
        <h2 className="font-bold text-base flex items-center gap-2"><ClipboardCheck className="w-5 h-5" /> انبارگردانی</h2>
        {warehouses.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="هنوز انباری تعریف نشده" description="اول از بخش «انبارها» یک انبار بساز" />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
            {warehouses.map(w => (
              <button key={w.id} onClick={() => startCount(w.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 text-right">
                <span className="font-bold text-sm">{w.name}</span>
                <span className="text-xs text-indigo-600 flex items-center gap-1">شروع شمارش <ArrowRight className="w-3.5 h-3.5 rotate-180" /></span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const warehouse = warehouses.find(w => w.id === warehouseId);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-bold text-base flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" /> انبارگردانی — {warehouse?.name}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => { setWarehouseId(''); setCounts({}); }} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            لغو
          </button>
          <RBACGate permission="product.edit">
            <button onClick={submit} disabled={submitting}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
              <Save className="w-4 h-4" /> ثبت نتیجه {diffCount > 0 && `(${diffCount.toLocaleString('fa-IR')} اختلاف)`}
            </button>
          </RBACGate>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="کالای فعالی برای شمارش نیست" />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
              <tr>
                <th className="p-3 text-right">کالا</th>
                <th className="p-3 text-right">موجودی سیستم</th>
                <th className="p-3 text-right">شمارش فیزیکی</th>
                <th className="p-3 text-right">اختلاف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map(p => {
                const system = systemQuantities[p.id] ?? 0;
                const counted = counts[p.id] ?? system;
                const diff = counted - system;
                return (
                  <tr key={p.id} className={diff !== 0 ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''}>
                    <td className="p-3 font-bold">{p.name}</td>
                    <td className="p-3 font-mono text-slate-500">{system.toLocaleString('fa-IR')} {p.unit}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={counted}
                        onChange={(e) => setCounts(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                        className="w-24 p-1.5 border border-slate-300 rounded-lg text-sm font-mono"
                        dir="ltr"
                      />
                    </td>
                    <td className={`p-3 font-mono font-bold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                      {diff === 0 ? '—' : (diff > 0 ? `+${diff.toLocaleString('fa-IR')}` : diff.toLocaleString('fa-IR'))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockTakeModule;
