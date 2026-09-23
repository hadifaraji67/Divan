# ═══════════════════════════════════════════════════════════
#  🚀 نصب‌کننده سرور دیوان — Windows
#  استفاده: PowerShell (Admin) → .\install.ps1
# ═══════════════════════════════════════════════════════════

# #Requires -RunAsAdministrator

$ErrorActionPreference = 'Stop'

# ─── رنگ‌ها ───
function Write-Log   { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Err   { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Ask   { param($msg) Write-Host "❓ $msg" -ForegroundColor Magenta }

# ─── مسیر نصب ───
$INSTALL_DIR = $PSScriptRoot
Set-Location $INSTALL_DIR

# ═══════════════════════════════════════════════════════════
#  نمایش خوش‌آمد
# ═══════════════════════════════════════════════════════════
Clear-Host
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                                                       ║" -ForegroundColor Blue
Write-Host "║        🏛  نصب‌کننده سرور دیوان — Windows  🏛          ║" -ForegroundColor Blue
Write-Host "║                                                       ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# ─── چک admin ───
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Err "این اسکریپت باید با دسترسی Administrator اجرا شود"
    Write-Host ""
    Write-Host "راه‌حل:"
    Write-Host "  1. PowerShell را با راست‌کلیک → Run as Administrator باز کن"
    Write-Host "  2. دستور زیر را اجرا کن:"
    Write-Host "     cd $INSTALL_DIR"
    Write-Host "     .\install.ps1"
    Write-Host ""
    exit 1
}

Write-Ok "دسترسی Admin تایید شد"
Write-Log "پوشه نصب: $INSTALL_DIR"
Write-Host ""

# ─── چک ویندوز ───
$osInfo = Get-CimInstance Win32_OperatingSystem
Write-Log "سیستم‌عامل: $($osInfo.Caption) ($($osInfo.Version))"
Write-Host ""

# ─── چک PowerShell version ───
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Err "PowerShell 5.1 یا بالاتر لازم است (فعلی: $($PSVersionTable.PSVersion))"
    exit 1
}
Write-Ok "PowerShell $($PSVersionTable.PSVersion)"
Write-Host ""
# ═══════════════════════════════════════════════════════════
#  ۱. نصب Chocolatey (package manager)
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  1️⃣  بررسی Chocolatey" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Log "Chocolatey نصب نیست، در حال نصب..."

    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072

    try {
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Ok "Chocolatey نصب شد"
    } catch {
        Write-Err "نصب Chocolatey ناموفق: $_"
        Write-Host ""
        Write-Host "راه‌حل دستی:"
        Write-Host "  https://chocolatey.org/install"
        exit 1
    }
} else {
    Write-Ok "Chocolatey نصب است"
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
#  ۲. نصب Node.js 20 LTS
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  2️⃣  بررسی Node.js" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

$nodeOk = $false
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    $nodeMajor = [int]($nodeVersion -replace 'v','' -split '\.')[0]
    if ($nodeMajor -ge 18) {
        Write-Ok "Node.js $nodeVersion"
        $nodeOk = $true
    } else {
        Write-Warn "Node.js $nodeVersion قدیمی است — نیاز به 18+"
    }
}

if (-not $nodeOk) {
    Write-Log "نصب Node.js 20 LTS..."
    choco install nodejs-lts -y --no-progress
    if ($LASTEXITCODE -ne 0) {
        Write-Err "نصب Node.js ناموفق"
        exit 1
    }

    # رفرش PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Ok "Node.js نصب شد: $(node -v)"
}
Write-Host ""
# ═══════════════════════════════════════════════════════════
#  ۳. نصب PostgreSQL 16
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  3️⃣  بررسی PostgreSQL" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

$pgInstalled = $false
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($pgService) {
    Write-Ok "PostgreSQL نصب است (سرویس: $($pgService.Name))"
    $pgInstalled = $true
} else {
    Write-Log "PostgreSQL نصب نیست، در حال نصب..."
    Write-Host "   (این مرحله ممکن است چند دقیقه طول بکشد)" -ForegroundColor DarkGray
    Write-Host ""

    choco install postgresql16 -y --no-progress --params "/Password:postgres"
    if ($LASTEXITCODE -ne 0) {
        Write-Err "نصب PostgreSQL ناموفق"
        Write-Host ""
        Write-Host "راه‌حل دستی:"
        Write-Host "  https://www.postgresql.org/download/windows/"
        exit 1
    }

    # رفرش PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    Write-Ok "PostgreSQL نصب شد"
    $pgInstalled = $true
}
Write-Host ""

