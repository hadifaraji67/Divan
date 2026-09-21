import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/App.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// چک import فعلی
const hasUseEffect = /import\s+React[^;]*\buseEffect\b/.test(src) ||
                     /import\s*\{[^}]*\buseEffect\b[^}]*\}\s*from\s*['"]react['"]/.test(src);

if (!hasUseEffect) {
  // حالت ۱: import React از 'react'
  if (src.includes("import React, { useState } from 'react';")) {
    src = src.replace(
      "import React, { useState } from 'react';",
      "import React, { useState, useEffect } from 'react';"
    );
    log.push('✅ useEffect اضافه شد');
  } else if (src.includes("import React from 'react';")) {
    src = src.replace(
      "import React from 'react';",
      "import React, { useState, useEffect } from 'react';"
    );
    log.push('✅ useEffect اضافه شد (از React تنها)');
  } else {
    // جستجو برای الگوی فعلی
    const match = src.match(/^import React[^;]*;$/m);
    if (match) {
      log.push('⚠️ الگوی import: ' + match[0]);
      // تلاش ساده: افزودن useEffect به هر import از react
      src = src.replace(
        /(import\s+React\s*,\s*\{)([^}]*)(\}\s*from\s*['"]react['"])/,
        (m, a, b, c) => {
          if (b.includes('useEffect')) return m;
          return `${a}${b}, useEffect${c}`;
        }
      );
      log.push('✅ useEffect اضافه شد (regex)');
    }
  }
} else {
  log.push('⏭ useEffect قبلاً هست');
}

writeFileSync(file, src);
console.log(log.join('\n'));
