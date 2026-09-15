# 🚀 سرور دیوان

> سرور همگام‌سازی نرم‌افزار حسابداری دیوان

## 🎯 چیست؟

سرور دیوان یک وب‌سرویس Node.js است که:
- داده‌ها را در PostgreSQL ذخیره می‌کند
- چند کاربر با نقش‌های مختلف پشتیبانی می‌کند
- همگام‌سازی بین چند دستگاه را ممکن می‌سازد
- امکان استفاده از راه دور (LAN یا اینترنت) را می‌دهد

بدون سرور هم دیوان کار می‌کند (حالت مستقل). سرور برای چند دستگاه یا چند کاربر لازم است.

---

## 📦 پیش‌نیازها

- Node.js 18 یا بالاتر
- PostgreSQL 14 یا بالاتر
- npm (همراه Node)

---

## ⚡ نصب سریع

cd ~/Divan/server
npm install
cp config.example.json config.json
nano config.json
npm run migrate
npm start

---

## 📱 نصب روی Termux

pkg install -y nodejs postgresql
mkdir -p $PREFIX/var/lib/postgresql
initdb $PREFIX/var/lib/postgresql
pg_ctl -D $PREFIX/var/lib/postgresql start
psql -d postgres -c "CREATE USER divan_app WITH PASSWORD 'divan1234';"
psql -d postgres -c "CREATE DATABASE divan OWNER divan_app;"
psql -d divan -c "GRANT ALL ON SCHEMA public TO divan_app;"
cd ~/Divan/server
npm install
cp config.example.json config.json
npm run migrate
npm start

---

## ⚙️ پیکربندی

فایل config.json را ویرایش کن:

- port: 4000
- host: 0.0.0.0 (یعنی از همه دستگاه‌های شبکه)
- database.host: 127.0.0.1
- database.user: divan_app
- database.password: رمز دیتابیس
- jwt.secret: یک کلید تصادفی طولانی (openssl rand -base64 48)

---

## ▶️ شروع سرویس

حالت ساده: npm start
حالت auto-reload: npm run dev

---

## 📱 اتصال از اپ

۱. بعد از npm start، آدرس‌های شبکه نمایش داده می‌شوند.

۲. در اپ دیوان:
   - اپ را باز کن → «اتصال به سرور»
   - آدرس وارد کن: http://192.168.1.100:4000
   - تست اتصال → ورود

---

## 💾 پشتیبان‌گیری

پشتیبان: pg_dump -U divan_app -h 127.0.0.1 divan > backup.sql
بازیابی: psql -U divan_app -h 127.0.0.1 divan < backup.sql

---

## 🐛 رفع مشکلات

### سرور اجرا نمی‌شود — ECONNREFUSED
PostgreSQL اجرا نیست: pg_ctl -D $PREFIX/var/lib/postgresql start

### خطای رمز دیتابیس
رمز config.json با رمز PostgreSQL نمی‌خواند.
psql -d postgres -c "ALTER USER divan_app WITH PASSWORD 'newpass';"

### اپ به سرور وصل نمی‌شود
- آدرس درست است؟ http://IP:4000
- سرور اجرا است؟ curl http://IP:4000/api/health
- در همان شبکه هستی؟

---

## 🔒 امنیت

برای پروداکشن:
۱. JWT secret قوی: openssl rand -base64 48
۲. رمز دیتابیس قوی
۳. HTTPS (برای اینترنت) با Nginx
۴. فایروال — فقط LAN

---

## 📊 مدیریت

پاک کردن همه داده‌ها:
psql -U divan_app -d divan -c "DELETE FROM sync_data;"

بروزرسانی:
cd ~/Divan/server
git pull
npm install
npm run migrate
# ریستارت سرور

---

## ❓ سوالات متداول

س: حتماً PostgreSQL لازم است؟ ج: بله.
س: روی Raspberry Pi کار می‌کند؟ ج: بله.
س: حتماً به اینترنت نیاز است؟ ج: نه، در شبکه محلی هم کار می‌کند.
س: چند دستگاه می‌توانند وصل شوند؟ ج: بی‌نهایت.
س: چقدر RAM لازم است؟ ج: حداقل 512MB. پیشنهاد: 1GB.

---

نسخه: 1.0.0
