import React, { useState } from 'react';
import { Menu, Plus, FileText, ShoppingCart, Users, CreditCard, ChevronDown, ChevronLeft, Package, Settings, Database, Layers } from 'lucide-react';

export const InvoiceApp: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'inventory' | 'settings'>('dashboard');
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('sales');

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const handleNavClick = (tab: 'dashboard' | 'invoices' | 'inventory' | 'settings') => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-l border-slate-800 p-4">
      <div className="text-xl font-bold text-center py-4 border-b border-slate-800 text-indigo-400">
        نرم‌افزار دیوان
      </div>
      
      <nav className="flex-1 mt-4 space-y-2 overflow-y-auto text-sm">
        {/* اطلاعات پایه و داشبورد */}
        <div>
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>اطلاعات پایه و داشبورد</span>
            </div>
          </button>
        </div>

        {/* فروش و انبارداری */}
        <div>
          <button 
            onClick={() => toggleSubmenu('sales')}
            className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>فروش و انبارداری</span>
            </div>
            {openSubmenu === 'sales' ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {openSubmenu === 'sales' && (
            <div className="mr-4 mt-1 space-y-1 border-r-2 border-slate-700 pr-2 text-xs">
              <button 
                onClick={() => handleNavClick('invoices')}
                className={`w-full flex items-center gap-2 p-2 rounded-md ${activeTab === 'invoices' ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>صدور و مدیریت فاکتور</span>
              </button>
              <button 
                onClick={() => handleNavClick('inventory')}
                className={`w-full flex items-center gap-2 p-2 rounded-md ${activeTab === 'inventory' ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>مدیریت انبار</span>
              </button>
            </div>
          )}
        </div>

        {/* تنظیمات */}
        <div>
          <button 
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>تنظیمات</span>
            </div>
          </button>
        </div>
      </nav>

      <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800">
        نسخه کشویی سایدبار (v3.1.6)
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 dir-rtl font-sans">
      {/* سایدبار دسکتاپ */}
      <div className="hidden md:block w-64 h-full">
        {renderSidebarContent()}
      </div>

      {/* سایدبار کشویی موبایل */}
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

      {/* محتوای اصلی صفحات */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-indigo-400">
              {activeTab === 'dashboard' && 'داشبورد مدیریت دیوان'}
              {activeTab === 'invoices' && 'مدیریت و صدور فاکتور'}
              {activeTab === 'inventory' && 'مدیریت موجودی انبار'}
              {activeTab === 'settings' && 'تنظیمات سیستم'}
            </h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium transition-colors">
            <Plus className="w-4 h-4" />
            فاکتور جدید
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab('invoices')} className="p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/50 flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg"><FileText className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-slate-400">فاکتورها</p>
                    <p className="text-base font-bold">مدیریت فاکتورها</p>
                  </div>
                </div>
                <div onClick={() => setActiveTab('inventory')} className="p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-emerald-500/50 flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><ShoppingCart className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-slate-400">انبار</p>
                    <p className="text-base font-bold">موجودی کالا</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <h2 className="text-lg font-bold text-indigo-400 mb-2">بخش فاکتورها</h2>
              <p className="text-sm text-slate-400">لیست فاکتورهای صادر شده در این بخش نمایش داده می‌شود.</p>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <h2 className="text-lg font-bold text-emerald-400 mb-2">بخش انبارداری</h2>
              <p className="text-sm text-slate-400">لیست کالاها و موجودی انبار در این بخش مدیریت می‌شود.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <h2 className="text-lg font-bold text-slate-300 mb-2">تنظیمات نرم‌افزار</h2>
              <p className="text-sm text-slate-400">پیکربندی چاپی و اطلاعات فروشگاه.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InvoiceApp;
