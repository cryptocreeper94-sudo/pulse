# DarkWave-V2 Technical Analysis Bot

## Overview
DarkWave-V2 is an advanced technical analysis bot built with the Mastra framework, designed for comprehensive cryptocurrency, stock market, and NFT analysis. It integrates with Telegram to provide real-time buy/sell signals based on technical indicators. Key capabilities include DEX pair and meme coin support with rug-risk detection, NFT collection analysis, a live trending carousel, database-backed session management, and multi-chain wallet tracking. The system also features a subscription notification system, a professional token submission system, and cryptocurrency payment integration via Coinbase Commerce. A "Crypto Cat" mascot provides interactive commentary. The project aims to launch the DarkWave (DWLP) token with a detailed whitepaper outlining its mission, tokenomics, utility, and roadmap.

## User Preferences
- User name: Jason
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"

## Latest Updates (Nov 23, 2025)
- **Banner System Complete**: Professional seamless-looping banners with neon candlestick design
  - Dark banner: `banner-dark.png` (black background with neon candlesticks/waveforms)
  - Light banner: `banner-light.png` (gray background with same design)
  - Auto-switches based on theme selection
  - Shows 4 panels per screen width for optimal visibility
  - No animation - uses CSS background-repeat for seamless tile
  - **Fixed z-index layering** - removed Market Cap/Volume blob overlap
  - **Title Section Integrated**: "DARKWAVE PULSE" on right half with frosted overlay
    - Large modern technical font (monospace, 2.2rem, uppercase)
    - Right-aligned on right 50% of banner (stationary)
    - Heavy blur + dark overlay (backdrop-filter: blur(8px)) for clean presentation
  - **Infinite Scrolling Animation**: 60-second smooth cycle
    - Left 50% shows scrolling neon candlesticks in continuous loop
    - Seamless tiling with background-repeat: repeat-x
  - Subtext placeholder ready for addition

## System Architecture

### Frontend
The frontend is built with React 19 and Vite 7, loading external utility scripts (CSS, themes, gauges, chart managers) from the public directory. It provides a modern user interface with a CoinMarketCap-style market overview, a 9-column data table, and 7 distinct category tabs. The design incorporates a Crypto.com-style aesthetic with dark navy backgrounds, a three-column responsive grid, elevated cards, and angular dividers.

The application features a personalized 9-theme system with organic CSS gradient patterns, maintaining layout consistency while changing color schemes. The Crypto Cat mascot is toggleable, offering varied personality and commentary. A banner system is used across pages.

### Backend and AI Agent
The core AI agent, DarkWave-V2, is powered by the Mastra framework, enabling tool calling, memory management, and natural language processing. Workflow orchestration uses `createWorkflow` and `createStep` for deterministic execution. A modular tool system (`createTool`) with Zod schemas encapsulates specific functionalities like Market Data, Technical Analysis, Holdings, Scanner, Chart Generation, Dexscreener, DEX Analysis (including rug-risk detection), and NFT Tool.

### Language Model Integration
The system integrates with OpenAI's GPT-4o-mini via Replit AI Integrations using the `generateLegacy` method from `@ai-sdk/openai`.

### Data Flow
The message processing pipeline involves Telegram webhooks, Inngest for event-driven workflow execution, the Mastra agent, and subsequent response formatting.

### Technical Implementation
The project utilizes TypeScript with strict mode and ES2022. Zod schemas provide runtime validation for all tool inputs/outputs. Pino logger is used for structured JSON logging. Security features include browser-generated unique user IDs, an admin dashboard, and robust file upload validation. Access control supports both an access code and an email whitelist, with pricing tiers including Free Trial, Basic, and Premium. Live data performance is optimized with 5-minute browser caching.

### Feature Specifications
Key features include DEX pair support with rug-risk detection and liquidity scoring, NFT collection analysis, a live trending carousel, and database-backed session management. It supports tracked, multi-chain wallets (Solana, Ethereum, Polygon, Arbitrum, Base, BSC). The system includes a subscription notification system, an admin dashboard, a professional token submission system with three-layer file validation, and cryptocurrency payments via Coinbase Commerce. A DarkWave Token Launchpad provides a live countdown, whitelist signup, and premium-gated access. A "Bot Detection System" is implemented for DEX pair rug risk analysis.

### UI/UX Decisions
The UI features a CoinMarketCap-style market overview with a 9-column data table and 7 distinct category tabs. It incorporates a Crypto.com-style design overhaul with dark navy backgrounds, a three-column responsive grid, elevated cards, and angular dividers. An enhanced color scheme uses electric blue accents with gold and purple highlights. A personalized 9-theme system offers subtle organic CSS gradient patterns. The Crypto Cat mascot provides toggleable, sarcastic commentary. The system enforces consistent box sizing, margins, padding, and font sizes across the UI for a low-profile, compact design, favoring double-column layouts.

## External Dependencies

### AI & LLM Services
-   OpenAI GPT-4o-mini (via Replit AI Integrations)
-   Vercel AI SDK (`ai`, `@ai-sdk/openai`)

### Market Data APIs
-   CoinGecko API
-   Yahoo Finance
-   Dexscreener API
-   QuickChart.io
-   Helius API (for Solana wallet balance)
-   Alchemy API (for EVM chain wallet balance)
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