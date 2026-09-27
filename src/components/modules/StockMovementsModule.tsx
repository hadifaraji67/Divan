import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRightLeft, Plus, X, ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react';
import type { Warehouse, Product, StockMovement } from '../../types/models';
import { loadData } from '../../lib/storage';
import { notify } from '../../lib/toast';
import { EmptyState } from '../shared/EmptyState';
import { RBACGate } from '../shared/RBACGate';
import { ensureDefaultWarehouse, transferStock, getStockMovements, getWarehouseStock, seedProductIfUntracked } from '../../lib/warehouse-stock';

export const StockMovementsModule: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [productId, setProductId] = useState('');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');

  const refresh = () => {
    setWarehouses(loadData<Warehouse[]>('warehouses', []));
    setProducts(loadData<Product[]>('products', []));
    setMovements(getStockMovements());
  };

  useEffect(() => {
    ensureDefaultWarehouse();
    refresh();
  }, []);

  const selectedProduct = products.find(p => p.id === productId);
  const availableInFrom = useMemo(() => {
    if (!selectedProduct || !fromId) return 0;
    seedProductIfUntracked(selectedProduct);
    return getWarehouseStock(fromId, selectedProduct.id);
  }, [selectedProduct, fromId, movements]);

  const openNew = () => {
    setProductId('');
    setFromId(warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id || '');
    setToId('');
    setQuantity(0);
    setReason('');
    setShowForm(true);
  };

  const submit = () => {
    const product = products.find(p => p.id === productId);
    const from = warehouses.find(w => w.id === fromId);
    const to = warehouses.find(w => w.id === toId);
    if (!product) { notify.warning('کالا را انتخاب کن'); return; }
    if (!from || !to) { notify.warning('انبار مبدا و مقصد را انتخاب کن'); return; }
    if (quantity <= 0) { notify.warning('مقدار باید بزرگ‌تر از صفر باشد'); return; }

    const result = transferStock(product, from, to, quantity, reason.trim() || undefined);
    if (!result.ok) {
      notify.error(result.error || 'انتقال ناموفق بود');
      return;
    }
    notify.success('انتقال با موفقیت ثبت شد');
    setShowForm(false);
    refresh();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-bold text-base flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" /> نقل و انتقال انبار</h2>
        <RBACGate permission="product.edit">
          <button
            onClick={openNew}
            disabled={warehouses.length < 2}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg"
            title={warehouses.length < 2 ? 'برای انتقال حداقل به دو انبار نیاز است' : ''}
          >
            <Plus className="w-4 h-4" /> انتقال جدید
          </button>
        </RBACGate>
      </div>

      {warehouses.length < 2 && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
          برای ثبت نقل‌وانتقال، حداقل به دو انبار فعال نیاز داری — از بخش «انبارها» یکی دیگر اضافه کن.
        </div>
      )}

      {movements.length === 0 ? (
        <EmptyState icon={ArrowRightLeft} title="هنوز انتقالی ثبت نشده" description="با «انتقال جدید» جابه‌جایی کالا بین انبارها را ثبت کن" />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
          {movements.map(m => (
            <div key={m.id} className="p-4 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-3 min-w-[200px]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  m.type === 'اصلاح انبارگردانی' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {m.type === 'اصلاح انبارگردانی' ? <ClipboardCheck className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-sm">{m.productName}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    {m.fromWarehouseName && <span>{m.fromWarehouseName}</span>}
                    {m.fromWarehouseName && m.toWarehouseName && <ArrowLeft className="w-3 h-3" />}
                    {m.toWarehouseName && <span>{m.toWarehouseName}</span>}
                  </div>
                </div>
              </div>
              <div className="text-left">
                <div className="font-mono font-bold text-sm">{m.quantity.toLocaleString('fa-IR')}</div>
                <div className="text-[10px] text-slate-400">{m.type}</div>
              </div>
              {m.reason && <div className="text-xs text-slate-500 max-w-[200px] truncate">{m.reason}</div>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg my-3 md:my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
              <h3 className="font-bold text-base">انتقال کالا بین انبارها</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">کالا *</span>
                <select value={productId} onChange={(e) => setProductId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                  <option value="">— انتخاب —</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-slate-600 block mb-1">از انبار *</span>
                  <select value={fromId} onChange={(e) => setFromId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                    <option value="">— انتخاب —</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  {productId && fromId && (
                    <span className="text-[10px] text-slate-400 mt-1 block">موجودی: {availableInFrom.toLocaleString('fa-IR')}</span>
                  )}
                </label>
                <label className="block">
                  <span className="text-xs text-slate-600 block mb-1">به انبار *</span>
                  <select value={toId} onChange={(e) => setToId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                    <option value="">— انتخاب —</option>
                    {warehouses.filter(w => w.id !== fromId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">مقدار *</span>
                <input type="number" value={quantity || ''} onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">توضیح (اختیاری)</span>
                <input value={reason} onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="مثلاً: تأمین شعبه دو" />
              </label>
            </div>
            <div className="p-4 border-t dark:border-slate-700 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">لغو</button>
              <button onClick={submit} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">ثبت انتقال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovementsModule;
