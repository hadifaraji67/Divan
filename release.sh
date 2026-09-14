#!/data/data/com.termux/files/usr/bin/bash
# اسکریپت انتشار نسخه جدید دیوان

set -e

VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "❌ خطا: نسخه را وارد کنید"
  echo "مثال: ./release.sh v3.3.0"
  exit 1
fi

# اعتبارسنجی نسخه
if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ فرمت نسخه اشتباه است. باید مثل v3.3.0 باشد"
  exit 1
fi

PLAIN_VERSION="${VERSION#v}"

echo "📦 انتشار نسخه $VERSION"
echo ""

# ۱. بروزرسانی package.json
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.version = '$PLAIN_VERSION';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
console.log('✅ package.json → $PLAIN_VERSION');
"

# ۲. کامیت
git add -A
if git diff --staged --quiet; then
  echo "ℹ️ تغییری برای کامیت نیست"
else
  git commit -m "chore: version $VERSION"
fi

# ۳. ساخت تگ
if git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "⚠️ تگ $VERSION از قبل وجود دارد"
else
  git tag -a "$VERSION" -m "انتشار نسخه $VERSION"
  echo "✅ تگ $VERSION ساخته شد"
fi

# ۴. push
echo ""
echo "🚀 در حال push..."
git push origin main
git push origin "$VERSION"

echo ""
echo "🎉 نسخه $VERSION منتشر شد!"
echo ""
echo "📊 وضعیت بیلد:"
echo "   https://github.com/hadifaraji67/Divan/actions"
echo ""
echo "📥 لینک Release (بعد از اتمام بیلد):"
echo "   https://github.com/hadifaraji67/Divan/releases/tag/$VERSION"
