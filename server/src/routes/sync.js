import express from 'express';
import { query, transaction } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = express.Router();

// همه routeها نیاز به احراز هویت دارند
router.use(requireAuth);

const ALLOWED_COLLECTIONS = [
  'contacts', 'products', 'invoices', 'payments', 'cheques',
  'installments', 'cashbox', 'journal_entries', 'settings_v1',
];

/**
 * GET /api/sync/status
 */
router.get(
  '/status',
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT collection, COUNT(*) as count, MAX(updated_at) as last_update
       FROM sync_data
       WHERE deleted = false
       GROUP BY collection
       ORDER BY collection`
    );

    res.json({
      status: 'ok',
      collections: result.rows,
      serverTime: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/sync/pull
 * دریافت همه داده‌ها از سرور
 * ?since=timestamp (اختیاری)
 */
router.get(
  '/pull',
  asyncHandler(async (req, res) => {
    const { since, collection } = req.query;

    const params = [];
    const conditions = ['deleted = false'];
    let idx = 1;

    if (since) {
      conditions.push(`updated_at > $${idx++}`);
      params.push(new Date(since));
    }

    if (collection) {
      if (!ALLOWED_COLLECTIONS.includes(collection)) {
        return res.status(400).json({ error: 'مجموعه نامعتبر' });
      }
      conditions.push(`collection = $${idx++}`);
      params.push(collection);
    }

    const result = await query(
      `SELECT collection, record_id, data, updated_at
       FROM sync_data
       WHERE ${conditions.join(' AND ')}
       ORDER BY updated_at`,
      params
    );

    // گروه‌بندی بر اساس collection
    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.collection]) grouped[row.collection] = [];
      grouped[row.collection].push({
        id: row.record_id,
        ...row.data,
        _updatedAt: row.updated_at,
      });
    }

    res.json({
      serverTime: new Date().toISOString(),
      since: since || null,
      data: grouped,
    });
  })
);

/**
 * POST /api/sync/push
 * ارسال تغییرات محلی به سرور
 * body: { changes: [{ collection, recordId, data, updatedAt, deleted }] }
 */
router.post(
  '/push',
  asyncHandler(async (req, res) => {
    const { changes } = req.body;

    if (!Array.isArray(changes)) {
      return res.status(400).json({ error: 'changes باید آرایه باشد' });
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    await transaction(async (client) => {
      for (const change of changes) {
        try {
          const { collection, recordId, data, updatedAt, deleted } = change;

          if (!ALLOWED_COLLECTIONS.includes(collection)) {
            results.errors.push({ recordId, error: 'مجموعه نامعتبر' });
            continue;
          }

          const changeTime = updatedAt ? new Date(updatedAt) : new Date();

          // بررسی نسخه فعلی
          const existing = await client.query(
            'SELECT updated_at FROM sync_data WHERE collection = $1 AND record_id = $2',
            [collection, recordId]
          );

          if (existing.rows.length > 0) {
            const serverTime = new Date(existing.rows[0].updated_at);

            // Last-Write-Wins
            if (serverTime >= changeTime) {
              results.skipped++;
              continue;
            }

            await client.query(
              `UPDATE sync_data
               SET data = $1, updated_at = $2, deleted = $3
               WHERE collection = $4 AND record_id = $5`,
              [data || {}, changeTime, deleted || false, collection, recordId]
            );
            results.updated++;
          } else {
            await client.query(
              `INSERT INTO sync_data (collection, record_id, data, updated_at, deleted)
               VALUES ($1, $2, $3, $4, $5)`,
              [collection, recordId, data || {}, changeTime, deleted || false]
            );
            results.created++;
          }
        } catch (err) {
          results.errors.push({ recordId: change.recordId, error: err.message });
        }
      }
    });

    res.json({
      serverTime: new Date().toISOString(),
      results,
    });
  })
);

/**
 * POST /api/sync/push-all
 * ارسال همه داده‌ها به یکباره (برای اولین sync)
 * body: { data: { collection: [...] } }
 */
router.post(
  '/push-all',
  asyncHandler(async (req, res) => {
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'data لازم است' });
    }

    const results = { total: 0, success: 0, errors: 0 };

    await transaction(async (client) => {
      for (const [collection, records] of Object.entries(data)) {
        if (!ALLOWED_COLLECTIONS.includes(collection)) continue;
        if (!Array.isArray(records)) continue;

        for (const record of records) {
          if (!record.id) continue;
          results.total++;

          try {
            await client.query(
              `INSERT INTO sync_data (collection, record_id, data, updated_at)
               VALUES ($1, $2, $3, NOW())
               ON CONFLICT (collection, record_id) DO UPDATE
               SET data = $3, updated_at = NOW()`,
              [collection, record.id, record]
            );
            results.success++;
          } catch (err) {
            results.errors++;
          }
        }
      }
    });

    res.json({ results });
  })
);

/**
 * DELETE /api/sync/clear
 * پاک کردن همه داده‌های sync (خطرناک!)
 */
router.delete(
  '/clear',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'فقط مدیر می‌تواند پاک کند' });
    }

    await query('DELETE FROM sync_data');

    res.json({ message: 'همه داده‌های sync پاک شدند' });
  })
);

export default router;
