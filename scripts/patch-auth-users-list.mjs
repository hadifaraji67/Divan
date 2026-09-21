import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'server/src/routes/auth.js';

if (!existsSync(file)) {
  console.log('❌ auth.js پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');

if (src.includes("'/users'")) {
  console.log('⏭ endpoint /users قبلاً هست');
  process.exit(0);
}

// پیدا کردن انتهای فایل
const endRegex = /\n\s*export default router;\s*$/m;
if (!endRegex.test(src)) {
  console.log('⚠️ export default router پیدا نشد');
  process.exit(0);
}

const newEndpoints = `

/**
 * GET /api/auth/users
 * لیست کاربران (فقط admin)
 */
router.get(
  '/users',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = await query(
      \`SELECT id, username, full_name, role, is_active, created_at, last_login
       FROM users
       ORDER BY created_at DESC\`
    );
    res.json({ users: result.rows });
  })
);

/**
 * PATCH /api/auth/users/:id
 * ویرایش نقش/فعال بودن کاربر (فقط admin)
 */
router.patch(
  '/users/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role, isActive, fullName } = req.body;

    const updates = [];
    const params = [];
    let idx = 1;

    if (role !== undefined) {
      if (!['admin', 'accountant', 'seller', 'viewer'].includes(role)) {
        return res.status(400).json({ error: 'نقش نامعتبر' });
      }
      updates.push(\`role = $\${idx++}\`);
      params.push(role);
    }

    if (isActive !== undefined) {
      updates.push(\`is_active = $\${idx++}\`);
      params.push(!!isActive);
    }

    if (fullName !== undefined) {
      updates.push(\`full_name = $\${idx++}\`);
      params.push(fullName);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'چیزی برای تغییر نیست' });
    }

    params.push(id);
    const result = await query(
      \`UPDATE users SET \${updates.join(', ')} WHERE id = $\${idx} RETURNING id, username, full_name, role, is_active\`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر پیدا نشد' });
    }

    res.json({ user: result.rows[0], message: 'ذخیره شد' });
  })
);

/**
 * POST /api/auth/change-password
 * تغییر رمز عبور خود کاربر
 */
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'رمز فعلی و جدید لازم است' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'رمز جدید حداقل ۴ کاراکتر' });
    }

    const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر پیدا نشد' });
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'رمز فعلی اشتباه است' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);

    res.json({ message: 'رمز عبور تغییر کرد' });
  })
);

export default router;
`;

src = src.replace(endRegex, newEndpoints);
writeFileSync(file, src);
console.log('✅ endpoint های /users اضافه شد');
