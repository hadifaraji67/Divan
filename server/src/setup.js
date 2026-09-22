#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  Setup اولیه دیوان — ساخت admin
 *  اجرا: node src/setup.js
 * ═══════════════════════════════════════════════════════════
 */

import bcrypt from 'bcryptjs';
import { query, testConnection } from './db/index.js';
import { config } from './config.js';

async function setup() {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   🔐 راه‌اندازی اولیه سرور دیوان          ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');

  // ─── چک اتصال دیتابیس ───
  try {
    const info = await testConnection();
    console.log(`✅ دیتابیس متصل: ${info.version.split(' ').slice(0, 2).join(' ')}`);
  } catch (err) {
    console.error('❌ اتصال به دیتابیس ناموفق:', err.message);
    process.exit(1);
  }

  // ─── چک تعداد کاربران ───
  const existing = await query('SELECT COUNT(*) as count FROM users');
  const count = Number(existing.rows[0].count);

  if (count > 0) {
    console.log(`ℹ️  ${count} کاربر از قبل وجود دارد — setup رد شد`);
    console.log('   برای افزودن کاربر جدید از پنل مدیریت استفاده کنید');
    process.exit(0);
  }

  // ─── اعتبارسنجی ───
  const { username, password, fullName } = config.admin;

  if (!username || !password) {
    console.error('❌ ADMIN_USERNAME و ADMIN_PASSWORD در .env لازم است');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ پسورد admin حداقل ۶ کاراکتر');
    process.exit(1);
  }

  if (['CHANGE-ME-STRONG-PASSWORD', 'divan1234', 'admin'].includes(password)) {
    console.error('❌ پسورد پیش‌فرض! در .env → ADMIN_PASSWORD عوض کن');
    process.exit(1);
  }

  // ─── ساخت admin ───
  console.log('');
  console.log('🔧 ساخت حساب مدیر...');

  const hash = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'admin')
     RETURNING id, username, full_name, role, created_at`,
    [username, hash, fullName || username]
  );

  const user = result.rows[0];

  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   ✅ حساب مدیر ساخته شد                    ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  console.log(`   ID:       ${user.id}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Name:     ${user.full_name}`);
  console.log(`   Role:     ${user.role}`);
  console.log('');
  console.log('🚀 حالا می‌تونی سرور رو اجرا کنی:');
  console.log('   npm start');
  console.log('');
}

setup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('');
    console.error('❌ خطا:', err.message);
    process.exit(1);
  });
