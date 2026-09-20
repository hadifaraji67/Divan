import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/shared/UpdateDebug.tsx';
let src = readFileSync(file, 'utf8');

// افزودن دکمه نمایش bundle state در تب env
const before = "      lines.push(`platform: ${w.Capacitor?.platform}`);";
const after = `      lines.push(\`platform: \${w.Capacitor?.platform}\`);

      // Bundle state
      try {
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

if (src.includes(before) && !src.includes('LiveUpdate Bundle')) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ Bundle state به دیباگ اضافه شد');
} else {
  console.log('⏭ قبلاً هست یا anchor پیدا نشد');
}
