# Pulse - AI Crypto Trading & News Platform

## Overview
Pulse, by DarkWave Studios, LLC, is an AI-driven cryptocurrency trading platform that leverages the Mastra AI framework to deliver predictive signals, quant trading analysis, and comprehensive crypto news/information. The platform focuses exclusively on cryptocurrency - all DWT token and staking functionality is handled by DarkWave Chain (our separate L1 blockchain at darkwavechain.com, launching Feb 14, 2026).

## User Preferences
- Preferred communication style: Simple, everyday language
- Always check with Jason before proceeding to verify any task - confirm changes look correct before moving on
- Agent diversity: Equal distribution across age groups, gender, race, and hair color
- Design aesthetic: Solid black/dark gray backgrounds (#0f0f0f, #1a1a1a, #141414) with free-floating elements featuring glow effects. Glassmorphism (backdrop-filter blur + semi-transparent backgrounds) is ALLOWED for cards site-wide, but NOT for backgrounds, buttons, or other non-card elements.

## Recent Updates (December 24, 2025)
- **Platform Focus Shift**: Pulse is now crypto-only (removed all stock references). DWT token and staking moved to DarkWave Chain (darkwavechain.com).
- **Removed Pages**: Projects page and Staking page removed from navigation.
- **DarkWave Chain References**: All DWAV token references updated to DWT and redirect to darkwavechain.com.
- **Wallet Handoff Doc**: Added `DARKWAVE-WALLET-HANDOFF.md` to Agent Team Hub for cross-team reference.

## Previous Updates (December 23, 2025)
- **Pre-Publish Sweep Completed**: Comprehensive platform audit verifying all critical systems are operational.
- **Firebase Admin Fix**: Resolved ESM bundling issue with dynamic imports for Firebase Admin SDK.
- **Staking Removed**: Direct staking moved to DarkWave Chain (darkwavechain.com).
- **Version**: 1.20.49 - Frontend and backend versions aligned.
- **DarkWave Chain Verification Modal**: Fixed title to "Verified on DarkWave Chain" and added viewport-aware sizing (max-height: 85vh, overflow-y: auto) to prevent background scrolling.
- **Telegram Broadcast Trigger**: Added `/api/internal/trigger-telegram` endpoint for external cron services to broadcast StrikeAgent signals to Telegram channel. Use GET with `?secret=YOUR_SECRET`. Returns top 3 signals from last 4 hours.
- **7-Day Outcome Backfill**: Added `/api/internal/backfill-7d-outcomes` endpoint to manually populate 7d prediction outcomes. 430+ outcomes now tracked with 52.8% win rate.
- **AI Status Widget**: Now displays combined prediction count of 76,483 (from both predictionEvents and strikeagentPredictions tables).
- **Live Fear & Greed Index**: Now fetching real-time data from Alternative.me API instead of hardcoded values. Shows current market sentiment (0-100 scale with labels like "Extreme Fear", "Greed", etc.)
- **Dynamic Altcoin Season**: Calculated from top 50 altcoin 30-day performance vs BTC (currently 32%).
- **Live Crypto News RSS**: Added `/api/crypto/news` endpoint that aggregates real-time headlines from CoinDesk, CoinTelegraph, Decrypt, and The Block RSS feeds with 5-minute caching.
- **Verification Badge Fix**: Fixed black screen issue when clicking blockchain verification badges by adding missing `qrcode.react` dependency to frontend.
- **Firebase Authentication**: Replaced Replit auth with Firebase Authentication using Google and GitHub sign-in providers. New login screen with both options. Backend syncs Firebase users with existing user database.
- **Firebase Analytics**: Integrated Firebase Analytics for tracking user activity and events.
- **Firebase Console Setup Required**: Add these domains to Firebase Console > Authentication > Settings > Authorized domains:
  - `*.replit.app`
  - `*.replit.dev`
  - Your production domain
- **Firebase Admin Credentials (Optional)**: For server-side token verification, add `FIREBASE_ADMIN_CREDENTIALS` secret with the full JSON service account key from Firebase Console > Project Settings > Service Accounts. Without this, the backend will sync users by email/UID without cryptographic verification.
- **Automatic Token Scan Trigger**: Added `/api/internal/trigger-scan` endpoint for external cron services to refresh StrikeAgent token data. Requires `CRON_SECRET` environment variable for authentication. Use GET with `?secret=YOUR_SECRET` or POST with `x-cron-secret` header.
- **Production Cron Setup**: Since Autoscale deployments go idle between requests, use an external cron service (like cron-job.org, EasyCron, or UptimeRobot) to call the trigger endpoints every 5-15 minutes to keep token data and Telegram broadcasts fresh.

## Access Code Reference
- **777**: User access (default, configurable via `USER_ACCESS_CODE` env var)
- **888**: Admin access (configurable via `ADMIN_ACCESS_CODE` env var)
- **999**: Owner access (configurable via `OWNER_ACCESS_CODE` env var)
- **0424**: Quant access (for special quant features)

## Future Roadmap
- **Extended Prediction Horizons**: Add 30-day, 6-month, and 1-year prediction timeframes as the platform matures and accumulates more historical data. These longer horizons will be enabled progressively as predictions age past each threshold.

## Previous Updates (December 22, 2025)
- **Production Deployment Fix**: Changed `npm run start` to use bootstrap server that properly handles static file serving from `public/` AND proxies API requests to Mastra. This fixes StrikeAgent API endpoints (`/api/public/strikeagent/*`) not working in production.
- **Bootstrap Server Update**: Updated `bootstrap.ts` to serve static files from `public/` directory where the build process copies the compiled frontend assets.

## Previous Updates (December 18, 2025)
- **Dashboard Carousel Cleanup (Mobile Only)**: Hidden "Latest News" carousel on mobile screens only (already exists in mobile news section below). Desktop still shows all 3 carousels; mobile displays 2 carousels (Market Metrics, Quick Actions) side-by-side.
- **Dark Mode Only**: Removed light theme toggle - platform is dark theme only ("DarkWave = dark"). Removed theme toggle button from header.
- **Header Cleanup**: Fixed PULSE title truncation on mobile by adjusting responsive breakpoints and removing unnecessary header elements
- **Pricing Page Layout**: Restructured billing toggle with "Save up to 17%" badge positioned below as a separate centered element for better symmetry
- **Telegram Mini App Refactor**: Converted TelegramApp.jsx to StrikeAgent-only focused experience with 3-tab bottom nav (StrikeAgent 🎯, Wallet 💳, Upgrade ⚡) and settings gear icon in header. Removed full Pulse dashboard for cleaner GTM.
- **StrikeAgent Live Widget**: Premium dashboard widget showing live bot signals (SNIPE/WATCH), confidence levels, win rate stats, with subtle "🔒 Pro" badge for locked features
- **Dashboard Layout**: Fixed 3-column carousel layout (Market Metrics, Quick Actions, Latest News) with proper responsive breakpoints (600px) to maintain horizontal alignment on desktop/tablet
- **Metric Cards**: Made cards responsive with flexible width, centered carousel indicators below dots between navigation arrows
- **Bitcoin Chart Timeframes**: Added 1S (live), 1H, and 4H timeframes alongside existing 1D/7D/30D/1Y/ALL options for granular market analysis
- **Mobile Carousel Consistency**: Updated MobileCardCarousel to match desktop layout with counter centered below dots between arrows
- **UI Responsive Improvements**: Made header elements (Whitepaper button, wallet display) responsive and compact on mobile screens
- **Disclaimer Banner**: Changed from brown/orange to attention-grabbing red color scheme

## System Architecture

### UI/UX Decisions
The platform features a solid dark theme with free-floating elements and glow effects (dark mode only - no light theme). Glassmorphism is used for cards, but not for backgrounds, buttons, or other non-card elements. The design includes a slim 50px header, a dynamic footer, SVG gauge components, metric cards, and a customizable Bitcoin chart using `lightweight-charts`. UI elements avoid frames, with agents appearing as if walking in front of a screen. The color palette strictly avoids orange, yellow, and brown.

### Technical Implementations
- **Frontend**: React 19 and Vite 7 web app, plus React Native + Expo mobile app.
- **Backend**: Mastra AI framework with an Express server, powered by the DarkWave-V2 AI agent.
- **Database**: PostgreSQL (Neon-backed).
- **Authentication**: Firebase Authentication with Google and GitHub OAuth providers. Backend verifies Firebase ID tokens and syncs user data. Optional WebAuthn biometric authentication for wallet transaction confirmation.
- **Workflow Management**: Inngest for event-driven processing and cron jobs.
- **Prediction Tracking**: Logs AI signals, tracks outcomes, calculates accuracy, and hashes predictions on both Solana and DarkWave Chain L1 for dual-layer verification. Features a logistic regression ML learning system with automated weekly training and an AI Status Widget.
- **DarkWave Chain Integration**: Full L1 blockchain integration for hash verification, hallmark generation, and prediction stamping. API routes at `/api/darkwave-chain/*` for status, hash submit/verify, and hallmark operations. Requires `DARKWAVE_API_KEY`, `DARKWAVE_API_SECRET`, `DARKWAVE_CHAIN_URL` secrets.
- **Personal Dashboard System**: Unique Hallmark ID per user, customizable landing page, favorite coins, market gauges, and main chart widget.
- **Coin Table System**: Categories (Top, Gainers, Losers, Meme, DeFi, DEX) fetching 20 coins each from CoinGecko API, with 1H/24H timeframe toggles and mobile responsiveness.
- **StrikeAgent**: AI tool for real-time token discovery with safety filters, smart auto mode, and multi-chain support (Solana, Ethereum, Base, Polygon, Arbitrum, BSC, and 17 other EVM chains).
- **Manual Token Watchlist/Limit Orders**: System for setting entry, exit, and stop-loss orders across four token slots, monitored by Inngest.
- **Multi-Chain Built-in Wallet**: Custom HD wallet with Trust Wallet-style UX, supporting Solana and 22 EVM chains, featuring BIP39 mnemonic generation and AES-256-GCM encrypted storage. Includes biometric transaction confirmation, premium UI redesign, and Quick Actions Hub.
- **Dust Buster**: Solana wallet cleanup utility for recovering locked SOL rent.
- **Automatic Versioning System**: Manages `version.json` for frontend and backend.
- **ORBIT Ecosystem Integration**: Cross-app communication for activity logging, code snippet sharing, metrics reporting, and alerts.
- **Feature Specifications**: Includes user authentication, real-time crypto price tracking, AI prediction/analysis modals, admin dashboard, Telegram bot integration, 54 diverse AI Agent personas, Knowledge Base, and a Skins System.
- **Stripe Integration**: 3 pricing tiers (Pulse Pro, StrikeAgent Elite, DarkWave Complete) with free trials.
- **Developer API System**: Public REST API for external developers to access Pulse's AI signals, market data, and predictions. Features API key management with rate limiting, scoped permissions, environment separation (live/test keys), and Stripe-integrated API billing tiers (Free, Pro, Enterprise).
- **AI Autonomous Trading System Roadmap**: A self-learning AI system to autonomously trigger StrikeAgent trades based on proven prediction accuracy, developed through phases of data collection, model training & accuracy tracking, StrikeAgent integration, and autonomous trading with safety layers and configurable trading modes (Observer, Approval, Semi-Auto, Full Auto).

## External Dependencies

### AI & LLM Services
- OpenAI GPT-4o-mini (via Replit AI Integrations)
- Vercel AI SDK (`ai`, `@ai-sdk/openai`)

### Market Data APIs
- CoinGecko API
- Yahoo Finance
- Dexscreener API
- Helius API (Solana)
- Alchemy API

### Database & Storage
- PostgreSQL (`@mastra/pg`)

### Infrastructure & Deployment
- Inngest (`inngest`, `@mastra/inngest`)

### Messaging Platform
- Telegram Bot API

### Technical Analysis Libraries
- `technicalindicators`

### Supporting Libraries
- `axios`, `zod`, React 19, Vite 7

## Agent Team Hub - Shared Documentation

These root-level markdown files contain complete code snippets and implementation guides for other agents to reference:

| File | Description |
|------|-------------|
| `DARKWAVE-WALLET-HANDOFF.md` | **Complete Multi-Chain Wallet System** - 23 chains (Solana + 22 EVM), HD wallet, BIP39 mnemonic, AES-256-GCM encryption. Full backend + frontend code ready to copy. |
| `SLIDESHOW_PACKAGE_FOR_OTHER_AGENT.md` | Slideshow component package |
| `MASTER-PROJECT-TRACKER.md` | Project status and feature tracking |
| `PRIORITIZED-ROADMAP.md` | Development roadmap and priorities |

### Wallet System Quick Reference (from DARKWAVE-WALLET-HANDOFF.md)
- **Backend Core**: `src/wallet/walletService.ts` - Multi-chain wallet operations
- **Encryption**: `src/mastra/tools/walletEncryption.ts` - AES-256-GCM
- **API Routes**: `src/mastra/routes/walletRoutes.ts` - REST endpoints
- **Frontend Service**: `darkwave-web/src/services/clientWalletService.js`
- **React Context**: `darkwave-web/src/context/BuiltInWalletContext.jsx`
- **Required Env Vars**: `HELIUS_API_KEY`, `WALLET_ENCRYPTION_KEY`