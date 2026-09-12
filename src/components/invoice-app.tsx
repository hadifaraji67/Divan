import React, { useState, useEffect } from 'react';
import { 
  Menu, Plus, FileText, ShoppingCart, Users, CreditCard, 
  Settings, Database, Lock, User, LogOut, Sun, Moon, Trash2, 
  Printer, AlertTriangle, Download, TrendingUp, Calendar, CheckSquare, Shield
} from 'lucide-react';

// === Interfaces ===
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
  type: 'مشتری' | 'تامین‌کننده' | 'همکار';
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
  // Auth & User Management
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Navigation
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'new-invoice' | 'inventory' | 'contacts' | 'cheques' | 'reports' | 'settings'>('dashboard');

  // App Data (LocalStorage Persisted)
  const [products, setProducts] = useState<Product[]>(() => JSON.parse(localStorage.getItem('divan_products') || '[]'));
  const [contacts, setContacts] = useState<Contact[]>(() => JSON.parse(localStorage.getItem('divan_contacts') || '[]'));
  const [invoices, setInvoices] = useState<Invoice[]>(() => JSON.parse(localStorage.getItem('divan_invoices') || '[]'));
  const [cheques, setCheques] = useState<Cheque[]>(() => JSON.parse(localStorage.getItem('divan_cheques') || '[]'));

  useEffect(() => { localStorage.setItem('divan_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('divan_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('divan_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('divan_cheques', JSON.stringify(cheques)); }, [cheques]);

  // Invoice Creation Form State
  const [invType, setInvType] = useState<'فاکتور فروش' | 'پیش‌فاکتور' | 'فاکتور خرید'>('فاکتور فروش');
  const [invCustomer, setInvCustomer] = useState('');
  const [invDate, setInvDate] = useState('1405/06/23');
  const [invItems, setInvItems] = useState<InvoiceItem[]>([]);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [selectedInvoicePrint, setSelectedInvoicePrint] = useState<Invoice | null>(null);

  // New Cheque State
  const [cqContact, setCqContact] = useState('');
  const [cqAmount, setCqAmount] = useState(0);
  const [cqDueDate, setCqDueDate] = useState('');
  const [cqBank, setCqBank] = useState('');
  const [cqNum, setCqNum] = useState('');
  const [cqType, setCqType] = useState<'دریافتی' | 'پرداختی'>('دریافتی');

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      setCurrentUser({ id: '1', username: 'مدیر سیستم', role: 'مدیر کل' });
      setLoginError('');
    } else if (username === 'seller' && password === '123456') {
      setCurrentUser({ id: '2', username: 'اپراتور فروش', role: 'فروشنده' });
      setLoginError('');
    } else {
      setLoginError('نام کاربری یا رمز عبور نامعتبر است.');
    }
  };

  // Invoice Handlers
  const handleAddItem = () => {
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    const base = prod.sellPrice * itemQty;
    const tax = base * 0.09;
    const total = base + tax;

    setInvItems([...invItems, {
      productId: prod.id,
      productName: prod.name,
      quantity: itemQty,
      unitPrice: prod.sellPrice,
      buyPrice: prod.buyPrice,
      discount: 0,
      tax,
      total
    }]);
    setSelectedProdId('');
    setItemQty(1);
  };

  const handleSaveInvoice = () => {
    if (!invCustomer || invItems.length === 0) return;

    const subtotal = invItems.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
    const totalTax = invItems.reduce((acc, i) => acc + i.tax, 0);
    const grandTotal = subtotal + totalTax;
    const totalProfit = invItems.reduce((acc, i) => acc + ((i.unitPrice - i.buyPrice) * i.quantity), 0);

    const newInv: Invoice = {
      id: (1000 + invoices.length + 1).toString(),
      type: invType,
      customerName: invCustomer,
      date: invDate,
      items: invItems,
      subtotal,
      totalDiscount: 0,
      totalTax,
      grandTotal,
      totalProfit,
      status: 'پرداخت شده'
    };

    if (invType === 'فاکتور فروش') {
      setProducts(products.map(p => {
        const item = invItems.find(i => i.productId === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
      }));
    }

    setInvoices([newInv, ...invoices]);
    setInvItems([]);
    setActiveTab('invoices');
  };

  // Cheque Handler
  const handleAddCheque = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cqContact || cqAmount <= 0) return;
    const newCq: Cheque = {
      id: `CQ-${100 + cheques.length + 1}`,
      contactName: cqContact,
      amount: cqAmount,
      dueDate: cqDueDate,
      bankName: cqBank,
      chequeNumber: cqNum,
      type: cqType,
      status: 'در جریان'
    };
    setCheques([...cheques, newCq]);
    setCqAmount(0);
    setCqNum('');
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800';
  const bgCard = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const bgInput = isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900';

  if (!currentUser) {
    return (
      <div className={`flex items-center justify-center min-h-screen p-4 dir-rtl font-sans ${bgMain}`}>
        <div className={`w-full max-w-md border rounded-2xl p-8 shadow-2xl space-y-6 ${bgCard}`}>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-indigo-500">سیستم جامع دیوان</h2>
            <p className="text-xs text-slate-400">ورود مدیر: admin / 123456 | ورود فروشنده: seller / 123456</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-xs text-center">{loginError}</div>}
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="نام کاربری" className={`w-full p-3 border rounded-lg text-sm ${bgInput}`} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="رمز عبور" className={`w-full p-3 border rounded-lg text-sm ${bgInput}`} />
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition-colors">ورود به پنل</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden dir-rtl font-sans ${bgMain}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-l p-4 flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="text-xl font-bold text-center py-3 border-b border-slate-800/40 text-indigo-500">نرم‌افزار دیوان</div>
        <div className="my-2 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs">
          <p className="font-bold text-indigo-400">{currentUser.username}</p>
          <p className="text-[10px] text-slate-400">نقش: {currentUser.role}</p>
        </div>
        <nav className="flex-1 space-y-1 mt-2 text-sm">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-bold' : ''}`}>داشبورد</button>
          <button onClick={() => setActiveTab('invoices')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'invoices' ? 'bg-indigo-600 text-white font-bold' : ''}`}>فاکتورها</button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'inventory' ? 'bg-indigo-600 text-white font-bold' : ''}`}>انبارداری</button>
          <button onClick={() => setActiveTab('cheques')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'cheques' ? 'bg-indigo-600 text-white font-bold' : ''}`}>مدیریت چک‌ها</button>
          {currentUser.role === 'مدیر کل' && (
            <button onClick={() => setActiveTab('reports')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'reports' ? 'bg-indigo-600 text-white font-bold' : ''}`}>گزارش سود و زیان</button>
          )}
        </nav>
        <button onClick={() => setCurrentUser(null)} className="w-full p-2 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold mt-auto">خروج</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
        <header className="flex justify-between items-center border-b pb-4">
          <h1 className="text-xl font-bold text-indigo-500">
            {activeTab === 'dashboard' && 'داشبورد مدیریتی'}
            {activeTab === 'invoices' && 'مدیریت فاکتورها'}
            {activeTab === 'new-invoice' && 'صدور فاکتور جدید'}
            {activeTab === 'inventory' && 'مدیریت انبار'}
            {activeTab === 'cheques' && 'مدیریت چک‌های دریافتی و پرداختی'}
            {activeTab === 'reports' && 'گزارشات مالی و تحلیل سود'}
          </h1>
          <button onClick={toggleTheme} className="p-2 border rounded-lg">{isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}</button>
        </header>

        {/* CHEQUES TAB */}
        {activeTab === 'cheques' && (
          <div className="space-y-6">
            <div className={`border rounded-xl p-6 space-y-4 ${bgCard}`}>
              <h3 className="font-bold text-sm">ثبت چک جدید</h3>
              <form onSubmit={handleAddCheque} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" value={cqContact} onChange={e => setCqContact(e.target.value)} placeholder="صادرکننده / دریافت‌کننده" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                <input type="number" value={cqAmount || ''} onChange={e => setCqAmount(Number(e.target.value))} placeholder="مبلغ چک (ریال)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                <input type="text" value={cqDueDate} onChange={e => setCqDueDate(e.target.value)} placeholder="تاریخ سررسید (مثال: 1405/07/15)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                <input type="text" value={cqBank} onChange={e => setCqBank(e.target.value)} placeholder="نام بانک" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                <input type="text" value={cqNum} onChange={e => setCqNum(e.target.value)} placeholder="شماره صیادی / چک" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                <select value={cqType} onChange={(e: any) => setCqType(e.target.value)} className={`p-2.5 border rounded-lg text-xs ${bgInput}`}>
                  <option value="دریافتی">چک دریافتی</option>
                  <option value="پرداختی">چک پرداختی</option>
                </select>
                <button type="submit" className="md:col-span-3 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">ثبت برگه چک</button>
              </form>
            </div>

            <div className={`border rounded-xl p-4 ${bgCard}`}>
              <h3 className="font-bold mb-4 text-sm">لیست چک‌ها</h3>
              <div className="space-y-3">
                {cheques.map((c) => (
                  <div key={c.id} className={`p-3 border rounded-lg flex justify-between items-center ${bgInput}`}>
                    <div>
                      <p className="font-bold text-xs">{c.contactName} - <span className="text-indigo-400">{c.bankName} ({c.chequeNumber})</span></p>
                      <p className="text-[11px] text-slate-400">سررسید: {c.dueDate} | نوع: {c.type}</p>
                    </div>
                    <span className="font-bold text-xs text-emerald-400">{c.amount.toLocaleString()} ریال</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && currentUser.role === 'مدیر کل' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-5 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">مجموع فروش کل</p>
                <p className="text-xl font-bold mt-2 text-emerald-400">
                  {invoices.reduce((acc, i) => acc + i.grandTotal, 0).toLocaleString()} ریال
                </p>
              </div>
              <div className={`p-5 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">سود ناخالص از فروش</p>
                <p className="text-xl font-bold mt-2 text-indigo-400">
                  {invoices.reduce((acc, i) => acc + i.totalProfit, 0).toLocaleString()} ریال
                </p>
              </div>
              <div className={`p-5 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">مجموع مالیات دریافت شده</p>
                <p className="text-xl font-bold mt-2 text-amber-400">
                  {invoices.reduce((acc, i) => acc + i.totalTax, 0).toLocaleString()} ریال
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceApp;
