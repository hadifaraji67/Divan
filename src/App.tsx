import React, { useState } from 'react';
import { InvoiceModule } from './components/InvoiceModule';
import { Package, Users, FileText, Menu, X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'inventory' | 'contacts'>('invoices');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'invoices', label: 'مدیریت فاکتورها', icon: FileText },
    { id: 'inventory', label: 'انبارداری و کالاها', icon: Package },
    { id: 'contacts', label: 'طرف حساب‌ها (اشخاص)', icon: Users },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans dir-rtl">
      {/* هدر موبایل */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <h1 className="text-base font-bold text-indigo-400">نرم‌افزار دیوان</h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* منوی کناری کشویی در موبایل */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-40 w-64 bg-slate-900 border-l border-slate-800 p-4 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:block text-lg font-bold text-center py-4 border-b border-slate-800 text-indigo-500">
          نرم‌افزار دیوان
        </div>

        <nav className="flex-1 space-y-2 mt-4 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-right p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}>
                <Icon className="w-4 h-4" /> 
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* پس‌زمینه در حالت باز بودن منو در موبایل */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" 
        />
      )}

      {/* محتوای اصلی */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
        {activeTab === 'invoices' && <InvoiceModule />}
        {activeTab === 'inventory' && (
          <div className="p-6 text-center text-slate-400">بخش کالاها و انبارداری</div>
        )}
        {activeTab === 'contacts' && (
          <div className="p-6 text-center text-slate-400">بخش طرف حساب‌ها</div>
        )}
      </main>
    </div>
  );
};

export default App;
