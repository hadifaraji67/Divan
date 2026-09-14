import React from 'react';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export const ComingSoon: React.FC<Props> = ({ title, description, icon: Icon = Sparkles }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4" dir="rtl">
      <div className="max-w-md w-full text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <Icon className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">{title}</h1>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold mb-4">
          <Clock className="w-3.5 h-3.5" />
          به زودی در نسخه بعدی
        </div>

        {description && (
          <p className="text-sm opacity-60 leading-relaxed mb-6">
            {description}
          </p>
        )}

        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border border-indigo-500/20">
          <div className="flex items-start gap-3 text-right">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold mb-1">در حال توسعه</div>
              <div className="text-[11px] opacity-60 leading-relaxed">
                تیم ما در حال ساخت این بخش است. برای اطلاع از زمان انتشار، نسخه‌های جدید را از طریق تنظیمات → بروزرسانی دنبال کنید.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
