import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search, X, Check } from 'lucide-react';
import { PROVINCES, getCounties, getCities } from '../lib/locations';

interface Props {
  province: string;
  county: string;
  city: string;
  onChange: (v: { province: string; county: string; city: string }) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const LocationSelector: React.FC<Props> = ({ province, county, city, onChange, disabled, compact }) => {
  const counties = useMemo(() => getCounties(province), [province]);
  const cities = useMemo(() => getCities(province, county), [province, county]);

  const setProvince = (v: string) => onChange({ province: v, county: '', city: '' });
  const setCounty = (v: string) => onChange({ province, county: v, city: '' });
  const setCity = (v: string) => onChange({ province, county, city: v });

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${compact ? 'gap-2' : ''}`}>
      <Combobox
        label="استان"
        value={province}
        options={PROVINCES}
        onChange={setProvince}
        disabled={disabled}
        placeholder="انتخاب استان..."
      />
      <Combobox
        label="شهرستان"
        value={county}
        options={counties}
        onChange={setCounty}
        disabled={disabled || !province}
        placeholder={province ? 'انتخاب شهرستان...' : 'اول استان'}
      />
      <Combobox
        label="شهر"
        value={city}
        options={cities}
        onChange={setCity}
        disabled={disabled || !county}
        placeholder={county ? 'انتخاب شهر...' : 'اول شهرستان'}
      />
    </div>
  );
};

/* ========== Combobox با جستجو ========== */
const Combobox: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}> = ({ label, value, options, onChange, disabled, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside as EventListener);
    document.addEventListener('touchstart', onClickOutside as EventListener);
    return () => {
      document.removeEventListener('mousedown', onClickOutside as EventListener);
      document.removeEventListener('touchstart', onClickOutside as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim();
    return options.filter(o => o.includes(q));
  }, [options, query]);

  return (
    <div ref={ref} className="relative">
      <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1 font-medium">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 border rounded-lg text-sm text-right transition-colors
          ${disabled
            ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
          }
          ${open ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className={`truncate ${value ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden"
          style={{ animation: 'scaleIn 0.12s ease-out' }}>
          <div className="p-2 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو..."
                className="w-full pr-8 pl-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-indigo-400 bg-transparent"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">چیزی پیدا نشد</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-right px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center justify-between
                    ${value === opt ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}
                  `}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="w-4 h-4 text-indigo-500 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