# ─── راه‌اندازی سرویس PostgreSQL ───
if ($pgInstalled) {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($pgService) {
        if ($pgService.Status -ne 'Running') {
            Write-Log "شروع سرویس PostgreSQL..."
            Start-Service $pgService.Name
            Start-Sleep -Seconds 3
        }

        Set-Service -Name $pgService.Name -StartupType Automatic
        Write-Ok "PostgreSQL در حال اجراست ($($pgService.Name))"
    } else {
        Write-Warn "سرویس PostgreSQL پیدا نشد — ادامه می‌دهیم"
    }
}
Write-Host ""

# ─── پیدا کردن psql ───
$psqlPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)

foreach ($p in $possiblePaths) {
    if (Test-Path $p) {
        $psqlPath = $p
        break
    }
}

if (-not $psqlPath) {
    $psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlCmd) { $psqlPath = $psqlCmd.Source }
}

if (-not $psqlPath) {
    Write-Err "psql.exe پیدا نشد — PostgreSQL درست نصب نشده"
    exit 1
}

Write-Ok "psql: $psqlPath"

# اضافه کردن به PATH session
$pgBinDir = Split-Path $psqlPath -Parent
$env:Path += ";$pgBinDir"
Write-Host ""
# ═══════════════════════════════════════════════════════════
#  ۴. پیکربندی سرور
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  🔧  پیکربندی سرور" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# ─── حالت اجرا ───
Write-Host "حالت اجرا:" -ForegroundColor White
Write-Host "  1) محلی      — فقط این دستگاه (localhost)" -ForegroundColor Gray
Write-Host "  2) شبکه      — در دسترس دستگاه‌های شبکه (0.0.0.0)" -ForegroundColor Gray
Write-Host "  3) اینترنت   — با reverse proxy / HTTPS" -ForegroundColor Gray
Write-Host ""
Write-Ask "انتخاب [1/2/3] (پیش‌فرض: 2): "
$modeInput = Read-Host
if ([string]::IsNullOrWhiteSpace($modeInput)) { $modeInput = "2" }

switch ($modeInput) {
    "1" { $serverHost = "127.0.0.1"; $trustProxy = "0" }
    "2" { $serverHost = "0.0.0.0";   $trustProxy = "0" }
    "3" { $serverHost = "127.0.0.1"; $trustProxy = "1" }
    default { $serverHost = "0.0.0.0"; $trustProxy = "0" }
}
Write-Ok "حالت: $serverHost"
Write-Host ""

# ─── پورت ───
Write-Ask "پورت سرور (پیش‌فرض: 4000): "
$serverPort = Read-Host
if ([string]::IsNullOrWhiteSpace($serverPort)) { $serverPort = "4000" }
if (-not ($serverPort -match '^\d+$')) {
    Write-Err "پورت باید عدد باشد"
    exit 1
}
Write-Ok "پورت: $serverPort"
Write-Host ""

# ─── دیتابیس ───
Write-Ask "نام کاربری دیتابیس (پیش‌فرض: divan_app): "
$dbUser = Read-Host
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "divan_app" }

Write-Ask "رمز دیتابیس (خالی = تولید خودکار): "
$dbPassInput = Read-Host
if ([string]::IsNullOrWhiteSpace($dbPassInput)) {
    $bytes = New-Object byte[] 16
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $dbPass = [Convert]::ToBase64String($bytes) -replace '[/+=]','' | ForEach-Object { $_.Substring(0, [Math]::Min(20, $_.Length)) }
    Write-Ok "رمز دیتابیس تولید شد: $dbPass"
} else {
    $dbPass = $dbPassInput
}

Write-Ask "نام دیتابیس (پیش‌فرض: divan): "
$dbName = Read-Host
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "divan" }

