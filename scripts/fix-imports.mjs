#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(process.cwd(), 'src');

const componentMap = {
  'Sidebar': 'layout', 'Header': 'layout', 'BottomNav': 'layout',
  'DashboardModule': 'modules', 'ContactsModule': 'modules', 'ProductsModule': 'modules',
  'InvoicesModule': 'modules', 'PaymentsModule': 'modules', 'ChequesModule': 'modules',
  'InstallmentsModule': 'modules', 'CashBox': 'modules', 'CustomerClub': 'modules',
  'JournalEntryForm': 'modules', 'FiscalYearClosing': 'modules',
  'ReportsModule': 'reports', 'ProfitLossReport': 'reports', 'BalanceSheetReport': 'reports',
  'FinancialReports': 'reports', 'RegionalReport': 'reports', 'PurchaseSalesReport': 'reports',
  'SuppliersDebt': 'reports', 'customer-ledger': 'reports', 'finance-panel': 'reports',
  'SettingsHub': 'hubs', 'ReportsHub': 'hubs',
  'InvoicePrintPro': 'print', 'PrintSettings': 'print',
  'ComingSoon': 'shared', 'UpdateBanner': 'shared', 'NotificationsPanel': 'shared',
  'LocationSelector': 'shared', 'JalaliDatePicker': 'shared', 'field': 'shared',
  'offline-cache': 'shared',
};

function getDepth(file) {
  const rel = relative(SRC, file);
  const parts = rel.split('/');
  const idx = parts.indexOf('components');
  if (idx === -1) return -1;
  return parts.length - idx - 2;
}

function prefix(depth) {
  if (depth < 0) return null;
  if (depth === 0) return './components';
  return '../'.repeat(depth) + 'components';
}

function walk(dir, cb) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules') continue;
      walk(full, cb);
    } else if (name.endsWith('.tsx') || name.endsWith('.ts')) {
      cb(full);
    }
  }
}

let fixed = 0;
const changed = [];

walk(SRC, (file) => {
  let content = readFileSync(file, 'utf8');
  const orig = content;
  const depth = getDepth(file);
  if (depth < 0) return;

  const pfx = prefix(depth);
  if (!pfx) return;

  // الگو: from './components/X' یا '../components/X' یا '../../components/X'
  content = content.replace(
    /(['"])(\.\.?\/)+(components)\/([A-Za-z0-9_-]+)(['"])/g,
    (m, q1, dots, comp, name, q4) => {
      const folder = componentMap[name];
      if (!folder) return m;
      return `${q1}${pfx}/${folder}/${name}${q4}`;
    }
  );

  // الگو: from '@/components/X'
  content = content.replace(
    /(['"])@\/components\/([A-Za-z0-9_-]+)(['"])/g,
    (m, q1, name, q3) => {
      const folder = componentMap[name];
      if (!folder) return m;
      return `${q1}@/components/${folder}/${name}${q3}`;
    }
  );

  if (content !== orig) {
    writeFileSync(file, content);
    changed.push(relative(SRC, file));
    fixed++;
  }
});

console.log(`✅ ${fixed} فایل اصلاح شد\n`);
changed.forEach(f => console.log(`   • ${f}`));
