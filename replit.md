# Pulse - AI Trading Analysis Platform

## Overview
Pulse, by DarkWave Studios, LLC, is an AI-driven trading platform that leverages the Mastra AI framework to deliver predictive signals and institutional-grade technical analysis for cryptocurrency and stocks. Its core purpose is to provide users with a competitive edge by identifying market trends early and offering sophisticated, risk-adjusted analytics. The platform integrates with the broader DarkWave Studios ecosystem, powered by the DWT token, aiming to empower traders with advanced AI capabilities and significant market potential.

## User Preferences
- Preferred communication style: Simple, everyday language
- Always check with Jason before proceeding to verify any task - confirm changes look correct before moving on
- Agent diversity: Equal distribution across age groups, gender, race, and hair color
- Design aesthetic: Solid black/dark gray backgrounds (#0f0f0f, #1a1a1a, #141414) with free-floating elements featuring glow effects. Glassmorphism (backdrop-filter blur + semi-transparent backgrounds) is ALLOWED for cards site-wide, but NOT for backgrounds, buttons, or other non-card elements.

## Recent Updates (December 23, 2025)
- **Automatic Token Scan Trigger**: Added `/api/internal/trigger-scan` endpoint for external cron services to refresh StrikeAgent token data. Requires `CRON_SECRET` environment variable for authentication. Use GET with `?secret=YOUR_SECRET` or POST with `x-cron-secret` header.
- **Production Cron Setup**: Since Autoscale deployments go idle between requests, use an external cron service (like cron-job.org, EasyCron, or UptimeRobot) to call the trigger endpoint every 5-15 minutes to keep token data fresh.

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
- **Authentication**: Session-based with access codes, featuring optional WebAuthn biometric authentication (fingerprint/Face ID) for login 2FA and wallet transaction confirmation. Secure session token rotation with tier-based durations (2 days free, 30 days premium, 10 years admin).
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