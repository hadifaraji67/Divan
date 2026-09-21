import express from 'express';
import cors from 'cors';
import { networkInterfaces } from 'node:os';
import { config } from './config.js';
import { testConnection } from './db/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';

const app = express();

if (config.trustProxy) {
  app.set('trust proxy', config.trustProxy);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (config.cors.origins.includes('*')) return callback(null, true);
    if (config.cors.origins.includes(origin)) return callback(null, true);
    if (!config.isProd) return callback(null, true);

    console.warn(`[CORS] رد شد: ${origin}`);
    callback(new Error('CORS: مبدأ مجاز نیست'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/health') {
      const ip = req.ip || req.socket.remoteAddress;
      console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms) [${ip}]`);
    }
  });
  next();
});

app.get('/', (req, res) => {
  res.json({
    name: 'Divan Server',
    version: '1.0.0',
    status: 'running',
    env: config.nodeEnv,
    docs: '/api/health',
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const dbInfo = await testConnection();
    res.json({
      status: 'healthy',
      time: new Date().toISOString(),
      env: config.nodeEnv,
      database: {
        connected: true,
        version: dbInfo.version.split(' ').slice(0, 2).join(' '),
      },
      uptime: Math.round(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
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

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.port, config.host, () => {
  const nets = networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }

  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   🚀 سرور دیوان فعال شد                   ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`🌐 Local:    http://127.0.0.1:${config.port}`);
  ips.forEach((ip) => console.log(`🌐 Network:  http://${ip}:${config.port}`));
  console.log(`📊 Health:   http://127.0.0.1:${config.port}/api/health`);
  console.log(`⚙️  Env:      ${config.nodeEnv}`);
  console.log(`🔒 Proxy:    ${config.trustProxy ? 'فعال' : 'غیرفعال'}`);
  console.log('');
});

function shutdown(signal) {
  console.log(`\n[${signal}] خاموش شدن...`);
  server.close(() => {
    console.log('✅ سرور متوقف شد');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('⚠️  اجبار به خروج');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});