Write-Ok "دیتابیس: $dbName / $dbUser"
Write-Host ""

# ─── Admin ───
Write-Ask "نام کاربری ادمین (پیش‌فرض: admin): "
$adminUser = Read-Host
if ([string]::IsNullOrWhiteSpace($adminUser)) { $adminUser = "admin" }

while ($true) {
    Write-Ask "رمز ادمین (حداقل ۶ کاراکتر): "
    $adminPassSecure = Read-Host -AsSecureString
    $adminPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassSecure)
    )

    if ($adminPass.Length -lt 6) {
        Write-Err "رمز باید حداقل ۶ کاراکتر باشد"
        continue
    }
    if ($adminPass -in @("admin","divan1234","password")) {
        Write-Err "رمز پیش‌فرض قبول نیست"
        continue
    }
    break
}
Write-Ok "رمز ادمین ثبت شد"
Write-Host ""
# ═══════════════════════════════════════════════════════════
#  ۵. ساخت کاربر و دیتابیس PostgreSQL
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  5️⃣  راه‌اندازی دیتابیس" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# ─── رمز postgres superuser ───
Write-Ask "رمز کاربر postgres (در نصب PostgreSQL تنظیم کردی — پیش‌فرض: postgres): "
$pgSuperPassSecure = Read-Host -AsSecureString
$pgSuperPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgSuperPassSecure)
)
if ([string]::IsNullOrWhiteSpace($pgSuperPass)) { $pgSuperPass = "postgres" }

# ─── تنظیم PGPASSWORD موقت ───
$env:PGPASSWORD = $pgSuperPass
$env:PGCLIENTENCODING = "UTF8"

# ─── تست اتصال ───
Write-Log "تست اتصال به PostgreSQL..."
$testQuery = "SELECT version();"
try {
    $result = & $psqlPath -U postgres -h 127.0.0.1 -c $testQuery -t 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "اتصال ناموفق: $result"
    }
    Write-Ok "اتصال به PostgreSQL موفق"
} catch {
    Write-Err "اتصال به PostgreSQL ناموفق"
    Write-Host ""
    Write-Host "دلایل احتمالی:" -ForegroundColor Yellow
    Write-Host "  1. رمز postgres اشتباه است" -ForegroundColor Gray
    Write-Host "  2. سرویس PostgreSQL اجرا نیست" -ForegroundColor Gray
    Write-Host "  3. pg_hba.conf اجازه نمی‌دهد" -ForegroundColor Gray
    Write-Host ""
    $env:PGPASSWORD = ""
    exit 1
}

# ─── چک وجود کاربر ───
Write-Log "بررسی کاربر $dbUser..."
$userExists = & $psqlPath -U postgres -h 127.0.0.1 -t -c "SELECT 1 FROM pg_user WHERE usename = '$dbUser';" 2>&1
$userExists = ($userExists | Out-String).Trim()

if ($userExists -eq "1") {
    Write-Warn "کاربر $dbUser از قبل وجود دارد — بروزرسانی رمز..."
    & $psqlPath -U postgres -h 127.0.0.1 -c "ALTER USER $dbUser WITH PASSWORD '$dbPass';" | Out-Null
} else {
    Write-Log "ساخت کاربر $dbUser..."
    & $psqlPath -U postgres -h 127.0.0.1 -c "CREATE USER $dbUser WITH PASSWORD '$dbPass';" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Err "ساخت کاربر ناموفق"
        $env:PGPASSWORD = ""
        exit 1
    }
}
Write-Ok "کاربر $dbUser آماده است"

# ─── چک وجود دیتابیس ───
Write-Log "بررسی دیتابیس $dbName..."
$dbExists = & $psqlPath -U postgres -h 127.0.0.1 -t -c "SELECT 1 FROM pg_database WHERE datname = '$dbName';" 2>&1
$dbExists = ($dbExists | Out-String).Trim()

if ($dbExists -eq "1") {
    Write-Warn "دیتابیس $dbName از قبل وجود دارد"
} else {
    Write-Log "ساخت دیتابیس $dbName..."
    & $psqlPath -U postgres -h 127.0.0.1 -c "CREATE DATABASE $dbName OWNER $dbUser ENCODING 'UTF8';" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Err "ساخت دیتابیس ناموفق"
        $env:PGPASSWORD = ""
        exit 1
    }
}
Write-Ok "دیتابیس $dbName آماده است"

