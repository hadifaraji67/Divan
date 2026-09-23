# 🇮🇷 راهنمای نصب دیوان روی VPS ایران

راهنمای کامل نصب سرور دیوان روی سرور مجازی ایرانی.

## 📋 پیش‌نیازها

| مورد | حداقل | توصیه |
|------|-------|-------|
| OS | Ubuntu 22.04 | Ubuntu 22.04 LTS |
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Disk | 20 GB SSD | 40 GB SSD |
| Bandwidth | 1 TB | نامحدود |

**هزینه تقریبی:** ۵۰-۱۵۰ هزار تومان/ماه

## 🏢 سرویس‌دهنده‌های پیشنهادی

- **آروان‌کلود** (arvancloud.ir) — ~۸۰ت/ماه ⭐
- **پارس‌پک** (parspack.com) — ~۵۰ت/ماه
- **ایران‌سرور** (iranserver.com) — ~۶۰ت/ماه
- **ابر آسیاتک** (asiatech.cloud) — ~۱۰۰ت/ماه

## 🚀 نصب سریع (۱۰ دقیقه)

### گام ۱: خرید VPS

از پنل سرویس‌دهنده:
- **OS:** Ubuntu 22.04 LTS
- **نسخه:** 1 CPU / 1 GB RAM

بعد از خرید:
- **IP سرور** (مثلاً 185.123.45.67)
- **رمز root**

### گام ۲: اتصال SSH

از ویندوز (PowerShell):
```powershell
ssh root@185.123.45.67
```

از لینوکس/Mac:
```bash
ssh root@185.123.45.67
```

### گام ۳: نصب یک‌خطی

```bash
curl -fsSL https://raw.githubusercontent.com/hadifaraji67/Divan/main/server/bootstrap.sh | sudo bash
```

### گام ۴: پاسخ به سؤالات

اسکریپت می‌پرسه:

```
پوشه نصب (پیش‌فرض: /opt/divan): [Enter]
بهینه‌سازی VPS برای ایران؟ [Y/Enter]
حالت اجرا [1/2/3]: 3   (Production)
پورت: [Enter=4000]
نام کاربری DB: [Enter=divan_app]
رمز DB: [Enter=خودکار]
نام DB: [Enter=divan]
نام کاربری ادمین: [Enter=admin]
رمز ادمین: (حداقل ۶ کاراکتر)
رمز postgres: (رمز PostgreSQL)
سرویس systemd نصب شود؟ [y]
```

### گام ۵: تمام!

آدرس نمایش داده می‌شود:
```
http://185.123.45.67:4000
```

---

## 🌐 تنظیم دامنه + HTTPS

### گام ۱: خرید دامنه

- **ایرنیک** (nic.ir) — دامنه .ir ~۵۰ت/سال
- **آروان** — دامنه + DNS رایگان
- **Cloudflare** — دامنه بین‌المللی + CDN رایگان

### گام ۲: تنظیم DNS

در پنل DNS، این رکورد را اضافه کن:

```
Type:   A
Name:   divan
Value:  185.123.45.67
TTL:    300
```

بعد از ۵-۱۰ دقیقه تست:
```bash
nslookup divan.yourdomain.ir
```

### گام ۳: فعال‌سازی HTTPS

```bash
ssh root@185.123.45.67
cd /opt/divan/divan-server-*
sudo bash deploy/setup-https.sh
```

اسکریپت خودکار:
- نصب Nginx
- گواهی Let’s Encrypt
- Reverse Proxy
- Security Headers
- Auto-renew هر ۹۰ روز

### گام ۴: تست

در مرورگر باز کن:
```
https://divan.yourdomain.ir/api/health
```

---

## 📱 اتصال از موبایل

در اپ دیوان:

```
تنظیمات → سرور
URL:      https://divan.yourdomain.ir
Username: admin
Password: (رمز ادمین)
```

بعد از اتصال، داده‌ها خودکار sync می‌شوند.

---

## ⚙️ مدیریت سرویس

```bash
sudo systemctl status divan-server    # وضعیت
sudo systemctl start divan-server     # شروع
sudo systemctl stop divan-server      # توقف
sudo systemctl restart divan-server   # ری‌استارت
sudo journalctl -u divan-server -f    # لاگ زنده
```

غیرفعال کردن auto-start:
```bash
sudo systemctl disable divan-server
```

---

## 💾 Backup خودکار

### ساخت اسکریپت backup

```bash
sudo mkdir -p /var/backups/divan
sudo chown postgres:postgres /var/backups/divan
```

فایل زیر را بساز: /usr/local/bin/divan-backup.sh

