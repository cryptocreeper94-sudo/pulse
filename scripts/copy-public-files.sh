#!/bin/bash

# Automatically copy public files to Mastra output directory
# This runs after Mastra bundles the application

mkdir -p .mastra/output/public
cp -f public/index.html .mastra/output/public/ 2>/dev/null || true
cp -f public/app.js .mastra/output/public/ 2>/dev/null || true
cp -f public/styles.css .mastra/output/public/ 2>/dev/null || true

echo "✅ Public files copied to .mastra/output/public/"
