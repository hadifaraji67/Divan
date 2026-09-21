import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

loadEnv({ path: join(ROOT, '.env') });

function loadJsonConfig() {
  const configPath = join(ROOT, 'config.json');
  const examplePath = join(ROOT, 'config.example.json');

  if (existsSync(configPath)) {
    return JSON.parse(readFileSync(configPath, 'utf8'));
  }
  if (existsSync(examplePath)) {
    console.warn('[config] config.json یافت نشد — از example استفاده می‌شود');
    return JSON.parse(readFileSync(examplePath, 'utf8'));
  }
  return {};
}

const json = loadJsonConfig();
const isProd = process.env.NODE_ENV === 'production';

function get(envKey, jsonPath, defaultValue) {
  const envVal = process.env[envKey];
  if (envVal !== undefined) return envVal;

  const jsonVal = jsonPath.split('.').reduce((o, k) => o?.[k], json);
  if (jsonVal !== undefined) return jsonVal;

  return defaultValue;
}

function getInt(envKey, jsonPath, defaultValue) {
  return Number(get(envKey, jsonPath, defaultValue));
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,

  port: getInt('PORT', 'port', 4000),
  host: get('HOST', 'host', '0.0.0.0'),

  database: {
    host: get('DB_HOST', 'database.host', '127.0.0.1'),
    port: getInt('DB_PORT', 'database.port', 5432),
    database: get('DB_NAME', 'database.database', 'divan'),
    user: get('DB_USER', 'database.user', 'divan_app'),
    password: get('DB_PASSWORD', 'database.password', ''),
  },

  jwt: {
    secret: get('JWT_SECRET', 'jwt.secret', ''),
    expiresIn: get('JWT_EXPIRES_IN', 'jwt.expiresIn', '30d'),
  },

  admin: {
    username: get('ADMIN_USERNAME', 'admin.username', 'admin'),
    password: get('ADMIN_PASSWORD', 'admin.password', ''),
    fullName: get('ADMIN_FULL_NAME', 'admin.fullName', 'مدیر سیستم'),
  },

  cors: {
    origins: get('CORS_ORIGINS', 'cors.origins', '*')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  trustProxy: getInt('TRUST_PROXY', 'trustProxy', 0),

  rateLimit: {
    windowMs: getInt('RATE_LIMIT_WINDOW_MS', 'rateLimit.windowMs', 15 * 60 * 1000),
    max: getInt('RATE_LIMIT_MAX', 'rateLimit.max', 100),
  },
};

const INSECURE_SECRETS = [
  'CHANGE-THIS-SECRET-IN-PRODUCTION',
  'CHANGE-ME-TO-A-64-CHAR-RANDOM-STRING',
  'secret',
  '',
];

const INSECURE_PASSWORDS = ['divan1234', 'CHANGE-ME-STRONG-PASSWORD', 'admin', ''];

if (!config.jwt.secret) {
  throw new Error('❌ jwt.secret تنظیم نشده — .env یا config.json را چک کن');
}

if (INSECURE_SECRETS.includes(config.jwt.secret)) {
  if (isProd) {
    throw new Error(
      '❌ JWT secret ناامن در پروداکشن!\n' +
        '   تولید: openssl rand -hex 32\n' +
        '   سپس در .env → JWT_SECRET قرار بده',
    );
  }
  console.warn('⚠️  JWT secret ناامن است — برای پروداکشن عوض کن');
}

if (config.jwt.secret.length < 32) {
  console.warn(`⚠️  JWT secret کوتاه است (${config.jwt.secret.length} کاراکتر)`);
}

if (INSECURE_PASSWORDS.includes(config.admin.password)) {
  if (isProd) {
    throw new Error('❌ پسورد admin ناامن در پروداکشن! از .env → ADMIN_PASSWORD عوض کن');
  }
  console.warn('⚠️  پسورد admin ناامن است');
}

if (isProd && (!config.database.password || config.database.password.length < 8)) {
  throw new Error('❌ پسورد دیتابیس ناامن در پروداکشن!');
}

console.log(`[config] محیط: ${config.nodeEnv}`);
console.log(`[config] پورت: ${config.port}`);
console.log(`[config] دیتابیس: ${config.database.user}@${config.database.host}:${config.database.port}/${config.database.database}`);
console.log(`[config] CORS: ${config.cors.origins.join(', ')}`);
if (config.trustProxy) console.log(`[config] Trust Proxy: ${config.trustProxy}`);
