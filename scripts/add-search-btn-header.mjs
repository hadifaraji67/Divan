import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/layout/Header.tsx';

if (!existsSync(file)) {
  console.log('❌ Header پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('onOpenSearch')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

const log = [];

// Props
src = src.replace(
  /interface Props \{[\s\S]*?\}/,
  (m) => {
    if (m.includes('onOpenSearch')) return m;
    return m.replace('}', '  onOpenSearch?: () => void;\n}');
  }
);

// تابع destination — اضافه کردن دکمه جستجو
src = src.replace(
  /export const Header: React\.FC<Props> = \(\{([^}]*)\}\) => \{/,
  (m, props) => `export const Header: React.FC<Props> = ({${props}}) => {`
);

// دکمه جستجو — کنار RoleBadge
const searchBtn = `
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs opacity-70 hover:opacity-100 transition-all"
            title="جستجو (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>جستجو...</span>
            <kbd className="text-[9px] px-1 py-0.5 rounded bg-white dark:bg-slate-900 border">Ctrl+K</kbd>
          </button>
        )`;

// اضافه کردن بعد از RoleBadge
if (src.includes('<RoleBadge />')) {
  src = src.replace('<RoleBadge />', '<RoleBadge />' + searchBtn);
  log.push('✅ دکمه جستجو (بعد از RoleBadge)');
} else if (src.includes('<h1')) {
  // بعد از h1
  src = src.replace(/(<h1[^>]*>\{title\}<\/h1>)/, '$1' + searchBtn);
  log.push('✅ دکمه جستجو (بعد از h1)');
}

// Search icon import
const lucideMatch = src.match(/import \{([^}]*)\} from ['"]lucide-react['"];/);
if (lucideMatch && !lucideMatch[1].includes('Search')) {
  src = src.replace(
    lucideMatch[0],
    lucideMatch[0].replace('}', ', Search }').replace('{, ', '{')
  );
}

writeFileSync(file, src);
console.log(log.join('\n'));
