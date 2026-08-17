#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
OUT="${1:-/tmp/yszmai-gh-pages}"

if [[ ! -f "$DIST/index.html" ]]; then
  echo "请先 npm run build"
  exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT"
cp -R "$DIST"/. "$OUT"/

# GitHub Pages: /playground/ 需要 playground/index.html
if [[ -f "$OUT/playground.html" ]] && [[ ! -f "$OUT/playground/index.html" ]]; then
  mkdir -p "$OUT/playground"
  cp "$OUT/playground.html" "$OUT/playground/index.html"
fi

printf 'yszmai.com\n' > "$OUT/CNAME"
touch "$OUT/.nojekyll"

echo "静态站已打包到 $OUT"
echo "  - /playground/ -> playground/index.html"
