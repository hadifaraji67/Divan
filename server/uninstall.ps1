#Requires -RunAsAdministrator
$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot

Clear-Host
Write-Host ""
Write-Host "=== حذف سرور دیوان ===" -ForegroundColor Red
Write-Host ""

Write-Host "این عملیات:" -ForegroundColor Yellow
Write-Host "  - سرویس Windows را حذف می‌کند" -ForegroundColor Gray
Write-Host "  - Firewall rule را پاک می‌کند" -ForegroundColor Gray
Write-Host "  - .env و logs را حذف می‌کند" -ForegroundColor Gray
Write-Host ""
Write-Host "ادامه؟ [y/N]: " -ForegroundColor Cyan -NoNewline
$confirm = Read-Host
if ($confirm -notmatch '^[yY]') {
    Write-Host "لغو شد" -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# حذف سرویس
$serviceName = "DivanServer"
$svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if ($svc) {
    Write-Host "توقف سرویس..." -ForegroundColor Cyan
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    $nssmPaths = @("C:\ProgramData\chocolatey\bin\nssm.exe", "C:\Program Files\nssm\nssm.exe")
    $nssmPath = $null
    foreach ($p in $nssmPaths) {
        if (Test-Path $p) { $nssmPath = $p; break }
    }

    if ($nssmPath) {
        & $nssmPath stop $serviceName 2>&1 | Out-Null
        & $nssmPath remove $serviceName confirm 2>&1 | Out-Null
    } else {
        sc.exe delete $serviceName 2>&1 | Out-Null
    }
    Write-Host "OK: سرویس حذف شد" -ForegroundColor Green
} else {
    Write-Host "سرویس نصب نبود" -ForegroundColor Gray
}
Write-Host ""

# حذف Firewall
Get-NetFirewallRule -DisplayName "Divan Server*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue
Write-Host "OK: Firewall rules حذف شدند" -ForegroundColor Green
Write-Host ""

# حذف فایل‌های حساس
foreach ($item in @(".env", "logs")) {
    $path = Join-Path $PSScriptRoot $item
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  حذف: $item" -ForegroundColor Gray
    }
}
Write-Host "OK: فایل‌های محرمانه حذف شدند" -ForegroundColor Green
Write-Host ""

Write-Host "=== حذف کامل شد ===" -ForegroundColor Green
Write-Host ""
Write-Host "برای حذف دیتابیس (اختیاری):" -ForegroundColor Yellow
Write-Host '  psql -U postgres -c "DROP DATABASE divan;"' -ForegroundColor Gray
Write-Host '  psql -U postgres -c "DROP USER divan_app;"' -ForegroundColor Gray
Write-Host ""
