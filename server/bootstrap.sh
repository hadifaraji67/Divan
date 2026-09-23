#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  🚀 نصب یک‌خطی سرور دیوان روی VPS
#  استفاده:
#    curl -fsSL https://raw.githubusercontent.com/hadifaraji67/Divan/main/server/bootstrap.sh | bash
# ═══════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${CYAN}ℹ️  $1${NC}"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; }
ask()  { echo -e "${BLUE}❓ $1${NC}"; }

REPO="hadifaraji67/Divan"
GITHUB_API="https://api.github.com/repos/${REPO}/releases/latest"

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🚀  نصب یک‌خطی سرور دیوان  🚀                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# ─── چک root ───
if [ "$EUID" -ne 0 ]; then
  err "این اسکریپت باید با sudo اجرا شود"
  echo "   sudo bash bootstrap.sh"
  exit 1
fi

# ─── چک پیش‌نیازها ───
log "بررسی پیش‌نیازها..."

if ! command -v curl &>/dev/null; then
  err "curl نصب نیست"
  echo "   apt update && apt install -y curl"
  exit 1
fi

if ! command -v tar &>/dev/null; then
  err "tar نصب نیست"
  echo "   apt update && apt install -y tar"
  exit 1
fi

ok "پیش‌نیازها OK"
echo ""

# ─── تنظیمات پیش‌فرض ───
INSTALL_DIR="/opt/divan"
SKIP_PRESET="${SKIP_PRESET:-0}"
AUTO_START="${AUTO_START:-1}"

# ─── پرسش از کاربر ───
ask "پوشه نصب (پیش‌فرض: $INSTALL_DIR): "
read -r USER_DIR </dev/tty
if [ -n "$USER_DIR" ]; then
  INSTALL_DIR="$USER_DIR"
fi

ask "بهینه‌سازی VPS برای ایران انجام شود؟ (Timezone, mirror, firewall) [Y/n]: "
read -r DO_PRESET </dev/tty
if [[ "$DO_PRESET" =~ ^[nN] ]]; then
  SKIP_PRESET=1
fi

echo ""
log "پوشه نصب: $INSTALL_DIR"
log "بهینه‌سازی ایران: $([ $SKIP_PRESET -eq 0 ] && echo 'بله' || echo 'خیر')"
echo ""

# ─── بهینه‌سازی ایران ───
if [ "$SKIP_PRESET" -eq 0 ]; then
  log "اجرای بهینه‌سازی VPS..."
  echo ""

  PRESET_URL="https://raw.githubusercontent.com/${REPO}/main/server/iran-preset.sh"
  if curl -fsSL "$PRESET_URL" -o /tmp/divan-preset.sh 2>/dev/null; then
    chmod +x /tmp/divan-preset.sh
    bash /tmp/divan-preset.sh
    rm -f /tmp/divan-preset.sh
  else
    warn "اسکریپت بهینه‌سازی دریافت نشد — رد می‌شود"
  fi
  echo ""
fi

# ─── دریافت آخرین نسخه ───
log "دریافت آخرین نسخه از GitHub..."
RELEASE_JSON=$(curl -fsSL "$GITHUB_API" 2>/dev/null || echo "")

if [ -z "$RELEASE_JSON" ]; then
  err "اتصال به GitHub برقرار نشد"
  exit 1
fi

VERSION=$(echo "$RELEASE_JSON" | grep -o '"tag_name": *"[^"]*"' | head -1 | cut -d'"' -f4)
TARBALL_URL=$(echo "$RELEASE_JSON" | grep -o '"browser_download_url": *"[^"]*divan-server-v[^"]*\.tar\.gz"' | head -1 | cut -d'"' -f4)

if [ -z "$VERSION" ] || [ -z "$TARBALL_URL" ]; then
  err "نسخه یا لینک دانلود پیدا نشد"
  exit 1
fi

ok "نسخه: $VERSION"
log "لینک: $TARBALL_URL"
echo ""

# ─── ساخت پوشه نصب ───
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# ─── دانلود tarball ───
log "دانلود tarball..."
curl -fSL --progress-bar "$TARBALL_URL" -o "divan-server.tar.gz" || {
  err "دانلود ناموفق"
  exit 1
}

ok "دانلود شد: $(du -h divan-server.tar.gz | cut -f1)"
echo ""

# ─── استخراج ───
log "استخراج..."
tar -xzf divan-server.tar.gz
SERVER_DIR=$(find . -maxdepth 1 -type d -name "divan-server-*" | head -1)

if [ -z "$SERVER_DIR" ]; then
  err "پوشه استخراج‌شده پیدا نشد"
  exit 1
fi

cd "$SERVER_DIR"
INSTALL_PATH=$(pwd)
ok "استخراج در: $INSTALL_PATH"
echo ""

# ─── اجرای install.sh ───
log "اجرای نصب‌کننده..."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "install.sh" ]; then
  bash install.sh
else
  err "install.sh پیدا نشد"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
ok "✅ نصب کامل شد!"
echo ""
echo "📁 پوشه نصب: $INSTALL_PATH"
echo ""
echo "🚀  مدیریت سرویس:"
echo "   sudo systemctl status divan-server"
echo "   sudo systemctl restart divan-server"
echo "   sudo journalctl -u divan-server -f"
echo ""
echo "📱  اتصال از اپ دیوان:"
echo "   تنظیمات → سرور → آدرس سرور را وارد کنید"
echo ""
