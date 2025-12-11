# Pulse - AI Trading Analysis Platform

## Overview
Pulse, powered by DarkWave Studios, LLC, is an AI-driven trading platform utilizing the Mastra AI framework to deliver predictive signals and institutional-grade technical analysis for cryptocurrency and stocks. Its primary goal is to provide users with a significant trading advantage by identifying market trends early and offering sophisticated, risk-adjusted analytics. The platform is designed to integrate with the broader DarkWave Studios ecosystem, powered by the upcoming DWAV token, and aims to empower traders with advanced AI capabilities.

## User Preferences
- User name: Jason (Owner/Admin)
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"
- **IMPORTANT**: Always check with Jason before proceeding to verify any task - confirm changes look correct before moving on
- Agent diversity: Equal distribution across age groups, gender, race, and hair color
- Design aesthetic: Solid black/dark gray backgrounds (#0f0f0f, #1a1a1a, #141414) with free-floating elements featuring glow effects - NO glassmorphism, NO transparency, NO backdrop-filter

## System Architecture

### UI/UX Decisions
The platform features a solid dark theme (`#0f0f0f`, `#1a1a1a`, `#141414`) with free-floating elements and glow effects, explicitly avoiding glassmorphism, transparency, and backdrop-filters. The design includes a slim 50px header with a hamburger menu and a slim, dynamic footer. Key UI components include SVG gauge components for market sentiment (Fear & Greed, Altcoin Season), metric cards for market cap and volume, and a customizable Bitcoin chart using `lightweight-charts` with various display options.

### Technical Implementations
- **Frontend**: Built with React 19 and Vite 7, located in `public/` and `darkwave-web/public/`. A mobile app is in development using React Native + Expo.
- **Backend**: Utilizes the Mastra AI framework with an Express server. The AI agent, DarkWave-V2, supports tool calling and memory.
- **Database**: PostgreSQL, specifically Neon-backed via Replit.
- **Authentication**: Session-based, employing an email whitelist and access codes.
- **Workflow Management**: Inngest is used for event-driven processing and cron jobs.
- **Prediction Tracking**: A robust system logs every AI signal, tracks outcomes at 1hr, 4hr, 24hr, and 7d intervals, and calculates accuracy statistics. Each prediction is hashed and stamped on the Solana blockchain.
- **ML Learning System**: Incorporates feature extraction, training, and inference services (`predictionLearningService.ts`). It uses logistic regression across different time horizons, with automated weekly training via Inngest. Features include RSI, MACD, EMA spreads, Bollinger position, volume delta, spike score, and volatility.
- **Personal Dashboard System**: Each user receives a unique Hallmark ID and a customizable landing page featuring favorite coins, market gauges, and a main chart widget.
- **Favorites System**: Users can save favorite coins with quick analysis access, persisting data to the database.
- **StrikeAgent (formerly Sniper Bot)**: An AI-powered predictive trading tool for real-time token discovery, featuring safety filters (anti-MEV, mint/freeze authority checks, honeypot simulation), smart auto mode, and multi-chain support (Solana, Ethereum, Base, Polygon, Arbitrum, BSC).
- **Manual Token Watchlist/Limit Orders**: A system for setting entry, exit, and stop-loss orders across four token slots, monitored by Inngest cron jobs.
- **Multi-Chain Built-in Wallet**: A custom HD wallet with Trust Wallet-style UX, supporting Solana and multiple EVM chains (Ethereum, Polygon, Base, Arbitrum, BSC). It features BIP39 mnemonic generation, AES-256-GCM encrypted storage, and client-side crypto operations.
- **Automatic Versioning System**: Manages `version.json` files for both frontend and backend, with scripts for auto-incrementing patch versions and promoting to v2.0.0 for token launch.
- **ORBIT Ecosystem Integration**: Facilitates cross-app communication with the ORBIT Developer Hub for activity logging, code snippet sharing, metrics reporting, and alerts.

### Feature Specifications
- User authentication and management.
- Real-time crypto price tracking.
- AI prediction and analysis modals for coins.
- Admin dashboard for user management.
- Telegram bot integration.
- 18 AI Agent personas with NFT Trading Cards.
- Comprehensive Knowledge Base.
- Custom Avatar Creator with extensive customization options.

## External Dependencies

### AI & LLM Services
- OpenAI GPT-4o-mini (via Replit AI Integrations)
- Vercel AI SDK (`ai`, `@ai-sdk/openai`)

### Market Data APIs
- CoinGecko API (primary)
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