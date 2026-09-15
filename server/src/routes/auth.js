import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { createToken, requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { config } from '../config.js';

const router = express.Router();

/**
 * POST /api/auth/setup
 * ساخت اولین کاربر admin (فقط اگر هیچ کاربری نباشد)
 */
router.post(
  '/setup',
  asyncHandler(async (req, res) => {
    const existing = await query('SELECT COUNT(*) as count FROM users');

    if (Number(existing.rows[0].count) > 0) {
      return res.status(400).json({ error: 'سیستم قبلاً راه‌اندازی شده است' });
    }

    const { username, password, fullName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'نام کاربری و رمز عبور لازم است' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'رمز عبور حداقل ۴ کاراکتر' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, username, full_name, role, created_at`,
      [username, hash, fullName || username]
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.status(201).json({
      message: 'حساب مدیر با موفقیت ساخته شد',
      user,
      token,
    });
  })
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'نام کاربری و رمز عبور لازم است' });
    }

    const result = await query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'حساب کاربری غیرفعال است' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
    }

    // بروزرسانی آخرین ورود
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = createToken(user);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
      },
      token,
    });
  })
);

/**
 * GET /api/auth/me
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await query(
      'SELECT id, username, full_name, role, is_active, created_at, last_login_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    res.json({ user: result.rows[0] });
  })
);

/**
 * GET /api/auth/needs-setup
 * بررسی اینکه آیا نیاز به setup اولیه است
 */
router.get(
  '/needs-setup',
  asyncHandler(async (req, res) => {
    const existing = await query('SELECT COUNT(*) as count FROM users');
    res.json({ needsSetup: Number(existing.rows[0].count) === 0 });
  })
);

/**
 * GET /api/auth/users (admin)
 */
router.get(
  '/users',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = await query(
      'SELECT id, username, full_name, role, is_active, created_at, last_login_at FROM users ORDER BY id'
    );
    res.json({ users: result.rows });
  })
);

/**
 * POST /api/auth/users (admin)
 */
router.post(
  '/users',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { username, password, fullName, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'نام کاربری و رمز عبور لازم است' });
    }

    const validRoles = ['admin', 'accountant', 'seller', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: `نقش باید یکی از ${validRoles.join(', ')} باشد` });
    }

    const existing = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'این نام کاربری قبلاً وجود دارد' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, full_name, role, is_active, created_at`,
      [username, hash, fullName || username, role || 'seller']
    );

    res.status(201).json({ user: result.rows[0] });
  })
);

/**
 * PUT /api/auth/users/:id (admin)
 */
router.put(
  '/users/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { fullName, role, isActive, password } = req.body;
    const id = req.params.id;

    const updates = [];
    const params = [];
    let idx = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${idx++}`);
      params.push(fullName);
    }
    if (role !== undefined) {
      updates.push(`role = $${idx++}`);
      params.push(role);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${idx++}`);
      params.push(isActive);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${idx++}`);
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'چیزی برای بروزرسانی نیست' });
    }

    params.push(id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, username, full_name, role, is_active`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    res.json({ user: result.rows[0] });
  })
);

/**
 * DELETE /api/auth/users/:id (admin)
 */
router.delete(
  '/users/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'نمی‌توانید خودتان را حذف کنید' });
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    res.json({ message: 'کاربر حذف شد' });
  })
);

export default router;
