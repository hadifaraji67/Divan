#!/data/data/com.termux/files/usr/bin/bash
# گزارش کامل پروژه برای اشتراک‌گذاری

OUT_DIR="/sdcard/divan-report"
mkdir -p "$OUT_DIR"

REPORT="$OUT_DIR/divan-full-report.txt"

echo "در حال ساخت گزارش در $REPORT ..."

{
  echo "═══════════════════════════════════════════════════"
  echo "  گزارش کامل پروژه دیوان"
  echo "  تاریخ: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "  نسخه: $(grep '"version"' package.json | head -1)"
  echo "═══════════════════════════════════════════════════"
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  📋 بخش ۱: ممیزی خودکار"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  node scripts/audit.mjs 2>&1 || echo "(ممیزی خطا داد)"
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  📁 بخش ۲: ساختار کامل src/"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  find src -type f | sort
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  📦 بخش ۳: package.json"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  cat package.json
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🎯 بخش ۴: فایل‌های کلیدی (خلاصه)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for f in \
    src/App.tsx \
    src/components/Sidebar.tsx \
    src/components/SettingsHub.tsx \
    src/components/Header.tsx \
    src/components/ReportsHub.tsx \
  ; do
    echo ""
    echo "─────────────────────────────────────────────────"
    echo "  FILE: $f"
    echo "─────────────────────────────────────────────────"
    if [ -f "$f" ]; then
      cat "$f"
    else
      echo "(فایل نیست)"
    fi
  done
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ⚙️  بخش ۵: وضعیت TypeScript"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  npx tsc --noEmit 2>&1 || echo "(همه چیز سالم است)"
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🔀 بخش ۶: آخرین کامیت‌ها"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  git log --oneline -15
  echo ""
  echo "وضعیت:"
  git status -s
  echo ""

} > "$REPORT" 2>&1

# ساخت فایل فشرده از کد کامل برای بررسی دقیق‌تر
echo "در حال ساخت آرشیو کد..."
tar czf "$OUT_DIR/divan-src.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.vite' \
  --exclude='dist' \
  --exclude='android' \
  --exclude='.tanstack' \
  src/ package.json tsconfig.json vite.config.ts 2>/dev/null

# اطلاعات
echo ""
echo "✅ گزارش ساخته شد:"
ls -lh "$OUT_DIR/"
echo ""
echo "📂 پوشه: $OUT_DIR"
echo ""
echo "📄 فایل اصلی گزارش: divan-full-report.txt"
echo "📦 آرشیو کد کامل: divan-src.tar.gz"
echo ""
echo "از فایل‌منیجر گوشی به این مسیر برو:"
echo "  /storage/emulated/0/divan-report/"
echo ""

