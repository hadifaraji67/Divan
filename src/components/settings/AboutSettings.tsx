import React, { useState } from 'react';
import {
  Info, Bug, Copy, ExternalLink, MessageCircle, Mail,
  Github, Shield, FileText, Sparkles, Check,
} from 'lucide-react';
import { APP_VERSION } from '../../lib/update/update-v2';
import { getLog } from '../../lib/error-logger';
import { notify } from '../../lib/toast';

const GITHUB_REPO = 'hadifaraji67/Divan';

export const AboutSettings: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyLog = () => {
    try {
      const log = getLog();
      const text = log
        .map((e) => {
          const time = new Date(e.timestamp).toLocaleString('fa-IR');
          const data = e.data ? ` | ${JSON.stringify(e.data).slice(0, 200)}` : '';
          return `[${time}] [${e.level}] [${e.source}] ${e.message}${data}`;
        })
        .join('\n');

      const header = `=== دیوان ${APP_VERSION} ===\nتاریخ: ${new Date().toLocaleString('fa-IR')}\nتعداد خطا: ${log.length}\n\n`;

      navigator.clipboard.writeText(header + (text || 'هیچ خطایی ثبت نشده'));
      setCopied(true);
      notify.success('لاگ‌ها کپی شدند');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify.error('کپی ناموفق بود');
    }
  };

  const handleOpenIssue = () => {
    const title = encodeURIComponent(`[Bug] نسخه ${APP_VERSION}`);
    const body = encodeURIComponent(
      `### نسخه\n${APP_VERSION}\n\n### توضیح مشکل\n\n\n### مراحل بازتولید\n1. \n2. \n3. \n\n### انتظار\n\n\n### دستگاه\n- مدل: \n- اندروید: `
    );
    window.open(`https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}`, '_blank');
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* هدر */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 p-5 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-500/30">
          د
        </div>
        <h2 className="text-lg font-bold mt-3">دیوان</h2>
        <p className="text-xs opacity-70 mt-1">سامانه جامع حسابداری</p>
        <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/60 dark:bg-slate-900/50 text-xs font-mono">
          نسخه <span dir="ltr">{APP_VERSION}</span>
        </div>
      </div>

      {/* گزارش مشکل */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Bug className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">مشکلی پیدا کردی؟</div>
            <div className="text-[11px] opacity-70 mt-0.5 leading-relaxed">
              با گزارش مشکل، به بهتر شدن دیوان کمک کن. لاگ‌ها به‌طور خودکار ثبت می‌شوند.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleOpenIssue}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub Issue
          </button>
          <button
            onClick={handleCopyLog}
            disabled={copied}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 ${
              copied ? 'bg-emerald-600' : 'bg-slate-700 hover:bg-slate-800'
            } text-white text-xs font-bold rounded-lg transition-colors`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'کپی شد' : 'کپی لاگ‌ها'}
          </button>
        </div>

        <div className="text-[10px] opacity-60 mt-2 leading-relaxed text-center">
          پس از کپی لاگ‌ها، آن‌ها را در پیام خود paste کنید
        </div>
      </div>

      {/* صفحات حقوقی */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 space-y-1">
          <a
            href="https://github.com/hadifaraji67/Divan/blob/main/PRIVACY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm">
              <Shield className="w-4 h-4 text-emerald-500" />
              سیاست حریم خصوصی
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-40" />
          </a>
          <a
            href="https://github.com/hadifaraji67/Divan/blob/main/TERMS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm">
              <FileText className="w-4 h-4 text-sky-500" />
              شرایط استفاده
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-40" />
          </a>
        </div>
      </div>

      {/* ارتباط */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-violet-500" />
          ارتباط با ما
        </h3>
        <div className="space-y-1">
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-xs"
          >
            <Github className="w-4 h-4" />
            <span dir="ltr">github.com/{GITHUB_REPO}</span>
          </a>
          <a
            href="mailto:support@divan.app"
            className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-xs"
          >
            <Mail className="w-4 h-4" />
            <span>ارسال ایمیل</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] opacity-50 space-y-1 py-3">
        <div className="flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          ساخته شده با ❤️ در ایران
        </div>
        <div>© ۱۴۰۵ — دیوان</div>
      </div>
    </div>
  );
};

export default AboutSettings;
