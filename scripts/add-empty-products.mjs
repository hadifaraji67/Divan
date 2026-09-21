import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('<EmptyState')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

if (!src.includes('EmptyState')) {
  src = src.replace(
    "import { notify } from '../../lib/toast';",
    "import { notify } from '../../lib/toast';\nimport { EmptyState } from '../shared/EmptyState';\nimport { Package, Plus, Upload } from 'lucide-react';"
  );
}

const emptyRegex = /<div[^>]*className="[^"]*text-center[^"]*opacity[^"]*"[^>]*>\s*[^<]*(هیچ|موردی|هنوز)[^<]*<\/div>/;
if (emptyRegex.test(src)) {
  const emptyState = `<EmptyState
            icon={Package}
            title="هنوز کالایی نداری!"
            description="شروع کن با افزودن اولین کالا یا وارد کردن از فایل Excel"
            actions={[
              { label: 'افزودن کالا', icon: Plus, onClick: openNew },
              { label: 'ورود از Excel', icon: Upload, onClick: () => setShowImport(true), variant: 'secondary' },
            ]}
          />`;
  src = src.replace(emptyRegex, emptyState);
  console.log('✅ EmptyState اضافه شد');
} else {
  console.log('⚠️ الگوی empty پیدا نشد');
}

writeFileSync(file, src);
