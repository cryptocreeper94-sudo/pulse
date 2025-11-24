# DarkWave-V2 Technical Analysis Bot

## Overview
**DarkWave Pulse** is a predictive trading platform built on the Mastra AI framework, offering predictive signals and institutional-grade technical analysis for cryptocurrency and stocks. Its mission is to provide an AI-powered trading advantage by catching trends early (degen appeal) and offering risk-adjusted analytics (pro appeal). Key capabilities include real-time technical analysis, a dual-mode UI (Degen and Pro), DEX pair analysis with rug-risk detection, multi-chain wallet tracking, Telegram bot integration, cryptocurrency payment processing, and a community ecosystem featuring 18 AI personas and 20 NFT Trading Cards. The V2 launch is scheduled for December 25, 2025.

## User Preferences
- User name: Jason
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"
- Agent diversity: Equal distribution across age groups, gender, race, and hair color (Nov 24, 2025)

## Recent Changes (Nov 24, 2025)
- Fixed coin table row click handlers: Replaced inline onclick handlers with proper event listeners using data attributes (fixes button responsiveness)
- Balanced 18 AI agents: 6 per age group (young/middle/old), 9 male/9 female, diverse racial representation, varied hair colors
- All agents now have distinct visual appearances with no demographic dominance
- Reorganized header: Removed Investors from nav menu, moved to footer with DarkWave logo
- Compacted header icon buttons (👤 Avatar, 🎨 Palette, 🐛 Bug, 🚪 Logout, ⚠️ Disclaimer) - reduced padding/font for better fit
- Added footer with DarkWave logo image + Investors button + social links (Telegram, X)

## System Architecture

### Frontend
The frontend uses React 19 and Vite 7, featuring a CoinMarketCap-style market overview with a 9-column data table and 7 category tabs. The design is inspired by Crypto.com, utilizing dark navy backgrounds, a three-column responsive grid, elevated cards, angular dividers, and electric blue accents with gold and purple highlights. It includes a personalized 9-theme system with organic CSS gradient patterns and a toggleable Crypto Cat mascot. UI elements are designed for low-profile, compact presentation with consistent sizing and double-column layouts where appropriate. An Agent Builder feature allows users to select from 18 AI agents (perfectly balanced: 6 young/middle/old, 9 male/9 female, diverse races and hair colors), with subscription gating and responsive carousel UI. Coin table interactions use event listeners for robust click handling (Nov 24, 2025).

### Backend and AI Agent
The core AI agent, DarkWave-V2, is powered by the Mastra framework, enabling tool calling, memory management, and natural language processing. Workflow orchestration is handled by `createWorkflow` and `createStep`. A modular tool system (`createTool`) with Zod schemas encapsulates functionalities such as Market Data, Technical Analysis, Holdings, Scanner, Chart Generation, Dexscreener, DEX Analysis (including rug-risk detection), and NFT Tool.

### Language Model Integration
The system integrates with OpenAI's GPT-4o-mini via Replit AI Integrations using the `generateLegacy` method from `@ai-sdk/openai`.

### Data Flow
Message processing involves Telegram webhooks, Inngest for event-driven workflows, the Mastra agent, and subsequent response formatting.

### Technical Implementation
The project is built with TypeScript (strict mode, ES2022) and uses Zod for runtime validation. Pino logger provides structured JSON logging. Security features include browser-generated unique user IDs, an admin dashboard, and robust file upload validation. Access control supports an access code and email whitelist, with Free Trial, Basic, and Premium pricing tiers. Live data performance is optimized with 5-minute browser caching. Sniper trading features (buy/sell limit orders) are integrated and locked until the V2 launch. Candlestick charts refresh every 2 seconds with detailed error logging.

### Feature Specifications
Key features include DEX pair support with rug-risk detection and liquidity scoring, NFT collection analysis, a live trending carousel, and database-backed session management. It supports tracked, multi-chain wallets (Solana, Ethereum, Polygon, Arbitrum, Base, BSC). The system includes a subscription notification system, an admin dashboard, a professional token submission system with three-layer file validation, and cryptocurrency payments via Coinbase Commerce. A DarkWave Token Launchpad provides a live countdown, whitelist signup, and premium-gated access, alongside a "Bot Detection System" for DEX pair analysis.

## External Dependencies

### AI & LLM Services
-   OpenAI GPT-4o-mini (via Replit AI Integrations)
-   Vercel AI SDK (`ai`, `@ai-sdk/openai`)

### Market Data APIs
-   CoinGecko API
-   Yahoo Finance
-   Dexscreener API
-   QuickChart.io
-   Helius API
-   Alchemy API
-   Alpha Vantage

### Database & Storage
-   PostgreSQL (`@mastra/pg`)

### Infrastructure & Deployment
-   Inngest (`inngest`, `@mastra/inngest`)
-   Stripe
-   Coinbase Commerce

### Messaging Platform
-   Telegram Bot API

### Technical Analysis Libraries
-   `technicalindicators`

### Supporting Libraries
-   `axios`
-   `zod`
-   React 19
-   Vite 7