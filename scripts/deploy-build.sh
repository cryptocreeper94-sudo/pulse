#!/bin/bash
# Fast deployment build script - uses pre-committed artifacts
set -e

echo "📦 Deployment build starting..."

# Install mastra output dependencies (required for runtime)
if [ -d ".mastra/output" ]; then
  echo "📚 Installing Mastra dependencies..."
  npm install --prefix .mastra/output --legacy-peer-deps --omit=dev --ignore-scripts 2>/dev/null || npm install --prefix .mastra/output --legacy-peer-deps --omit=dev || true
fi

# Compile TypeScript
echo "📝 Compiling TypeScript..."
npx tsc src/bootstrap.ts src/mastra-child.ts --outDir dist --esModuleInterop --module NodeNext --moduleResolution NodeNext --target ES2022 --skipLibCheck

# Rename to .mjs
mv dist/bootstrap.js dist/bootstrap.mjs 2>/dev/null || true

# Apply Mastra patches
if [ -f "./scripts/patch-mastra.sh" ]; then
  ./scripts/patch-mastra.sh
fi

echo "✅ Deployment build complete!"
