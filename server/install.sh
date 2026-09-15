#!/data/data/com.termux/files/usr/bin/bash
# اسکریپت نصب خودکار سرور دیوان

set -e

echo "╔═══════════════════════════════════════════╗"
echo "║   🚀 نصب سرور دیوان                       ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# تشخیص سیستم
if [ -d "/data/data/com.termux" ]; then
  OS="termux"
elif [ -f "/etc/debian_version" ]; then
  OS="debian"
elif [ -f "/etc/redhat-release" ]; then
  OS="redhat"
else
  OS="unknown"
fi

echo "سیستم: $OS"
echo ""

# ۱. نصب Node.js
if ! command -v node &> /dev/null; then
  echo "📦 نصب Node.js..."
  case $OS in
    termux) pkg install -y nodejs ;;
    debian) sudo apt install -y nodejs npm ;;
    redhat) sudo dnf install -y nodejs npm ;;
    *) echo "❌ لطفاً Node.js را دستی نصب کن"; exit 1 ;;
  esac
else
  echo "✅ Node.js نصب است: $(node -v)"
fi

# ۲. نصب PostgreSQL
if ! command -v psql &> /dev/null; then
  echo "📦 نصب PostgreSQL..."
  case $OS in
    termux) pkg install -y postgresql ;;
    debian) sudo apt install -y postgresql postgresql-contrib ;;
    redhat) sudo dnf install -y postgresql-server postgresql-contrib ;;
    *) echo "❌ لطفاً PostgreSQL را دستی نصب کن"; exit 1 ;;
  esac
else
  echo "✅ PostgreSQL نصب است"
fi

# ۳. راه‌اندازی PostgreSQL (فقط Termux)
if [ "$OS" = "termux" ]; then
  if [ ! -d "$PREFIX/var/lib/postgresql/base" ]; then
    echo "🔧 راه‌اندازی اولیه PostgreSQL..."
    mkdir -p $PREFIX/var/lib/postgresql
    initdb $PREFIX/var/lib/postgresql
  fi

  # بررسی اجرا بودن
  if ! pg_ctl -D $PREFIX/var/lib/postgresql status &> /dev/null; then
    echo "▶️  شروع PostgreSQL..."
    pg_ctl -D $PREFIX/var/lib/postgresql -l $PREFIX/var/lib/postgresql/logfile start
    sleep 3
  fi
fi

# ۴. ساخت کاربر و دیتابیس
echo ""
echo "🔧 راه‌اندازی دیتابیس..."
psql -d postgres -c "CREATE USER divan_app WITH PASSWORD 'divan1234';" 2>/dev/null || echo "ℹ️  کاربر divan_app از قبل هست"
psql -d postgres -c "CREATE DATABASE divan OWNER divan_app;" 2>/dev/null || echo "ℹ️  دیتابیس divan از قبل هست"
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE divan TO divan_app;" 2>/dev/null
psql -d divan -c "GRANT ALL ON SCHEMA public TO divan_app;" 2>/dev/null

# ۵. نصب پکیج‌ها
echo ""
echo "📦 نصب پکیج‌های npm..."
npm install

# ۶. ساخت config
if [ ! -f config.json ]; then
  cp config.example.json config.json
  echo "✅ config.json ساخته شد"
fi

# ۷. اجرای migration
echo ""
echo "🔧 اجرای migration..."
npm run migrate

# ۸. دریافت IP
IP=$(ip route get 1 2>/dev/null | awk '{print $7}' | head -1)

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║   ✅ نصب کامل شد!                         ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo "🚀 برای اجرای سرور:"
echo "   cd $(pwd)"
echo "   npm start"
echo ""
if [ -n "$IP" ]; then
  echo "📡 آدرس شبکه:"
  echo "   http://$IP:4000"
  echo ""
fi
echo "📖 برای اطلاعات بیشتر:"
echo "   cat README.md"
echo ""
