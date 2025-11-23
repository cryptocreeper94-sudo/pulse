# DarkWave-V2 Technical Analysis Bot

## Overview - PREDICTIVE TRADING PLATFORM
**DarkWave Pulse** is a predictive trading platform serving both degens and professionals. Built on Mastra AI framework with predictive signals and institutional-grade technical analysis for cryptocurrency and stocks. 

**Mission**: Your Trading Advantage - AI-powered signals to catch trends before they explode (degen appeal) + institutional-grade risk-adjusted analytics (pro appeal).

**Key Capabilities**:
- Predictive trading signals across crypto & stocks
- Real-time technical analysis with advanced indicators
- Dual-mode UI: Degen Mode (hype/trend-focused) + Pro Mode (institutional metrics)
- DEX pair analysis with rug-risk detection
- Multi-chain wallet tracking
- Telegram bot integration
- Cryptocurrency payment processing (Coinbase Commerce)
- Community ecosystem: 16 AI personas (Avatar King) + 20 NFT Trading Cards

**V2 Launch**: December 25, 2025 with dual-mode UI for market positioning.

## User Preferences
- User name: Jason
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"

## Latest Updates (Nov 23, 2025)
- **Banner + Subtitle System COMPLETE**: "Predictive Signals. Complete Ecosystem. Maximum Edge."
  - Dual-positioning mission statement encapsulates entire ecosystem vision (launchpad, wallet, marketplace, staking)
  - Degens hear: Early signals, opportunity pipeline, complete trading ecosystem
  - Pros hear: Predictive advantage, infrastructure, risk management
  - **Visual Implementation**:
    - Title: "DARKWAVE PULSE" (uppercase monospace, 2.2rem, white, right-aligned)
    - Subtitle: "Predictive Signals. Complete Ecosystem. Maximum Edge." (0.75rem, 75% opacity, monospace, right-aligned)
    - Both on right 50% of banner with frosted blur overlay
    - Left 50%: Neon candlesticks scrolling infinitely in 60-second cycle
    - Auto-switches dark/light theme (banner-dark.png / banner-light.png)
  - Ready for social media ad variations (degen vs pro angles)
  
- **Strategic Rebrand - Predictive Trading Platform**: Ecosystem + Signals + Edge
  - Next phase: Degen/Pro mode toggle in Settings (presentation layer only, no duplication)
  - Avatar King & Crypto Cat remain core (unchanged)

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