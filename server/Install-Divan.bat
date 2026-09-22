@echo off
REM ═══════════════════════════════════════════════════════════
REM  نصب سرور دیوان — Windows
REM  فقط روی این فایل دابل‌کلیک کن
REM ═══════════════════════════════════════════════════════════

title Divan Server Installer

echo.
echo  ╔═══════════════════════════════════════════════════════╗
echo  ║        🏛  نصب‌کننده سرور دیوان                     ║
echo  ╚═══════════════════════════════════════════════════════╝
echo.
echo  این پنجره را نبندید...
echo.

REM چک وجود install.ps1
if not exist "%~dp0install.ps1" (
    echo  ❌ فایل install.ps1 پیدا نشد
    echo  مطمئن شو هر دو فایل در یک پوشه هستند
    echo.
    pause
    exit /b 1
)

REM اجرا با دسترسی Admin
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -NoExit -File \"%~dp0install.ps1\"'"

exit /b 0
