import React, { useState } from 'react';
import { KeyRound, Puzzle } from 'lucide-react';
import { MODULES, activateWithCode, setModuleEnabled } from '../../lib/licensing';
import { useEnabledModules } from '../../lib/use-modules';
import { notify } from '../../lib/toast';
import { RBACGate } from '../shared/RBACGate';

export const ModulesSettings: React.FC = () => {
  const enabled = useEnabledModules();
  const [code, setCode] = useState('');

  const redeem = () => {
    if (!code.trim()) return;
    const result = activateWithCode(code);
    if (!result.ok) {
      notify.error(result.error || 'فعال‌سازی ناموفق بود');
      return;
    }
    const names = MODULES.filter(m => result.modules?.includes(m.key)).map(m => m.name).join('، ');
    notify.success('ماژول‌ها فعال شدند', names);
    setCode('');
  };

  return (
    <RBACGate permission="settings.edit">
      <div className="space-y-4 max-w-2xl" dir="rtl">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2"><Puzzle className="w-5 h-5" /> ماژول‌ها</h3>
          <p className="text-xs text-slate-500 mt-1">
            هر سازمان فقط ماژول‌هایی را که نیاز دارد فعال نگه می‌دارد. غیرفعال کردن یک ماژول فقط آن را از منو پنهان می‌کند و هیچ داده‌ای حذف نمی‌شود.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
          {MODULES.map(m => {
            const on = enabled.includes(m.key);
            return (
              <label key={m.key} className="flex items-center justify-between gap-4 p-4 cursor-pointer">
                <div className="min-w-0">
                  <div className="font-bold text-sm">{m.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.description}</div>
                </div>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => setModuleEnabled(m.key, e.target.checked)}
                  className="w-5 h-5 accent-turquoise shrink-0"
                />
              </label>
            );
          })}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="font-bold text-sm flex items-center gap-2"><KeyRound className="w-4 h-4" /> کد فعال‌سازی</div>
          <p className="text-xs text-slate-500">اگر کد فعال‌سازی ماژول دارید، اینجا وارد کنید.</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="DIVAN-..."
              dir="ltr"
              className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm font-mono"
            />
            <button onClick={redeem} className="px-5 py-2 bg-turquoise hover:opacity-90 text-white text-sm font-bold rounded-lg">
              فعال‌سازی
            </button>
          </div>
        </div>
      </div>
    </RBACGate>
  );
};

export default ModulesSettings;
