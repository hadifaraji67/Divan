#!/bin/bash

# ۱. افزودن سرویس پشتیبان‌گیری و بازگردانی داده‌ها
mkdir -p src/services
cat << 'ES1' > src/services/backupService.ts
export const exportBackupData = (data: any) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `divan_backup_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const importBackupData = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        resolve(parsedData);
      } catch (err) {
        reject('فایل پشتیبان معتبر نیست.');
      }
    };
    reader.readAsText(file);
  });
};
ES1

# ۲. سرویس تنظیمات سفارشی چاپ (لوگو، متن footer)
cat << 'ES2' > src/services/printSettings.ts
export interface PrintSettings {
  storeName: string;
  storePhone: string;
  footerMessage: string;
  showLogo: boolean;
}

const SETTINGS_KEY = 'divan_print_settings';

export const savePrintSettings = (settings: PrintSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getPrintSettings = (): PrintSettings => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) return JSON.parse(saved);
  return {
    storeName: 'فروشگاه دیوان',
    storePhone: '',
    footerMessage: 'از خرید شما متشکریم!',
    showLogo: false
  };
};
ES2

# ۳. تنظیمات Web App Manifest برای پشتیبانی کامل PWA
cat << 'ES3' > public/manifest.json
{
  "short_name": "دیوان",
  "name": "نرم‌افزار مدیریت و صدور فاکتور دیوان",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "dir": "rtl",
  "lang": "fa"
}
ES3

# ۴. ثبت تغییرات فاز ۶ در Git و Push به GitHub
git add .
git commit -m "Feat: Complete Phase 6 - Backup/Restore Service, Advanced Print Settings & PWA Integration"
git push origin main

echo "✅ تمامی کدهای فاز ۶ اعمال شده و روی گیت‌هاب آپلود شدند."
