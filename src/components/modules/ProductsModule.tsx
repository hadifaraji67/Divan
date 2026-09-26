import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Camera, Edit, Package, PackagePlus, Plus, Search, Star, Trash2, X } from 'lucide-react';
import type { Product } from '../../types/models';
import { loadData, saveData, genId } from '../../lib/storage';
import { notify } from '../../lib/toast';
import { useFormDraft } from '../../lib/use-form-draft';
import { findDuplicateProduct } from '../../lib/duplicate-detection';
import { logActivity } from '../../lib/activity-log';
import { useBulkSelect } from '../../lib/use-bulk-select';
import { BulkActionsBar } from '../shared/BulkActionsBar';
import { isValidAmount } from '../../lib/validation';
import { PRODUCT_COLUMNS } from '../../lib/import';
import { useUndoableDelete } from '../../lib/use-undoable-delete';
import { EmptyState } from '../shared/EmptyState';
import { RBACGate } from '../shared/RBACGate';
import { BarcodeScanner } from '../shared/BarcodeScanner';
import { RecentItemsStrip } from '../shared/RecentItemsStrip';
import { recordRecentItem, removeRecentItem } from '../../lib/recent-items';
const empty = (): Product => ({
  id: '', sku: '', barcode: '', name: '', description: '', category: '', subCategory: '',
  brand: '', unit: 'عدد', stock: 0, minStock: 0, buyPrice: 0, wholesalePrice: 0,
  sellPrice: 0, taxPercent: 9, taxId: '', warehouseName: '', location: '',
  isActive: true, favorite: false, createdAt: '',
});

