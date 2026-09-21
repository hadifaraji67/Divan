import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/hubs/SettingsHub.tsx';

if (!existsSync(file)) {
  console.log('❌ SettingsHub پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// ─── پیدا کردن TABS_BASE ───
const tabsBaseRegex = /const TABS_BASE[^=]*=\s*\[[\s\S]*?\];/;

if (!tabsBaseRegex.test(src)) {
  console.log('❌ TABS_BASE پیدا نشد');
  process.exit(1);
}

const oldBlock = tabsBaseRegex.exec(src)[0];
console.log('متن فعلی TABS_BASE:');
console.log(oldBlock.slice(0, 500));

// ─── ساخت TABS_BASE تمیز ───
const cleanTabsBase = `const TABS_BASE: { id: Tab; title: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: 'general', title: 'عمومی', icon: Palette },
  { id: 'store', title: 'اطلاعات فروشگاه', icon: Store },
  { id: 'print', title: 'تنظیمات چاپ', icon: Printer },
  { id: 'fiscal', title: 'سال مالی', icon: Calendar },
  { id: 'backup', title: 'بکاپ و بازیابی', icon: HardDrive },
  { id: 'update', title: 'بروزرسانی', icon: RefreshCw },
  { id: 'server', title: 'سرور و همگام‌سازی', icon: Server },
  { id: 'security', title: 'امنیت', icon: Shield },
  { id: 'reminder', title: 'یادآوری', icon: Bell },
  { id: 'users', title: 'کاربران', icon: Users, adminOnly: true },
  { id: 'about', title: 'درباره', icon: Info },
];`;

src = src.replace(oldBlock, cleanTabsBase);
log.push('✅ TABS_BASE بازنویسی شد');

// ─── چک importهای لازم ───
const requiredIcons = ['Palette', 'Store', 'Printer', 'Calendar', 'HardDrive', 'RefreshCw', 'Server', 'Shield', 'Bell', 'Users', 'Info'];
const lucideImportMatch = src.match(/import \{([^}]*)\} from ['"]lucide-react['"];/);

if (lucideImportMatch) {
  const existing = lucideImportMatch[1].split(',').map((s) => s.trim());
  const missing = requiredIcons.filter((i) => !existing.includes(i));

  if (missing.length > 0) {
    const allIcons = [...new Set([...existing, ...requiredIcons])];
    src = src.replace(
      lucideImportMatch[0],
      `import { ${allIcons.join(', ')} } from 'lucide-react';`
    );
    log.push(`✅ ${missing.length} آیکون اضافه شد: ${missing.join(', ')}`);
  } else {
    log.push('⏭ همه آیکون‌ها موجود');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
