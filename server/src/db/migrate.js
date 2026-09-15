import { query } from './index.js';

const MIGRATIONS = [
  {
    name: '001_create_users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `,
  },
  {
    name: '002_create_sync_data',
    sql: `
      CREATE TABLE IF NOT EXISTS sync_data (
        id SERIAL PRIMARY KEY,
        collection VARCHAR(50) NOT NULL,
        record_id VARCHAR(100) NOT NULL,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        deleted BOOLEAN DEFAULT false,
        UNIQUE(collection, record_id)
      );
      CREATE INDEX IF NOT EXISTS idx_sync_collection ON sync_data(collection);
      CREATE INDEX IF NOT EXISTS idx_sync_updated ON sync_data(updated_at);
      CREATE INDEX IF NOT EXISTS idx_sync_record ON sync_data(collection, record_id);
    `,
  },
  {
    name: '003_create_migrations',
    sql: `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },
];

async function runMigrations() {
  console.log('🔧 شروع migration...\n');

  // ساخت جدول migrations اگر نبود
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const migration of MIGRATIONS) {
    const existing = await query('SELECT name FROM _migrations WHERE name = $1', [migration.name]);

    if (existing.rows.length > 0) {
      console.log(`ℹ️  ${migration.name} — قبلاً اعمال شده`);
      continue;
    }

    try {
      console.log(`⚙️  ${migration.name}...`);
      await query(migration.sql);
      await query('INSERT INTO _migrations (name) VALUES ($1)', [migration.name]);
      console.log(`✅ ${migration.name}`);
    } catch (err) {
      console.error(`❌ ${migration.name} خطا:`, err.message);
      throw err;
    }
  }

  console.log('\n🎉 Migration کامل شد');
}

// اجرا
runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
