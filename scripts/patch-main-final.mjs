import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/main.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

if (!src.includes('installGlobalHandlers')) {
  src = src.replace(
    "import './styles.css';",
    "import './styles.css';\nimport { installGlobalHandlers } from './lib/error-logger';"
  );
  log.push('✅ import error-logger');
}

if (!src.includes('notifyAppReady')) {
  src = src.replace(
    "const rootElement = document.getElementById('root')!;",
    `(async () => {
  const w = window as any;
  if (w.Capacitor?.isNativePlatform?.() && w.Capacitor?.Plugins?.LiveUpdate) {
    try {
      await w.Capacitor.Plugins.LiveUpdate.notifyAppReady();
      console.log('[LiveUpdate] ready');
    } catch (e) { console.warn('[LiveUpdate] notifyAppReady:', e); }
  }
})();

installGlobalHandlers();

const rootElement = document.getElementById('root')!;`
  );
  log.push('✅ notifyAppReady + install handlers');
}

writeFileSync(file, src);
console.log(log.join('\n'));