export const ProductsModule: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [editing, setEditing] = useState<Product>(empty());

  const toggleFavorite = (id: string) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p));
  };

  // Auto-save draft
  const productDraft = useFormDraft<Product>(
    'product_new',
    editing,
    showForm,
    (draft) => setEditing(draft),
  );
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => { setItems(loadData<Product[]>('products', [])); }, []);
  useEffect(() => { saveData('products', items); }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (favoritesOnly) list = list.filter(p => p.favorite);
    if (search.trim()) {
      const q = search.trim();
      list = list.filter(p => p.name.includes(q) || p.sku.includes(q) || p.category.includes(q));
    }
    // محبوب‌ها اول
    return [...list].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
  }, [items, search, favoritesOnly]);

  const bulk = useBulkSelect(filtered, (x) => x.id);

  const openNew = () => {
    const p = empty();
    p.id = genId();
    p.sku = `P-${(items.length + 1).toString().padStart(4, '0')}`;
    p.createdAt = new Date().toISOString();
    setEditing(p); setShowForm(true);
  };
  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setShowForm(true);
    recordRecentItem('products', p.id, p.name);
  };
  const save = () => {
    // اعتبارسنجی
    if (!editing.name?.trim()) {
      notify.warning('نام کالا الزامی است');
      return;
    }
    if (!isValidAmount(editing.buyPrice, true)) {
      notify.warning('قیمت خرید نامعتبر');
      return;
    }
    if (!isValidAmount(editing.sellPrice, true)) {
      notify.warning('قیمت فروش نامعتبر');
      return;
    }
    if (editing.stock < 0) {
      notify.warning('موجودی نمی‌تواند منفی باشد');
      return;
    }
    if (editing.minStock < 0) {
      notify.warning('حد بحرانی نمی‌تواند منفی باشد');
      return;
    }
    if (editing.taxPercent < 0 || editing.taxPercent > 100) {
      notify.warning('درصد مالیات باید بین ۰ تا ۱۰۰ باشد');
      return;
    }
    // ─── Duplicate Detection ───
    const duplicate = findDuplicateProduct(editing, items);
    if (duplicate) {
      const proceed = confirm(
        `کالای مشابه پیدا شد:\n\n${duplicate.name}\nکد: ${duplicate.sku || '—'}\nبارکد: ${duplicate.barcode || '—'}\n\nآیا باز هم ذخیره شود؟`
      );
      if (!proceed) return;
    }

    const isEdit = items.some(p => p.id === editing.id);
    setItems(prev => prev.find(p => p.id === editing.id)
      ? prev.map(p => p.id === editing.id ? editing : p)
      : [...prev, editing]);
    setShowForm(false);

    // Activity Log
    logActivity(
      isEdit ? 'update' : 'create',
      'product',
      {
        entityId: editing.id,
        entityLabel: editing.name,
        summary: isEdit ? `ویرایش کالا «${editing.name}»` : `ایجاد کالا «${editing.name}»`,
      },
    );
    productDraft.clearDraft();
  };
  const deleteWithUndo = useUndoableDelete<Product>({
    onDelete: (p) => {
      setItems(prev => prev.filter(x => x.id !== p.id));
    },
    onRestore: (p) => {
      setItems(prev => [...prev, p]);
    },
    getLabel: (p) => p.name || 'کالا',
  });

  const remove = (id: string) => {
    const product = items.find(p => p.id === id);
    if (!product) return;
    if (!confirm('حذف این کالا؟')) return;
    logActivity('delete', 'product', {
      entityId: product.id,
      entityLabel: product.name,
      summary: `حذف کالا «${product.name}»`,
    });
    deleteWithUndo(product);
    removeRecentItem('products', id);
  };
  const handleBulkDelete = () => {
    const count = bulk.count;
    if (count === 0) return;
    if (!confirm(`حذف ${count} کالا؟`)) return;
    const ids = new Set(bulk.selected);
    setItems(prev => prev.filter(p => !ids.has(p.id)));
    logActivity('delete', 'product', {
      summary: `حذف گروهی ${count} کالا`,
      details: { count },
    });
    bulk.clear();
  };



  const lowStock = items.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="space-y-4" dir="rtl">
      {showScanner && (
        <BarcodeScanner
          onDetected={(code) => {
            setEditing({ ...editing, barcode: code });
            setShowScanner(false);
            notify.success('بارکد اسکن شد: ' + code);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
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

        <button
          onClick={() => setFavoritesOnly(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold rounded-lg border ${
            favoritesOnly
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
          title="فقط محبوب‌ها"
        >
          <Star className={`w-4 h-4 ${favoritesOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span className="hidden md:inline">محبوب‌ها</span>
        </button>

          <RBACGate permission="product.create">{<button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
          <Plus className="w-4 h-4" /> کالای جدید
        </button>}</RBACGate>
      </div>

      <RecentItemsStrip
        scope="products"
        refreshKey={items.length}
        onSelect={(id) => {
          const p = items.find(x => x.id === id);
          if (p) openEdit(p);
        }}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 bg-slate-50 border-b text-xs text-slate-600 flex items-center gap-3">
          {filtered.length > 0 && (
            <input
              type="checkbox"
              checked={bulk.allSelected}
              ref={(el) => { if (el) el.indeterminate = bulk.someSelected; }}
              onChange={bulk.toggleAll}
              className="w-4 h-4 rounded cursor-pointer"
              title="انتخاب همه"
            />
          )}
          <span>مجموع: {items.length} کالا — نمایش: {filtered.length}</span>
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
                  <th className="p-3 text-right w-10"></th>
                  <th className="p-3 text-right w-10"></th>
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
                  <tr key={p.id} className={`${bulk.isSelected(p.id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                    <td className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={bulk.isSelected(p.id)}
                        onChange={() => bulk.toggle(p.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-3 w-10">
                      <button
                        onClick={() => toggleFavorite(p.id)}
                        className="p-1 rounded hover:bg-amber-50"
                        title={p.favorite ? 'حذف از محبوب‌ها' : 'افزودن به محبوب‌ها'}
                      >
                        <Star className={`w-4 h-4 ${p.favorite ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                      </button>
                    </td>
                    <td className="p-3 font-mono text-xs">{p.sku}</td>
                    <td className="p-3"><div className="font-bold">{p.name}</div>{p.brand && <div className="text-[10px] opacity-60">{p.brand}</div>}{p.barcode && <div className="text-[10px] opacity-40 font-mono">{p.barcode}</div>}</td>
                    <td className="p-3 text-slate-500">{p.category || '—'}</td>
                    <td className={`p-3 font-bold ${p.stock <= p.minStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {p.stock} {p.unit}
                    </td>
                    <td className="p-3 text-slate-600">{p.buyPrice.toLocaleString()}</td>
                    <td className="p-3 text-slate-600">{p.sellPrice.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600"><Edit className="w-4 h-4" /></button>
                        
                        <RBACGate permission="product.delete">{<button onClick={() => remove(p.id)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4" /></button>}</RBACGate>
                      
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-3 md:my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-slate-900 rounded-t-2xl">
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
                <span className="text-xs text-slate-600 block mb-1">بارکد</span>
                <div className="flex gap-2">
                  <div className="flex gap-2">
                  <div className="flex gap-2">
                  <input value={editing.barcode || ''} onChange={(e) => setEditing({ ...editing, barcode: e.target.value })}
                    className="flex-1 p-2 border rounded-lg text-sm font-mono" dir="ltr" placeholder="مثلاً: 6260123456789" />
                  <button type="button" onClick={() => setShowScanner(true)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 text-xs font-bold whitespace-nowrap">
                    <Camera className="w-4 h-4" /> اسکن
                  </button>
                </div>
                  
                </div>
                  
                </div>
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">قیمت عمده (ریال)</span>
                <input type="number" value={editing.wholesalePrice || 0} onChange={(e) => setEditing({ ...editing, wholesalePrice: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">برند</span>
                <input value={editing.brand || ''} onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">زیرگروه</span>
                <input value={editing.subCategory || ''} onChange={(e) => setEditing({ ...editing, subCategory: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">انبار</span>
                <input value={editing.warehouseName || ''} onChange={(e) => setEditing({ ...editing, warehouseName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="انبار مرکزی" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">محل قرارگیری</span>
                <input value={editing.location || ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="قفسه A-12" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">شناسه مالیاتی</span>
                <input value={editing.taxId || ''} onChange={(e) => setEditing({ ...editing, taxId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">مالیات (%)</span>
                <input type="number" value={editing.taxPercent} onChange={(e) => setEditing({ ...editing, taxPercent: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs text-slate-600 block mb-1">توضیحات</span>
                <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" rows={2} />
              </label>
              <label className="flex items-center gap-2 mt-6 md:col-span-2">
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
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        count={bulk.count}
        total={filtered.length}
        onClear={bulk.clear}
        onSelectAll={bulk.toggleAll}
        actions={[
          {
            label: 'حذف',
            icon: Trash2,
            onClick: handleBulkDelete,
            variant: 'danger',
          },
        ]}
      />

    </div>
  );
};

export default ProductsModule;
