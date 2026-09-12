import React, { useState, useEffect } from 'react';
import { 
  Menu, Plus, FileText, ShoppingCart, Users, CreditCard, 
  Settings, Database, Lock, User, LogOut, Sun, Moon, Trash2, 
  Printer, AlertTriangle, Download, TrendingUp, Calendar, CheckSquare, Shield,
  Building, Phone, MapPin, DollarSign, Tag, Edit, Save, X, Package, QrCode, Layers, Box
} from 'lucide-react';

// === Advanced Product Interface ===
export interface AdvancedProduct {
  id: string;
  sku: string; // کد یکتای کالا
  barcode?: string; // بارکد کالا
  taxId?: string; // شناسه کالا (سامانه مودیان / جامع تجارت)
  name: string;
  brand?: string; // برند یا مدل
  category: string; // گروه اصلی
  subCategory?: string; // گروه فرعی
  
  // واحدهای سنجش
  mainUnit: string; // واحد اصلی (مثلا عدد)
  subUnit?: string; // واحد فرعی (مثلا بسته/کارتن)
  conversionRatio?: number; // ضریب تبدیل (مثلا 24)
  
  // انبارداری و موقعیت
  warehouseName: string; // نام انبار پیش‌فرض
  location: string; // موقعیت فیزیکی (راهرو/قفسه/طبقه)
  stock: number; // موجودی واقعی (بر اساس واحد اصلی)
  reservedStock: number; // موجودی رزرو شده در پیش‌فاکتورها
  minStock: number; // حداقل موجودی (نقطه سفارش)
  maxStock?: number; // حداکثر موجودی مجاز

  // قیمت‌گذاری
  lastBuyPrice: number; // آخرین قیمت خرید
  avgBuyPrice: number; // میانگین قیمت خرید
  sellPrice: number; // قیمت فروش خرده‌فروشی
  wholesalePrice?: number; // قیمت فروش عمده
  taxPercent: number; // درصد مالیات بر ارزش افزوده

  // ردیابی و انقضا
  productType: 'کالای خریدی' | 'کالای ساختنی' | 'خدمات';
  hasSerial: boolean; // نیاز به شماره سریال
  hasBatch: boolean; // نیاز به سری ساخت
  batchNumber?: string;
  expireDate?: string; // تاریخ انقضا

  // وضعیت و ملاحظات
  isActive: boolean;
  notes?: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  cardNumber: string;
  sheba: string;
}

export interface AdvancedContact {
  id: string;
  code: string;
  personType: 'حقیقی' | 'حقوقی';
  roles: ('مشتری' | 'تامین‌کننده' | 'همکار' | 'پرسنل')[];
  name: string;
  lastName?: string;
  companyName?: string;
  nationalId: string;
  economicCode?: string;
  registrationNumber?: string;
  mobile: string;
  phone?: string;
  email?: string;
  postalCode?: string;
  address?: string;
  deliveryAddress?: string;
  creditLimit: number;
  paymentTermsDays: number;
  defaultDiscountPercent: number;
  bankAccounts: BankAccount[];
  group: string;
  isActive: boolean;
  notes?: string;
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  buyPrice: number;
  discount: number;
  tax: number;
  total: number;
}

interface Invoice {
  id: string;
  type: 'فاکتور فروش' | 'پیش‌فاکتور' | 'فاکتور خرید';
  customerName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  totalProfit: number;
  status: 'پرداخت شده' | 'پیشنویس' | 'بدهکار';
}

interface Cheque {
  id: string;
  contactName: string;
  amount: number;
  dueDate: string;
  bankName: string;
  chequeNumber: string;
  type: 'دریافتی' | 'پرداختی';
  status: 'در جریان' | 'پاس شده' | 'برگشتی';
}

interface AppUser {
  id: string;
  username: string;
  role: 'مدیر کل' | 'فروشنده' | 'انباردار';
}

