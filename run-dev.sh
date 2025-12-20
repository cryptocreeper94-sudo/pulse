#!/bin/bash
# Run Mastra (backend on port 3001), Public API (port 3002), and Vite (frontend on port 5000)

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 DarkWave Development Server Starting...${NC}"

# Step 1: Start Mastra backend on port 3001 in background
echo -e "${BLUE}📡 Starting Mastra backend on port 3001...${NC}"
PORT=3001 npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend PID: $BACKEND_PID${NC}"

# Wait for backend to be fully ready (poll until port 3001 responds)
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
MAX_WAIT=60
WAITED=0
while ! curl -s http://localhost:3001/api > /dev/null 2>&1; do
  sleep 1
  WAITED=$((WAITED + 1))
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo -e "${YELLOW}⚠️ Backend took too long, starting frontend anyway...${NC}"
    break
  fi
  if [ $((WAITED % 5)) -eq 0 ]; then
    echo -e "${BLUE}   Still waiting... (${WAITED}s)${NC}"
  fi
done

if [ $WAITED -lt $MAX_WAIT ]; then
  echo -e "${GREEN}✅ Backend ready after ${WAITED}s${NC}"
fi

# Step 2: Start Public API server on port 3002 in background
echo -e "${BLUE}🔌 Starting Public API server on port 3002...${NC}"
npx tsx src/api/publicApiServer.ts &
PUBLIC_API_PID=$!
echo -e "${GREEN}✅ Public API PID: $PUBLIC_API_PID${NC}"

# Step 3: Start Vite frontend on port 5000 in foreground
echo -e "${BLUE}🎨 Starting Vite frontend on port 5000...${NC}"
cd darkwave-web
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID $PUBLIC_API_PID" EXIT
