#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  ممیزی جامع پروژه دیوان
# ═══════════════════════════════════════════════════════════

REPORT="$HOME/Divan/audit-reports/divan-audit-$(date +%Y%m%d-%H%M%S).txt"
cd ~/Divan

log() { echo "$@" >> "$REPORT"; }
section() {
  log ""
  log "════════════════════════════════════════════════════════════"
  log "  $1"
  log "════════════════════════════════════════════════════════════"
  log ""
}
show() { echo "$@"; echo "$@" >> "$REPORT"; }

{
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         ممیزی جامع پروژه دیوان — $(date +%Y/%m/%d)        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📁 مسیر: $(pwd)"
echo "📌 نسخه: $(grep '\"version\"' package.json | head -1 | sed 's/.*: \"//;s/\".*//')"
echo "📌 Branch: $(git branch --show-current)"
echo "📌 آخرین commit: $(git log --oneline -1)"
echo ""
} | tee "$REPORT"

# ═══ ۱. STRUCTURE ═══
section "۱️⃣ STRUCTURE — ساختار پروژه"
{
echo "📊 فایل‌های TS/TSX در src:"
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l
echo ""
echo "📊 فایل‌های JS/MJS در server + scripts:"
find server scripts -type f \( -name "*.js" -o -name "*.mjs" \) 2>/dev/null | wc -l
echo ""
echo "📊 تعداد کل خطوط کد src:"
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec cat {} + 2>/dev/null | wc -l
echo ""
echo "📊 بزرگ‌ترین ۱۵ فایل:"
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + 2>/dev/null | sort -rn | head -16
echo ""
echo "📊 فایل‌های بالای ۵۰۰ خط (کاندید بازسازی):"
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sh -c 'l=$(wc -l < "$1" 2>/dev/null); [ "$l" -gt 500 ] && echo "$l $1"' _ {} \; 2>/dev/null | sort -rn
echo ""
} | tee -a "$REPORT"

# ═══ ۲. TYPESCRIPT ═══
section "۲️⃣ TYPESCRIPT"
{
echo "📊 اجرای tsc --noEmit..."
npx tsc --noEmit > audit-reports/tsc-result.txt 2>&1
TSC_EXIT=$?
TSC_ERRORS=$(grep -c "error TS" audit-reports/tsc-result.txt 2>/dev/null || echo "0")
echo "   → تعداد خطا: $TSC_ERRORS"
echo ""
if [ "$TSC_ERRORS" -gt 0 ]; then
  echo "📊 ۳۰ خطای اول:"
  head -30 audit-reports/tsc-result.txt
  echo ""
fi
echo "📊 @ts-ignore / @ts-nocheck:"
grep -rn "@ts-ignore\|@ts-nocheck" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
echo ""
echo "📊 استفاده از any:"
grep -rn ": any\b\|<any>\|as any" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
echo ""
} | tee -a "$REPORT"

# ═══ ۳. CODE QUALITY ═══
section "۳️⃣ CODE QUALITY"
{
echo "📊 console.log:"
grep -rn "console\.log" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
echo ""
echo "📊 نمونه console.log ها:"
grep -rn "console\.log" src --include="*.ts" --include="*.tsx" 2>/dev/null | head -10
echo ""
echo "📊 TODO / FIXME / HACK:"
grep -rn "TODO\|FIXME\|HACK\|XXX" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
echo ""
echo "📊 نمونه TODO ها:"
grep -rn "TODO\|FIXME\|HACK" src --include="*.ts" --include="*.tsx" 2>/dev/null | head -10
echo ""
echo "📊 فایل‌های .bak:"
find . -name "*.bak*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null
echo ""
} | tee -a "$REPORT"

# ═══ ۴. SECURITY ═══
section "۴️⃣ SECURITY"
{
echo "📊 رمز/توکن سخت‌کد شده:"
grep -rniE "(password|secret|api[_-]?key|token)\s*[:=]\s*['\"][^'\"]{6,}" \
  src server --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null \
  | grep -v "process.env\|import.meta.env\|placeholder\|example" | head -15
echo ""
echo "📊 eval / dangerouslySetInnerHTML:"
grep -rn "eval(\|dangerouslySetInnerHTML" src --include="*.ts" --include="*.tsx" 2>/dev/null | head -10
echo ""
echo "📊 npm audit (خلاصه):"
npm audit --production 2>&1 | tail -10
echo ""
echo "📊 پکیج‌های قدیمی:"
npm outdated 2>&1 | head -20
echo ""
} | tee -a "$REPORT"

# ═══ ۵. BUILD ═══
section "۵️⃣ BUILD"
{
echo "📊 ساخت build جدید..."
rm -rf dist
npm run build > audit-reports/build-result.txt 2>&1
BUILD_EXIT=$?
tail -40 audit-reports/build-result.txt
echo ""
if [ $BUILD_EXIT -eq 0 ]; then
  echo "✅ Build موفق"
  echo ""
  echo "📊 اندازه dist:"
  du -sh dist 2>/dev/null
  echo ""
  echo "📊 بزرگ‌ترین فایل‌های bundle:"
  find dist -type f \( -name "*.js" -o -name "*.css" \) -exec du -h {} + 2>/dev/null | sort -rh | head -10
  echo ""
  echo "📊 تعداد chunk های JS:"
  find dist/assets -name "*.js" 2>/dev/null | wc -l
else
  echo "❌ Build شکست خورد (exit code: $BUILD_EXIT)"
  echo ""
  echo "📊 خطاهای build:"
  grep -iE "error|failed|cannot|unable" audit-reports/build-result.txt | head -30
fi
echo ""
} | tee -a "$REPORT"

# ═══ ۶. GIT ═══
section "۶️⃣ GIT"
{
echo "📊 آخرین ۱۰ commit:"
git log --oneline -10
echo ""
echo "📊 وضعیت فایل‌ها:"
git status --short
echo ""
echo "📊 Tag های اخیر:"
git tag --sort=-creatordate | head -10
echo ""
} | tee -a "$REPORT"

# ═══ ۷. FILE INVENTORY ═══
section "۷️⃣ FILE INVENTORY"
{
echo "📊 components/modules:"
ls src/components/modules/ 2>/dev/null
echo ""
echo "📊 components/shared:"
ls src/components/shared/ 2>/dev/null
echo ""
echo "📊 components/print:"
ls src/components/print/ 2>/dev/null
echo ""
echo "📊 lib:"
ls src/lib/ 2>/dev/null
echo ""
echo "📊 routes:"
ls src/routes/ 2>/dev/null
echo ""
} | tee -a "$REPORT"

# ═══ پایان ═══
section "✅ پایان ممیزی"
{
echo "📄 گزارش: $REPORT"
echo ""
echo "📊 خلاصه:"
echo "   • TS errors: $TSC_ERRORS"
echo "   • Build: $([ $BUILD_EXIT -eq 0 ] && echo '✅ موفق' || echo '❌ شکست')"
echo "   • TS/TSX files: $(find src -type f \( -name '*.ts' -o -name '*.tsx' \) | wc -l)"
echo ""
} | tee -a "$REPORT"

echo ""
echo "═══════════════════════════════════════"
echo "✅ ممیزی کامل شد"
echo "📄 گزارش: audit-reports/$(basename $REPORT)"
echo "═══════════════════════════════════════"
