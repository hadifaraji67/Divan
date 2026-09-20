import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ContactsModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

if (!src.includes('useUndoableDelete')) {
  // اضافه کردن import
  const importMatch = src.match(/import \{ notify \} from ['"][^'"]+['"];/);
  if (importMatch) {
    src = src.replace(importMatch[0], importMatch[0] + "\nimport { useUndoableDelete } from '../../lib/use-undoable-delete';");
    log.push('✅ import');
  }
}

// پیدا کردن تابع remove
const removeRegex = /const remove\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\s*\};/;
const match = src.match(removeRegex);

if (match && !src.includes('deleteWithUndo')) {
  const newRemove = `const deleteWithUndo = useUndoableDelete<Contact>({
    onDelete: (c) => setContacts(prev => prev.filter(x => x.id !== c.id)),
    onRestore: (c) => setContacts(prev => [...prev, c]),
    getLabel: (c) => c.name || 'مشتری',
  });

  const remove = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    if (!confirm('حذف این مشتری؟')) return;
    deleteWithUndo(contact);
  };`;

  src = src.replace(match[0], newRemove);
  log.push('✅ remove با undo');
}

writeFileSync(file, src);
console.log(log.join('\n'));
