# Pulse - AI Trading Analysis Platform

## Overview
Pulse (powered by DarkWave Studios, LLC) is a predictive trading platform built on the Mastra AI framework, offering predictive signals and institutional-grade technical analysis for cryptocurrency and stocks. Its mission is to provide an AI-powered trading advantage by catching trends early and offering risk-adjusted analytics.

**DWAV Token Launch**: February 14, 2026

## Token Information
- **Token Name**: DarkWave Studios (DWAV)
- **Network**: Solana
- **Purpose**: Ecosystem token powering all DarkWave Studios apps
- **Utility**: Staking rewards, premium access, cross-app benefits

## User Preferences
- User name: Jason (Owner/Admin)
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"
- **IMPORTANT**: Always check with Jason before proceeding to verify any task - confirm changes look correct before moving on
- Agent diversity: Equal distribution across age groups, gender, race, and hair color
- Design aesthetic: Solid black/dark gray backgrounds (#0f0f0f, #1a1a1a, #141414) with free-floating elements featuring glow effects - NO glassmorphism, NO transparency, NO backdrop-filter

---

## STATUS SUMMARY (December 7, 2025)

### WORKING
- Core platform operational on Vite + Express backend
- User authentication system (email whitelist + access codes)
- Slim 50px header with hamburger menu navigation
- Redesigned metric cards (Fear & Greed, Altcoin Season, Market Cap, Volume)
- Live candlestick charts with 30-second refresh
- Bitcoin and crypto price tracking via CoinGecko API
- Admin dashboard with full user management
- Telegram bot integration
- Solana blockchain audit trail (LIVE on mainnet)
- Admin/Owner login redirects to `/app?tab=dev`
- Dark theme UI (solid black/gray, no transparency)
- 18 AI Agent personas with NFT Trading Cards
- Knowledge Base (8 chapters, 143-term glossary)

### NEEDS ATTENTION
- CoinGecko API rate limiting (429 errors) - using Pro API now
- Backend startup timing (API errors during cold start)

### NOT YET BUILT
- DWAV token smart contract
- Staking platform with hourly rewards
- Liquidity pools
- CoinGecko/Jupiter listings
- Coinbase Commerce crypto payments

---

## LAUNCH CHECKLIST

### PHASE 1: CLEANUP ✅
- [x] Remove whitepaper.html
- [x] Remove whitepaper-hub.html
- [x] Remove darkwave-whitepaper.md
- [x] Update replit.md with DWAV branding
- [x] Update all "December 25" dates to "February 14"
- [x] Update all "PULSE token" to "DWAV token"

### PHASE 2: CORE APP ✅
- [x] Update app.js token references (DWAV)
- [x] Update index.html V2 content
- [x] Update subscription.js messaging
- [x] Update upgrade-system.js
- [x] Update lockscreen.html branding (DWAV-XXXX-2026)
- [x] Update admin.html
- [x] Fix CoinGecko rate limiting (Pro API)
- [x] Test all navigation buttons
- [x] Test all tabs work
- [x] Test login/logout flow
- [x] Test chart loading
- [x] Test metric cards display

### PHASE 3: LANDING PAGES ✅
- [x] Update darkwave-studios-landing.html (DWAV Staking)
- [x] Update darkwavestudios-main.html (DWAV Staking)

### PHASE 4: MOBILE APP ✅
- [x] Update token references
- [x] Neon color palette applied (#00D4FF, #39FF14, #9D4EDD, #FF006E)
- [x] Shadow/glow effects added to cards

### PHASE 5: SMART CONTRACT
- [ ] Write DWAV token contract
- [ ] Deploy to Solana devnet
- [ ] Test token functions
- [ ] Deploy to mainnet

### PHASE 6: TOKEN INFRASTRUCTURE
- [ ] Create liquidity pool
- [ ] Apply for Jupiter listing
- [ ] Apply for CoinGecko listing
- [ ] Write new DWAV whitepaper

### PHASE 7: FINAL
- [ ] Full platform test
- [ ] Marketing push (2 weeks)
- [ ] Launch (Feb 14, 2026)

---

## System Architecture

### Frontend (Web)
- **Framework**: React 19 + Vite 7
- **Location**: `public/` and `darkwave-web/public/`
- **Design**: CoinMarketCap-style market overview, 9-column data table, 7 category tabs
- **Theme**: Solid dark (#0f0f0f, #1a1a1a) - NO transparency effects

### Frontend (Mobile)
- **Framework**: React Native + Expo
- **Location**: `darkwave-mobile/`
- **Status**: In development

### Backend
- **Framework**: Mastra AI + Express
- **AI Agent**: DarkWave-V2 with tool calling and memory
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Authentication**: Session-based with email whitelist + access codes
- **Workflows**: Inngest for event-driven processing

### Blockchain Integration
- **Network**: Solana (mainnet)
- **Audit Trail**: SHA-256 hashing via Memo Program
- **Token**: DWAV (DarkWave Studios) - pending deployment
- **Wallet Support**: Solana, Ethereum, Polygon, Arbitrum, Base, BSC

---

## Important Files

### Core Application
- `public/index.html` - Main web app HTML
- `public/app.js` - Core JavaScript logic
- `public/styles.css` - Global styles
- `public/lockscreen.html` - Login/authentication page
- `darkwave-web/public/` - Mirror of public/ for deployment

### Backend Services
- `src/services/auditTrailService.ts` - Solana blockchain stamping
- `src/mastra/agents/index.ts` - AI agent configuration
- `server.ts` - Express server entry point
- `run-dev.sh` - Development startup script

### Mobile App
- `darkwave-mobile/app/index.tsx` - Main mobile entry point
- `darkwave-mobile/app/_layout.tsx` - Navigation layout

---

## External Dependencies

### AI & LLM Services
- OpenAI GPT-4o-mini (via Replit AI Integrations)
- Vercel AI SDK (`ai`, `@ai-sdk/openai`)

### Market Data APIs
- CoinGecko API (primary - has rate limits)
- Yahoo Finance
- Dexscreener API
- QuickChart.io
- Helius API (Solana)
- Alchemy API

### Database & Storage
- PostgreSQL (`@mastra/pg`)

### Infrastructure & Deployment
- Inngest (`inngest`, `@mastra/inngest`)
- Stripe (payments pending)
- Coinbase Commerce (crypto payments pending)

### Messaging Platform
- Telegram Bot API

### Technical Analysis Libraries
- `technicalindicators`

### Supporting Libraries
- `axios`, `zod`, React 19, Vite 7

---

## Deployment Notes

- **Development**: `./run-dev.sh` starts Vite + Express on port 5000
- **Production**: Republish required after changes
- **Critical**: Always copy changes to BOTH `public/` and `darkwave-web/public/`
