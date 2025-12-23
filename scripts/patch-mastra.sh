#!/bin/bash
# Patch Mastra output to bind to 127.0.0.1 instead of 0.0.0.0
# This prevents Replit from auto-adding port entries

MASTRA_OUTPUT=".mastra/output/index.mjs"

if [ -f "$MASTRA_OUTPUT" ]; then
  sed -i 's/host: "0\.0\.0\.0"/host: "127.0.0.1"/g' "$MASTRA_OUTPUT"
  echo "Patched Mastra to bind to 127.0.0.1"
fi
