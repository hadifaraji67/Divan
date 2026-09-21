import { writeFileSync } from 'fs';

const readme = `# 🏛 دیوان — سامانه جامع حسابداری

**نرم‌افزار حسابداری و مدیریت کسب‌وکار ایرانی — کاملاً آفلاین**

[![Version](https://img.shields.io/badge/version-5.0.0--beta.66-blue.svg)](https://github.com/hadifaraji67/Divan/releases)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web-green.svg)](https://github.com/hadifaraji67/Divan)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](./LICENSE)

[📥 دانلود APK](https://github.com/hadifaraji67/Divan/releases/latest) • [🌐 نسخه وب](https://divan-one.vercel.app)

---

## 📖 درباره دیوان

دیوان یک نرم‌افزار حسابداری و مدیریت کسب‌وکار **کاملاً آفلاین** است که برای کاربران ایرانی طراحی شده. تمام داده‌ها روی دستگاه شما ذخیره می‌شود و هیچ اطلاعاتی به سرور خارجی ارسال نمی‌گردد.

## ✨ قابلیت‌ها

| بخش | قابلیت |
|-----|--------|
| 💰 مالی | فاکتور، دفتر روزنامه، پرداخت، چک، اقساط، صندوق |
| 👥 اشخاص | مشتریان، تأمین‌کنندگان، کالاها، بارکد، هشدار موجودی |
| 📊 گزارش | ۱۲ تب گزارش، نمودار فروش، Excel Export |
| 🔍 جستجو | Command Palette سراسری (Ctrl+K) |
| 📱 موبایل | یادآوری چک، QR فاکتور، Undo حذف |
| 🔒 امنیت | قفل محلی، کد بازیابی QR، بکاپ AES-256 |
| 🎭 نقش‌ها | مدیر، حسابدار، فروشنده، بازدیدکننده (RBAC) |

## 📸 اسکرین‌شات‌ها

| داشبورد | فاکتورها |
|:---:|:---:|
| ![داشبورد](screenshots/01-dashboard.png) | ![فاکتورها](screenshots/03-invoices.png) |

| کالاها | جستجوی سراسری |
|:---:|:---:|
| ![کالاها](screenshots/05-products.png) | ![جستجو](screenshots/06-command-palette.png) |

| گزارشات | حالت تاریک |
|:---:|:---:|
| ![گزارشات](screenshots/07-reports.png) | ![دارک](screenshots/08-dark-mode.png) |

## 🚀 نصب

### 📱 اندروید
از [صفحه Releases](https://github.com/hadifaraji67/Divan/releases/latest) فایل \`divan-v5.0.0-beta.66.apk\` را دانلود کنید.

### 🌐 وب (PWA)
👉 [divan-one.vercel.app](https://divan-one.vercel.app)

### 💻 اجرای محلی
\`\`\`bash
git clone https://github.com/hadifaraji67/Divan.git
cd Divan
npm install --legacy-peer-deps
npm run dev
# → http://localhost:8080
\`\`\`

## 🛠 تکنولوژی‌ها

**Frontend:** React 19 • TypeScript 5.7 • Vite 8 • TanStack Router 1.170 • TailwindCSS 4 • Capacitor 8

**Backend:** Node.js • Express • PostgreSQL • JWT • bcrypt

**Native:** Camera • Filesystem • Share • LocalNotifications • MLKit Barcode • LiveUpdate

## 📊 آمار پروژه

| متریک | مقدار |
|-------|-------|
| نسخه | 5.0.0-beta.66 |
| فایل‌های کد | ۹۷ |
| پکیج‌ها | ۳۵۴ |
| Bundle Size | ~۷۲۰ KB |
| APK Size | ~۳۰ MB |

## 📄 مجوز

© ۱۴۰۵ — همه حقوق محفوظ است.

---

ساخته شده با ❤️ در ایران
`;

writeFileSync('README.md', readme, 'utf8');
console.log('✅ README.md ساخته شد (' + readme.length + ' کاراکتر)');
