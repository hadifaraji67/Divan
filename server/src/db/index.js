import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

export const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[db] خطای غیرمنتظره:', err);
});

/**
 * اجرای یک query
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`[db] query کند: ${duration}ms — ${text.slice(0, 80)}`);
    }
    return result;
  } catch (err) {
    console.error('[db] خطا در query:', err.message);
    console.error('  SQL:', text.slice(0, 200));
    throw err;
  }
}

/**
 * تست اتصال
 */
export async function testConnection() {
  const result = await query('SELECT NOW() as now, version() as version');
  return result.rows[0];
}

/**
 * تراکنش
 */
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
