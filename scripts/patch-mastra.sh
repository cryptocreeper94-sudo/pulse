#!/bin/bash
# Patch Mastra build to fix known issues and bind to 127.0.0.1

MASTRA_BUILD=".mastra/.build/entry-0.mjs"
MASTRA_OUTPUT=".mastra/output/index.mjs"

TARGET=""
if [ -f "$MASTRA_OUTPUT" ]; then
  TARGET="$MASTRA_OUTPUT"
elif [ -f "$MASTRA_BUILD" ]; then
  TARGET="$MASTRA_BUILD"
fi

if [ -z "$TARGET" ]; then
  echo "[patch-mastra] No Mastra build found - skipping"
  exit 0
fi

echo "[patch-mastra] Patching $TARGET"

sed -i 's/host: "0\.0\.0\.0"/host: "127.0.0.1"/g' "$TARGET"

if grep -q "import { tools } from '#tools'" "$TARGET"; then
  sed -i "s|import { tools } from '#tools';|const tools = [];|" "$TARGET"
  echo "[patch-mastra] Fixed #tools import (inline)"
fi

TOOLS_FILE=".mastra/.build/tools.mjs"
if [ ! -f "$TOOLS_FILE" ]; then
  echo 'export const tools = {};' > "$TOOLS_FILE"
  echo "[patch-mastra] Created missing tools.mjs"
fi

if grep -q "throw new Error('Could not dynamically require" "$TARGET"; then
  sed -i '/^function commonjsRequire/i import { createRequire as _cr } from "module";\nconst _require = _cr(import.meta.url);' "$TARGET"
  sed -i 's/function commonjsRequire(path) {/function commonjsRequire(path) {\n  try { return _require(path); } catch(e) {}\n  /g' "$TARGET"
  sed -i "/throw new Error('Could not dynamically require/d" "$TARGET"
  echo "[patch-mastra] Fixed commonjsRequire"
fi

sed -i 's/per_page: 50/per_page: 10/g' "$TARGET"
sed -i 's/per_page: 250/per_page: 25/g' "$TARGET"
sed -i 's/per_page || 50/per_page || 10/g' "$TARGET"

echo "[patch-mastra] Done"
