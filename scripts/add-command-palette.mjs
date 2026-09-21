import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/App.tsx';

if (!existsSync(file)) {
  console.log('❌ App.tsx پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// چک قبلی
if (src.includes('CommandPalette')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// import
const reactImport = src.match(/import React[^;]*;/);
if (reactImport && !reactImport[0].includes('useEffect')) {
  src = src.replace(reactImport[0], reactImport[0].replace('useState', 'useState, useEffect'));
}

// افزودن import CommandPalette
src = src.replace(
  "import { OnboardingTour } from './components/setup/OnboardingTour';",
  "import { OnboardingTour } from './components/setup/OnboardingTour';\nimport { CommandPalette } from './components/shared/CommandPalette';"
);
log.push('✅ import');

// state
const stateRegex = /const \[showOnboarding, setShowOnboarding\] = useState[\s\S]*?\}\);/;
const stateMatch = src.match(stateRegex);

if (stateMatch && !src.includes('showPalette')) {
  src = src.replace(
    stateMatch[0],
    stateMatch[0] + `

  const [showPalette, setShowPalette] = useState(false);

  // کیبورد Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((p) => !p);
      }
      if (e.key === 'F1') {
        e.preventDefault();
        setShowPalette(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);`
  );
  log.push('✅ state + keyboard');
}

// رندر CommandPalette — بعد از Onboarding
const renderAnchor = 'return (\n    <AppGuard>';
if (src.includes(renderAnchor)) {
  src = src.replace(
    renderAnchor,
    `return (
    <AppGuard>
    <CommandPalette
      open={showPalette}
      onClose={() => setShowPalette(false)}
      onNavigate={(view: any) => handleSelect(view)}
    />`
  );
  log.push('✅ رندر CommandPalette');
}

writeFileSync(file, src);
console.log(log.join('\n'));
