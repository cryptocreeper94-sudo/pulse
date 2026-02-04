#!/bin/bash
# Fast deployment build script - uses pre-committed artifacts
set -e

echo "📦 Deployment build starting..."

# Skip npm install if node_modules already exists (committed to git)
if [ -d ".mastra/output/node_modules" ] && [ "$(ls -A .mastra/output/node_modules 2>/dev/null)" ]; then
  echo "✅ Mastra dependencies already present, skipping install"
else
  echo "📚 Installing Mastra dependencies..."
  npm install --prefix .mastra/output --legacy-peer-deps --omit=dev --ignore-scripts 2>/dev/null || npm install --prefix .mastra/output --legacy-peer-deps --omit=dev || true
fi

# Compile TypeScript (fast - just 2 files)
echo "📝 Compiling TypeScript..."
npx tsc src/bootstrap.ts src/mastra-child.ts --outDir dist --esModuleInterop --module NodeNext --moduleResolution NodeNext --target ES2022 --skipLibCheck

# Rename to .mjs
mv dist/bootstrap.js dist/bootstrap.mjs 2>/dev/null || true

# Apply Mastra patches
if [ -f "./scripts/patch-mastra.sh" ]; then
  ./scripts/patch-mastra.sh
fi

# Fix uuid ESM import issue
if [ -f ".mastra/output/mastra.mjs" ]; then
  sed -i "s/import require\$\$0\$8\$1, { v4 as v4\$1 } from 'uuid';/import * as require\$\$0\$8\$1 from 'uuid'; const { v4: v4\$1 } = require\$\$0\$8\$1;/g" .mastra/output/mastra.mjs 2>/dev/null || true
  echo "✅ Fixed uuid import"
fi

echo "✅ Deployment build complete!"
