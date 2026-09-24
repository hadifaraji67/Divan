#!/bin/bash
REPORT="$HOME/Divan/audit-reports/audit-$(date +%Y%m%d-%H%M).txt"
mkdir -p "$HOME/Divan/audit-reports"
cd ~/Divan

{
  echo "=== Divan Audit Report ==="
  echo "Date: $(date)"
  echo "Version: $(grep '"version"' package.json | head -1)"
  echo ""

  echo "--- STRUCTURE ---"
  TS_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
  TS_LINES=$(find src -name "*.ts" -o -name "*.tsx" -exec cat {} + 2>/dev/null | wc -l)
  echo "TS files: $TS_COUNT"
  echo "Total lines: $TS_LINES"
  echo ""
  echo "Files > 400 lines:"
  find src \( -name "*.tsx" -o -name "*.ts" \) -exec sh -c 'l=$(wc -l < "$1"); [ "$l" -gt 400 ] && echo "$l $1"' _ {} \; 2>/dev/null | sort -rn
  echo ""

  echo "--- CONSOLE.LOG ---"
  grep -rn "console.log" src --include="*.ts" --include="*.tsx" 2>/dev/null | head -10
  echo "Count: $(grep -rn 'console.log' src --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l)"
  echo ""

  echo "--- TODO/FIXME ---"
  grep -rn "TODO\|FIXME\|HACK" src --include="*.ts" --include="*.tsx" 2>/dev/null
  echo ""

  echo "--- ANY COUNT ---"
  echo "Total: $(grep -rn ': any\b' src --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l)"
  echo ""

  echo "--- LOCALSTORAGE KEYS ---"
  grep -rhoE "'divan_[a-z_]+'" src --include="*.ts" --include="*.tsx" 2>/dev/null | sort -u
  echo ""

  echo "--- FEATURES ---"
  echo "Modules:"
  ls src/components/modules/ 2>/dev/null | grep -v bak
  echo ""
  echo "Settings:"
  ls src/components/settings/ 2>/dev/null | grep -v bak
  echo ""
  echo "Shared:"
  ls src/components/shared/ 2>/dev/null | grep -v bak
  echo ""

  echo "--- TESTS ---"
  find . -name "*.test.*" -not -path "./node_modules/*" 2>/dev/null
  echo "Count: $(find . -name '*.test.*' -not -path './node_modules/*' 2>/dev/null | wc -l)"
  echo ""

  echo "--- GIT ---"
  git log --oneline -10
  echo ""
  git tag --sort=-creatordate | head -5
} > "$REPORT"

echo "Report: $REPORT"
cat "$REPORT"
