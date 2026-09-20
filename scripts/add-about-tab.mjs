import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/hubs/SettingsHub.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// import
if (!src.includes('AboutSettings')) {
  src = src.replace(
    "import { LockSettings } from '../settings/LockSettings';",
    "import { LockSettings } from '../settings/LockSettings';\nimport { AboutSettings } from '../settings/AboutSettings';"
  );
  log.push('✅ import');
}

// افزودن Info به lucide
if (!src.includes(', Info')) {
  src = src.replace(
    "import { Store, Printer, Calendar, Database, Palette, RefreshCw, HardDrive, Server } from 'lucide-react';",
    "import { Store, Printer, Calendar, Database, Palette, RefreshCw, HardDrive, Server, Info } from 'lucide-react';"
  );
  log.push('✅ Info icon');
}

// Tab type
src = src.replace(
  "type Tab = 'general' | 'store' | 'print' | 'fiscal' | 'backup' | 'update' | 'server' | 'security';",
  "type Tab = 'general' | 'store' | 'print' | 'fiscal' | 'backup' | 'update' | 'server' | 'security' | 'about';"
);

// TABS array
if (!src.includes("'about'")) {
  src = src.replace(
    "{ id: 'security', title: 'امنیت', icon: Shield },",
    "{ id: 'security', title: 'امنیت', icon: Shield },\n  { id: 'about', title: 'درباره', icon: Info },"
  );
  log.push('✅ tab');
}

// رندر
if (!src.includes("active === 'about'")) {
  src = src.replace(
    "{active === 'security' && <LockSettings />}",
    "{active === 'security' && <LockSettings />}\n        {active === 'about' && <AboutSettings />}"
  );
  log.push('✅ رندر');
}

writeFileSync(file, src);
console.log(log.join('\n'));
