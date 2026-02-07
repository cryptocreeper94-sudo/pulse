# Pulse - AI Crypto Trading & News Platform

## Overview
Pulse, by DarkWave Studios, LLC, is an AI-driven cryptocurrency trading platform that leverages the Mastra AI framework to deliver predictive signals, quant trading analysis, and comprehensive crypto news/information. The platform focuses exclusively on cryptocurrency, with all DWC coin and staking functionality handled by DarkWave Smart Chain (DSC), a separate L1 blockchain.

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
- **ORBIT Ecosystem Integration**: Facilitates cross-app communication for activity logging, code sharing, metrics, and alerts.
- **Feature Specifications**: Includes user authentication, real-time crypto price tracking, AI prediction/analysis modals, admin dashboard, Telegram bot integration, 54 diverse AI Agent personas, Knowledge Base, and a Skins System.
- **Stripe Integration**: Supports 3 pricing tiers (Pulse Pro, StrikeAgent Elite, DarkWave Complete) with free trials.
- **Developer API System**: Public REST API for external developers to access Pulse's AI signals, market data, and predictions, with API key management, rate limiting, and Stripe-integrated billing.
- **AI Autonomous Trading System Roadmap**: Future development for a self-learning AI to autonomously trigger StrikeAgent trades, progressing through data collection, model training, and configurable trading modes (Observer, Approval, Semi-Auto, Full Auto).
- **Alerts System**: Price alerts (above/below/percent change/volume spike), whale transaction tracking, smart money wallet monitoring, and multi-channel notifications (Telegram, email, push).
- **Crypto Calendar**: Token unlock schedules, upcoming airdrops, IDOs, conferences, and crypto events with impact levels and reminders.
- **DeFi Dashboard**: Multi-chain DeFi position tracking (staking, LPs, vaults), protocol TVL rankings, yield opportunity finder with risk levels.
- **On-Chain Analytics**: Real-time gas tracker for all chains, DEX volume analysis, holder distribution lookup, token flow tracking (inflow/outflow by category).
- **Referral Program**: 10% lifetime commission on referral subscriptions, unique referral codes, earnings tracking, $10 minimum payout in crypto.
- **Social Trading Hub**: Trader leaderboards (daily/weekly/monthly/all-time), trading signal sharing with outcome tracking, follow/copy trading system, verified trader badges.
- **Copy Trading System**: Auto-mirror trades from top performers with allocation controls, max trade size limits, and performance tracking per followed trader.
- **Tax Reports**: Comprehensive tax reporting with FIFO/LIFO cost-basis calculation, long-term vs short-term gains classification (based on 365+ day holding period), CSV export, and TurboTax (.txf) format export.
- **Arbitrage Scanner**: CEX arbitrage (Binance/KuCoin price comparison), DEX arbitrage opportunities (Uniswap/Sushiswap/PancakeSwap/Raydium/Orca), and triangular arbitrage detection.
- **NFT Portfolio**: Multi-chain NFT tracking (Ethereum/Solana/Polygon) with Helius and Alchemy API integrations, floor price alerts, trending collections display, and collection analytics.
- **Multi-language Support**: i18n infrastructure supporting 7 languages (English, Spanish, Chinese, Japanese, Korean, Russian, Portuguese) with user preference persistence.

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