export const InvoiceApp: React.FC = () => {
  const [currentUser] = useState<AppUser | null>({ id: '1', username: 'مدیر سیستم', role: 'مدیر کل' });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'contacts' | 'inventory' | 'cheques' | 'reports'>('inventory');

  // App Data State
  const [products, setProducts] = useState<AdvancedProduct[]>(() => JSON.parse(localStorage.getItem('divan_products_v2') || '[]'));
  const [contacts, setContacts] = useState<AdvancedContact[]>(() => JSON.parse(localStorage.getItem('divan_contacts_v2') || '[]'));
  const [invoices, setInvoices] = useState<Invoice[]>(() => JSON.parse(localStorage.getItem('divan_invoices') || '[]'));
  const [cheques, setCheques] = useState<Cheque[]>(() => JSON.parse(localStorage.getItem('divan_cheques') || '[]'));

  useEffect(() => { localStorage.setItem('divan_products_v2', JSON.stringify(products)); }, [products]);

  // Product Modal / Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);

  // Form Fields for Product
  const [pSku, setPSku] = useState('');
  const [pBarcode, setPBarcode] = useState('');
  const [pTaxId, setPTaxId] = useState('');
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pCategory, setPCategory] = useState('عمومی');
  const [pSubCategory, setPSubCategory] = useState('');
  const [pMainUnit, setPMainUnit] = useState('عدد');
  const [pSubUnit, setPSubUnit] = useState('');
  const [pConversionRatio, setPConversionRatio] = useState<number>(1);
  const [pWarehouseName, setPWarehouseName] = useState('انبار مرکزی');
  const [pLocation, setPLocation] = useState('');
  const [pStock, setPStock] = useState<number>(0);
  const [pReservedStock, setPReservedStock] = useState<number>(0);
  const [pMinStock, setPMinStock] = useState<number>(5);
  const [pMaxStock, setPMaxStock] = useState<number>(100);
  const [pLastBuyPrice, setPLastBuyPrice] = useState<number>(0);
  const [pAvgBuyPrice, setPAvgBuyPrice] = useState<number>(0);
  const [pSellPrice, setPSellPrice] = useState<number>(0);
  const [pWholesalePrice, setPWholesalePrice] = useState<number>(0);
  const [pTaxPercent, setPTaxPercent] = useState<number>(10);
  const [pProductType, setPProductType] = useState<'کالای خریدی' | 'کالای ساختنی' | 'خدمات'>('کالای خریدی');
  const [pHasSerial, setPHasSerial] = useState(false);
  const [pHasBatch, setPHasBatch] = useState(false);
  const [pBatchNumber, setPBatchNumber] = useState('');
  const [pExpireDate, setPExpireDate] = useState('');
  const [pNotes, setPNotes] = useState('');

  const handleOpenProductModal = (prod?: AdvancedProduct) => {
    if (prod) {
      setEditingProdId(prod.id);
      setPSku(prod.sku); setPBarcode(prod.barcode || ''); setPTaxId(prod.taxId || '');
      setPName(prod.name); setPBrand(prod.brand || ''); setPCategory(prod.category); setPSubCategory(prod.subCategory || '');
      setPMainUnit(prod.mainUnit); setPSubUnit(prod.subUnit || ''); setPConversionRatio(prod.conversionRatio || 1);
      setPWarehouseName(prod.warehouseName); setPLocation(prod.location || '');
      setPStock(prod.stock); setPReservedStock(prod.reservedStock || 0); setPMinStock(prod.minStock); setPMaxStock(prod.maxStock || 0);
      setPLastBuyPrice(prod.lastBuyPrice); setPAvgBuyPrice(prod.avgBuyPrice); setPSellPrice(prod.sellPrice); setPWholesalePrice(prod.wholesalePrice || 0);
      setPTaxPercent(prod.taxPercent); setPProductType(prod.productType); setPHasSerial(prod.hasSerial); setPHasBatch(prod.hasBatch);
      setPBatchNumber(prod.batchNumber || ''); setPExpireDate(prod.expireDate || ''); setPNotes(prod.notes || '');
    } else {
      setEditingProdId(null);
      setPSku(`PRD-${1000 + products.length + 1}`);
      setPBarcode(''); setPTaxId(''); setPName(''); setPBrand(''); setPCategory('عمومی'); setPSubCategory('');
      setPMainUnit('عدد'); setPSubUnit(''); setPConversionRatio(1); setPWarehouseName('انبار مرکزی'); setPLocation('');
      setPStock(0); setPReservedStock(0); setPMinStock(5); setPMaxStock(100);
      setPLastBuyPrice(0); setPAvgBuyPrice(0); setPSellPrice(0); setPWholesalePrice(0); setPTaxPercent(10);
      setPProductType('کالای خریدی'); setPHasSerial(false); setPHasBatch(false); setPBatchNumber(''); setPExpireDate(''); setPNotes('');
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pSku) return;

    const newProd: AdvancedProduct = {
      id: editingProdId || Date.now().toString(),
      sku: pSku,
      barcode: pBarcode,
      taxId: pTaxId,
      name: pName,
      brand: pBrand,
      category: pCategory,
      subCategory: pSubCategory,
      mainUnit: pMainUnit,
      subUnit: pSubUnit,
      conversionRatio: pConversionRatio,
      warehouseName: pWarehouseName,
      location: pLocation,
      stock: pStock,
      reservedStock: pReservedStock,
      minStock: pMinStock,
      maxStock: pMaxStock,
      lastBuyPrice: pLastBuyPrice,
      avgBuyPrice: pAvgBuyPrice || pLastBuyPrice,
      sellPrice: pSellPrice,
      wholesalePrice: pWholesalePrice,
      taxPercent: pTaxPercent,
      productType: pProductType,
      hasSerial: pHasSerial,
      hasBatch: pHasBatch,
      batchNumber: pBatchNumber,
      expireDate: pExpireDate,
      isActive: true,
      notes: pNotes,
    };

    if (editingProdId) {
      setProducts(products.map(p => p.id === editingProdId ? newProd : p));
    } else {
      setProducts([newProd, ...products]);
    }

    setShowProductModal(false);
  };

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800';
  const bgCard = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const bgInput = isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900';

  return (
    <div className={`flex h-screen w-screen overflow-hidden dir-rtl font-sans ${bgMain}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-l p-4 flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="text-xl font-bold text-center py-3 border-b border-slate-800/40 text-indigo-500">نرم‌افزار دیوان</div>
        <nav className="flex-1 space-y-1 mt-4 text-sm">
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'inventory' ? 'bg-indigo-600 text-white font-bold' : ''}`}>انبارداری و مدیریت کالا</button>
          <button onClick={() => setActiveTab('contacts')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'contacts' ? 'bg-indigo-600 text-white font-bold' : ''}`}>طرف حساب‌ها (اشخاص)</button>
          <button onClick={() => setActiveTab('invoices')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'invoices' ? 'bg-indigo-600 text-white font-bold' : ''}`}>فاکتورها</button>
          <button onClick={() => setActiveTab('cheques')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'cheques' ? 'bg-indigo-600 text-white font-bold' : ''}`}>چک‌ها</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
        <header className="flex justify-between items-center border-b pb-4">
          <h1 className="text-xl font-bold text-indigo-500">مدیریت جامع انبار و محصولات</h1>
          <button onClick={() => handleOpenProductModal()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> تعریف کالای جدید
          </button>
        </header>

        {/* Inventory List */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">تعداد کل عناوین کالا</p>
                <p className="text-lg font-bold text-indigo-400 mt-1">{products.length} کالا</p>
              </div>
              <div className={`p-4 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">کالاهای نیازمند سفارش (کسری)</p>
                <p className="text-lg font-bold text-rose-400 mt-1">
                  {products.filter(p => p.stock <= p.minStock).length} کالا
                </p>
              </div>
              <div className={`p-4 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">مجموع ارزش ریالی انبار (خرید)</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  {products.reduce((acc, p) => acc + (p.stock * p.lastBuyPrice), 0).toLocaleString()} ریال
                </p>
              </div>
              <div className={`p-4 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">مجموع موجودی رزرو شده</p>
                <p className="text-lg font-bold text-amber-400 mt-1">
                  {products.reduce((acc, p) => acc + (p.reservedStock || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className={`p-4 border rounded-xl flex flex-col justify-between space-y-3 ${bgCard}`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">کد: {p.sku}</span>
                      {p.stock <= p.minStock ? (
                        <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3" /> هشدار موجودی
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">موجود</span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm mt-2 text-indigo-300">{p.name} {p.brand ? `(${p.brand})` : ''}</h3>
                    <p className="text-xs text-slate-400 mt-1">دسته: {p.category} | بارکد: {p.barcode || '-'}</p>
                    <p className="text-xs text-slate-400 mt-1">انبار: {p.warehouseName} {p.location ? `(قفسه: ${p.location})` : ''}</p>
                    <div className="flex justify-between items-center text-xs mt-2 p-2 bg-slate-950/40 rounded border border-slate-800">
                      <span>موجودی: <strong className="text-indigo-400">{p.stock} {p.mainUnit}</strong></span>
                      <span>قابل فروش: <strong className="text-emerald-400">{p.stock - (p.reservedStock || 0)}</strong></span>
                    </div>
                    <div className="text-xs space-y-1 mt-2">
                      <p className="text-slate-400">قیمت خرید: {p.lastBuyPrice.toLocaleString()} ریال</p>
                      <p className="text-slate-200 font-bold">قیمت فروش: {p.sellPrice.toLocaleString()} ریال</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">شناسه مودیان: {p.taxId || '-'}</span>
                    <button onClick={() => handleOpenProductModal(p)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg text-xs flex items-center gap-1">
                      <Edit className="w-3.5 h-3.5" /> ویرایش
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Form for Advanced Product */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`w-full max-w-4xl border rounded-2xl p-6 space-y-6 my-8 ${bgCard}`}>
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-lg text-indigo-400">{editingProdId ? 'ویرایش مشخصات کالا' : 'تعریف کالای جدید (انبارداری کامل)'}</h3>
                <button onClick={() => setShowProductModal(false)}><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                {/* 1. شناسه و اطلاعات اصلی کالا */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۱. اطلاعات شناسه و عمومی کالا</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="text" value={pSku} onChange={e => setPSku(e.target.value)} placeholder="کد اختصاصی (SKU)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                    <input type="text" value={pBarcode} onChange={e => setPBarcode(e.target.value)} placeholder="بارکد کالا" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={pTaxId} onChange={e => setPTaxId(e.target.value)} placeholder="شناسه کالا (سامانه مودیان)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <select value={pProductType} onChange={(e: any) => setPProductType(e.target.value)} className={`p-2.5 border rounded-lg text-xs ${bgInput}`}>
                      <option value="کالای خریدی">کالای خریدی</option>
                      <option value="کالای ساختنی">کالای ساختنی/تولیدی</option>
                      <option value="خدمات">خدماتی (بدون انبار)</option>
                    </select>
                    <input type="text" value={pName} onChange={e => setPName(e.target.value)} placeholder="نام کامل کالا" className={`p-2.5 border rounded-lg text-xs md:col-span-2 ${bgInput}`} required />
                    <input type="text" value={pBrand} onChange={e => setPBrand(e.target.value)} placeholder="برند / مدل" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={pCategory} onChange={e => setPCategory(e.target.value)} placeholder="دسته اصلی (مثلا: قطعات)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  </div>
                </div>

                {/* 2. واحدها و ضرایب تبدیل */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۲. واحدهای سنجش و بسته بندی</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" value={pMainUnit} onChange={e => setPMainUnit(e.target.value)} placeholder="واحد سنجش اصلی (مثلا: عدد/کیلو)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                    <input type="text" value={pSubUnit} onChange={e => setPSubUnit(e.target.value)} placeholder="واحد فرعی (مثلا: کارتن/بسته)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={pConversionRatio || ''} onChange={e => setPConversionRatio(Number(e.target.value))} placeholder="ضریب تبدیل (مثلا 24 عدد در کارتن)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  </div>
                </div>

                {/* 3. موجودی و کنترل انبار */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۳. کنترل موجودی و موقعیت فیزیکی انبار</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="text" value={pWarehouseName} onChange={e => setPWarehouseName(e.target.value)} placeholder="نام انبار پیش‌فرض" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={pLocation} onChange={e => setPLocation(e.target.value)} placeholder="موقعیت در انبار (مثلا: راهرو A، قفسه 3)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={pStock || ''} onChange={e => setPStock(Number(e.target.value))} placeholder="موجودی فعلی (واحد اصلی)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={pReservedStock || ''} onChange={e => setPReservedStock(Number(e.target.value))} placeholder="موجودی رزرو شده" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={pMinStock || ''} onChange={e => setPMinStock(Number(e.target.value))} placeholder="حداقل موجودی (نقطه سفارش)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={pMaxStock || ''} onChange={e => setPMaxStock(Number(e.target.value))} placeholder="حداکثر موجودی مجاز" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  </div>
                </div>

                {/* 4. قیمت‌گذاری و مالیات */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۴. قیمت‌گذاری و ارزش‌گذاری انبار</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="number" value={pLastBuyPrice || ''} onChange={e => setPLastBuyPrice(Number(e.target.value))} placeholder="آخرین قیمت خرید (ریال)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={pAvgBuyPrice || ''} onChange={e => setPAvgBuyPrice(Number(e.target.value))} placeholder="میانگین قیمت خرید" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={pSellPrice || ''} onChange={e => setPSellPrice(Number(e.target.value))} placeholder="قیمت فروش خرده‌فروشی" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={pWholesalePrice || ''} onChange={e => setPWholesalePrice(Number(e.target.value))} placeholder="قیمت فروش عمده" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={pTaxPercent || ''} onChange={e => setPTaxPercent(Number(e.target.value))} placeholder="درصد مالیات ارزش افزوده" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  </div>
                </div>

                {/* 5. ردیابی، سری ساخت و انقضا */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۵. ردیابی، سری ساخت و انقضا</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" value={pBatchNumber} onChange={e => setPBatchNumber(e.target.value)} placeholder="شماره سری ساخت / بچ (Batch No)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={pExpireDate} onChange={e => setPExpireDate(e.target.value)} placeholder="تاریخ انقضا (مثلا: 1406/12/29)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={pNotes} onChange={e => setPNotes(e.target.value)} placeholder="توضیحات و یادداشت انباردار" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowProductModal(false)} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">انصراف</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold">ذخیره مشخصات کالا</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceApp;
