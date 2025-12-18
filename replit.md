# Pulse - AI Trading Analysis Platform

## Overview
Pulse, by DarkWave Studios, LLC, is an AI-driven trading platform that leverages the Mastra AI framework to deliver predictive signals and institutional-grade technical analysis for cryptocurrency and stocks. Its core purpose is to provide users with a competitive edge by identifying market trends early and offering sophisticated, risk-adjusted analytics. The platform integrates with the broader DarkWave Studios ecosystem, powered by the DWAV token, aiming to empower traders with advanced AI capabilities and significant market potential.

## User Preferences
- Preferred communication style: Simple, everyday language
- Always check with Jason before proceeding to verify any task - confirm changes look correct before moving on
- Agent diversity: Equal distribution across age groups, gender, race, and hair color
- Design aesthetic: Solid black/dark gray backgrounds (#0f0f0f, #1a1a1a, #141414) with free-floating elements featuring glow effects. Glassmorphism (backdrop-filter blur + semi-transparent backgrounds) is ALLOWED for cards site-wide, but NOT for backgrounds, buttons, or other non-card elements.

## Recent Updates (December 18, 2025)
- **Telegram Mini App Refactor**: Converted TelegramApp.jsx to StrikeAgent-only focused experience with 3-tab bottom nav (StrikeAgent 🎯, Wallet 💳, Upgrade ⚡) and settings gear icon in header. Removed full Pulse dashboard for cleaner GTM.
- **Light Theme Support**: Full light/dark theme toggle via header button (☀️/🌙). Theme persists in localStorage. URL param `?theme=light` can force light mode. ThemeContext manages state, CSS variables handle colors.
- **StrikeAgent Live Widget**: Premium dashboard widget showing live bot signals (SNIPE/WATCH), confidence levels, win rate stats, with subtle "🔒 Pro" badge for locked features
- **Theme-Aware CSS Variables**: Updated inline styles in DashboardTab, StrikeAgentLiveWidget, and other components to use CSS variables (`var(--text-primary)`, `var(--bg-surface)`, etc.) for proper theme switching
- **Dashboard Layout**: Fixed 3-column carousel layout (Market Metrics, Quick Actions, Latest News) with proper responsive breakpoints (600px) to maintain horizontal alignment on desktop/tablet
- **Metric Cards**: Made cards responsive with flexible width, centered carousel indicators below dots between navigation arrows
- **Bitcoin Chart Timeframes**: Added 1S (live), 1H, and 4H timeframes alongside existing 1D/7D/30D/1Y/ALL options for granular market analysis
- **Mobile Carousel Consistency**: Updated MobileCardCarousel to match desktop layout with counter centered below dots between arrows
- **UI Responsive Improvements**: Made header elements (Whitepaper button, wallet display) responsive and compact on mobile screens
- **Disclaimer Banner**: Changed from brown/orange to attention-grabbing red color scheme

## System Architecture

### UI/UX Decisions
The platform features a solid dark theme with free-floating elements and glow effects. Glassmorphism is used for cards, but not for backgrounds, buttons, or other non-card elements. The design includes a slim 50px header, a dynamic footer, SVG gauge components, metric cards, and a customizable Bitcoin chart using `lightweight-charts`. UI elements avoid frames, with agents appearing as if walking in front of a screen. The color palette strictly avoids orange, yellow, and brown. A light mode theme is also implemented.

### Technical Implementations
- **Frontend**: React 19 and Vite 7 web app, plus React Native + Expo mobile app.
- **Backend**: Mastra AI framework with an Express server, powered by the DarkWave-V2 AI agent.
- **Database**: PostgreSQL (Neon-backed).
- **Authentication**: Session-based with access codes, featuring optional WebAuthn biometric authentication (fingerprint/Face ID) for login 2FA and wallet transaction confirmation. Secure session token rotation with tier-based durations (2 days free, 30 days premium, 10 years admin).
- **Workflow Management**: Inngest for event-driven processing and cron jobs.
- **Prediction Tracking**: Logs AI signals, tracks outcomes, calculates accuracy, and hashes predictions on the Solana blockchain. Features a logistic regression ML learning system with automated weekly training and an AI Status Widget.
- **Personal Dashboard System**: Unique Hallmark ID per user, customizable landing page, favorite coins, market gauges, and main chart widget.
- **Coin Table System**: Categories (Top, Gainers, Losers, Meme, DeFi, DEX) fetching 20 coins each from CoinGecko API, with 1H/24H timeframe toggles and mobile responsiveness.
- **StrikeAgent**: AI tool for real-time token discovery with safety filters, smart auto mode, and multi-chain support (Solana, Ethereum, Base, Polygon, Arbitrum, BSC, and 17 other EVM chains).
- **Manual Token Watchlist/Limit Orders**: System for setting entry, exit, and stop-loss orders across four token slots, monitored by Inngest.
- **Multi-Chain Built-in Wallet**: Custom HD wallet with Trust Wallet-style UX, supporting Solana and 22 EVM chains, featuring BIP39 mnemonic generation and AES-256-GCM encrypted storage. Includes biometric transaction confirmation, premium UI redesign, and Quick Actions Hub.
- **Dust Buster**: Solana wallet cleanup utility for recovering locked SOL rent.
- **Automatic Versioning System**: Manages `version.json` for frontend and backend.
- **ORBIT Ecosystem Integration**: Cross-app communication for activity logging, code snippet sharing, metrics reporting, and alerts.
- **Feature Specifications**: Includes user authentication, real-time crypto price tracking, AI prediction/analysis modals, admin dashboard, Telegram bot integration, 54 diverse AI Agent personas, Knowledge Base, custom Avatar Creator, and a Skins System.
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