```bash
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M)
FILE="/var/backups/divan/divan-$DATE.sql"
sudo -u postgres pg_dump divan > "$FILE"
gzip "$FILE"
find /var/backups/divan -name "*.gz" -mtime +30 -delete
```

```bash
sudo chmod +x /usr/local/bin/divan-backup.sh

# Cron روزانه ساعت ۳ صبح
sudo crontab -l 2>/dev/null | { cat; echo "0 3 * * * /usr/local/bin/divan-backup.sh >> /var/log/divan-backup.log 2>&1"; } | sudo crontab -
```

### تست backup

```bash
sudo /usr/local/bin/divan-backup.sh
ls -la /var/backups/divan/
```

### بازیابی

```bash
gunzip /var/backups/divan/divan-20260922-0300.sql.gz
sudo -u postgres psql divan < /var/backups/divan/divan-20260922-0300.sql
sudo systemctl restart divan-server
```

---

## 🔒 امنیت

### چک‌لیست

- [ ] HTTPS فعال (الزامی برای IP عمومی)
- [ ] پسورد ادمین قوی (۱۲+ کاراکتر)
- [ ] پسورد postgres قوی
- [ ] Firewall فعال (UFW)
- [ ] فقط پورت‌های 22, 80, 443 باز
- [ ] پورت 4000 عمومی نباشه (فقط localhost)
- [ ] پورت 5432 عمومی نباشه
- [ ] Backup روزانه

### چک پورت‌های باز

```bash
sudo ufw status
sudo netstat -tlnp | grep -E ":(22|80|443|4000|5432)"
```

باید ببینی:
```
tcp  0.0.0.0:22     (SSH)
tcp  0.0.0.0:80     (HTTP)
tcp  0.0.0.0:443    (HTTPS)
tcp  127.0.0.1:4000 (Divan - داخلی)
tcp  127.0.0.1:5432 (PostgreSQL - داخلی)
```

### نصب Fail2ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

---

## 🐛 عیب‌یابی

### سرور بالا نمی‌آید

```bash
sudo journalctl -u divan-server -n 50
sudo netstat -tlnp | grep 4000
sudo systemctl status postgresql
cd /opt/divan/divan-server-*/ && node src/index.js
```

### اپ وصل نمی‌شود

```bash
# از خود سرور
curl http://127.0.0.1:4000/api/health

# از بیرون
curl http://185.123.45.67:4000/api/health
```

اگر اولی کار می‌کند ولی دومی نه:
```bash
sudo ufw allow 4000/tcp
```

### خطای SSL

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## 📊 مانیتورینگ

### بررسی منابع

```bash
htop                                    # CPU و RAM
df -h                                   # دیسک
sudo journalctl -xe                     # لاگ‌های سیستم
```

### اندازه دیتابیس

```bash
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('divan'));"
```

### نصب Netdata (رایگان)

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

بعد از نصب: http://IP:19999

---

## 🔄 آپدیت سرور

```bash
cd /opt/divan

# بکاپ
sudo cp -r divan-server-* divan-server-backup

# دانلود آخرین نسخه
LATEST=$(curl -s https://api.github.com/repos/hadifaraji67/Divan/releases/latest | grep browser_download_url | grep tar.gz | cut -d'"' -f4)
curl -L -o new.tar.gz "$LATEST"

# استخراج
tar -xzf new.tar.gz
cd divan-server-*/

# نصب dependencies
npm ci --omit=dev
node src/db/migrate.js

# ری‌استارت
sudo systemctl restart divan-server
```

---

## ❓ سوالات متداول

### هزینه کل چقدره؟

| مورد | هزینه |
|------|-------|
| VPS آروان (1CPU/1GB) | ~۸۰ت/ماه |
| دامنه .ir | ~۵ت/ماه (سالانه ۵۰ت) |
| SSL (Let’s Encrypt) | رایگان |
| CDN (Cloudflare) | رایگان |
| **جمع** | **~۸۵ت/ماه** |

### چند کاربر می‌توانند وصل شوند؟

با 1 CPU / 1 GB RAM:
- ۵-۱۰ کاربر همزمان
- ۵۰-۱۰۰ کاربر کل

برای بیشتر: 2 CPU / 2 GB RAM

### چطور کاربر جدید اضافه کنم؟

از پنل ادمین در اپ:
```
تنظیمات → کاربران → کاربر جدید
```

### از Docker استفاده کنم؟

```bash
cd /opt/divan/divan-server-*/
sudo docker compose up -d
```

---

## 📞 پشتیبانی

- **GitHub Issues:** https://github.com/hadifaraji67/Divan/issues
- **مستندات:** [README.md](./README.md) — [WINDOWS.md](./WINDOWS.md)

---

© ۱۴۰۵ — دیوان
