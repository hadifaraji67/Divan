import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/hubs/SettingsHub.tsx';

if (!existsSync(file)) {
  console.log('❌ SettingsHub پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

if (src.includes('UsersSettings')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// import
src = src.replace(
  "import { AboutSettings } from '../settings/AboutSettings';",
  "import { AboutSettings } from '../settings/AboutSettings';\nimport { UsersSettings } from '../settings/UsersSettings';\nimport { useRBAC } from '../../lib/use-rbac';"
);

// Users icon
if (!src.includes(' Users')) {
  src = src.replace(
    /import \{([^}]*)\} from ['"]lucide-react['"];/,
    (m, content) => {
      if (content.includes('Users')) return m;
      return `import {${content.trim()}, Users } from 'lucide-react';`;
    }
  );
}

// Tab type
src = src.replace(
  /type Tab = ([^;]+);/,
  (m, types) => {
    if (types.includes("'users'")) return m;
    return `type Tab = ${types.trim().replace(/'about'/, "'users' | 'about'")};`;
  }
);

// TABS array — فقط برای admin
const tabsArrayRegex = /const TABS: \{ id: Tab; title: string; icon: React\.ElementType \}\[\] = \[([\s\S]*?)\];/;
const tabsMatch = src.match(tabsArrayRegex);

if (tabsMatch && !tabsMatch[1].includes('users')) {
  src = src.replace(
    tabsArrayRegex,
    `const TABS_BASE: { id: Tab; title: string; icon: React.ElementType; adminOnly?: boolean }[] = [$1,
  { id: 'users', title: 'کاربران', icon: Users, adminOnly: true },
];

const TABS = TABS_BASE;`
  );
  log.push('✅ TABS اضافه شد');
}

// استفاده از useRBAC در کامپوننت
if (!src.includes('useRBAC()')) {
  src = src.replace(
    /export const SettingsHub: React\.FC = \(\) => \{/,
    `export const SettingsHub: React.FC = () => {
  const { isAdmin } = useRBAC();
  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin);`
  );

  // جایگزینی TABS.map با visibleTabs.map
  src = src.replace(
    /\{TABS\.map\(/,
    '{visibleTabs.map('
  );
  log.push('✅ useRBAC');
}

// رندر
if (!src.includes("active === 'users'")) {
  src = src.replace(
    "{active === 'security' && <LockSettings />}",
    "{active === 'security' && <LockSettings />}\n        {active === 'users' && isAdmin && <UsersSettings />}"
  );
  log.push('✅ رندر');
}

writeFileSync(file, src);
console.log(log.join('\n'));
