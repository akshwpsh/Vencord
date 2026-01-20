#!/usr/bin/env bash
set -euo pipefail

# Copy Vencord build outputs to a Vesktop-compatible folder
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/dist"
DEST="$SCRIPT_DIR/VencordBuild"

echo "Running build (pnpm build)..."
(cd "$SCRIPT_DIR" && pnpm build)

if [[ ! -d "$SRC" ]]; then
  echo "[ERROR] dist folder not found: $SRC"
  exit 1
fi

mkdir -p "$DEST"

cp -f "$SRC/vencordDesktopMain.js" "$DEST/vencordDesktopMain.js"
cp -f "$SRC/vencordDesktopPreload.js" "$DEST/vencordDesktopPreload.js"
cp -f "$SRC/vencordDesktopRenderer.js" "$DEST/vencordDesktopRenderer.js"
cp -f "$SRC/vencordDesktopRenderer.css" "$DEST/vencordDesktopRenderer.css"

if [[ ! -f "$DEST/package.json" ]]; then
  echo "{}" > "$DEST/package.json"
fi

echo "Done. Vencord files copied to: $DEST"
