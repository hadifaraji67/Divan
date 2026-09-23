#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}ℹ️  $1${NC}"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; }

if [ "$EUID" -ne 0 ]; then
  err "این اسکریپت باید با sudo اجرا شود"
  exit 1
fi

echo ""
echo "🇮🇷  بهینه‌سازی VPS برای کاربران ایران"
echo "═══════════════════════════════════════════"
echo ""
log "تنظیم Timezone به Asia/Tehran..."
timedatectl set-timezone Asia/Tehran 2>/dev/null || ln -sf /usr/share/zoneinfo/Asia/Tehran /etc/localtime
ok "Timezone: $(date)"
echo ""

log "نصب locale فارسی..."
apt-get install -y -qq locales > /dev/null 2>&1 || true
locale-gen en_US.UTF-8 > /dev/null 2>&1 || true
update-locale LANG=en_US.UTF-8 > /dev/null 2>&1 || true
ok "Locale تنظیم شد"
echo ""
log "تنظیم mirror ایرانی APT..."
if [ -f /etc/apt/sources.list ]; then
  cp /etc/apt/sources.list /etc/apt/sources.list.backup-iran 2>/dev/null || true
  if grep -qi "ubuntu" /etc/apt/sources.list 2>/dev/null; then
    CODENAME=$(lsb_release -cs 2>/dev/null || echo "jammy")
    cat > /etc/apt/sources.list << APT_UBUNTU
deb https://mirror.arvancloud.ir/ubuntu/ ${CODENAME} main restricted universe multiverse
deb https://mirror.arvancloud.ir/ubuntu/ ${CODENAME}-updates main restricted universe multiverse
deb https://mirror.arvancloud.ir/ubuntu/ ${CODENAME}-security main restricted universe multiverse
APT_UBUNTU
    log "Ubuntu mirror: arvancloud.ir (${CODENAME})"
  elif grep -qi "debian" /etc/apt/sources.list 2>/dev/null; then
    CODENAME=$(lsb_release -cs 2>/dev/null || echo "bookworm")
    cat > /etc/apt/sources.list << APT_DEBIAN
deb https://mirror.arvancloud.ir/debian/ ${CODENAME} main contrib non-free
deb https://mirror.arvancloud.ir/debian/ ${CODENAME}-updates main contrib non-free
deb https://mirror.arvancloud.ir/debian-security/ ${CODENAME}-security main contrib non-free
APT_DEBIAN
    log "Debian mirror: arvancloud.ir (${CODENAME})"
  fi
  apt-get update -qq > /dev/null 2>&1 || true
  ok "APT mirror ایرانی تنظیم شد"
fi
echo ""
if ! command -v ufw &>/dev/null; then
  apt-get install -y -qq ufw > /dev/null 2>&1
fi
log "تنظیم Firewall..."
ufw --force disable > /dev/null 2>&1 || true
ufw default deny incoming > /dev/null 2>&1 || true
ufw default allow outgoing > /dev/null 2>&1 || true
ufw allow 22/tcp > /dev/null 2>&1 || true
ufw allow 80/tcp > /dev/null 2>&1 || true
ufw allow 443/tcp > /dev/null 2>&1 || true
ufw --force enable > /dev/null 2>&1 || true
ok "UFW فعال (22, 80, 443)"
echo ""

TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
SWAP_MEM=$(free -m | awk '/^Swap:/{print $2}')
if [ "$SWAP_MEM" -lt 512 ] && [ "$TOTAL_MEM" -lt 2048 ]; then
  log "RAM کمه (${TOTAL_MEM}MB) — ساخت swap 1GB..."
  fallocate -l 1G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=1024 2>/dev/null
  chmod 600 /swapfile
  mkswap /swapfile > /dev/null 2>&1
  swapon /swapfile > /dev/null 2>&1 || true
  grep -q "/swapfile" /etc/fstab || echo "/swapfile none swap sw 0 0" >> /etc/fstab
  ok "Swap 1GB ساخته شد"
else
  ok "RAM کافیه (${TOTAL_MEM}MB)"
fi
echo ""

log "بهینه‌سازی sysctl..."
cat > /etc/sysctl.d/99-divan.conf << SYSCTL
net.core.somaxconn = 1024
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_max_syn_backlog = 2048
vm.swappiness = 10
fs.file-max = 65535
SYSCTL
sysctl -p /etc/sysctl.d/99-divan.conf > /dev/null 2>&1 || true
ok "sysctl بهینه شد"
echo ""
log "نصب ابزارهای پایه..."
apt-get install -y -qq \
  curl wget tar unzip git \
  ca-certificates gnupg lsb-release \
  build-essential htop net-tools \
  > /dev/null 2>&1 || true
ok "ابزارها نصب شدند"
echo ""

echo "✅ بهینه‌سازی کامل شد!"
echo ""
echo "📋 خلاصه:"
echo "   Timezone:  $(date +%Z)"
echo "   Mirror:    arvancloud.ir"
echo "   Firewall:  UFW (22, 80, 443)"
echo "   RAM:       ${TOTAL_MEM}MB"
echo "   Swap:      $(free -m | awk '/^Swap:/{print $2}')MB"
echo ""
echo "🚀  مرحله بعد:"
echo "   curl -fsSL https://raw.githubusercontent.com/hadifaraji67/Divan/main/server/bootstrap.sh | bash"
echo ""
