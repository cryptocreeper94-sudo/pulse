# Pulse - AI Crypto Trading & News Platform

## Overview
Pulse, by DarkWave Studios, LLC, is an AI-driven cryptocurrency trading platform in the Trust Layer ecosystem (dwtl.io). It leverages the Mastra AI framework to deliver predictive signals, quant trading analysis, and comprehensive crypto news/information. The platform focuses exclusively on cryptocurrency, with Signal ($SIG) as the native asset and staking launching July 4, 2026. Part of a 33-app ecosystem connected via SSO Trust Layer. Pulse is app #14 with hallmark prefix `PU` and domain pulse.tlid.io.

## User Preferences
- Preferred communication style: Simple, everyday language
- Always check with Jason before proceeding to verify any task - confirm changes look correct before moving on
- Agent diversity: Equal distribution across age groups, gender, race, and hair color
- Design aesthetic: Solid black/dark gray backgrounds (#0f0f0f, #1a1a1a, #141414) with free-floating elements featuring glow effects. Glassmorphism (backdrop-filter blur + semi-transparent backgrounds) is ALLOWED for cards site-wide, but NOT for backgrounds, buttons, or other non-card elements.

## System Architecture

### UI/UX Decisions
The platform utilizes a dark theme exclusively, featuring solid black/dark gray backgrounds and free-floating elements with glow effects. Glassmorphism is permitted only for cards. Key UI components include a slim 50px header, dynamic footer, SVG gauge components, metric cards, and a customizable Bitcoin chart using `lightweight-charts`. The design avoids frames, and the color palette strictly excludes orange, yellow, and brown.

### Technical Implementations
- **Frontend**: React 19 and Vite 7 web app, with a React Native + Expo mobile app.
- **Backend**: Mastra AI framework using an Express server, powered by the DarkWave-V2 AI agent.
- **Database**: PostgreSQL (Neon-backed).
- **Authentication**: Firebase Authentication (Google, GitHub OAuth) with backend user syncing and optional WebAuthn for wallet transactions. SSO inter-app trust layer using JWT (HS256) with DARKWAVE_API_SECRET-protected token issuance, cross-app verify, and session exchange endpoints (`/api/sso/*`).
- **Workflow Management**: Inngest for event-driven processing and cron jobs.
- **Prediction Tracking**: Logs AI signals, tracks outcomes, calculates accuracy, and hashes predictions on Solana and DarkWave Smart Chain (DSC) for dual-layer verification, incorporating a logistic regression ML system.
- **DarkWave Smart Chain Integration**: Comprehensive L1 blockchain integration for hash verification, hallmark generation, and prediction stamping, including API routes for status, hash submit/verify, and hallmark operations. Also enables automated DWC swaps on DarkWave DEX and staking optimization.
- **Personal Dashboard System**: Features unique Hallmark ID per user, customizable landing pages, favorite coins, market gauges, and chart widgets.
- **Coin Table System**: Displays categorized coins (Top, Gainers, Losers, Meme, DeFi, DEX) from CoinGecko API with time-frame toggles.
- **StrikeAgent**: AI tool for real-time token discovery with safety filters, smart auto mode, and multi-chain support.
- **Manual Token Watchlist/Limit Orders**: Allows users to set entry, exit, and stop-loss orders across four token slots, monitored by Inngest.
- **Multi-Chain Built-in Wallet**: Custom HD wallet supporting Solana and 22 EVM chains, with BIP39 mnemonic generation, AES-256-GCM encrypted storage, and biometric transaction confirmation.
- **Dust Buster**: Solana wallet cleanup utility.
- **Automatic Versioning System**: Manages `version.json` for frontend and backend.
- **ORBIT Ecosystem Integration**: Facilitates cross-app communication for activity logging, code sharing, metrics, and alerts. Auto-registers with ORBIT at `orbitstaffing.io` on startup. Bridge endpoints at `/api/orbit/*` (status, sso-login, register, verify) provide SSO login via ORBIT Trust Layer, user registration, and token verification. Handled directly in bootstrap.ts.
- **Shared Components System**: Cross-app reusable UI components (footer, announcement-bar, trust-badge) served via `/api/ecosystem/shared/` endpoints. Includes loader.js for one-line integration, individual render endpoints, bundle endpoint for JSON, and manifest. Supports dark/light themes. Components auto-place (footer at bottom, announcement bar at top, trust badge fixed bottom-right). Handled directly in bootstrap.ts.
- **Feature Specifications**: Includes user authentication, real-time crypto price tracking, AI prediction/analysis modals, admin dashboard, Telegram bot integration, 54 diverse AI Agent personas, Knowledge Base, and a Skins System.
- **Stripe Integration**: Supports 3 pricing tiers (Pulse Pro, StrikeAgent Elite, DarkWave Complete) with free trials.
- **Developer API System**: Public REST API for external developers to access Pulse's AI signals, market data, and predictions, with API key management, rate limiting, and Stripe-integrated billing.
- **AI Autonomous Trading System**: Fully wired "drop $20 and let it ride" auto-trading system. Four modes: Observer (watch only), Approval (confirm each trade), Semi-Auto (auto-execute small positions), Full-Auto (auto-execute within limits). ML prediction scanner runs every 15 min via Inngest (`autoTradeMLScanner`), picks up fresh predictions, evaluates against user config (confidence/accuracy thresholds, allowed signals/horizons, position limits, daily limits), and executes Jupiter swaps on Solana using the user's linked trading wallet. Wallet linking via `/api/auto-trade/wallet/link` (encrypts private key server-side with AES-256-GCM using DARKWAVE_API_SECRET). Kill switch auto-pauses after consecutive losses. Telegram notifications for all trade events. Key files: `src/services/tradeExecutionService.ts` (signal evaluation + Jupiter swap execution), `src/services/autoTradeService.ts` (config/trade CRUD, `auto_trade_config` + `auto_trades` tables), `src/mastra/inngest/autoTradeWorker.ts` (ML scanner cron, kill switch monitor, daily report, approval reminders), `darkwave-web/src/components/ml/AutoTradeConfig.jsx` (frontend UI). API routes at `/api/auto-trade/*` (config, toggle, pause, resume, trades, approve, reject, stats) via `autoTradeRoutes.ts`, wallet management at `/api/auto-trade/wallet/*` (link, status, unlink) in `bootstrap.ts`.
- **Alerts System**: Price alerts (above/below/percent change/volume spike), whale transaction tracking, smart money wallet monitoring, and multi-channel notifications (Telegram, email, push).
- **Crypto Calendar**: Token unlock schedules, upcoming airdrops, IDOs, conferences, and crypto events with impact levels and reminders.
- **DeFi Dashboard**: Multi-chain DeFi position tracking (staking, LPs, vaults), protocol TVL rankings, yield opportunity finder with risk levels.
- **On-Chain Analytics**: Real-time gas tracker for all chains, DEX volume analysis, holder distribution lookup, token flow tracking (inflow/outflow by category).
- **Trust Layer Hallmark System**: Ecosystem-wide audit trail using Pulse prefix `PU`. Genesis hallmark `PU-00000001` created on boot, referencing parent genesis `TH-00000001`. SHA-256 hashed payloads with simulated blockchain txHash/blockHeight. Public verification at `/api/hallmark/:id/verify`. Trust stamps (Tier 2) for lightweight events (auth, wallet, purchases) with standardized categories. Tables: `trust_layer_hallmarks`, `trust_stamps`, `hallmark_counter`, `user_unique_hashes`. Services: `trustLayerHallmarkService.ts`, `trustStampService.ts`.
- **Trust Layer Affiliate Program**: 5-tier commission system (Base 10%, Silver 12.5%, Gold 15%, Platinum 17.5%, Diamond 20%) based on converted referral count. Universal `uniqueHash` per user works across all 33 ecosystem apps. Referral links: `https://pulse.tlid.io/ref/[hash]`. Payouts in SIG (10 SIG minimum). API endpoints: `/api/affiliate/dashboard`, `/api/affiliate/link`, `/api/affiliate/track` (public), `/api/affiliate/request-payout`. Tables: `affiliate_referrals`, `affiliate_commissions`. Service: `trustLayerAffiliateService.ts`.
- **Referral Program (Legacy)**: 10% lifetime commission on referral subscriptions, unique referral codes, earnings tracking, $10 minimum payout in crypto.
- **Social Trading Hub**: Trader leaderboards (daily/weekly/monthly/all-time), trading signal sharing with outcome tracking, follow/copy trading system, verified trader badges.
- **Copy Trading System**: Auto-mirror trades from top performers with allocation controls, max trade size limits, and performance tracking per followed trader.
- **Tax Reports**: Comprehensive tax reporting with FIFO/LIFO cost-basis calculation, long-term vs short-term gains classification (based on 365+ day holding period), CSV export, and TurboTax (.txf) format export.
- **Arbitrage Scanner**: CEX arbitrage (Binance/KuCoin price comparison), DEX arbitrage opportunities (Uniswap/Sushiswap/PancakeSwap/Raydium/Orca), and triangular arbitrage detection.
- **NFT Portfolio**: Multi-chain NFT tracking (Ethereum/Solana/Polygon) with Helius and Alchemy API integrations, floor price alerts, trending collections display, and collection analytics.
- **Multi-language Support**: i18n infrastructure supporting 7 languages (English, Spanish, Chinese, Japanese, Korean, Russian, Portuguese) with user preference persistence.
- **Command Center**: PIN-protected (741963) admin-only dashboard serving as the central operations hub. Organizes all platform tools into 8 categorized sections (Mission Control, AI & Predictions, Trading Operations, Wallet & Assets, Intelligence & Alerts, Finance & Revenue, Developer & Technical, Learning & Resources) with photorealistic card backgrounds, horizontal carousel navigation, glow effects, and badge system. Session-based PIN auth with 30-min TTL. Located at `darkwave-web/src/components/tabs/CommandCenterTab.jsx`.

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
- Alternative.me API (Fear & Greed Index)
- CoinDesk, CoinTelegraph, Decrypt, The Block (RSS feeds for news)

### Database & Storage
- PostgreSQL (`@mastra/pg`)

### Infrastructure & Deployment
- Inngest (`inngest`, `@mastra/inngest`)

### Messaging Platform
- Telegram Bot API

### Technical Analysis Libraries
- `technicalindicators`

### Payment Processing
- Stripe

### Supporting Libraries
- `axios`, `zod`, React 19, Vite 7