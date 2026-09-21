import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/hubs/SettingsHub.tsx';

if (!existsSync(file)) {
  console.log('❌ SettingsHub پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// چک قبلی
if (src.includes('ReminderSettings')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// import
if (!src.includes('ReminderSettings')) {
  src = src.replace(
    "import { AboutSettings } from '../settings/AboutSettings';",
    "import { AboutSettings } from '../settings/AboutSettings';\nimport { ReminderSettings } from '../settings/ReminderSettings';"
  );
  log.push('✅ import ReminderSettings');
}

// Bell icon
if (!src.includes('Bell')) {
  src = src.replace(
    "import { Store, Printer, Calendar, Database, Palette, RefreshCw, HardDrive, Server, Info } from 'lucide-react';",
    "import { Store, Printer, Calendar, Database, Palette, RefreshCw, HardDrive, Server, Info, Bell } from 'lucide-react';"
  );
  log.push('✅ Bell icon');
}

// Tab type
src = src.replace(
  "type Tab = 'general' | 'store' | 'print' | 'fiscal' | 'backup' | 'update' | 'server' | 'security' | 'about';",
  "type Tab = 'general' | 'store' | 'print' | 'fiscal' | 'backup' | 'update' | 'server' | 'security' | 'reminder' | 'about';"
);

// TABS array
if (!src.includes("'reminder'")) {
  src = src.replace(
    "{ id: 'security', title: 'امنیت', icon: Shield },",
    "{ id: 'security', title: 'امنیت', icon: Shield },\n  { id: 'reminder', title: 'یادآوری', icon: Bell },"
  );
  log.push('✅ tab');
}

// رندر
if (!src.includes("active === 'reminder'")) {
  src = src.replace(
    "{active === 'security' && <LockSettings />}",
    "{active === 'security' && <LockSettings />}\n        {active === 'reminder' && <ReminderSettings />}"
  );
  log.push('✅ رندر');
}

writeFileSync(file, src);
console.log(log.join('\n'));
