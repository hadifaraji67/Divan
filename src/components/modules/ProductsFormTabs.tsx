import React, { useState } from 'react';
import { Package, DollarSign, Warehouse, MapPin } from 'lucide-react';
import type { Product } from '../../types/models';

interface Props {
  editing: Product;
  setEditing: (p: Product) => void;
}

const TABS = [
  { id: 'basic', label: 'اطلاعات پایه', icon: Package },
  { id: 'pricing', label: 'قیمت‌گذاری', icon: DollarSign },
  { id: 'stock', label: 'موجودی', icon: Warehouse },
  { id: 'location', label: 'محل و انبار', icon: MapPin },
];

export const ProductsFormTabs: React.FC<Props> = ({ editing, setEditing }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const update = (patch: Partial<Product>) => {
    setEditing({ ...editing, ...patch });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-3 animate-fade-in">
        {/* اطلاعات پایه */}
        {activeTab === 'basic' && (
          <>
            <Field label="نام کالا" required>
              <input
                value={editing.name}
                onChange={(e) => update({ name: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="مثلاً: ماوس لاجیتک"
              />
            </Field>

            <Field label="کد کالا (SKU)">
              <input
                value={editing.sku}
                onChange={(e) => update({ sku: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm font-mono"
                dir="ltr"
              />
            </Field>

            <Field label="بارکد">
              <input
                value={editing.barcode || ''}
                onChange={(e) => update({ barcode: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm font-mono"
                dir="ltr"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="دسته">
                <input
                  value={editing.category}
                  onChange={(e) => update({ category: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </Field>
              <Field label="زیردسته">
                <input
                  value={editing.subCategory || ''}
                  onChange={(e) => update({ subCategory: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="برند">
                <input
                  value={editing.brand || ''}
                  onChange={(e) => update({ brand: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </Field>
              <Field label="واحد">
                <input
                  value={editing.unit}
                  onChange={(e) => update({ unit: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="عدد، کیلو، بسته"
                />
              </Field>
            </div>

            <Field label="توضیحات">
              <textarea
                value={editing.description || ''}
                onChange={(e) => update({ description: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
                rows={3}
              />
            </Field>
          </>
        )}

        {/* قیمت‌گذاری */}
        {activeTab === 'pricing' && (
          <>
            <Field label="قیمت خرید (ریال)">
              <input
                type="number"
                value={editing.buyPrice || 0}
                onChange={(e) => update({ buyPrice: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg text-sm font-mono"
                dir="ltr"
              />
            </Field>

            <Field label="قیمت فروش (ریال)" required>
              <input
                type="number"
                value={editing.sellPrice || 0}
                onChange={(e) => update({ sellPrice: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg text-sm font-mono"
                dir="ltr"
              />
            </Field>

            <Field label="قیمت عمده (ریال)">
              <input
                type="number"
                value={editing.wholesalePrice || 0}
                onChange={(e) => update({ wholesalePrice: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg text-sm font-mono"
                dir="ltr"
              />
            </Field>

            <Field label="درصد مالیات">
              <input
                type="number"
                value={editing.taxPercent || 0}
                onChange={(e) => update({ taxPercent: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg text-sm"
                min={0}
                max={100}
              />
            </Field>
          </>
        )}

        {/* موجودی */}
        {activeTab === 'stock' && (
          <>
            <Field label="موجودی فعلی">
              <input
                type="number"
                value={editing.stock || 0}
                onChange={(e) => update({ stock: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg text-sm font-mono"
                dir="ltr"
              />
            </Field>

            <Field label="حد بحرانی">
              <input
                type="number"
                value={editing.minStock || 0}
                onChange={(e) => update({ minStock: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg text-sm font-mono"
                dir="ltr"
              />
            </Field>

            <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs leading-relaxed">
              💡 وقتی موجودی به حد بحرانی برسد، در داشبورد هشدار می‌بینی
            </div>
          </>
        )}

        {/* محل و انبار */}
        {activeTab === 'location' && (
          <>
            <Field label="نام انبار">
              <input
                value={editing.warehouseName || ''}
                onChange={(e) => update({ warehouseName: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="مثلاً: انبار مرکزی"
              />
            </Field>

            <Field label="موقعیت قفسه">
              <input
                value={editing.location || ''}
                onChange={(e) => update({ location: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm font-mono"
                placeholder="مثلاً: A-12-3"
                dir="ltr"
              />
            </Field>
          </>
        )}
      </div>
    </div>
  );
};

/* کامپوننت Field کمکی */
const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <label className="block">
    <span className="text-xs font-bold block mb-1.5">
      {label}
      {required && <span className="text-rose-500 mr-1">*</span>}
    </span>
    {children}
  </label>
);

export default ProductsFormTabs;
