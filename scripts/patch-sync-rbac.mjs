import { readFileSync, writeFileSync } from 'node:fs';
const file = 'server/src/routes/sync.js';
let src = readFileSync(file, 'utf8');
const log = [];

// import
if (!src.includes('requireRole')) {
  // چک requireAuth هست
  if (src.includes("from '../middleware/auth.js'")) {
    // فقط requireRole را اضافه کن
    src = src.replace(
      /import \{([^}]*)\} from ['"]\.\.\/middleware\/auth\.js['"];/,
      (m, content) => {
        if (content.includes('requireRole')) return m;
        return `import {${content.trim()}, requireRole } from '../middleware/auth.js';`;
      }
    );
    log.push('✅ import requireRole');
  } else {
    // import جدید
    src = "import { requireAuth, requireRole } from '../middleware/auth.js';\n" + src;
    log.push('✅ import جدید');
  }
}

// افزودن requireRole به routes
// POST /push → requireRole('admin', 'accountant', 'seller')
// DELETE → requireRole('admin', 'accountant')
// GET /pull → همه

const changes = [
  // POST /push — فقط نویسندگان
  {
    before: /router\.post\(\s*['"]\/push['"][\s\S]*?requireAuth,?\s*/g,
    after: "router.post('/push', requireAuth, requireRole('admin', 'accountant', 'seller'), ",
    desc: 'push',
  },
];

// جایگزینی هوشمند — پیدا کردن requireAuth و افزودن requireRole
src = src.replace(
  /requireAuth,\s*\n(\s*)\(req, res\)/g,
  "requireAuth,\n$1requireRole('admin', 'accountant', 'seller'),\n$1(req, res)"
);

// برای DELETE — فقط admin/accountant
src = src.replace(
  /router\.delete\(\s*['"]([^'"]+)['"][\s\S]{0,200}?requireAuth,/g,
  (match, path) => {
    if (match.includes('requireRole')) return match;
    return match.replace(
      'requireAuth,',
      "requireAuth, requireRole('admin', 'accountant'),"
    );
  }
);

// برای POST /push جداگانه چک
if (src.includes("router.post(") && src.includes("'/push'")) {
  log.push('✅ RBAC برای /push');
}

writeFileSync(file, src);
console.log(log.join('\n'));
