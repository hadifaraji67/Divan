#!/bin/bash
set -e
MODE="${1:-beta}"
CURRENT=$(node -p "require('./package.json').version")
BASE=$(echo "$CURRENT" | sed 's/-.*//')
SUFFIX=$(echo "$CURRENT" | grep -oE '(alpha|beta|rc)' | head -1 || echo "")
NUM=$(echo "$CURRENT" | grep -oE '[0-9]+$' || echo "0")

case "$MODE" in
  beta)
    if [ "$SUFFIX" = "beta" ]; then NEW="${BASE}-beta.$((NUM + 1))"
    else NEW="${BASE}-beta.1"; fi ;;
  rc)
    if [ "$SUFFIX" = "rc" ]; then NEW="${BASE}-rc.$((NUM + 1))"
    else NEW="${BASE}-rc.1"; fi ;;
  stable) NEW="$BASE" ;;
  *) echo "❌ beta|rc|stable"; exit 1 ;;
esac

node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.version = '$NEW';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
"
echo "✅ $CURRENT → $NEW"
