#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  🚀 نصب‌کننده سرور دیوان
#  استفاده: bash install.sh
# ═══════════════════════════════════════════════════════════

set -e

# ─── رنگ‌ها ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${BLUE}ℹ️  $1${NC}"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; }
ask()  { echo -e "${CYAN}❓ $1${NC}"; }

# ─── تشخیص OS ───
if [ -d "/data/data/com.termux" ]; then
  OS="termux"
  SUDO=""
elif [ -f "/etc/debian_version" ]; then
  OS="debian"
  SUDO="sudo"
elif [ -f "/etc/redhat-release" ]; then
  OS="redhat"
  SUDO="sudo"
else
  OS="unknown"
  SUDO=""
fi

# ─── پاک‌سازی در خروج ───
cleanup() {
  if [ $? -ne 0 ]; then
    err "نصب متوقف شد"
  fi
}
trap cleanup EXIT

# ═══════════════════════════════════════════════════════════
#  نمایش خوش‌آمد
# ═══════════════════════════════════════════════════════════
clear 2>/dev/null || true
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        🏛  نصب‌کننده سرور دیوان  🏛                       ║"
echo "║                                                           ║"
echo "║        سرور حسابداری اختصاصی — نسخه 1.0                  ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
log "سیستم‌عامل: $OS"
log "پوشه نصب: $(pwd)"
echo ""

# ═══════════════════════════════════════════════════════════
#  ۱. چک و نصب Node.js
# ═══════════════════════════════════════════════════════════
if ! command -v node &>/dev/null; then
  warn "Node.js نصب نیست"
  case $OS in
    termux) pkg install -y nodejs ;;
    debian) $SUDO apt update && $SUDO apt install -y nodejs npm ;;
    redhat) $SUDO dnf install -y nodejs npm ;;
    *) err "لطفاً Node.js 18+ نصب کن"; exit 1 ;;
  esac
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  err "Node.js نسخه 18+ لازم است (فعلی: $(node -v))"
  exit 1
fi
ok "Node.js $(node -v)"

# ═══════════════════════════════════════════════════════════
#  ۲. چک و نصب PostgreSQL
# ═══════════════════════════════════════════════════════════
if ! command -v psql &>/dev/null; then
  warn "PostgreSQL نصب نیست"
  case $OS in
    termux) pkg install -y postgresql ;;
    debian) $SUDO apt install -y postgresql postgresql-contrib ;;
    redhat) $SUDO dnf install -y postgresql-server postgresql-contrib
            $SUDO postgresql-setup --initdb 2>/dev/null || true ;;
    *) err "لطفاً PostgreSQL نصب کن"; exit 1 ;;
  esac
fi
ok "PostgreSQL نصب است"

# ═══════════════════════════════════════════════════════════
#  ۳. راه‌اندازی PostgreSQL
# ═══════════════════════════════════════════════════════════
if [ "$OS" = "termux" ]; then
  PG_DIR="$PREFIX/var/lib/postgresql"

  if [ ! -d "$PG_DIR/base" ]; then
    log "راه‌اندازی اولیه PostgreSQL..."
    mkdir -p "$PG_DIR"
    initdb "$PG_DIR" &>/dev/null
  fi

  if ! pg_ctl -D "$PG_DIR" status &>/dev/null; then
    log "شروع PostgreSQL..."
    pg_ctl -D "$PG_DIR" -l "$PG_DIR/logfile" start
    sleep 3
  fi
else
  # Debian/RedHat
  if ! $SUDO systemctl is-active --quiet postgresql; then
    log "شروع PostgreSQL..."
    $SUDO systemctl start postgresql
    $SUDO systemctl enable postgresql 2>/dev/null || true
    sleep 2
  fi
fi
ok "PostgreSQL در حال اجراست"

# ═══════════════════════════════════════════════════════════
#  ۴. پرسیدن اطلاعات از کاربر
# ═══════════════════════════════════════════════════════════
echo ""
echo "─────────────────────────────────────────────────────────"
echo "  🔧 پیکربندی سرور"
echo "─────────────────────────────────────────────────────────"
echo ""

# حالت اجرا
echo "حالت اجرا:"
echo "  1) محلی      — فقط این دستگاه (localhost)"
echo "  2) شبکه      — در دسترس همه دستگاه‌های شبکه (0.0.0.0)"
echo "  3) تولید     — با reverse proxy / HTTPS (پشت Nginx)"
echo ""
ask "انتخاب کن [1/2/3] (پیش‌فرض: 2): "
read -r MODE_INPUT </dev/tty
MODE_INPUT=${MODE_INPUT:-2}

