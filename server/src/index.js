import express from 'express';
import cors from 'cors';
import { networkInterfaces } from 'node:os';
import { config } from './config.js';
import { testConnection } from './db/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';

const app = express();

// ═══ Middleware ═══
app.use(cors()); // اجازه از همه مبدأها (APK + PWA)
app.use(express.json({ limit: '50mb' })); // برای sync حجم زیاد
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// لاگ ساده
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/health') {
      console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ═══ Routes ═══
app.get('/', (req, res) => {
  res.json({
    name: 'Divan Server',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const dbInfo = await testConnection();
    res.json({
      status: 'healthy',
      time: new Date().toISOString(),
      database: {
        connected: true,
        version: dbInfo.version.split(' ').slice(0, 2).join(' '),
      },
      uptime: Math.round(process.uptime()),
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);

// ═══ Error Handlers ═══
app.use(notFoundHandler);
app.use(errorHandler);

// ═══ Start ═══
const PORT = config.port || 4000;
const HOST = config.host || '0.0.0.0';

async function start() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║         🚀 دیوان سرور v1.0.0              ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  try {
    console.log('📡 اتصال به PostgreSQL...');
    const dbInfo = await testConnection();
    console.log(`✅ دیتابیس متصل شد: ${dbInfo.version.split(' ').slice(0, 2).join(' ')}`);

    // بررسی نیاز به setup
    const { query } = await import('./db/index.js');
    const users = await query('SELECT COUNT(*) as count FROM users');
    const needsSetup = Number(users.rows[0].count) === 0;

    if (needsSetup) {
      console.log('\n⚠️  هیچ کاربری وجود ندارد — نیاز به راه‌اندازی اولیه');
      console.log('   → POST /api/auth/setup با username و password\n');
    }

    app.listen(PORT, HOST, () => {
      console.log(`\n✅ سرور روی http://${HOST}:${PORT} اجرا شد`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Auth:   http://localhost:${PORT}/api/auth`);
      console.log(`   Sync:   http://localhost:${PORT}/api/sync\n`);

      // نمایش IPهای شبکه
      const nets = networkInterfaces();
      const ips = [];
      for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
          if (net.family === 'IPv4' && !net.internal) {
            ips.push(net.address);
          }
        }
      }
      if (ips.length > 0) {
        console.log('📡 آدرس‌های شبکه:');
        ips.forEach(ip => console.log(`   http://${ip}:${PORT}`));
        console.log('');
      }
    });
  } catch (err) {
    console.error('\n❌ خطا در شروع سرور:', err.message);
    console.error('\nراه‌حل‌ها:');
    console.error('  ۱. مطمئن شو PostgreSQL اجراست: pg_ctl -D $PREFIX/var/lib/postgresql status');
    console.error('  ۲. Migration اجرا کن: npm run migrate');
    console.error('  ۳. config.json را بررسی کن\n');
    process.exit(1);
  }
}

// مدیریت خطاهای غیرمنتظره
process.on('unhandledRejection', (err) => {
  console.error('[unhandled]', err);
});

process.on('SIGINT', () => {
  console.log('\n👋 سرور متوقف شد');
  process.exit(0);
});

start();
