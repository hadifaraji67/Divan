import React, { useState } from 'react';
import Sidebar, { type ViewKey } from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import { UpdateBanner } from './components/UpdateBanner';
import { notify } from './lib/toast';
import { useEdgeSwipe } from './lib/use-swipe';

// ماژول‌ها
import { ContactsModule } from './components/ContactsModule';
import { ProductsModule } from './components/ProductsModule';
import { InvoicesModule } from './components/InvoicesModule';
import { PaymentsModule } from './components/PaymentsModule';
import { ChequesModule } from './components/ChequesModule';
import { SettingsModule } from './components/SettingsModule';
import { PrintSettings } from './components/PrintSettings';
import { RegionalReport } from './components/RegionalReport';
import { BackupRestore } from './components/BackupRestore';
import { CustomerClub } from './components/CustomerClub';
import { InstallmentsModule } from './components/InstallmentsModule';
import { CashBox } from './components/CashBox';
import { DashboardModule } from './components/DashboardModule';
import { InvoiceModule } from './components/InvoiceModule';
import { SmsImportPanel } from './components/sms-import-panel';
import { FinancePanel } from './components/finance-panel';
import { CustomerLedger } from './components/customer-ledger';
import { JournalEntryForm } from './components/JournalEntryForm';
import { FinancialReports } from './components/FinancialReports';
import { ReportsModule } from './components/ReportsModule';
import { ProfitLossReport } from './components/ProfitLossReport';
import { BalanceSheetReport } from './components/BalanceSheetReport';
import { FiscalYearClosing } from './components/FiscalYearClosing';
import type { Account, JournalEntry, JournalLine } from './types/accounting';
import { DEFAULT_ACCOUNTS } from './lib/accounting';

const VIEW_TITLES: Record<ViewKey, string> = {
  home: 'صفحه اصلی',
  contacts: 'اشخاص و مشتریان',
  invoice: 'صدور سریع فاکتور',
  invoices: 'مدیریت فاکتورها',
  inventory: 'انبار و کالا',
  'print-settings': 'تنظیمات چاپ',
  'regional-report': 'گزارش منطقه‌ای',
  backup: 'پشتیبان‌گیری و بازیابی',
  'customer-club': 'باشگاه مشتریان',
  installments: 'اقساط و تسویه',
  'cash-box': 'صندوق و کیف پول',
  payments: 'پرداخت‌ها',
  'customer-ledger': 'دفتر معین مشتریان',
  cheques: 'مدیریت چک‌ها',
  'journal-entry': 'ثبت سند دستی',
  'financial-reports': 'گزارش‌های مالی',
  'fiscal-year-closing': 'بستن سال مالی',
  reports: 'گزارش‌های جامع',
  'profit-loss': 'صورت سود و زیان',
  'balance-sheet': 'ترازنامه',
  finance: 'پنل مالی',
  'sms-import': 'استخراج پیامک بانکی',
  settings: 'تنظیمات سیستم',
};

export const App: React.FC = () => {
  const [active, setActive] = useState<ViewKey>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

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
      case 'invoice': return <InvoiceModule />;
      case 'invoices': return <InvoicesModule />;
      case 'inventory': return <ProductsModule />;
      case 'print-settings': return <PrintSettings />;
      case 'regional-report': return <RegionalReport />;
      case 'backup': return <BackupRestore />;
      case 'customer-club': return <CustomerClub />;
      case 'installments': return <InstallmentsModule />;
      case 'cash-box': return <CashBox />;
      case 'payments': return <PaymentsModule />;
      case 'customer-ledger': return <CustomerLedger />;
      case 'cheques': return <ChequesModule />;
      case 'journal-entry': return <JournalEntryForm accounts={accounts} onSave={handleSaveJournal} />;
      case 'financial-reports': return <FinancialReports accounts={accounts} entries={entries} />;
      case 'fiscal-year-closing': return (
        <FiscalYearClosing
          accounts={accounts}
          entries={entries}
          onCloseFiscalYear={() => { if (confirm('بستن سال مالی؟')) { setEntries([]); notify.success('سال مالی بسته شد'); } }}
        />
      );
      case 'reports': return <ReportsModule />;
      case 'profit-loss': return <ProfitLossReport />;
      case 'balance-sheet': return <BalanceSheetReport />;
      case 'finance': return <FinancePanel />;
      case 'sms-import': return <SmsImportPanel />;
      case 'settings': return <SettingsModule />;
      default: return <DashboardModule onNavigate={(v: any) => handleSelect(v)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Sidebar
        active={active}
        onSelect={handleSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <Header title={VIEW_TITLES[active]} onMenuClick={() => setSidebarOpen(true)} />

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
        <UpdateBanner />
      </main>
    </div>
  );
};

export default App;
