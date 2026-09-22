import React, { useState } from 'react';
import { Users, Package, FileText, Download, Upload, Wallet, Landmark, Database } from 'lucide-react';
import type { Contact, Product, Invoice, Payment, Cheque } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { loadData, saveData, genId } from '../../lib/storage';
import { exportToCSV } from '../../lib/export';
import { ImportDialog } from '../shared/ImportDialog';
import { CONTACT_COLUMNS, PRODUCT_COLUMNS } from '../../lib/import';
import { notify } from '../../lib/toast';

type ImportType = 'contacts' | 'products' | null;

export const DataSettings: React.FC = () => {
  const [showImport, setShowImport] = useState<ImportType>(null);

  // ═══════════════════════════════════════════
  //  Export handlers
  // ═══════════════════════════════════════════

  const handleExportContacts = async () => {
    const contacts = loadData<Contact[]>('contacts', []);
    await exportToCSV('مشتریان', contacts, [
      { key: 'code', label: 'کد' },
      { key: 'type', label: 'نوع' },
      { key: 'name', label: 'نام' },
      { key: 'lastName', label: 'نام خانوادگی' },
      { key: 'companyName', label: 'نام شرکت' },
      { key: 'nationalId', label: 'کد ملی' },
      { key: 'mobile', label: 'موبایل' },
      { key: 'phone', label: 'تلفن' },
      { key: 'email', label: 'ایمیل' },
      { key: 'province', label: 'استان' },
      { key: 'city', label: 'شهر' },
      { key: 'address', label: 'آدرس' },
      { key: 'postalCode', label: 'کد پستی' },
      { key: 'roles', label: 'نقش‌ها', format: (v: any) => Array.isArray(v) ? v.join('، ') : '' },
    ]);
  };

  const handleExportProducts = async () => {
    const products = loadData<Product[]>('products', []);
    await exportToCSV('کالاها', products, [
      { key: 'sku', label: 'کد' },
      { key: 'barcode', label: 'بارکد' },
      { key: 'name', label: 'نام کالا' },
      { key: 'category', label: 'دسته' },
      { key: 'brand', label: 'برند' },
      { key: 'unit', label: 'واحد' },
      { key: 'stock', label: 'موجودی' },
      { key: 'minStock', label: 'حد بحرانی' },
      { key: 'buyPrice', label: 'قیمت خرید' },
      { key: 'sellPrice', label: 'قیمت فروش' },
      { key: 'wholesalePrice', label: 'عمده' },
      { key: 'taxPercent', label: 'مالیات %' },
      { key: 'warehouseName', label: 'انبار' },
    ]);
  };

  const handleExportInvoices = async () => {
    const invoices = loadData<Invoice[]>('invoices', []);
    await exportToCSV('فاکتورها', invoices, [
      { key: 'number', label: 'شماره' },
      { key: 'date', label: 'تاریخ' },
      { key: 'type', label: 'نوع' },
      { key: 'contactName', label: 'مشتری' },
      { key: 'items', label: 'تعداد اقلام', format: (v: any) => String(Array.isArray(v) ? v.length : 0) },
      { key: 'total', label: 'مبلغ کل', format: (_: any, row: any) => String(Math.round(invoiceTotal(row.items || [], row.discountPercent || 0, row.taxPercent || 0, row.shippingCost || 0))) },
    ]);
  };

  const handleExportPayments = async () => {
    const payments = loadData<Payment[]>('payments', []);
    await exportToCSV('پرداخت‌ها', payments, [
      { key: 'date', label: 'تاریخ' },
      { key: 'contactName', label: 'شخص' },
      { key: 'direction', label: 'جهت' },
      { key: 'type', label: 'روش' },
      { key: 'amount', label: 'مبلغ' },
      { key: 'refCode', label: 'کد پیگیری' },
      { key: 'bankName', label: 'بانک' },
      { key: 'notes', label: 'توضیحات' },
    ]);
  };

  const handleExportCheques = async () => {
    const cheques = loadData<Cheque[]>('cheques', []);
    await exportToCSV('چک‌ها', cheques, [
      { key: 'chequeNumber', label: 'شماره چک' },
      { key: 'contactName', label: 'شخص' },
      { key: 'direction', label: 'جهت' },
      { key: 'amount', label: 'مبلغ' },
      { key: 'dueDate', label: 'سررسید' },
      { key: 'bankName', label: 'بانک' },
      { key: 'status', label: 'وضعیت' },
      { key: 'notes', label: 'توضیحات' },
    ]);
  };

  // ═══════════════════════════════════════════
  //  Import handlers
  // ═══════════════════════════════════════════

  const handleImportedContacts = (rows: any[]) => {
    const existing = loadData<Contact[]>('contacts', []);
    const existingIds = new Set(existing.map(c => c.id));

    const newItems = rows.map((r: any) => ({
      id: genId(),
      code: r.code || '',
      type: r.type || 'حقیقی',
      name: r.name || '',
      lastName: r.lastName || '',
      companyName: r.companyName || '',
      nationalId: r.nationalId || '',
      mobile: r.mobile || '',
      phone: r.phone || '',
      email: r.email || '',
      province: r.province || '',
      county: r.county || '',
      city: r.city || '',
      postalCode: r.postalCode || '',
      address: r.address || '',
      roles: r.roles || ['مشتری'],
      creditLimit: Number(r.creditLimit) || 0,
      createdAt: new Date().toISOString(),
    })).filter((r: any) => !existingIds.has(r.id));

    saveData('contacts', [...existing, ...newItems]);
    setShowImport(null);
  };

  const handleImportedProducts = (rows: any[]) => {
    const existing = loadData<Product[]>('products', []);
    const existingIds = new Set(existing.map(p => p.id));

    const newItems = rows.map((r: any) => ({
      id: genId(),
      sku: r.sku || '',
      barcode: r.barcode || '',
      name: r.name || '',
      category: r.category || '',
      brand: r.brand || '',
      unit: r.unit || 'عدد',
      stock: Number(r.stock) || 0,
      minStock: Number(r.minStock) || 0,
      buyPrice: Number(r.buyPrice) || 0,
      sellPrice: Number(r.sellPrice) || 0,
      wholesalePrice: Number(r.wholesalePrice) || 0,
      taxPercent: Number(r.taxPercent) || 0,
      location: r.location || '',
      warehouseName: r.warehouseName || '',
      createdAt: new Date().toISOString(),
      isActive: true,
    })).filter((r: any) => !existingIds.has(r.id));

    saveData('products', [...existing, ...newItems]);
    setShowImport(null);
  };

  // ═══════════════════════════════════════════
  //  UI
  // ═══════════════════════════════════════════

  const Section: React.FC<{ icon: React.ElementType; title: string; desc: string; children: React.ReactNode; color: string }> = ({ icon: Icon, title, desc, children, color }) => (
    <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
      <div className="flex items-start gap-3 px-4 py-3 border-b" style={{ borderColor: 'inherit' }}>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  const ActionButton: React.FC<{ onClick: () => void; icon: React.ElementType; label: string; sub?: string; variant: 'in' | 'out' }> = ({ onClick, icon: Icon, label, sub, variant }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all hover:scale-[1.02] ${
        variant === 'in'
          ? 'border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 hover:border-sky-400'
          : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 hover:border-emerald-400'
      }`}
    >
      <div className={`p-2 rounded-lg ${variant === 'in' ? 'bg-sky-500 text-white' : 'bg-emerald-500 text-white'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm">{label}</div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </button>
  );

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-2xl p-4 bg-gradient-to-l from-indigo-600 to-violet-600 text-white">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6" />
          <div>
            <h2 className="font-bold text-lg">ورود و خروج داده</h2>
            <p className="text-xs opacity-80 mt-0.5">انتقال داده‌ها از/به Excel — برای انتقال بین دستگاه‌ها یا بکاپ</p>
          </div>
        </div>
      </div>

      {/* ورود داده */}
      <Section
        icon={Upload}
        title="ورود داده از Excel"
        desc="فایل CSV خروجی از نرم‌افزار یا قالب نمونه را انتخاب کنید"
        color="bg-sky-500/10 text-sky-600 dark:text-sky-400"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionButton
            onClick={() => setShowImport('contacts')}
            icon={Users}
            label="ورود مشتریان"
            sub="نام، موبایل، کد ملی، آدرس..."
            variant="in"
          />
          <ActionButton
            onClick={() => setShowImport('products')}
            icon={Package}
            label="ورود کالاها"
            sub="کد، نام، قیمت، موجودی..."
            variant="in"
          />
        </div>
        <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 leading-relaxed">
          💡 ابتدا قالب نمونه را دانلود کنید، در Excel پر کنید، سپس اینجا بارگذاری کنید.
        </div>
      </Section>

      {/* خروجی داده */}
      <Section
        icon={Download}
        title="خروجی داده به Excel"
        desc="ذخیره داده‌ها به صورت فایل CSV (سازگار با Excel فارسی)"
        color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionButton onClick={handleExportContacts} icon={Users} label="خروجی مشتریان" sub="همه اشخاص" variant="out" />
          <ActionButton onClick={handleExportProducts} icon={Package} label="خروجی کالاها" sub="همه محصولات" variant="out" />
          <ActionButton onClick={handleExportInvoices} icon={FileText} label="خروجی فاکتورها" sub="همه فاکتورها" variant="out" />
          <ActionButton onClick={handleExportPayments} icon={Wallet} label="خروجی پرداخت‌ها" sub="دریافت/پرداخت" variant="out" />
          <ActionButton onClick={handleExportCheques} icon={Landmark} label="خروجی چک‌ها" sub="همه چک‌ها" variant="out" />
        </div>
        <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 leading-relaxed">
          📁 فایل‌ها در پوشه Documents/Divan-Exports ذخیره می‌شوند.
        </div>
      </Section>

      {/* Import Dialogs */}
      {showImport === 'contacts' && (
        <ImportDialog
          title="ورود مشتریان از Excel"
          columns={CONTACT_COLUMNS}
          templateName="divan-contacts-template.csv"
          onImported={handleImportedContacts}
          onClose={() => setShowImport(null)}
        />
      )}

      {showImport === 'products' && (
        <ImportDialog
          title="ورود کالاها از Excel"
          columns={PRODUCT_COLUMNS}
          templateName="divan-products-template.csv"
          onImported={handleImportedProducts}
          onClose={() => setShowImport(null)}
        />
      )}
    </div>
  );
};

export default DataSettings;
