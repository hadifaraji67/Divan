import React, { useState } from 'react';
import { Store, Printer, Calendar, Database, Palette } from 'lucide-react';
import { GeneralSettings } from './settings/GeneralSettings';
import { StoreSettings } from './settings/StoreSettings';
import { FiscalSettings } from './settings/FiscalSettings';
import { PrintSettings } from './PrintSettings';
import { BackupRestore } from './BackupRestore';

type Tab = 'general' | 'store' | 'print' | 'fiscal' | 'backup';

const TABS: { id: Tab; title: string; icon: React.ElementType }[] = [
  { id: 'general', title: 'عمومی', icon: Palette },
  { id: 'store', title: 'اطلاعات فروشگاه', icon: Store },
  { id: 'print', title: 'تنظیمات چاپ', icon: Printer },
  { id: 'fiscal', title: 'سال مالی', icon: Calendar },
  { id: 'backup', title: 'پشتیبان‌گیری', icon: Database },
];

export const SettingsHub: React.FC = () => {
  const [active, setActive] = useState<Tab>('general');

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.title}
            </button>
          );
        })}
      </div>

      <div key={active} style={{ animation: 'fadeIn 0.2s ease-out' }}>
        {active === 'general' && <GeneralSettings />}
        {active === 'store' && <StoreSettings />}
        {active === 'print' && <PrintSettings />}
        {active === 'fiscal' && <FiscalSettings />}
        {active === 'backup' && <BackupRestore />}
      </div>
    </div>
  );
};

export default SettingsHub;
