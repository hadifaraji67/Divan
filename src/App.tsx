import React, { useState, useEffect } from 'react';
import { OnboardingTour } from './components/setup/OnboardingTour';
import { CommandPalette } from './components/shared/CommandPalette';
import { BackupDiscoveryScreen } from './components/setup/BackupDiscoveryScreen';
import Sidebar, { type ViewKey } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import { notify } from './lib/toast';
import { useEdgeSwipe } from './lib/use-swipe';
import { useAutoBackup } from './lib/backup/use-auto-backup';
import { startWatcher } from './lib/sync/watcher';
import { startAutoReschedule } from './lib/cheque-reminder';

// ماژول‌ها
import { ContactsModule } from './components/modules/ContactsModule';
import { ProductsModule } from './components/modules/ProductsModule';
import { InvoicesModule } from './components/modules/InvoicesModule';
import { PaymentsModule } from './components/modules/PaymentsModule';
import { ChequesModule } from './components/modules/ChequesModule';
import { PrintSettings } from './components/print/PrintSettings';
import { CustomerClub } from './components/modules/CustomerClub';
import { InstallmentsModule } from './components/modules/InstallmentsModule';
import { CashBox } from './components/modules/CashBox';
import { DashboardModule } from './components/modules/DashboardModule';
import { JournalEntryForm } from './components/modules/JournalEntryForm';
import { ReportsModule } from './components/reports/ReportsModule';
import { ReportsHub } from './components/hubs/ReportsHub';
import { FiscalYearClosing } from './components/modules/FiscalYearClosing';
import { SettingsHub } from './components/hubs/SettingsHub';
import { ComingSoon } from './components/shared/ComingSoon';
import { AppGuard } from './components/setup/AppGuard';
import { Users, FileText, Wallet, Package, Calendar, Settings } from 'lucide-react';
import type { Account, JournalEntry, JournalLine } from './types/accounting';
import { DEFAULT_ACCOUNTS } from './lib/accounting';

const VIEW_TITLES: Record<ViewKey, string> = {
  home: 'داشبورد',
  // فروش
  contacts: 'اشخاص و مشتریان',
  invoices: 'مدیریت فاکتورها',
  payments: 'پرداخت‌ها',
  cheques: 'مدیریت چک‌ها',
  installments: 'اقساط و تسویه',
  'customer-club': 'باشگاه مشتریان',
  // خرید
  suppliers: 'تامین‌کنندگان',
  'purchase-invoices': 'فاکتور خرید',
  'supplier-payments': 'پرداخت به تامین‌کننده',
  // انبار
  inventory: 'انبار و کالا',
  'stock-movements': 'نقل و انتقال انبار',
  'stock-take': 'انبارگردانی',
  // مالی
  'journal-entry': 'ثبت سند دستی',
  'cash-box': 'صندوق و بانک',
  'fiscal-year-closing': 'بستن سال مالی',
  // گزارش‌ها
  'reports-hub': 'گزارش‌ها و تحلیل',
  // منابع انسانی
  employees: 'پرسنل',
  payroll: 'حقوق و دستمزد',
  attendance: 'حضور و غیاب',
  // پروژه‌ها
  projects: 'پروژه‌ها',
  production: 'تولید',
  // سیستم
  settings: 'تنظیمات سیستم',
};

