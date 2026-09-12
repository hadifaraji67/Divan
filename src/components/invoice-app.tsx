import React, { useState, useEffect } from 'react';
import { 
  Menu, Plus, FileText, ShoppingCart, Users, CreditCard, 
  ChevronDown, ChevronLeft, Package, Settings, Database, 
  Wrench, Lock, User, LogOut, RefreshCw, CheckCircle, ArrowUpCircle,
  Sun, Moon, Trash2, Printer, Search, AlertTriangle, Download, Upload, Eye
} from 'lucide-react';

// === Types ===
interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  economicCode?: string;
  address?: string;
  type: 'مشتری' | 'تامین‌کننده' | 'همکار';
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage or fixed
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
  status: 'پرداخت شده' | 'پیشنویس' | 'بدهکار';
}

interface Transaction {
  id: string;
  contactName: string;
  type: 'دریافت' | 'پرداخت';
  amount: number;
  date: string;
  method: 'نقد' | 'کارتخوان' | 'چک' | 'کارت به کارت';
  description: string;
}

export const InvoiceApp: React.FC = () => {
  // Auth & Theme
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Navigation
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'new-invoice' | 'inventory' | 'contacts' | 'accounting' | 'settings'>('dashboard');
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('sales');

  // App System
  const [currentVersion] = useState('4.0.0');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'latest'>('idle');

  // State / Data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('divan_products');
    return saved ? JSON.parse(saved) : [
      { id: 'P-101', name: 'سنسور SpO2 بزرگسال', category: 'تجهیزات پزشکی', unit: 'عدد', buyPrice: 1200000, sellPrice: 1500000, stock: 120, minStock: 20 },
      { id: 'P-102', name: 'پروب پالس اکسی متر', category: 'تجهیزات پزشکی', unit: 'عدد', buyPrice: 2200000, sellPrice: 2800000, stock: 8, minStock: 10 }
    ];
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('divan_contacts');
    return saved ? JSON.parse(saved) : [
      { id: 'C-101', name: 'علی محمدی', phone: '09121112233', economicCode: '10101010', type: 'مشتری', address: 'تهران، خیابان ولیعصر' },
      { id: 'C-102', name: 'شرکت تجهیزات پزشکی آریا', phone: '02188889999', economicCode: '41111111', type: 'تامین‌کننده', address: 'تهران، میدان ونک' }
    ];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('divan_invoices');
    return saved ? JSON.parse(saved) : [
      {
        id: '1001',
        type: 'فاکتور فروش',
        customerName: 'علی محمدی',
        date: '1405/06/20',
        items: [{ productId: 'P-101', productName: 'سنسور SpO2 بزرگسال', quantity: 2, unitPrice: 1500000, discount: 0, tax: 270000, total: 3270000 }],
        subtotal: 3000000,
        totalDiscount: 0,
        totalTax: 270000,
        grandTotal: 3270000,
        status: 'پرداخت شده'
      }
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('divan_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 'T-101', contactName: 'علی محمدی', type: 'دریافت', amount: 3270000, date: '1405/06/20', method: 'کارتخوان', description: 'تسویه فاکتور 1001' }
    ];
  });

  // LocalStorage Persist
  useEffect(() => { localStorage.setItem('divan_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('divan_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('divan_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('divan_transactions', JSON.stringify(transactions)); }, [transactions]);

  // Invoice Form State
  const [invType, setInvType] = useState<'فاکتور فروش' | 'پیش‌فاکتور' | 'فاکتور خرید'>('فاکتور فروش');
  const [invCustomer, setInvCustomer] = useState('');
  const [invDate, setInvDate] = useState('1405/06/23');
  const [invItems, setInvItems] = useState<InvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<Invoice | null>(null);

  // New Product Modal/Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('تجهیزات پزشکی');
  const [newProdUnit, setNewProdUnit] = useState('عدد');
  const [newProdBuyPrice, setNewProdBuyPrice] = useState(0);
  const [newProdSellPrice, setNewProdSellPrice] = useState(0);
  const [newProdStock, setNewProdStock] = useState(0);
  const [newProdMinStock, setNewProdMinStock] = useState(5);

  // New Contact State
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactType, setNewContactType] = useState<'مشتری' | 'تامین‌کننده' | 'همکار'>('مشتری');

  // New Transaction State
  const [txContact, setTxContact] = useState('');
  const [txType, setTxType] = useState<'دریافت' | 'پرداخت'>('دریافت');
  const [txAmount, setTxAmount] = useState(0);
  const [txMethod, setTxMethod] = useState<'نقد' | 'کارتخوان' | 'چک' | 'کارت به کارت'>('کارتخوان');
  const [txDesc, setTxDesc] = useState('');

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password === '123456') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handleAddItemToInvoice = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const baseTotal = prod.sellPrice * itemQty;
    const discAmount = (baseTotal * itemDiscount) / 100;
    const taxAmount = (baseTotal - discAmount) * 0.09; // 9% VAT
    const finalTotal = baseTotal - discAmount + taxAmount;

    const newItem: InvoiceItem = {
      productId: prod.id,
      productName: prod.name,
      quantity: itemQty,
      unitPrice: prod.sellPrice,
      discount: discAmount,
      tax: taxAmount,
      total: finalTotal
    };

    setInvItems([...invItems, newItem]);
    setSelectedProductId('');
    setItemQty(1);
    setItemDiscount(0);
  };

  const handleRemoveInvoiceItem = (index: number) => {
    setInvItems(invItems.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = () => {
    if (!invCustomer || invItems.length === 0) return;

    const subtotal = invItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const totalDiscount = invItems.reduce((acc, item) => acc + item.discount, 0);
    const totalTax = invItems.reduce((acc, item) => acc + item.tax, 0);
    const grandTotal = subtotal - totalDiscount + totalTax;

    const newInv: Invoice = {
      id: (1000 + invoices.length + 1).toString(),
      type: invType,
      customerName: invCustomer,
      date: invDate,
      items: invItems,
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
      status: invType === 'پیش‌فاکتور' ? 'پیشنویس' : 'پرداخت شده'
    };

    // Update stock if sales invoice
    if (invType === 'فاکتور فروش') {
      setProducts(products.map(p => {
        const item = invItems.find(i => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      }));
    }

    setInvoices([newInv, ...invoices]);
    setInvItems([]);
    setInvCustomer('');
    setActiveTab('invoices');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;
    const p: Product = {
      id: `P-${100 + products.length + 1}`,
      name: newProdName,
      category: newProdCategory,
      unit: newProdUnit,
      buyPrice: Number(newProdBuyPrice),
      sellPrice: Number(newProdSellPrice),
      stock: Number(newProdStock),
      minStock: Number(newProdMinStock)
    };
    setProducts([...products, p]);
    setNewProdName('');
    setNewProdBuyPrice(0);
    setNewProdSellPrice(0);
    setNewProdStock(0);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName) return;
    const c: Contact = {
      id: `C-${100 + contacts.length + 1}`,
      name: newContactName,
      phone: newContactPhone,
      type: newContactType
    };
    setContacts([...contacts, c]);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txContact || txAmount <= 0) return;
    const t: Transaction = {
      id: `T-${100 + transactions.length + 1}`,
      contactName: txContact,
      type: txType,
      amount: Number(txAmount),
      date: '1405/06/23',
      method: txMethod,
      description: txDesc
    };
    setTransactions([t, ...transactions]);
    setTxAmount(0);
    setTxDesc('');
  };

  const exportDataJSON = () => {
    const data = { products, contacts, invoices, transactions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `divan-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800';
  const bgCard = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const bgInput = isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900';
  const bgSidebar = isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700';
  const bgHover = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100';

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center min-h-screen p-4 dir-rtl font-sans ${bgMain}`}>
        <div className={`w-full max-w-md border rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 ${bgCard}`}>
          <div className="flex justify-end">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors">
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-indigo-600/10 text-indigo-500 rounded-xl mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-indigo-500">ورود به سیستم دیوان</h2>
            <p className="text-xs text-slate-400">نام کاربری: admin | رمز عبور: 123456</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-xs text-center font-semibold">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1">نام کاربری</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin" 
                  className={`w-full border rounded-lg py-2.5 pr-10 pl-3 text-sm focus:outline-none focus:border-indigo-500 ${bgInput}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">رمز عبور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456" 
                  className={`w-full border rounded-lg py-2.5 pr-10 pl-3 text-sm focus:outline-none focus:border-indigo-500 ${bgInput}`}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-indigo-600/20"
            >
              ورود به سیستم
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderSidebarContent = () => (
    <div className={`flex flex-col h-full border-l p-4 select-none ${bgSidebar}`}>
      <div className="text-xl font-bold text-center py-4 border-b border-slate-800/40 text-indigo-500">
        نرم‌افزار دیوان
      </div>
      
      <nav className="flex-1 mt-4 space-y-1.5 overflow-y-auto text-sm">
        <button 
          onClick={() => { setActiveTab('dashboard'); setMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-bold' : bgHover}`}
        >
          <Database className="w-4 h-4" />
          <span>داشبورد اصلی</span>
        </button>

        <button 
          onClick={() => { setActiveTab('invoices'); setMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-colors ${activeTab === 'invoices' || activeTab === 'new-invoice' ? 'bg-indigo-600 text-white font-bold' : bgHover}`}
        >
          <ShoppingCart className="w-4 h-4 text-emerald-500" />
          <span>فاکتورها و فروش</span>
        </button>

        <button 
          onClick={() => { setActiveTab('inventory'); setMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-indigo-600 text-white font-bold' : bgHover}`}
        >
          <Package className="w-4 h-4 text-amber-500" />
          <span>مدیریت انبار و کالا</span>
        </button>

        <button 
          onClick={() => { setActiveTab('contacts'); setMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-colors ${activeTab === 'contacts' ? 'bg-indigo-600 text-white font-bold' : bgHover}`}
        >
          <Users className="w-4 h-4 text-sky-500" />
          <span>طرف حساب‌ها و مشتریان</span>
        </button>

        <button 
          onClick={() => { setActiveTab('accounting'); setMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-colors ${activeTab === 'accounting' ? 'bg-indigo-600 text-white font-bold' : bgHover}`}
        >
          <CreditCard className="w-4 h-4 text-purple-500" />
          <span>حسابداری و دفتر معین</span>
        </button>

        <button 
          onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-indigo-600 text-white font-bold' : bgHover}`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>تنظیمات و پشتیبان‌گیری</span>
        </button>
      </nav>

      <div className="pt-4 border-t border-slate-800/40 space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج از حساب</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen w-screen overflow-hidden dir-rtl font-sans ${bgMain}`}>
      <div className="hidden md:block w-64 h-full shrink-0">
        {renderSidebarContent()}
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 w-64 h-full">{renderSidebarContent()}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`flex items-center justify-between px-4 py-3 border-b ${bgCard}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 rounded-lg bg-slate-800/20">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-lg font-bold text-indigo-500">
              {activeTab === 'dashboard' && 'داشبورد مدیریتی'}
              {activeTab === 'invoices' && 'صدور و مدیریت فاکتورها'}
              {activeTab === 'new-invoice' && 'ثبت فاکتور / پیش‌فاکتور جدید'}
              {activeTab === 'inventory' && 'انبارداری و موجودی کالا'}
              {activeTab === 'contacts' && 'طرف حساب‌ها'}
              {activeTab === 'accounting' && 'دفتر معین و امور مالی'}
              {activeTab === 'settings' && 'تنظیمات و پشتیبان‌گیری'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg border border-slate-700/30">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <button 
              onClick={() => setActiveTab('new-invoice')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
            >
              <Plus className="w-4 h-4" />
              فاکتور جدید
            </button>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 ${bgMain}`}>
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 border rounded-xl ${bgCard}`}>
                  <p className="text-xs text-slate-400">کل فاکتورها</p>
                  <p className="text-xl font-bold mt-1">{invoices.length} عدد</p>
                </div>
                <div className={`p-4 border rounded-xl ${bgCard}`}>
                  <p className="text-xs text-slate-400">تعداد کالا در انبار</p>
                  <p className="text-xl font-bold mt-1 text-emerald-500">{products.length} کالا</p>
                </div>
                <div className={`p-4 border rounded-xl ${bgCard}`}>
                  <p className="text-xs text-slate-400">طرف حساب‌های ثبت‌شده</p>
                  <p className="text-xl font-bold mt-1 text-blue-500">{contacts.length} نفر</p>
                </div>
                <div className={`p-4 border rounded-xl ${bgCard}`}>
                  <p className="text-xs text-slate-400">مجموع تراکنش‌ها</p>
                  <p className="text-xl font-bold mt-1 text-amber-500">{transactions.length} مورد</p>
                </div>
              </div>

              {/* Low Stock Warning */}
              {products.some(p => p.stock <= p.minStock) && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    هشدار کمبود موجودی انبار
                  </div>
                  <p className="text-xs text-slate-400">کالاهای زیر به نقطه سفارش رسیده یا کمتر از حد مجاز هستند:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {products.filter(p => p.stock <= p.minStock).map(p => (
                      <li key={p.id}>{p.name} - موجودی فعلی: <strong className="text-rose-500">{p.stock}</strong> (حداقل مجاز: {p.minStock})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* INVOICES LIST */}
          {activeTab === 'invoices' && (
            <div className={`border rounded-xl overflow-hidden ${bgCard}`}>
              <div className="p-4 border-b border-slate-800/40 flex justify-between items-center">
                <h3 className="font-bold">فهرست فاکتورها و پیش‌فاکتورها</h3>
                <button onClick={() => setActiveTab('new-invoice')} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs">ثبت فاکتور جدید</button>
              </div>
              <div className="divide-y divide-slate-800/40">
                {invoices.map((inv) => (
                  <div key={inv.id} className={`p-4 flex items-center justify-between ${bgHover}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">فاکتور #{inv.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{inv.type}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">خریدار: {inv.customerName} | تاریخ: {inv.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="font-bold text-emerald-500">{inv.grandTotal.toLocaleString()} ریال</p>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/20">{inv.status}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedInvoiceToPrint(inv)}
                        className="p-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-500 rounded-lg"
                        title="مشاهده و چاپ فاکتور"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW INVOICE FORM */}
          {activeTab === 'new-invoice' && (
            <div className={`border rounded-xl p-6 space-y-6 ${bgCard}`}>
              <h3 className="font-bold text-lg border-b border-slate-800/40 pb-3">صدور فاکتور / پیش‌فاکتور جدید</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">نوع فاکتور</label>
                  <select value={invType} onChange={(e: any) => setInvType(e.target.value)} className={`w-full p-2.5 border rounded-lg text-sm ${bgInput}`}>
                    <option value="فاکتور فروش">فاکتور فروش</option>
                    <option value="پیش‌فاکتور">پیش‌فاکتور</option>
                    <option value="فاکتور خرید">فاکتور خرید</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">نام خریدار / مشتری</label>
                  <select value={invCustomer} onChange={(e) => setInvCustomer(e.target.value)} className={`w-full p-2.5 border rounded-lg text-sm ${bgInput}`}>
                    <option value="">انتخاب از لیست طرف حساب‌ها...</option>
                    {contacts.map(c => <option key={c.id} value={c.name}>{c.name} ({c.type})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">تاریخ</label>
                  <input type="text" value={invDate} onChange={(e) => setInvDate(e.target.value)} className={`w-full p-2.5 border rounded-lg text-sm ${bgInput}`} />
                </div>
              </div>

              {/* Add Item Box */}
              <div className="p-4 border border-indigo-500/30 rounded-xl bg-indigo-500/5 space-y-4">
                <h4 className="text-xs font-bold text-indigo-400">افزودن کالا به فاکتور</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className={`w-full p-2 border rounded-lg text-xs ${bgInput}`}>
                    <option value="">انتخاب کالا از انبار...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (موجودی: {p.stock}) - {p.sellPrice.toLocaleString()} ریال</option>)}
                  </select>
                  <input type="number" min="1" value={itemQty} onChange={(e) => setItemQty(Number(e.target.value))} placeholder="تعداد" className={`w-full p-2 border rounded-lg text-xs ${bgInput}`} />
                  <input type="number" min="0" max="100" value={itemDiscount} onChange={(e) => setItemDiscount(Number(e.target.value))} placeholder="درصد تخفیف" className={`w-full p-2 border rounded-lg text-xs ${bgInput}`} />
                  <button onClick={handleAddItemToInvoice} className="p-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">افزودن به ردیف‌ها</button>
                </div>
              </div>

              {/* Items Table */}
              {invItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/40 border-b border-slate-700/50">
                      <tr>
                        <th className="p-3">نام کالا</th>
                        <th className="p-3">تعداد</th>
                        <th className="p-3">قیمت واحد</th>
                        <th className="p-3">تخفیف</th>
                        <th className="p-3">مالیات (9%)</th>
                        <th className="p-3">جمع کل</th>
                        <th className="p-3">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {invItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3">{item.productName}</td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3">{item.unitPrice.toLocaleString()}</td>
                          <td className="p-3 text-rose-400">{item.discount.toLocaleString()}</td>
                          <td className="p-3">{item.tax.toLocaleString()}</td>
                          <td className="p-3 font-bold text-emerald-400">{item.total.toLocaleString()}</td>
                          <td className="p-3">
                            <button onClick={() => handleRemoveInvoiceItem(idx)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button onClick={handleSaveInvoice} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm">ثبت و ذخیره نهایی فاکتور</button>
            </div>
          )}

          {/* INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className={`border rounded-xl p-6 space-y-4 ${bgCard}`}>
                <h3 className="font-bold">تعریف کالای جدید</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input type="text" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="نام کالا" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                  <input type="number" value={newProdBuyPrice || ''} onChange={(e) => setNewProdBuyPrice(Number(e.target.value))} placeholder="قیمت خرید (ریال)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  <input type="number" value={newProdSellPrice || ''} onChange={(e) => setNewProdSellPrice(Number(e.target.value))} placeholder="قیمت فروش (ریال)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                  <input type="number" value={newProdStock || ''} onChange={(e) => setNewProdStock(Number(e.target.value))} placeholder="موجودی اولیه" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                  <button type="submit" className="md:col-span-4 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">افزودن کالا به انبار</button>
                </form>
              </div>

              <div className={`border rounded-xl p-4 ${bgCard}`}>
                <h3 className="font-bold mb-4">موجودی انبار</h3>
                <div className="space-y-3">
                  {products.map((p) => (
                    <div key={p.id} className={`p-3 border rounded-lg flex justify-between items-center ${bgInput}`}>
                      <div>
                        <p className="font-bold">{p.name} <span className="text-[10px] text-slate-400">({p.category})</span></p>
                        <p className="text-xs text-slate-400">قیمت فروش: {p.sellPrice.toLocaleString()} ریال</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${p.stock <= p.minStock ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        موجودی: {p.stock} {p.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className={`border rounded-xl p-6 space-y-4 ${bgCard}`}>
                <h3 className="font-bold">تعریف طرف حساب جدید</h3>
                <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="نام و نام خانوادگی / شرکت" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                  <input type="text" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} placeholder="شماره تماس" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  <select value={newContactType} onChange={(e: any) => setNewContactType(e.target.value)} className={`p-2.5 border rounded-lg text-xs ${bgInput}`}>
                    <option value="مشتری">مشتری</option>
                    <option value="تامین‌کننده">تامین‌کننده</option>
                    <option value="همکار">همکار</option>
                  </select>
                  <button type="submit" className="md:col-span-3 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">ثبت طرف حساب</button>
                </form>
              </div>

              <div className={`border rounded-xl p-4 ${bgCard}`}>
                <h3 className="font-bold mb-4">لیست طرف حساب‌ها</h3>
                <div className="space-y-3">
                  {contacts.map((c) => (
                    <div key={c.id} className={`p-3 border rounded-lg flex justify-between items-center ${bgInput}`}>
                      <div>
                        <p className="font-bold">{c.name}</p>
                        <p className="text-xs text-slate-400">تلفن: {c.phone || 'ثبت نشده'}</p>
                      </div>
                      <span className="text-xs bg-slate-800/40 px-2.5 py-1 rounded">{c.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNTING */}
          {activeTab === 'accounting' && (
            <div className="space-y-6">
              <div className={`border rounded-xl p-6 space-y-4 ${bgCard}`}>
                <h3 className="font-bold">ثبت تراکنش مالی جدید (دریافت / پرداخت)</h3>
                <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select value={txContact} onChange={(e) => setTxContact(e.target.value)} className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required>
                    <option value="">انتخاب طرف حساب...</option>
                    {contacts.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <select value={txType} onChange={(e: any) => setTxType(e.target.value)} className={`p-2.5 border rounded-lg text-xs ${bgInput}`}>
                    <option value="دریافت">دریافت (ورودی نقد/بانک)</option>
                    <option value="پرداخت">پرداخت (خروجی)</option>
                  </select>
                  <input type="number" value={txAmount || ''} onChange={(e) => setTxAmount(Number(e.target.value))} placeholder="مبلغ (ریال)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                  <input type="text" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} placeholder="توضیحات تراکنش" className={`md:col-span-2 p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  <button type="submit" className="py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">ثبت تراکنش</button>
                </form>
              </div>

              <div className={`border rounded-xl p-4 ${bgCard}`}>
                <h3 className="font-bold mb-4">دفتر معین تراکنش‌ها</h3>
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div key={t.id} className={`p-3 border rounded-lg flex justify-between items-center ${bgInput}`}>
                      <div>
                        <p className="font-bold">{t.contactName} - <span className="text-xs font-normal text-slate-400">{t.description}</span></p>
                        <p className="text-xs text-slate-400">روش: {t.method} | تاریخ: {t.date}</p>
                      </div>
                      <span className={`text-xs font-bold ${t.type === 'دریافت' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'دریافت' ? '+' : '-'} {t.amount.toLocaleString()} ریال
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className={`border rounded-xl p-6 space-y-4 ${bgCard}`}>
                <h3 className="font-bold">پشتیبان‌گیری و خروجی داده‌ها</h3>
                <p className="text-xs text-slate-400">تمام فاکتورها، کالاها و طرف حساب‌ها را به‌صورت فایل JSON دانلود کنید تا در صورت نیاز بازیابی شوند.</p>
                <button onClick={exportDataJSON} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                  <Download className="w-4 h-4" />
                  دانلود فایل پشتیبان (JSON)
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRINT INVOICE MODAL */}
      {selectedInvoiceToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-indigo-600">فاکتور فروش دیوان</h2>
                <p className="text-xs text-slate-500">شماره فاکتور: #{selectedInvoiceToPrint.id}</p>
              </div>
              <button onClick={() => setSelectedInvoiceToPrint(null)} className="text-rose-500 font-bold text-sm">بستن</button>
            </div>

            <div className="grid grid-cols-2 text-xs gap-2 bg-slate-50 p-3 rounded-lg border">
              <p><strong>خریدار:</strong> {selectedInvoiceToPrint.customerName}</p>
              <p><strong>تاریخ:</strong> {selectedInvoiceToPrint.date}</p>
            </div>

            <table className="w-full text-right text-xs border border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="p-2 border">شرح کالا</th>
                  <th className="p-2 border">تعداد</th>
                  <th className="p-2 border">قیمت واحد</th>
                  <th className="p-2 border">جمع کل</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceToPrint.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 border">{item.productName}</td>
                    <td className="p-2 border">{item.quantity}</td>
                    <td className="p-2 border">{item.unitPrice.toLocaleString()}</td>
                    <td className="p-2 border font-bold">{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-left font-bold text-sm space-y-1">
              <p>جمع فاکتور: {selectedInvoiceToPrint.grandTotal.toLocaleString()} ریال</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2">
                <Printer className="w-4 h-4" />
                چاپ / پرینت فاکتور
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceApp;
