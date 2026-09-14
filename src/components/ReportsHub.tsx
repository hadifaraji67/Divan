import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Package, Users, Wallet, MapPin,
  FileText, Scale, PieChart, Activity, DollarSign,
} from 'lucide-react';
import { ReportsModule } from './ReportsModule';
import { FinancialReports } from './FinancialReports';
import { ProfitLossReport } from './ProfitLossReport';
import { BalanceSheetReport } from './BalanceSheetReport';
import { RegionalReport } from './RegionalReport';
import { PurchaseSalesReport } from './PurchaseSalesReport';
import { SuppliersDebt } from './SuppliersDebt';
import { FinancePanel } from './finance-panel';
import { CustomerLedger } from './customer-ledger';
import type { Account, JournalEntry } from '../types/accounting';

type Tab = 'overview' | 'sales' | 'products' | 'customers' | 'profit-loss' | 'balance-sheet' | 'trial' | 'regional' | 'ledger' | 'purchase-sales' | 'suppliers-debt' | 'finance-panel';

const TABS: { id: Tab; title: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: 'overview', title: 'نمای کلی', desc: 'خلاصه فروش و سود', icon: PieChart, color: 'indigo' },
  { id: 'sales', title: 'فروش', desc: 'نمودار ماهانه', icon: TrendingUp, color: 'emerald' },
  { id: 'products', title: 'کالاها', desc: 'پرفروش‌ترین‌ها', icon: Package, color: 'sky' },
  { id: 'customers', title: 'مشتریان', desc: 'برترین خریداران', icon: Users, color: 'violet' },
  { id: 'profit-loss', title: 'سود و زیان', desc: 'صورت رسمی', icon: Wallet, color: 'emerald' },
  { id: 'balance-sheet', title: 'ترازنامه', desc: 'دارایی/بدهی', icon: Scale, color: 'rose' },
  { id: 'trial', title: 'تراز آزمایشی', desc: 'دفتر کل', icon: FileText, color: 'amber' },
  { id: 'regional', title: 'منطقه‌ای', desc: 'فروش به تفکیک استان', icon: MapPin, color: 'sky' },
  { id: 'ledger', title: 'دفتر معین', desc: 'گردش حساب', icon: Activity, color: 'indigo' },
  { id: 'purchase-sales', title: 'خرید و فروش', desc: 'مقایسه ماهانه', icon: TrendingUp, color: 'emerald' },
  { id: 'suppliers-debt', title: 'بدهی تامین‌کنندگان', desc: 'مانده حساب', icon: Users, color: 'rose' },
  { id: 'finance-panel', title: 'پنل مالی', desc: 'جریان نقدی', icon: Wallet, color: 'indigo' },
];

interface Props {
  accounts: Account[];
  entries: JournalEntry[];
}

export const ReportsHub: React.FC<Props> = ({ accounts, entries }) => {
  const [active, setActive] = useState<Tab>('overview');

  return (
    <div className="space-y-4" dir="rtl">
      {/* تب‌ها - اسکرول افقی در موبایل */}
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

      {/* محتوا */}
      <div key={active} style={{ animation: 'fadeIn 0.2s ease-out' }}>
        {active === 'overview' && <ReportsModule />}
        {active === 'sales' && <SalesReport />}
        {active === 'products' && <ProductsReport />}
        {active === 'customers' && <CustomersReport />}
        {active === 'profit-loss' && <ProfitLossReport />}
        {active === 'balance-sheet' && <BalanceSheetReport />}
        {active === 'trial' && <FinancialReports accounts={accounts} entries={entries} />}
        {active === 'regional' && <RegionalReport />}
        {active === 'ledger' && <CustomerLedger />}
        {active === 'purchase-sales' && <PurchaseSalesReport />}
        {active === 'suppliers-debt' && <SuppliersDebt />}
        {active === 'finance-panel' && <FinancePanel />}
      </div>
    </div>
  );
};

/* گزارش فروش */
const SalesReport: React.FC = () => {
  return <ReportsModule defaultTab="sales" />;
};

/* گزارش کالا */
const ProductsReport: React.FC = () => {
  return <ReportsModule defaultTab="products" />;
};

/* گزارش مشتریان */
const CustomersReport: React.FC = () => {
  return <ReportsModule defaultTab="customers" />;
};

export default ReportsHub;
