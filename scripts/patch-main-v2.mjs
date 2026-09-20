import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/main.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

if (!src.includes('installGlobalHandlers')) {
  src = src.replace("import './styles.css';", "import './styles.css';\nimport { installGlobalHandlers } from './lib/error-logger';");
  log.push('✅ import');
}
if (!src.includes('installGlobalHandlers();')) {
  src = src.replace(
    "const rootElement = document.getElementById('root')!;",
    "(async () => {\n  const w = window as any;\n  if (w.Capacitor?.isNativePlatform?.() && w.Capacitor?.Plugins?.LiveUpdate) {\n    try { await w.Capacitor.Plugins.LiveUpdate.notifyAppReady(); } catch {}\n  }\n})();\ninstallGlobalHandlers();\n\nconst rootElement = document.getElementById('root')!;"
  );
  log.push('✅ install handlers');
}
writeFileSync(file, src);
console.log(log.join('\n') || '⏭ تغییری لازم نبود');
