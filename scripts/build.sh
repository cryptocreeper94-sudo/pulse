#!/usr/bin/env bash
set -e

echo "[build] Building bootstrap with esbuild..."
npx esbuild src/bootstrap.ts --bundle --platform=node --target=node20 --format=esm --outfile=dist/bootstrap.mjs --external:pg-native --external:pg --external:cpu-features --external:ssh2 --external:better-sqlite3 --external:bun:sqlite

echo "[build] Patching Mastra build..."
bash scripts/patch-mastra.sh

echo "[build] Done"
