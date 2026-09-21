import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/App.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// import
if (!src.includes('BackupDiscoveryScreen')) {
  src = src.replace(
    "import { OnboardingTour } from './components/setup/OnboardingTour';",
    "import { OnboardingTour } from './components/setup/OnboardingTour';\nimport { BackupDiscoveryScreen } from './components/setup/BackupDiscoveryScreen';"
  );
  log.push('✅ import');
}

// state — فقط اگر بکاپ در اولین بار نصب پیدا شد
if (!src.includes('showDiscovery')) {
  const stateAnchor = /const \[showOnboarding, setShowOnboarding\] = useState\(\(\) => \{[\s\S]*?\}\);/;
  const m = src.match(stateAnchor);
  if (m) {
    const insertion = `const [showDiscovery, setShowDiscovery] = useState(false);

  // ─── بررسی بکاپ در اولین بار نصب ───
  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined') return;
      // چک کنیم اولین بار است یا نه
      const hasSeenDiscovery = localStorage.getItem('divan_discovery_seen');
      const hasData = localStorage.getItem('divan_contacts') || localStorage.getItem('divan_invoices');

      if (hasSeenDiscovery || hasData) {
        localStorage.setItem('divan_discovery_seen', '1');
        return;
      }

      // اولین بار نصب — چک بکاپ
      try {
        const { listBackups } = await import('./lib/backup/filesystem');
        const backups = await listBackups();
        if (backups.length > 0) {
          setShowDiscovery(true);
        } else {
          localStorage.setItem('divan_discovery_seen', '1');
        }
      } catch {
        localStorage.setItem('divan_discovery_seen', '1');
      }
    })();
  }, []);

  const handleDiscoveryComplete = () => {
    localStorage.setItem('divan_discovery_seen', '1');
    setShowDiscovery(false);
  };

  ${m[0]}`;
    src = src.replace(m[0], insertion);
    log.push('✅ state + useEffect');
  }
}

// رندر
if (!src.includes('<BackupDiscoveryScreen')) {
  const beforeOnboarding = `{showOnboarding && (`;
  const newRender = `{showDiscovery && (
      <BackupDiscoveryScreen
        onComplete={handleDiscoveryComplete}
        onSkip={handleDiscoveryComplete}
      />
    )}
    {showOnboarding && !showDiscovery && (`;

  if (src.includes(beforeOnboarding)) {
    src = src.replace(beforeOnboarding, newRender);
    log.push('✅ رندر');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