export const App: React.FC = () => {
  const [showDiscovery, setShowDiscovery] = useState(false);

  // ─── بررسی بکاپ در اولین بار نصب ───
  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined') return;
      // چک کنیم اولین بار است یا نه
      const hasSeenDiscovery = localStorage.getItem('divan_discovery_seen');
      const hasData = localStorage.getItem('divan_contacts') || localStorage.getItem('divan_invoices');

      if (hasSeenDiscovery || hasData) {
        localStorage.setItem('divan_discovery_seen', '1');
        return;
      }

      // اولین بار نصب — چک بکاپ
      try {
        const { listBackups } = await import('./lib/backup/filesystem');
        const backups = await listBackups();
        if (backups.length > 0) {
          setShowDiscovery(true);
        } else {
          localStorage.setItem('divan_discovery_seen', '1');
        }
      } catch {
        localStorage.setItem('divan_discovery_seen', '1');
      }
    })();
  }, []);

  const handleDiscoveryComplete = () => {
    localStorage.setItem('divan_discovery_seen', '1');
    setShowDiscovery(false);
  };

  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('divan_onboarding_done');
  });

  const [showPalette, setShowPalette] = useState(false);

  // کیبورد Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((p) => !p);
      }
      if (e.key === 'F1') {
        e.preventDefault();
        setShowPalette(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('divan_onboarding_done', '1');
    setShowOnboarding(false);
  };

  const [active, setActive] = useState<ViewKey>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // بکاپ خودکار روزانه
  useAutoBackup();

  // یادآوری چک‌ها
  useEffect(() => {
    const stop = startAutoReschedule();
    return () => stop();
  }, []);

  // شروع watcher همگام‌سازی
  React.useEffect(() => {
    const stop = startWatcher();
    return stop;
  }, []);

  useEdgeSwipe({
    onOpenRight: () => setSidebarOpen(true),
    onClose: () => setSidebarOpen(false),
    isOpen: sidebarOpen,
  });

  const handleSelect = (key: ViewKey) => {
    setActive(key);
    setSidebarOpen(false);
  };

  const handleSaveJournal = (description: string, lines: JournalLine[]) => {
    const e: JournalEntry = {
      id: Date.now().toString(),
      entryNumber: entries.length + 1,
      date: new Date().toLocaleDateString('fa-IR'),
      description,
      lines,
      referenceType: 'MANUAL',
      createdAt: new Date().toISOString(),
    } as JournalEntry;
    setEntries(p => [...p, e]);
  };

  const renderView = () => {
    switch (active) {
      case 'home': return <DashboardModule onNavigate={(v: any) => handleSelect(v)} />;
      case 'contacts': return <ContactsModule />;
      case 'invoices': return <InvoicesModule />;
      case 'inventory': return <ProductsModule />;
      case 'customer-club': return <CustomerClub />;
      case 'installments': return <InstallmentsModule />;
      case 'cash-box': return <CashBox />;
      case 'payments': return <PaymentsModule />;
      case 'cheques': return <ChequesModule />;
      case 'journal-entry': return <JournalEntryForm accounts={accounts} onSave={handleSaveJournal} />;
      case 'fiscal-year-closing': return (
        <FiscalYearClosing
          accounts={accounts}
          entries={entries}
          onCloseFiscalYear={() => { if (confirm('بستن سال مالی؟')) { setEntries([]); notify.success('سال مالی بسته شد'); } }}
        />
      );
      case 'settings': return <SettingsHub />;

      // Coming Soon
      case 'suppliers': return <ComingSoon title="تامین‌کنندگان" description="مدیریت کامل تامین‌کنندگان با تاریخچه خرید، ارزیابی و مانده حساب" icon={Users} />;
      case 'purchase-invoices': return <ComingSoon title="فاکتور خرید" description="ثبت و مدیریت فاکتورهای خرید از تامین‌کنندگان" icon={FileText} />;
      case 'supplier-payments': return <ComingSoon title="پرداخت به تامین‌کننده" description="مدیریت پرداخت‌ها و تسویه حساب با تامین‌کنندگان" icon={Wallet} />;
      case 'stock-movements': return <ComingSoon title="نقل و انتقال انبار" description="ثبت جابجایی کالا بین انبارها و شعب" icon={Package} />;
      case 'stock-take': return <ComingSoon title="انبارگردانی" description="شمارش موجودی و تطبیق با سیستم" icon={Package} />;
      case 'employees': return <ComingSoon title="پرسنل" description="مدیریت اطلاعات کارکنان و قراردادها" icon={Users} />;
      case 'payroll': return <ComingSoon title="حقوق و دستمزد" description="محاسبه و پرداخت حقوق ماهانه پرسنل" icon={Wallet} />;
      case 'attendance': return <ComingSoon title="حضور و غیاب" description="ثبت ورود و خروج و محاسبه کارکرد" icon={Calendar} />;
      case 'projects': return <ComingSoon title="پروژه‌ها" description="مدیریت پروژه‌ها، وظایف و منابع" icon={Settings} />;
      case 'production': return <ComingSoon title="تولید" description="برنامه‌ریزی و مدیریت خط تولید" icon={Package} />;
      default: return <DashboardModule onNavigate={(v: any) => handleSelect(v)} />;
    }
  };

  return (
    <AppGuard>
    <CommandPalette
      open={showPalette}
      onClose={() => setShowPalette(false)}
      onNavigate={(view: any) => handleSelect(view)}
    />
    {showDiscovery && (
      <BackupDiscoveryScreen
        onComplete={handleDiscoveryComplete}
        onSkip={handleDiscoveryComplete}
      />
    )}
    {showOnboarding && !showDiscovery && (
      <OnboardingTour
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingComplete}
      />
    )}
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Sidebar
        active={active}
        onSelect={handleSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <Header
          title={VIEW_TITLES[active]}
          onMenuClick={() => setSidebarOpen(true)}
          onOpenSearch={() => setShowPalette(true)}
        />

        <div key={active} className="p-4 md:p-6 flex-1 view-enter">
          {active !== 'home' && (
            <button
              onClick={() => handleSelect('home')}
              className="mb-4 text-xs md:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              ← بازگشت به داشبورد
            </button>
          )}
          {renderView()}
        </div>

        <BottomNav
          active={active}
          onSelect={handleSelect}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </main>
    </div>
    </AppGuard>
  );
};

export default App;
