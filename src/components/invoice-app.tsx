import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Plus, FileText, ShoppingCart, Users, CreditCard } from 'lucide-react';

export const InvoiceApp: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 dir-rtl font-sans">
      {/* سایدبار دسکتاپ */}
      <div className="hidden md:block border-l border-slate-800">
        <Sidebar />
      </div>

      {/* سایدبار کشویی موبایل */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-slate-900">
            <Sidebar />
          </div>
        </div>
      )}

      {/* محتوای اصلی و داشبورد برنامه */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* هدر بالایی */}
        <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-indigo-400">داشبورد مدیریت دیوان</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium transition-colors">
            <Plus className="w-4 h-4" />
            فاکتور جدید
          </button>
        </header>

        {/* بخش کارت‌ها و امکانات سریع */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg"><FileText className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-400">فاکتورهای امروز</p>
                <p className="text-base font-bold">مدیریت فاکتورها</p>
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><ShoppingCart className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-400">وضعیت انبار</p>
                <p className="text-base font-bold">موجودی کالا</p>
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-400">مشتریان</p>
                <p className="text-base font-bold">طرف حساب‌ها</p>
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg"><CreditCard className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-400">حسابداری</p>
                <p className="text-base font-bold">دفتر معین</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400">
            سیستم آماده استفاده است. از منوی سمت راست بخش مورد نظر خود را انتخاب کنید.
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoiceApp;
