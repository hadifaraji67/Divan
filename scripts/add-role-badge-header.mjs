import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/layout/Header.tsx';

if (!existsSync(file)) {
  console.log('❌ Header پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('RoleBadge')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// import
const importAnchor = src.match(/^import .* from ['"]lucide-react['"];$/m);
if (importAnchor) {
  src = src.replace(
    importAnchor[0],
    importAnchor[0] + "\nimport { RoleBadge } from '../shared/RoleBadge';"
  );
}

// افزودن Badge بعد از title
const titleRegex = /(<h1[^>]*>\{title\}<\/h1>)/;
if (titleRegex.test(src)) {
  src = src.replace(titleRegex, '$1\n        <RoleBadge />');
  console.log('✅ RoleBadge اضافه شد');
}

writeFileSync(file, src);