# ─── دسترسی‌ها ───
Write-Log "تنظیم دسترسی‌ها..."
& $psqlPath -U postgres -h 127.0.0.1 -d $dbName -c "GRANT ALL ON SCHEMA public TO $dbUser;" | Out-Null
& $psqlPath -U postgres -h 127.0.0.1 -d $dbName -c "ALTER SCHEMA public OWNER TO $dbUser;" | Out-Null
& $psqlPath -U postgres -h 127.0.0.1 -c "ALTER USER $dbUser CREATEDB;" | Out-Null
Write-Ok "دسترسی‌ها تنظیم شد"

# ─── پاک کردن رمز از env ───
$env:PGPASSWORD = ""
Write-Host ""
# ═══════════════════════════════════════════════════════════
#  ۶. ساخت فایل .env
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  6️⃣  ساخت فایل .env" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# ─── تولید JWT_SECRET ───
$jwtBytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($jwtBytes)
$jwtSecret = ($jwtBytes | ForEach-Object { $_.ToString("x2") }) -join ""

# ─── محتوای .env ───
$envContent = @"
# ═══════════════════════════════════════════════════════════
#  تنظیمات سرور دیوان — تولید شده در $(Get-Date -Format 'yyyy-MM-dd HH:mm')
# ═══════════════════════════════════════════════════════════

NODE_ENV=production
PORT=$serverPort
HOST=$serverHost

# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASSWORD=$dbPass

# JWT
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=30d

# Admin (فقط برای setup اولیه)
ADMIN_USERNAME=$adminUser
ADMIN_PASSWORD=$adminPass
ADMIN_FULL_NAME=مدیر سیستم

# CORS
CORS_ORIGINS=*

# Proxy
TRUST_PROXY=$trustProxy
"@

$envPath = Join-Path $INSTALL_DIR ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Ok ".env ساخته شد: $envPath"
Write-Host ""

# ═══════════════════════════════════════════════════════════
#  ۷. نصب پکیج‌های npm
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  7️⃣  نصب پکیج‌های npm" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

Write-Log "اجرای npm install (ممکن است ۲-۳ دقیقه طول بکشد)..."
Write-Host ""

Push-Location $INSTALL_DIR
try {
    if (Test-Path "package-lock.json") {
        npm ci --omit=dev 2>&1 | Out-Host
    } else {
        npm install --omit=dev 2>&1 | Out-Host
    }

    if ($LASTEXITCODE -ne 0) {
        throw "npm install ناموفق (exit code: $LASTEXITCODE)"
    }
    Write-Ok "پکیج‌ها نصب شدند"
} catch {
    Write-Err "خطا در npm install: $_"
    Pop-Location
    exit 1
} finally {
    Pop-Location
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
#  ۸. اجرای Migration
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  8️⃣  اجرای migration دیتابیس" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

Push-Location $INSTALL_DIR
try {
    node src/db/migrate.js 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Migration ناموفق"
    }
    Write-Ok "Migration کامل شد"
} catch {
    Write-Err "خطا در migration: $_"
    Pop-Location
    exit 1
} finally {
    Pop-Location
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
#  ۹. ساخت کاربر ادمین
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  9️⃣  ساخت حساب مدیر" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

Push-Location $INSTALL_DIR
try {
    node src/setup.js 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "setup.js با خطا یا warning تمام شد — ادامه می‌دهیم"
    } else {
        Write-Ok "حساب ادمین ساخته شد"
    }
} catch {
    Write-Warn "خطا در setup: $_"
} finally {
    Pop-Location
}
Write-Host ""
# ═══════════════════════════════════════════════════════════
#  ۱۰. تنظیم Windows Firewall
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  🔟  تنظیم Firewall" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

$ruleName = "Divan Server (TCP $serverPort)"

# حذف rule قبلی اگر بود
Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue

