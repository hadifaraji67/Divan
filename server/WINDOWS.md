# نصب سرور دیوان روی Windows

## پیش‌نیازها

- Windows 10 / 11 / Server 2019+
- RAM: 2 GB (4 GB توصیه)
- Disk: 500 MB
- دسترسی Administrator
- PowerShell 5.1+

پورت‌ها: `4000` (سرور) + `5432` (PostgreSQL local)

## نصب سریع

### ۱. دانلود

از [Releases](https://github.com/hadifaraji67/Divan/releases/latest):
```
divan-server-vX.X.X.tar.gz
```

### ۲. استخراج

```powershell
tar -xzf divan-server-v5.0.0-beta.72.tar.gz
cd divan-server-v5.0.0-beta.72
```

### ۳. اجرا

PowerShell را **Run as Administrator** باز کن:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\install.ps1
```

### ۴. پاسخ به سؤالات

```
حالت: 2 (شبکه)
پورت: 4000
دیتابیس: divan_app / divan
رمز postgres: (هنگام نصب PostgreSQL گذاشتی)
رمز ادمین: (حداقل 6 کاراکتر)
```

### ۵. اتصال از موبایل

```
تنظیمات → سرور
URL:      http://IP:4000
Username: admin
Password: (رمز ادمین)
```

## مدیریت سرویس

```powershell
Get-Service DivanServer        # وضعیت
Start-Service DivanServer      # شروع
Stop-Service DivanServer       # توقف
Restart-Service DivanServer    # ری‌استارت
```

یا: `Win + R` → `services.msc`

## لاگ‌ها

```powershell
Get-Content logs\stdout.log -Tail 50 -Wait
Get-Content logs\stderr.log -Tail 50 -Wait
```

## عیب‌یابی

### سرور بالا نمی‌آید

```powershell
netstat -ano | findstr :4000
Get-Service DivanServer
node src/index.js   # اجرای مستقیم
```

### دیتابیس وصل نمی‌شود

```powershell
$env:PGPASSWORD = "رمز"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U divan_app -h 127.0.0.1 -d divan -c "SELECT 1;"
```

### Firewall

```powershell
Get-NetFirewallRule -DisplayName "Divan Server*"
New-NetFirewallRule -DisplayName "Divan Server" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow
```

### موبایل وصل نمی‌شود

از مرورگر موبایل تست کن:
```
http://192.168.1.100:4000/api/health
```

چک کن:
- IP درست است (نه 127.0.0.1)
- Firewall باز است
- هر دو یک شبکه هستند
- Antivirus block نمی‌کند

## حذف

```powershell
.\uninstall.ps1
```

حذف دستی دیتابیس:
```powershell
$env:PGPASSWORD = "postgres-pass"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "DROP DATABASE divan;"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "DROP USER divan_app;"
```

## Backup دیتابیس

```powershell
$date = Get-Date -Format "yyyyMMdd"
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U divan_app -h 127.0.0.1 divan > "backup-$date.sql"
```

Restore:
```powershell
Get-Content backup.sql | & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U divan_app -h 127.0.0.1 divan
```

## امنیت

- [ ] رمز ادمین قوی (12+ کاراکتر)
- [ ] رمز postgres قوی
- [ ] `.env` فقط برای Administrator
- [ ] Firewall فقط از LAN
- [ ] Windows Update فعال
- [ ] Antivirus فعال
- [ ] Backup منظم

## HTTPS (پیشرفته)

برای دسترسی از اینترنت:

### Cloudflare Tunnel (رایگان)

```powershell
choco install cloudflared -y
cloudflared tunnel login
cloudflared tunnel create divan
cloudflared tunnel route dns divan divan.yourdomain.com
cloudflared tunnel run --url http://localhost:4000 divan
```

### Nginx + Let's Encrypt

```powershell
choco install nginx -y
copy deploy\nginx.conf C:\tools\nginx\conf\
```

راهنمای کامل: `deploy/setup-https.sh`

## ساختار فایل‌ها

```
divan-server-vX.X.X/
├── install.ps1          ← نصب‌کننده
├── uninstall.ps1        ← حذف
├── start.ps1            ← اجرای دستی
├── .env                 ← تنظیمات (محرمانه)
├── package.json
├── Dockerfile
├── WINDOWS.md           ← این فایل
├── README.md
├── deploy/
├── src/
└── logs/
    ├── stdout.log
    └── stderr.log
```

---

© ۱۴۰۵ — دیوان
