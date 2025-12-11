# Pulse - AI Trading Analysis Platform

## Overview
Pulse, by DarkWave Studios, LLC, is an AI-driven trading platform that leverages the Mastra AI framework to deliver predictive signals and institutional-grade technical analysis for cryptocurrency and stocks. Its core purpose is to provide users with a competitive edge by identifying market trends early and offering sophisticated, risk-adjusted analytics. The platform integrates with the broader DarkWave Studios ecosystem, powered by the DWAV token, aiming to empower traders with advanced AI capabilities and significant market potential.

## User Preferences
- User name: Jason (Owner/Admin)
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"
- **IMPORTANT**: Always check with Jason before proceeding to verify any task - confirm changes look correct before moving on
- Agent diversity: Equal distribution across age groups, gender, race, and hair color
- Design aesthetic: Solid black/dark gray backgrounds (#0f0f0f, #1a1a1a, #141414) with free-floating elements featuring glow effects - NO glassmorphism, NO transparency, NO backdrop-filter

## System Architecture

### UI/UX Decisions
The platform features a solid dark theme (`#0f0f0f`, `#1a1a1a`, `#141414`) with free-floating elements and glow effects, explicitly avoiding glassmorphism, transparency, and backdrop-filters. The design includes a slim 50px header with a hamburger menu, a dynamic footer, SVG gauge components for market sentiment, metric cards for market cap and volume, and a customizable Bitcoin chart using `lightweight-charts`. UI elements should avoid frames or boxes, with agents appearing as if walking in front of a screen, using full-body, rembg-treated, Pixar/MIB style with sweep-in animations. The color palette strictly avoids orange, yellow, and brown. A light mode theme with softer blue-tinted grays and enhanced contrast is also implemented.

### Technical Implementations
- **Frontend**: React 19 and Vite 7, with a React Native + Expo mobile app in development.
- **Backend**: Mastra AI framework with an Express server, powered by the DarkWave-V2 AI agent supporting tool calling and memory.
- **Database**: PostgreSQL, specifically Neon-backed.
- **Authentication**: Session-based, using an email whitelist and access codes.
- **Workflow Management**: Inngest for event-driven processing and cron jobs.
- **Prediction Tracking**: Logs AI signals, tracks outcomes at various intervals, calculates accuracy, and hashes predictions on the Solana blockchain.
- **ML Learning System**: Features include logistic regression for predictions, automated weekly training via Inngest, and feature extraction from indicators like RSI, MACD, EMA spreads, Bollinger position, volume delta, spike score, and volatility.
- **Personal Dashboard System**: Unique Hallmark ID per user, customizable landing page, favorite coins, market gauges, and main chart widget.
- **StrikeAgent**: An AI-powered tool for real-time token discovery, incorporating safety filters (anti-MEV, mint/freeze authority, honeypot simulation), smart auto mode, and multi-chain support (Solana, Ethereum, Base, Polygon, Arbitrum, BSC, and 17 other EVM chains).
- **Manual Token Watchlist/Limit Orders**: System for setting entry, exit, and stop-loss orders across four token slots, monitored by Inngest.
- **Multi-Chain Built-in Wallet**: Custom HD wallet with Trust Wallet-style UX, supporting Solana and 22 EVM chains. Features BIP39 mnemonic generation, AES-256-GCM encrypted storage, client-side crypto operations, and multi-wallet support.
- **Automatic Versioning System**: Manages `version.json` for frontend and backend, with scripts for auto-incrementing patch versions.
- **ORBIT Ecosystem Integration**: Cross-app communication for activity logging, code snippet sharing, metrics reporting, and alerts.
- **Feature Specifications**: Includes user authentication, real-time crypto price tracking, AI prediction/analysis modals, admin dashboard, Telegram bot integration, 18 AI Agent personas with NFT Trading Cards, a comprehensive Knowledge Base, and a custom Avatar Creator with DiceBear integration supporting 5 professional avatar styles. A Skins System offers 304 customizable themes across 14 categories, with free and subscriber-exclusive options.

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