# ساخت rule جدید
try {
    New-NetFirewallRule `
        -DisplayName $ruleName `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $serverPort `
        -Action Allow `
        -Profile Any | Out-Null
    Write-Ok "Firewall rule اضافه شد (port $serverPort)"
} catch {
    Write-Warn "تنظیم firewall ناموفق: $_"
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
#  ۱۱. نصب به عنوان Windows Service
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  1️⃣1️⃣  نصب به عنوان Windows Service" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

Write-Ask "سرور به عنوان Windows Service نصب شود؟ (خودکار بعد از ری‌استارت) [y/N]: "
$installService = Read-Host
if ([string]::IsNullOrWhiteSpace($installService)) { $installService = "n" }

if ($installService -match '^[yY]') {
    Write-Log "نصب سرویس Windows..."

    # ─── نصب NSSM ───
    if (-not (Get-Command nssm -ErrorAction SilentlyContinue)) {
        Write-Log "نصب NSSM..."
        choco install nssm -y --no-progress
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }

    $nssmCmd = Get-Command nssm -ErrorAction SilentlyContinue
    if (-not $nssmCmd) {
        # جستجوی دستی
        $nssmPaths = @(
            "C:\ProgramData\chocolatey\bin\nssm.exe",
            "C:\Program Files\nssm\nssm.exe"
        )
        foreach ($p in $nssmPaths) {
            if (Test-Path $p) { $nssmCmd = @{ Source = $p }; break }
        }
    }

    if (-not $nssmCmd) {
        Write-Warn "NSSM پیدا نشد — سرویس نصب نشد"
        Write-Host "  می‌توانی بعداً دستی نصب کنی" -ForegroundColor Gray
    } else {
        $nssmPath = if ($nssmCmd.Source) { $nssmCmd.Source } else { $nssmCmd.Path }
        $serviceName = "DivanServer"
        $nodePath = (Get-Command node).Source
        $scriptPath = Join-Path $INSTALL_DIR "src\index.js"
        $logDir = Join-Path $INSTALL_DIR "logs"

        # ساخت پوشه logs
        if (-not (Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }

        # حذف سرویس قبلی اگر بود
        $existing = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        if ($existing) {
            Write-Log "حذف سرویس قبلی..."
            & $nssmPath stop $serviceName 2>&1 | Out-Null
            & $nssmPath remove $serviceName confirm 2>&1 | Out-Null
            Start-Sleep -Seconds 1
        }

        # نصب سرویس
        & $nssmPath install $serviceName $nodePath $scriptPath | Out-Null
        & $nssmPath set $serviceName AppDirectory $INSTALL_DIR | Out-Null
        & $nssmPath set $serviceName DisplayName "Divan Accounting Server" | Out-Null
        & $nssmPath set $serviceName Description "سرور حسابداری دیوان" | Out-Null
        & $nssmPath set $serviceName Start SERVICE_AUTO_START | Out-Null
        & $nssmPath set $serviceName AppStdout (Join-Path $logDir "stdout.log") | Out-Null
        & $nssmPath set $serviceName AppStderr (Join-Path $logDir "stderr.log") | Out-Null
        & $nssmPath set $serviceName AppRotateFiles 1 | Out-Null
        & $nssmPath set $serviceName AppRotateBytes 1048576 | Out-Null

        # شروع سرویس
        Write-Log "شروع سرویس..."
        Start-Service -Name $serviceName
        Start-Sleep -Seconds 3

        $svc = Get-Service -Name $serviceName
        if ($svc.Status -eq 'Running') {
            Write-Ok "سرویس $serviceName اجرا شد"
        } else {
            Write-Warn "سرویس اجرا نشد — چک کن: services.msc"
        }
    }
} else {
    Write-Log "سرویس نصب نشد — می‌تونی دستی با start.ps1 اجرا کنی"
}
Write-Host ""
# ═══════════════════════════════════════════════════════════
#  ۱۲. تست سلامت سرور
# ═══════════════════════════════════════════════════════════
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  1️⃣2️⃣  تست سلامت سرور" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

Write-Log "صبر برای راه‌اندازی سرور..."
Start-Sleep -Seconds 3

$healthUrl = "http://127.0.0.1:$serverPort/api/health"
$healthOk = $false

try {
    $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 5 -ErrorAction Stop
    if ($response.status -eq "healthy") {
        Write-Ok "سرور سالم است!"
        Write-Host "   Database: $($response.database.version)" -ForegroundColor Gray
        Write-Host "   Uptime:   $($response.uptime)s" -ForegroundColor Gray
        $healthOk = $true
    }
} catch {
    Write-Warn "سرور هنوز پاسخ نمی‌دهد (طبیعی اگر سرویس نصب نکردی)"
    Write-Host "  برای اجرای دستی: .\start.ps1" -ForegroundColor Gray
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
#  ۱۳. دریافت IP سرور
# ═══════════════════════════════════════════════════════════
$localIPs = @()
try {
    $localIPs = Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
        Select-Object -ExpandProperty IPAddress
} catch {
    # Fallback
    $localIPs = @((Get-WmiObject Win32_NetworkAdapterConfiguration |
        Where-Object { $_.IPEnabled } |
        Select-Object -ExpandProperty IPAddress) -ne $null)
}

# ═══════════════════════════════════════════════════════════
#  ۱۴. خلاصه نهایی
# ═══════════════════════════════════════════════════════════
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                       ║" -ForegroundColor Green
Write-Host "║   ✅  نصب با موفقیت تمام شد!                          ║" -ForegroundColor Green
Write-Host "║                                                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋  اطلاعات ورود:" -ForegroundColor White
Write-Host "   ┌──────────────────────────────────────────────┐" -ForegroundColor DarkGray
Write-Host "   │  نام کاربری:  $adminUser" -ForegroundColor Gray
Write-Host "   │  رمز عبور:    (همان که وارد کردی)" -ForegroundColor Gray
Write-Host "   └──────────────────────────────────────────────┘" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📡  آدرس‌های دسترسی:" -ForegroundColor White
Write-Host "   Local:    http://127.0.0.1:$serverPort" -ForegroundColor Gray
if ($serverHost -eq "0.0.0.0") {
    foreach ($ip in $localIPs) {
        Write-Host "   Network:  http://${ip}:$serverPort" -ForegroundColor Green
    }
}
Write-Host ""

Write-Host "💚  تست سلامت:" -ForegroundColor White
Write-Host "   Invoke-RestMethod http://127.0.0.1:$serverPort/api/health" -ForegroundColor Gray
Write-Host ""

Write-Host "⚙️   مدیریت:" -ForegroundColor White
if (Get-Service -Name "DivanServer" -ErrorAction SilentlyContinue) {
    Write-Host "   services.msc                  ← مدیریت سرویس" -ForegroundColor Gray
    Write-Host "   Start-Service DivanServer     ← شروع" -ForegroundColor Gray
    Write-Host "   Stop-Service DivanServer      ← توقف" -ForegroundColor Gray
    Write-Host "   Restart-Service DivanServer   ← ری‌استارت" -ForegroundColor Gray
} else {
    Write-Host "   .\start.ps1                   ← اجرا دستی" -ForegroundColor Gray
}
Write-Host ""

Write-Host "📱  اتصال از موبایل:" -ForegroundColor White
Write-Host "   1. اپ دیوان → تنظیمات → سرور" -ForegroundColor Gray
if ($localIPs.Count -gt 0 -and $serverHost -eq "0.0.0.0") {
    Write-Host "   2. آدرس: http://$($localIPs[0]):$serverPort" -ForegroundColor Green
} else {
    Write-Host "   2. آدرس: http://SERVER_IP:$serverPort" -ForegroundColor Yellow
}
Write-Host "   3. Username: $adminUser" -ForegroundColor Gray
Write-Host "   4. Password: (همان که وارد کردی)" -ForegroundColor Gray
Write-Host ""

Write-Host "📄  فایل‌های مهم:" -ForegroundColor White
Write-Host "   .env              ← تنظیمات (محرمانه!)" -ForegroundColor Gray
Write-Host "   start.ps1         ← اجرای دستی" -ForegroundColor Gray
Write-Host "   uninstall.ps1     ← حذف کامل" -ForegroundColor Gray
Write-Host "   logs\             ← لاگ‌ها" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉  آماده استفاده!" -ForegroundColor Green
Write-Host ""
