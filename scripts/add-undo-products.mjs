import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// import
if (!src.includes('useUndoableDelete')) {
  src = src.replace(
    "import { notify } from '../../lib/toast';",
    "import { notify } from '../../lib/toast';\nimport { useUndoableDelete } from '../../lib/use-undoable-delete';\nimport { EmptyState } from '../shared/EmptyState';\nimport { PackagePlus } from 'lucide-react';"
  );
  log.push('✅ import');
}

// جایگزینی remove
const oldRemove = `const remove = (id: string) => {
    if (!confirm('حذف این کالا؟')) return;
    setItems(prev => prev.filter(p => p.id !== id));
  };`;

const newRemove = `const deleteWithUndo = useUndoableDelete<Product>({
    onDelete: (p) => {
      setItems(prev => prev.filter(x => x.id !== p.id));
    },
    onRestore: (p) => {
      setItems(prev => [...prev, p]);
    },
    getLabel: (p) => p.name || 'کالا',
  });

  const remove = (id: string) => {
    const product = items.find(p => p.id === id);
    if (!product) return;
    if (!confirm('حذف این کالا؟')) return;
    deleteWithUndo(product);
  };`;

if (src.includes(oldRemove)) {
  src = src.replace(oldRemove, newRemove);
  log.push('✅ remove با undo');
} else {
  log.push('⚠️ remove pattern پیدا نشد — چک کن');
}

writeFileSync(file, src);
console.log(log.join('\n'));
