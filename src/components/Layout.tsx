import React from 'react';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 dir-rtl text-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900">
        {children}
      </main>
    </div>
  );
};

export default Layout;
