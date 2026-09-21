import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/hubs/SettingsHub.tsx';

if (!existsSync(file)) {
  console.log('❌ SettingsHub پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// ─── پیدا کردن خط import تکراری Shield ───
const shieldImportRegex = /import \{ Shield \} from ['"]lucide-react['"];\s*\n/g;

if (shieldImportRegex.test(src)) {
  src = src.replace(shieldImportRegex, '');
  log.push('✅ خط import تکراری Shield حذف شد');
} else {
  log.push('⏭ خط جداگانه Shield نبود');
}

// ─── چک: آیا Shield در import اصلی هست؟ ───
const mainImportMatch = src.match(/import \{([^}]*)\} from ['"]lucide-react['"];/);
if (mainImportMatch) {
  const content = mainImportMatch[1];
  // شمارش Shield در import اصلی
  const shieldCount = (content.match(/\bShield\b/g) || []).length;

  if (shieldCount > 1) {
    // حذف تکراری‌ها — یکی نگه‌دار
    const parts = content.split(',').map((s) => s.trim());
    const seen = new Set();
    const unique = [];

    for (const p of parts) {
      if (!seen.has(p)) {
        seen.add(p);
        unique.push(p);
      }
    }

    src = src.replace(
      mainImportMatch[0],
      `import { ${unique.join(', ')} } from 'lucide-react';`
    );
    log.push(`✅ Shield تکراری در import اصلی حذف شد (${unique.length} آیکون)`);
  } else if (shieldCount === 0) {
    // Shield نیست — اضافه کن
    const parts = content.split(',').map((s) => s.trim());
    parts.push('Shield');
    src = src.replace(
      mainImportMatch[0],
      `import { ${parts.join(', ')} } from 'lucide-react';`
    );
    log.push('✅ Shield به import اصلی اضافه شد');
  } else {
    log.push('⏭ Shield یک بار در import اصلی است');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
