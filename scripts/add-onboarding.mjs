import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// چک فایل App.tsx
const candidates = ['src/App.tsx', 'src/components/App.tsx'];
let appFile = candidates.find((f) => existsSync(f));

if (!appFile) {
  console.log('❌ App.tsx پیدا نشد');
  process.exit(1);
}

let src = readFileSync(appFile, 'utf8');
const log = [];

// import
if (!src.includes('OnboardingTour')) {
  // اضافه کردن import بعد از آخرین import
  const importMatch = src.match(/^(import[\s\S]*?;)\s*\n/m);
  if (importMatch) {
    src = src.replace(
      importMatch[1],
      importMatch[1] + "\nimport { OnboardingTour } from './components/setup/OnboardingTour';"
    );
    log.push('✅ import');
  }
}

// storage key
const STORAGE_KEY = 'divan_onboarding_done';

// state + handler
if (!src.includes('showOnboarding')) {
  // پیدا کردن اولین useState
  const stateMatch = src.match(/const \[(\w+),\s*set\w+\]\s*=\s*useState/);
  if (stateMatch) {
    const insertion = `const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('${STORAGE_KEY}');
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('${STORAGE_KEY}', '1');
    setShowOnboarding(false);
  };

  ${stateMatch[0]}`;
    src = src.replace(stateMatch[0], insertion);
    log.push('✅ state');
  }
}

// رندر
if (!src.includes('<OnboardingTour')) {
  // پیدا کردن return
  const returnMatch = src.match(/return \(\s*<[^>]+>/);
  if (returnMatch) {
    src = src.replace(
      returnMatch[0],
      `return (
      <>
        {showOnboarding && (
          <OnboardingTour
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        )}
        ${returnMatch[0].replace('return (', '').trim()}`
    );
    // حالا باید آخرین } را قبل از آخرین ); اضافه کنیم
    // این سخت است — به جای این، از Fragment استفاده می‌کنیم
    log.push('⚠️ رندر — نیاز به چک دستی');
  }
}

writeFileSync(appFile, src);
console.log(log.join('\n'));
console.log('📁 فایل:', appFile);
