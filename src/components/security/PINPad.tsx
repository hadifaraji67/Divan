import React, { useState, useRef, useEffect } from 'react';
import { Delete, Eye, EyeOff, Fingerprint, Scan } from 'lucide-react';

interface Props {
  mode: 'pin' | 'password';
  pinLength?: number;
  onSubmit: (value: string) => void;
  error?: string;
  onBiometric?: () => void;
  biometricType?: 'fingerprint' | 'face' | 'iris' | 'none';
  hint?: string;
  onForgot?: () => void;
}

export const PINPad: React.FC<Props> = ({
  mode,
  pinLength = 4,
  onSubmit,
  error,
  onBiometric,
  biometricType = 'none',
  hint,
  onForgot,
}) => {
  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error) setValue('');
  }, [error]);

  useEffect(() => {
    if (mode === 'pin' && value.length === pinLength) {
      const timer = setTimeout(() => onSubmit(value), 150);
      return () => clearTimeout(timer);
    }
  }, [value, pinLength, mode, onSubmit]);

  useEffect(() => {
    if (mode === 'password') passwordRef.current?.focus();
  }, [mode]);

  const handleDigit = (d: string) => {
    if (value.length < (mode === 'pin' ? pinLength : 100)) {
      setValue(prev => prev + d);
    }
  };

  const handleBackspace = () => setValue(prev => prev.slice(0, -1));

  if (mode === 'password') {
    return (
      <div className="w-full max-w-sm mx-auto space-y-4" dir="rtl">
        <div className="relative">
          <input
            ref={passwordRef}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value) onSubmit(value);
            }}
            placeholder="رمز عبور..."
            className="w-full p-4 text-center text-lg border-2 rounded-2xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none tracking-widest font-mono"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            {showPassword ? <EyeOff className="w-5 h-5 opacity-60" /> : <Eye className="w-5 h-5 opacity-60" />}
          </button>
        </div>

        {error && (
          <div className="text-rose-600 text-sm font-medium text-center p-2 rounded-lg bg-rose-500/10">
            {error}
          </div>
        )}

        {hint && <div className="text-xs opacity-60 text-center">راهنما: {hint}</div>}

        <div className="flex gap-2">
          {onBiometric && biometricType !== 'none' && (
            <button
              type="button"
              onClick={onBiometric}
              className="flex items-center justify-center px-4 py-3.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl"
            >
              {biometricType === 'face' ? <Scan className="w-5 h-5" /> : <Fingerprint className="w-5 h-5" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => value && onSubmit(value)}
            disabled={!value}
            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl"
          >
            ورود
          </button>
        </div>

        {onForgot && (
          <button
            onClick={onForgot}
            className="w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            رمز را فراموش کرده‌اید؟
          </button>
        )}
      </div>
    );
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

  return (
    <div className="w-full max-w-xs mx-auto space-y-5" dir="rtl">
      <div className="flex justify-center gap-4 py-4">
        {Array.from({ length: pinLength }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < value.length ? 'bg-indigo-500 scale-110' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="text-rose-600 text-sm font-medium text-center p-2 rounded-lg bg-rose-500/10">
          {error}
        </div>
      )}

      {hint && !error && <div className="text-xs opacity-60 text-center">راهنما: {hint}</div>}

      <div className="grid grid-cols-3 gap-3" dir="ltr">
        {digits.map((d, i) => {
          if (d === '') return <div key={i} />;
          if (d === 'back') {
            return (
              <button
                key={i}
                onClick={handleBackspace}
                disabled={!value}
                className="h-16 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-30"
              >
                <Delete className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              className="h-16 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-2xl font-bold text-slate-700 dark:text-slate-200"
            >
              {d}
            </button>
          );
        })}
      </div>

      {onBiometric && biometricType !== 'none' && (
        <button
          onClick={onBiometric}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium"
        >
          {biometricType === 'face' ? <Scan className="w-5 h-5" /> : <Fingerprint className="w-5 h-5" />}
          {biometricType === 'face' ? 'ورود با چهره' : 'ورود با اثر انگشت'}
        </button>
      )}

      {onForgot && (
        <button
          onClick={onForgot}
          className="w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          رمز را فراموش کرده‌اید؟
        </button>
      )}
    </div>
  );
};

export default PINPad;
