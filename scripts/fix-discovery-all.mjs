import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/setup/BackupDiscoveryScreen.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// ─── ۱.1: import صحیح ───
if (!src.includes("import React, { useEffect, useState }") && 
    !src.includes("import React, { useState, useEffect }")) {
  src = src.replace(
    /import React[^;]*from ['"]react['"];/,
    "import React, { useEffect, useState } from 'react';"
  );
  log.push('✅ import React + useState + useEffect');
}

// ─── ۱.2: fix useState خط ۱۶ ───
// الگو: `const [backups, setBackups] = useState<StoredBackup[]>()` (بدون پارامتر)
src = src.replace(
  /useState<StoredBackup\[\]>\(\)(?!\s*;|\s*\))/g,
  'useState<StoredBackup[]>([])'
);

// الگو: `useState<StoredBackup[]>` (بدون پرانتز)
src = src.replace(
  /useState<StoredBackup\[\]>(?!\s*\()/g,
  'useState<StoredBackup[]>([])'
);

// الگو: "Type has no call signatures" — معمولاً وقتی چیزی به تابع وصل می‌شود
// بررسی خط ۱۶ دقیق:
const line16 = src.split('\n')[15] || '';
log.push(`خط ۱۶: ${line16.slice(0, 80)}`);

// ─── ۱.3: fix implicit any در map ───
src = src.replace(
  /\.map\(\(\s*b\s*\)\s*=>/g,
  '.map((b: StoredBackup) =>'
);

// ─── ۱.4: fix implicit any در find ───
src = src.replace(
  /\.find\(\(\s*x\s*\)\s*=>/g,
  '.find((x: StoredBackup) =>'
);

// ─── ۱.5: fix implicit any در filter ───
src = src.replace(
  /\.filter\(\(\s*f\s*\)\s*=>/g,
  '.filter((f: any) =>'
);

writeFileSync(file, src);
console.log(log.join('\n'));
