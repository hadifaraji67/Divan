#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  نصب خودکار Nginx + Let's Encrypt SSL
#  فقط روی Ubuntu/Debian/CentOS اجرا کن
# ═══════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo "╔═══════════════════════════════════════════════╗"
echo "║  🔒 نصب HTTPS برای سرور دیوان                 ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# ─── چک root ───
if [ "$EUID" -ne 0 ]; then
  err "این اسکریپت باید با sudo اجرا بشه"
fi

# ─── گرفتن اطلاعات ───
read -p "🌐 دامنه (مثال: divan.example.com): " DOMAIN
read -p "📧 ایمیل (برای Let's Encrypt): " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  err "دامنه و ایمیل الزامی هستن"
fi

log "دامنه: $DOMAIN"
log "ایمیل: $EMAIL"
echo ""

read -p "آیا از Nginx استفاده می‌کنی یا Caddy؟ (nginx/caddy) [nginx]: " WEBSERVER
WEBSERVER=${WEBSERVER:-nginx}
log "وب‌سرور: $WEBSERVER"
echo ""

# ═══════════════════════════════════════════════
#  مرحله ۱: نصب پیش‌نیازها
# ═══════════════════════════════════════════════
log "📦 نصب پیش‌نیازها..."
apt-get update -qq
apt-get install -y -qq curl gnupg2 ca-certificates lsb-release apt-transport-https
ok "پیش‌نیازها نصب شدند"
echo ""

# ═══════════════════════════════════════════════
#  مرحله ۲: نصب وب‌سرور
# ═══════════════════════════════════════════════
if [ "$WEBSERVER" = "caddy" ]; then
  log "📦 نصب Caddy..."
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq
  apt-get install -y -qq caddy
  ok "Caddy نصب شد"
else
  log "📦 نصب Nginx + certbot..."
  apt-get install -y -qq nginx certbot python3-certbot-nginx
  ok "Nginx + certbot نصب شدند"
fi
echo ""

# ═══════════════════════════════════════════════
#  مرحله ۳: تنظیم وب‌سرور
# ═══════════════════════════════════════════════
if [ "$WEBSERVER" = "caddy" ]; then
  log "🔧 تنظیم Caddy..."
  mkdir -p /etc/caddy /var/log/caddy

  cat > /etc/caddy/Caddyfile <<CADDY_CONF
$DOMAIN {
    encode gzip zstd

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }

    reverse_proxy 127.0.0.1:4000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }

    log {
        output file /var/log/caddy/divan.log {
            roll_size 10mb
            roll_keep 5
        }
    }
}
CADDY_CONF

  systemctl enable caddy
  systemctl restart caddy
  ok "Caddy راه‌اندازی شد"
else
  log "🔧 تنظیم Nginx..."

  # کپی nginx.conf با دامنه
  sed "s/divan\.example\.com/$DOMAIN/g" /opt/divan/server/deploy/nginx.conf > /etc/nginx/sites-available/divan
  ln -sf /etc/nginx/sites-available/divan /etc/nginx/sites-enabled/divan
  rm -f /etc/nginx/sites-enabled/default

  mkdir -p /var/www/certbot

  # تست config (بدون SSL چون هنوز cert نداریم)
  # ابتدا فقط HTTP را راه‌اندازی کن
  cat > /etc/nginx/sites-available/divan <<NGINX_TEMP
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}
NGINX_TEMP

  systemctl enable nginx
  systemctl restart nginx
  ok "Nginx راه‌اندازی اولیه شد"

  # ─── گرفتن گواهی ───
  log "🔐 دریافت گواهی Let's Encrypt..."
  certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
  ok "گواهی SSL دریافت شد"

  # ─── کپی config کامل ───
  sed "s/divan\.example\.com/$DOMAIN/g" /opt/divan/server/deploy/nginx.conf > /etc/nginx/sites-available/divan

  nginx -t
  systemctl reload nginx
  ok "Nginx با HTTPS راه‌اندازی شد"

  # ─── Auto-renew ───
  systemctl enable certbot.timer
  systemctl start certbot.timer
  ok "تمدید خودکار گواهی فعال شد"
fi
echo ""

# ═══════════════════════════════════════════════
#  مرحله ۴: Firewall
# ═══════════════════════════════════════════════
if command -v ufw &>/dev/null; then
  log "🔥 تنظیم Firewall..."
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
  ok "Firewall تنظیم شد"
fi
echo ""

# ═══════════════════════════════════════════════
#  پایان
# ═══════════════════════════════════════════════
echo "╔═══════════════════════════════════════════════╗"
echo "║  ✅ نصب HTTPS کامل شد!                        ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "🌐 آدرس سرور:"
echo "   https://$DOMAIN"
echo ""
echo "📊 تست سلامت:"
echo "   curl https://$DOMAIN/api/health"
echo ""
echo "📋 لاگ‌ها:"
if [ "$WEBSERVER" = "caddy" ]; then
  echo "   sudo journalctl -u caddy -f"
else
  echo "   sudo journalctl -u nginx -f"
fi
echo "   sudo journalctl -u divan-server -f"
echo ""
