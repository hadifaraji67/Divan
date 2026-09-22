# ═══════════════════════════════════════════════════════════
#  🚀 اجرای سرور دیوان — Windows
#  استفاده: .\start.ps1
# ═══════════════════════════════════════════════════════════

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   🚀 اجرای سرور دیوان                    ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# ─── چک .env ───
if (-not (Test-Path ".env")) {
    Write-Host "❌ فایل .env پیدا نشد" -ForegroundColor Red
    Write-Host "   ابتدا install.ps1 را اجرا کن" -ForegroundColor Yellow
    exit 1
}

# ─── چک node_modules ───
if (-not (Test-Path "node_modules")) {
    Write-Host "ℹ️  node_modules پیدا نشد — نصب..." -ForegroundColor Cyan
    npm install --omit=dev
    Write-Host ""
}

# ─── خواندن پورت از .env ───
$port = "4000"
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^PORT=(\d+)') { $port = $matches[1] }
}

# ─── نمایش IP ───
$localIPs = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
    Select-Object -ExpandProperty IPAddress

Write-Host "📡 آدرس‌های دسترسی:" -ForegroundColor White
Write-Host "   Local:    http://127.0.0.1:$port" -ForegroundColor Gray
foreach ($ip in $localIPs) {
    Write-Host "   Network:  http://${ip}:$port" -ForegroundColor Green
}
Write-Host ""
Write-Host "⏹  برای توقف: Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# ─── اجرا ───
node src/index.js
