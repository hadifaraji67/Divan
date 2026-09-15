import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadConfig() {
  const configPath = join(ROOT, 'config.json');
  const examplePath = join(ROOT, 'config.example.json');

  if (!existsSync(configPath)) {
    if (existsSync(examplePath)) {
      console.warn('[config] config.json یافت نشد — از example استفاده می‌شود');
      return JSON.parse(readFileSync(examplePath, 'utf8'));
    }
    throw new Error('config.json پیدا نشد — ابتدا config.example.json را کپی کن');
  }

  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export const config = loadConfig();

// اعتبارسنجی
if (!config.database?.host) throw new Error('database.host در config.json لازم است');
if (!config.jwt?.secret) throw new Error('jwt.secret در config.json لازم است');
if (config.jwt.secret === 'CHANGE-THIS-SECRET-IN-PRODUCTION') {
  console.warn('⚠️  هشدار: jwt.secret پیش‌فرض است — در پروداکشن عوض کن!');
}
