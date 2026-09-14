// نسخه از package.json خوانده می‌شود (در زمان build توسط Vite جایگزین می‌شود)
declare const __APP_VERSION__: string;
export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
