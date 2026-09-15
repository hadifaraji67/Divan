import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronRight, ChevronLeft, X } from 'lucide-react';
import {
  todayJalali, formatJalali, parseJalali, buildMonthGrid,
  daysInJalaliMonth, faMonthName, faWeekday, isToday, toFaDigits,
} from '../../lib/jalali';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const JalaliDatePicker: React.FC<Props> = ({ value, onChange, placeholder, disabled, className }) => {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(0);
  const [viewMonth, setViewMonth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const today = todayJalali();

  // مقدار اولیه view
  useEffect(() => {
    const parsed = parseJalali(value);
    if (parsed) {
      setViewYear(parsed.jy);
      setViewMonth(parsed.jm);
    } else {
      setViewYear(today.jy);
      setViewMonth(today.jm);
    }
  }, [value, open]);

  // بستن با کلیک بیرون
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const grid = buildMonthGrid(viewYear, viewMonth);
  const selected = parseJalali(value);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const pick = (day: number) => {
    const formatted = formatJalali(viewYear, viewMonth, day, true);
    onChange(formatted);
    setOpen(false);
  };

  const pickToday = () => {
    onChange(formatJalali(today.jy, today.jm, today.jd, true));
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 border rounded-lg text-sm transition-colors text-right
          ${disabled
            ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700'
            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
          }
          ${open ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}
          ${className || ''}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className={`truncate ${value ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
            {value || placeholder || 'انتخاب تاریخ...'}
          </span>
        </div>
        {value && !disabled && (
          <span onClick={clear} className="p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 cursor-pointer shrink-0">
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden w-[300px]"
          style={{ animation: 'scaleIn 0.12s ease-out' }}
        >
          {/* هدر تقویم */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="text-sm font-bold">
              {faMonthName(viewMonth)} {toFaDigits(viewYear)}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* روزهای هفته */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 py-2 border-b border-slate-100 dark:border-slate-800">
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} className={i === 6 ? 'text-rose-500' : ''}>{faWeekday(i).slice(0, 3)}</div>
            ))}
          </div>

          {/* شبکه روزها */}
          <div className="grid grid-cols-7 gap-0.5 p-2">
            {grid.map((day, idx) => {
              if (day === null) return <div key={idx} className="aspect-square" />;
              const isSel = selected?.jy === viewYear && selected?.jm === viewMonth && selected?.jd === day;
              const isTod = isToday(viewYear, viewMonth, day);
              const weekday = (idx % 7);
              const isFriday = weekday === 6;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pick(day)}
                  className={`aspect-square rounded-lg text-xs font-medium transition-all relative
                    ${isSel
                      ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30'
                      : isTod
                        ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-300 dark:border-indigo-600'
                        : isFriday
                          ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {toFaDigits(day)}
                  {isTod && !isSel && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* فوتر */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <button
              type="button"
              onClick={pickToday}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JalaliDatePicker;
