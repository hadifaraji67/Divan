import React, { useState } from 'react';
import {
  FileText, Users, Package, Wallet, BarChart3, Shield,
  ChevronLeft, ChevronRight, Check, X, Sparkles,
} from 'lucide-react';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
  hint: string;
  color: string;
}

const STEPS: Step[] = [
  {
    icon: FileText,
    title: 'فاکتور بساز',
    description: 'با چند کلیک فاکتور فروش، خرید، پیش‌فاکتور و برگشتی صادر کن.',
    hint: 'منوی «فروش» → فاکتور جدید',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    icon: Users,
    title: 'مشتریان را ثبت کن',
    description: 'اطلاعات مشتریان و تامین‌کنندگان را ذخیره کن و مانده حساب را ببین.',
    hint: 'منوی «فروش» → مشتریان',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Package,
    title: 'کالا و انبار',
    description: 'کالاها را با بارکد، قیمت و موجودی مدیریت کن. حد بحرانی تعیین کن.',
    hint: 'منوی «انبار و کالا»',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Wallet,
    title: 'پرداخت و چک',
    description: 'پرداخت‌ها، چک‌ها و اقساط را پیگیری کن. همه در یک نگاه.',
    hint: 'منوی «مالی و حسابداری»',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: BarChart3,
    title: 'گزارش‌های حرفه‌ای',
    description: 'تراز، سود و زیان، ترازنامه و نمودار فروش — همه خودکار.',
    hint: 'منوی «گزارش‌ها و تحلیل»',
    color: 'from-sky-500 to-blue-600',
  },
  {
    icon: Shield,
    title: 'داده‌هایت امن است',
    description: 'قفل محلی، بکاپ رمزنگاری‌شده و بازیابی آسان.',
    hint: 'تنظیمات → امنیت و بکاپ',
    color: 'from-slate-500 to-slate-700',
  },
];

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const next = () => {
    if (isLast) onComplete();
    else setStep(step + 1);
  };

  const prev = () => {
    if (!isFirst) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold opacity-70">آشنایی با دیوان</span>
          </div>
          <button
            onClick={onSkip}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-xs opacity-60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-l from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Icon + Content */}
        <div className="p-6 text-center">
          <div className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-xl mb-5`}>
            <Icon className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-xl font-bold mb-2">{current.title}</h2>
          <p className="text-sm opacity-70 leading-relaxed mb-4">{current.description}</p>

          <div className="inline-block px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
            💡 {current.hint}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 pt-0">
          {!isFirst && (
            <button
              onClick={prev}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold"
            >
              <ChevronRight className="w-4 h-4" />
              قبلی
            </button>
          )}

          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
          >
            {isLast ? (
              <>
                <Check className="w-4 h-4" />
                شروع کار با دیوان
              </>
            ) : (
              <>
                بعدی
                <ChevronLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Skip Footer */}
        {!isLast && (
          <button
            onClick={onSkip}
            className="w-full pb-4 text-[11px] opacity-50 hover:opacity-80 transition-opacity"
          >
            رد کردن آموزش
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingTour;