case $MODE_INPUT in
  1) SERVER_HOST="127.0.0.1"; TRUST_PROXY="0" ;;
  2) SERVER_HOST="0.0.0.0";   TRUST_PROXY="0" ;;
  3) SERVER_HOST="127.0.0.1"; TRUST_PROXY="1" ;;
  *) SERVER_HOST="0.0.0.0";   TRUST_PROXY="0" ;;
esac
ok "حالت: $SERVER_HOST"

# پورت
echo ""
ask "پورت سرور (پیش‌فرض: 4000): "
read -r SERVER_PORT </dev/tty
SERVER_PORT=${SERVER_PORT:-4000}
ok "پورت: $SERVER_PORT"

# دیتابیس
echo ""
ask "نام کاربری دیتابیس (پیش‌فرض: divan_app): "
read -r DB_USER </dev/tty
DB_USER=${DB_USER:-divan_app}

ask "رمز دیتابیس (خالی = تولید خودکار): "
read -r DB_PASS </dev/tty
if [ -z "$DB_PASS" ]; then
  DB_PASS=$(openssl rand -base64 18 2>/dev/null | tr -d '/+=' | head -c 20 || date +%s | sha256sum | head -c 20)
  ok "رمز دیتابیس تولید شد: $DB_PASS"
fi

ask "نام دیتابیس (پیش‌فرض: divan): "
read -r DB_NAME </dev/tty
DB_NAME=${DB_NAME:-divan}

# Admin
echo ""
ask "نام کاربری ادمین (پیش‌فرض: admin): "
read -r ADMIN_USER </dev/tty
ADMIN_USER=${ADMIN_USER:-admin}

