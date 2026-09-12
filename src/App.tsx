import React, { useState } from 'react';
import { InvoiceModule } from './components/InvoiceModule';
import { LayoutGrid, Package, Users, FileText } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'inventory' | 'contacts'>('invoices');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans dir-rtl">
      {/* منوی کناری ثابت */}
      <aside className="w-64 border-l border-slate-800 p-4 flex flex-col bg-slate-900">
        <div className="text-xl font-bold text-center py-4 border-b border-slate-800 text-indigo-500">
          سیستم حسابداری دیوان
        </div>
        <nav className="flex-1 space-y-2 mt-6 text-xs">
          <button 
            onClick={() => setActiveTab('invoices')} 
            className={`w-full text-right p-3 rounded-xl flex items-center gap-2 transition-all ${activeTab === 'invoices' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800'}`}>
            <FileText className="w-4 h-4" /> بخش صدور و مدیریت فاکتور
          </button>
          
          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`w-full text-right p-3 rounded-xl flex items-center gap-2 transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Package className="w-4 h-4" /> انبار و مدیریت کالاها
          </button>

          <button 
            onClick={() => setActiveTab('contacts')} 
            className={`w-full text-right p-3 rounded-xl flex items-center gap-2 transition-all ${activeTab === 'contacts' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Users className="w-4 h-4" /> اشخاص و طرف حساب‌ها
          </button>
        </nav>
      </aside>

      {/* محتوای اصلی */}
      <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
        {activeTab === 'invoices' && <InvoiceModule />}
        {activeTab === 'inventory' && (
          <div className="p-6 text-center text-slate-400">بخش کالاها و انبارداری (فعال است)</div>
        )}
        {activeTab === 'contacts' && (
          <div className="p-6 text-center text-slate-400">بخش طرف حساب‌ها (فعال است)</div>
        )}
      </main>
    </div>
  );
};

export default App;
