import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/shared/UpdateDebug.tsx';
let src = readFileSync(file, 'utf8');

if (!src.includes("from '@capawesome/capacitor-live-update'")) {
  src = "import { LiveUpdate } from '@capawesome/capacitor-live-update';\n" + src;
}

// جایگزینی دسترسی به bundle state
const before = `      try {
        const LU = w.Capacitor?.Plugins?.LiveUpdate;
        if (LU) {
          lines.push('');
          lines.push('=== LiveUpdate Bundle ===');
          try {
            const curr = await LU.getCurrentBundle?.();
            lines.push(\`current: \${JSON.stringify(curr)}\`);
          } catch (e: any) { lines.push(\`current error: \${e?.message}\`); }
          try {
            const next = await LU.getNextBundle?.();
            lines.push(\`next: \${JSON.stringify(next)}\`);
          } catch (e: any) { lines.push(\`next error: \${e?.message}\`); }
          try {
            const builtin = await LU.getBuiltinBundle?.();
            lines.push(\`builtin: \${JSON.stringify(builtin)}\`);
          } catch (e: any) { lines.push(\`builtin error: \${e?.message}\`); }
        }
      } catch {}`;

const after = `      try {
        lines.push('');
        lines.push('=== LiveUpdate ===');
        lines.push(\`plugin: \${typeof LiveUpdate}\`);
        try {
          const curr = await LiveUpdate.getCurrentBundle();
          lines.push(\`current: \${JSON.stringify(curr)}\`);
        } catch (e: any) { lines.push(\`current err: \${e?.message}\`); }
        try {
          const next = await LiveUpdate.getNextBundle();
          lines.push(\`next: \${JSON.stringify(next)}\`);
        } catch (e: any) { lines.push(\`next err: \${e?.message}\`); }
      } catch (e: any) { lines.push(\`LU err: \${e?.message}\`); }`;

if (src.includes(before)) {
  src = src.replace(before, after);
  console.log('✅ Bundle state به‌روز شد');
}
writeFileSync(file, src);
