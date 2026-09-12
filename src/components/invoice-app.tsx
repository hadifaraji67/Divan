import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const InvoiceApp: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 dir-rtl font-sans">
      {/* سایدبار در دسکتاپ (ثابت) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* سایدبار کشویی برای موبایل */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* بخش اصلی برنامه */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* هدر موبایل جهت باز کردن سایدبار */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-indigo-400">نرم‌افزار دیوان</span>
        </header>

        {/* محتوای صفحات */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900">
          <div className="text-center text-slate-400 mt-10">
            <p className="text-lg font-medium text-slate-200">ساده‌سازی رابط کاربری انجام شد.</p>
            <p className="text-sm mt-2">منوی جدید از سمت راست در دسترس است.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoiceApp;