while true; do
  ask "رمز ادمین (حداقل ۶ کاراکتر): "
  read -rs ADMIN_PASS </dev/tty
  echo ""
  if [ ${#ADMIN_PASS} -lt 6 ]; then
    err "رمز باید حداقل ۶ کاراکتر باشد"
    continue
  fi
  if [ "$ADMIN_PASS" = "admin" ] || [ "$ADMIN_PASS" = "divan1234" ]; then
    err "رمز پیش‌فرض قبول نیست"
    continue
  fi
  break
done
ok "رمز ادمین ثبت شد"

# ═══════════════════════════════════════════════════════════
#  ۵. ساخت کاربر و دیتابیس PostgreSQL
# ═══════════════════════════════════════════════════════════
echo ""
log "ساخت کاربر و دیتابیس PostgreSQL..."

if [ "$OS" = "termux" ]; then
  PSQL="psql -U $(whoami)"
else
  PSQL="$SUDO -u postgres psql"
fi

# کاربر
$PSQL -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" 2>/dev/null | grep -q 1 || \
  $PSQL -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || \
  warn "کاربر $DB_USER از قبل هست"

# دیتابیس
$PSQL -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1 || \
  $PSQL -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || \
  warn "دیتابیس $DB_NAME از قبل هست"

# دسترسی‌ها
$PSQL -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
$PSQL -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null || true

ok "دیتابیس آماده شد"

# ═══════════════════════════════════════════════════════════
#  ۶. ساخت فایل .env
# ═══════════════════════════════════════════════════════════
echo ""
log "ساخت فایل .env..."

JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || date +%s%N | sha256sum | head -c 64)

cat > .env << ENV_FILE
# ═══════════════════════════════════════════════════════════
#  تنظیمات سرور دیوان — تولید شده در $(date)
# ═══════════════════════════════════════════════════════════

NODE_ENV=production
PORT=$SERVER_PORT
HOST=$SERVER_HOST

# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=30d

# Admin
ADMIN_USERNAME=$ADMIN_USER
ADMIN_PASSWORD=$ADMIN_PASS
ADMIN_FULL_NAME=مدیر سیستم

# CORS
CORS_ORIGINS=*

# Proxy
TRUST_PROXY=$TRUST_PROXY
ENV_FILE

chmod 600 .env
ok ".env ساخته شد (دسترسی 600)"

# ═══════════════════════════════════════════════════════════
#  ۷. نصب dependencies
# ═══════════════════════════════════════════════════════════
echo ""
log "نصب پکیج‌های npm..."
if [ -f package-lock.json ]; then
  npm ci --omit=dev 2>&1 | tail -3
else
  npm install --omit=dev 2>&1 | tail -3
fi
ok "پکیج‌ها نصب شدند"

# ═══════════════════════════════════════════════════════════
#  ۸. اجرای Migration
# ═══════════════════════════════════════════════════════════
echo ""
log "اجرای migration دیتابیس..."
node src/db/migrate.js
ok "Migration کامل شد"

# ═══════════════════════════════════════════════════════════
#  ۹. ساخت کاربر Admin
# ═══════════════════════════════════════════════════════════
echo ""
log "ساخت حساب ادمین..."
node src/setup.js
ok "ادمین ساخته شد"

# ═══════════════════════════════════════════════════════════
#  ۱۰. Systemd Service (فقط Linux)
# ═══════════════════════════════════════════════════════════
if [ "$OS" = "debian" ] || [ "$OS" = "redhat" ]; then
  echo ""
  ask "سرویس systemd نصب شود؟ [y/N]: "
  read -r INSTALL_SERVICE </dev/tty

  if [ "$INSTALL_SERVICE" = "y" ] || [ "$INSTALL_SERVICE" = "Y" ]; then
    INSTALL_DIR=$(pwd)
    SERVICE_FILE="/etc/systemd/system/divan-server.service"

    $SUDO tee "$SERVICE_FILE" > /dev/null << SERVICE_EOF
[Unit]
Description=Divan Accounting Server
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$(which node) src/index.js
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=divan-server

[Install]
WantedBy=multi-user.target
SERVICE_EOF

    $SUDO systemctl daemon-reload
    $SUDO systemctl enable divan-server
    $SUDO systemctl start divan-server
    sleep 2

    if $SUDO systemctl is-active --quiet divan-server; then
      ok "سرویس systemd فعال و اجرا شد"
    else
      warn "سرویس اجرا نشد — لاگ‌ها را چک کن: sudo journalctl -u divan-server"
    fi
  fi
fi

# ═══════════════════════════════════════════════════════════
#  ۱۱. تست سلامت (اگر سرویس اجرا شده)
# ═══════════════════════════════════════════════════════════
echo ""
log "تست سرور..."
sleep 1

HEALTH_URL="http://127.0.0.1:$SERVER_PORT/api/health"
if command -v curl &>/dev/null && curl -sf "$HEALTH_URL" &>/dev/null; then
  ok "سرور پاسخ می‌دهد: $HEALTH_URL"
elif command -v wget &>/dev/null && wget -q -O- "$HEALTH_URL" &>/dev/null; then
  ok "سرور پاسخ می‌دهد: $HEALTH_URL"
else
  warn "سرور هنوز اجرا نشده (طبیعی اگر systemd نصب نکردی)"
fi

# ═══════════════════════════════════════════════════════════
#  دریافت IP
# ═══════════════════════════════════════════════════════════
IP_LOCAL=""
case $OS in
  termux) IP_LOCAL=$(ip route get 1 2>/dev/null | awk '{print $7}' | head -1) ;;
  *) IP_LOCAL=$(hostname -I 2>/dev/null | awk '{print $1}') ;;
esac

# ═══════════════════════════════════════════════════════════
#  خلاصه نهایی
# ═══════════════════════════════════════════════════════════
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅  نصب با موفقیت تمام شد!                              ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📋  اطلاعات ورود:"
echo "   ┌─────────────────────────────────────────┐"
echo "   │  نام کاربری:  $ADMIN_USER"
echo "   │  رمز عبور:    (همون که وارد کردی)"
echo "   └─────────────────────────────────────────┘"
echo ""
echo "🚀  اجرای سرور:"
echo "   cd $(pwd)"
echo "   npm start"
echo ""
echo "📡  آدرس‌های دسترسی:"
echo "   Local:    http://127.0.0.1:$SERVER_PORT"
if [ -n "$IP_LOCAL" ] && [ "$SERVER_HOST" = "0.0.0.0" ]; then
  echo "   Network:  http://$IP_LOCAL:$SERVER_PORT"
fi
echo ""
echo "💚  تست سلامت:"
echo "   curl http://127.0.0.1:$SERVER_PORT/api/health"
echo ""
echo "📖  مستندات:"
echo "   cat README.md"
echo ""

if [ "$OS" = "debian" ] || [ "$OS" = "redhat" ]; then
  if $SUDO systemctl is-active --quiet divan-server 2>/dev/null; then
    echo "⚙️   مدیریت سرویس:"
    echo "   sudo systemctl status divan-server"
    echo "   sudo systemctl restart divan-server"
    echo "   sudo journalctl -u divan-server -f"
    echo ""
  fi
fi

echo "🎉  آماده استفاده!"
echo ""
