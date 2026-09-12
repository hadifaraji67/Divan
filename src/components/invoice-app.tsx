import React, { useState } from 'react';
import { 
  Menu, Plus, FileText, ShoppingCart, Users, CreditCard, 
  ChevronDown, ChevronLeft, Package, Settings, Database, 
  Wrench, Lock, User, LogOut, RefreshCw, CheckCircle, ArrowUpCircle
} from 'lucide-react';

export const InvoiceApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'new-invoice' | 'inventory' | 'contacts' | 'accounting' | 'tools' | 'settings'>('dashboard');
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('sales');

  // وضعیت سیستم آپدیت
  const [currentVersion] = useState('3.2.0');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'latest' | 'available'>('idle');

  const [invoices] = useState([
    { id: '1001', customer: 'علی محمدی', date: '1405/06/20', total: 12500000, status: 'پرداخت شده' },
    { id: '1002', customer: 'شرکت آریا', date: '1405/06/22', total: 48000000, status: 'پیشنویس' }
  ]);

  const [products] = useState([
    { id: 'P1', name: 'سنسور SpO2 بزرگسال', price: 1500000, stock: 120 },
    { id: 'P2', name: 'پروب پالس اکسی متر', price: 2800000, stock: 45 }
  ]);

  const [contacts] = useState([
    { id: 'C1', name: 'علی محمدی', phone: '09121112233', type: 'مشتری' },
    { id: 'C2', name: 'شرکت آریا', phone: '02188889999', type: 'همکار' }
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() !== '' && password.trim() !== '') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('لطفاً نام کاربری و رمز عبور را وارد کنید.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    setUpdateStatus('idle');
    setTimeout(() => {
      setCheckingUpdate(false);
      setUpdateStatus('latest');
    }, 1500);
  };

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const handleNavClick = (tab: any) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4 dir-rtl font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-indigo-600/10 text-indigo-400 rounded-xl mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-indigo-400">ورود به نرم‌افزار دیوان</h2>
            <p className="text-xs text-slate-400">جهت دسترسی به سیستم، حساب خود را وارد کنید</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs text-center">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">نام کاربری</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: admin" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pr-10 pl-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">رمز عبور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pr-10 pl-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
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

          <div className="text-center text-xs text-slate-500 border-t border-slate-800/60 pt-4">
            نرم‌افزار مدیریت فروش و انبارداری دیوان (نسخه {currentVersion})
          </div>
        </div>
      </div>
    );
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-l border-slate-800 p-4 select-none">
      <div className="text-xl font-bold text-center py-4 border-b border-slate-800 text-indigo-400">
        نرم‌افزار دیوان
      </div>
      
      <nav className="flex-1 mt-4 space-y-1.5 overflow-y-auto text-sm">
        <div>
          <button 
            onClick={() => toggleSubmenu('base')}
            className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>اطلاعات پایه و داشبورد</span>
            </div>
            {openSubmenu === 'base' ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {openSubmenu === 'base' && (
            <div className="mr-4 mt-1 space-y-1 border-r-2 border-slate-700 pr-2 text-xs">
              <button 
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-2 p-2 rounded-md ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <span>داشبورد اصلی</span>
              </button>
              <button 
                onClick={() => handleNavClick('contacts')}
                className={`w-full flex items-center gap-2 p-2 rounded-md ${activeTab === 'contacts' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <span>مدیریت طرف حساب‌ها</span>
              </button>
            </div>
          )}
        </div>

        <div>
          <button 
            onClick={() => toggleSubmenu('sales')}
            className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>فروش و انبارداری</span>
            </div>
            {openSubmenu === 'sales' ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {openSubmenu === 'sales' && (
            <div className="mr-4 mt-1 space-y-1 border-r-2 border-slate-700 pr-2 text-xs">
              <button 
                onClick={() => handleNavClick('invoices')}
                className={`w-full flex items-center gap-2 p-2 rounded-md ${activeTab === 'invoices' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>صدور و مدیریت فاکتور</span>
              </button>
              <button 
                onClick={() => handleNavClick('inventory')}
                className={`w-full flex items-center gap-2 p-2 rounded-md ${activeTab === 'inventory' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>مدیریت انبار و کالا</span>
              </button>
            </div>
          )}
        </div>

        <div>
          <button 
            onClick={() => toggleSubmenu('finance')}
            className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>حسابداری و مالی</span>
            </div>
            {openSubmenu === 'finance' ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {openSubmenu === 'finance' && (
            <div className="mr-4 mt-1 space-y-1 border-r-2 border-slate-700 pr-2 text-xs">
              <button 
                onClick={() => handleNavClick('accounting')}
                className={`w-full flex items-center gap-2 p-2 rounded-md ${activeTab === 'accounting' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <span>دفتر معین و تراکنش‌ها</span>
              </button>
            </div>
          )}
        </div>

        <div>
          <button 
            onClick={() => handleNavClick('tools')}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${activeTab === 'tools' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-sky-400" />
              <span>ابزارهای هوشمند</span>
            </div>
          </button>
        </div>

        <div>
          <button 
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>تنظیمات و آپدیت</span>
            </div>
          </button>
        </div>
      </nav>

      <div className="pt-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج از سیستم ({username})</span>
        </button>
        <div className="text-center text-[10px] text-slate-500">
          نسخه فعال: v{currentVersion}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 dir-rtl font-sans">
      <div className="hidden md:block w-64 h-full shrink-0">
        {renderSidebarContent()}
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-lg font-bold text-indigo-400">
              {activeTab === 'dashboard' && 'داشبورد مدیریت دیوان'}
              {activeTab === 'invoices' && 'صدور و مدیریت فاکتورها'}
              {activeTab === 'new-invoice' && 'صدور فاکتور جدید'}
              {activeTab === 'inventory' && 'مدیریت موجودی انبار'}
              {activeTab === 'contacts' && 'طرف حساب‌ها و مشتریان'}
              {activeTab === 'accounting' && 'حسابداری و دفتر معین'}
              {activeTab === 'tools' && 'ابزارهای هوشمند'}
              {activeTab === 'settings' && 'تنظیمات و بروزرسانی سیستم'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('new-invoice')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              فاکتور جدید
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="خروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab('invoices')} className="p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/50 flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg"><FileText className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-slate-400">فاکتورها</p>
                    <p className="text-sm font-bold">{invoices.length} فاکتور ثبت‌شده</p>
                  </div>
                </div>
                <div onClick={() => setActiveTab('inventory')} className="p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-emerald-500/50 flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><Package className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-slate-400">انبار</p>
                    <p className="text-sm font-bold">{products.length} کالا موجود</p>
                  </div>
                </div>
                <div onClick={() => setActiveTab('contacts')} className="p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-blue-500/50 flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Users className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-slate-400">طرف حساب‌ها</p>
                    <p className="text-sm font-bold">{contacts.length} شخص ثبت‌شده</p>
                  </div>
                </div>
                <div onClick={() => setActiveTab('accounting')} className="p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50 flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg"><CreditCard className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-slate-400">تراکنش‌ها</p>
                    <p className="text-sm font-bold">دفتر معین فعال</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-200">لیست فاکتورهای اخیر</h3>
                <button onClick={() => setActiveTab('new-invoice')} className="px-3 py-1 bg-indigo-600 rounded text-xs">ثبت جدید</button>
              </div>
              <div className="divide-y divide-slate-800">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50">
                    <div>
                      <p className="font-semibold text-slate-200">فاکتور #{inv.id} - {inv.customer}</p>
                      <p className="text-xs text-slate-400">تاریخ: {inv.date}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-emerald-400">{inv.total.toLocaleString()} ریال</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'new-invoice' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-slate-200">صدور فاکتور رسمی/غیررسمی</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="نام خریدار / مشتری" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm" />
                <input type="text" placeholder="تاریخ (مثال: 1405/06/23)" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm" />
              </div>
              <div className="border border-slate-800 rounded-lg p-4 bg-slate-950 text-center text-slate-400 text-sm">
                اقلام فاکتور را از انبار انتخاب کنید.
              </div>
              <button onClick={() => setActiveTab('invoices')} className="w-full py-2.5 bg-indigo-600 rounded-lg font-bold text-sm">ثبت و ذخیره فاکتور</button>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold text-slate-200 mb-4">مدیریت موجودی کالا</h3>
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-200">{p.name}</p>
                      <p className="text-xs text-slate-400">قیمت: {p.price.toLocaleString()} ریال</p>
                    </div>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full">موجودی: {p.stock}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold text-slate-200 mb-4">فهرست مشتریان و همکاران</h3>
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-400">شماره تماس: {c.phone}</p>
                    </div>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{c.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'accounting' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 space-y-2">
              <CreditCard className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="font-bold text-slate-200">دفتر معین و تراکنش‌های مالی</h3>
              <p className="text-xs">تمام بدهکاری‌ها و بستانکاری‌های ثبت شده در سیستم آماده دریافت خروجی PDF و چاپی می‌باشد.</p>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
              <Wrench className="w-10 h-10 text-sky-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-200">ابزارهای هوشمند نرم‌افزار</h3>
              <p className="text-xs mt-1">محاسبه مالیات بر ارزش افزوده، تبدیل قیمت و تولید کد QR فاکتور.</p>
            </div>
          )}

          {/* تنظیمات و بروزرسانی */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-200 flex items-center gap-2">
                      <ArrowUpCircle className="w-5 h-5 text-indigo-400" />
                      بررسی و بروزرسانی سیستم
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">نسخه فعلی: v{currentVersion}</p>
                  </div>
                  <button 
                    onClick={handleCheckUpdate}
                    disabled={checkingUpdate}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${checkingUpdate ? 'animate-spin' : ''}`} />
                    {checkingUpdate ? 'در حال بررسی...' : 'بررسی آپدیت جدید'}
                  </button>
                </div>

                {updateStatus === 'latest' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    شما در حال استفاده از آخرین نسخه نرم‌افزار (v{currentVersion}) هستید.
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-slate-200">تنظیمات چاپ و فاکتور</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-indigo-600" />
                    نمایش لوگو و اطلاعات فروشگاه در سربرگ فاکتور
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-indigo-600" />
                    محاسبه ۱۰٪ مالیات بر ارزش افزوده به صورت خودکار
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InvoiceApp;
