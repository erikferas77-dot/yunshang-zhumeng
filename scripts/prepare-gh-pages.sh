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

# /playground（无尾斜杠）→ /playground/（不能与 playground/ 目录同名，用根目录 playground.html）
PLAYGROUND_REDIRECT='<!DOCTYPE html><html><head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=/playground/">
<link rel="canonical" href="/playground/">
<script>location.replace("/playground/")</script>
</head><body></body></html>'

if [[ -d "$OUT/playground" ]] && [[ ! -f "$OUT/playground.html" ]]; then
  printf '%s\n' "$PLAYGROUND_REDIRECT" > "$OUT/playground.html"
elif [[ ! -d "$OUT/playground" ]] && [[ ! -f "$OUT/playground.html" ]]; then
  printf '%s\n' "$PLAYGROUND_REDIRECT" > "$OUT/playground"
fi

echo "静态站已打包到 $OUT"
if [[ -f "$OUT/playground/index.html" ]]; then
  echo "  - /playground/ -> playground/index.html"
fi
if [[ -f "$OUT/playground.html" ]]; then
  echo "  - /playground -> playground.html (redirect)"
fi
