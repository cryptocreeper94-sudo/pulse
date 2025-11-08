# DarkWave-V2 Technical Analysis Bot

## Overview
DarkWave-V2 is an advanced technical analysis bot built with the Mastra framework, providing comprehensive cryptocurrency, stock market, and NFT analysis. It integrates with Telegram to deliver real-time buy/sell signals based on technical indicators like RSI, MACD, moving averages, and Bollinger Bands. The system uses a workflow-based architecture, processes user messages via an AI agent, and stores conversation history and user watchlists in PostgreSQL for personalized interactions. Key features include DEX pair and meme coin support with rug-risk detection, NFT collection analysis, a live trending carousel, database-backed session management, and multi-chain wallet tracking. It also incorporates a comprehensive subscription notification system with an admin dashboard, a professional token submission system with robust validation, and cryptocurrency payment integration via Coinbase Commerce. A unique "Crypto Cat" mascot provides interactive commentary, and a "Launching Soon" section with a countdown and presale platform design for the DarkWave token (DWLP) is included. The project aims to launch the DarkWave token on December 25, 2025, with a whitepaper outlining its mission, tokenomics, utility, and roadmap.

## Recent Changes (November 2025)
- **Crypto.com-Style Design Overhaul**: Complete UI redesign with premium multi-dimensional aesthetic
  - Solid dark navy backgrounds (#0A0E27, #1A1F3A) replacing gradients for clean professional look
  - Three-column responsive grid system for sophisticated staggered layouts
  - Depth system with elevated cards, recessed panels, box shadows, and inset glows
  - Angular dividers with geometric accent elements
  - Strategic use of emojis for visual interest without excess
- **Visual Content Integration**: 5 crypto/finance stock images downloaded and integrated throughout interface
- **News Headlines Section**: Live market headlines interspersed in three-column layout with depth styling
- **Affiliate Monetization**: Exchange partner section with Kraken, Coinbase, and Binance affiliate links
- **Enhanced Color Scheme**: Electric blue (#3B82F6, #60A5FA) accents with gold (#FBBF24) and purple (#8B5CF6) highlights
- **3-Tier Pricing System**: Implemented Free Trial (7 days, 20 searches/day), Basic ($2/mo, 20 searches/day), Premium ($5/mo, unlimited)
- **Dual Access Methods**: Users can enter "lucky 777" for free trial OR whitelisted email for instant premium access
- **Multi-Theme System**: Added Jupiter (DeFi Dark), Robinhood (Clean Light), and Coinbase (Professional Blue) themes with localStorage persistence
- **Projects Page Category System**: Reorganized with four distinct sections (Crypto Cat Series, Conspiracy Themed, Religious/Spiritual, Community Projects) each with custom messaging and teasers for limited editions and future airdrops
- **Live Interactive Charts**: FREE candlestick and line charts with 7 timeframes (1M-YTD) and smart auto-refresh rates

## Future Features (Deferred)
See `FUTURE_FEATURES.md` for detailed specs on planned features:
- **TP/SL Trade Manager**: Restart-safe take profit/stop loss monitoring (requires wallet integration + testing)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Agent Framework (Mastra Core)
The application is built on Mastra, an agent framework for AI applications. It utilizes an agent-based architecture for an AI assistant (DarkWave-V2) capable of calling tools, maintaining memory, and processing natural language. Workflow orchestration is handled by `createWorkflow` and `createStep` for deterministic execution. A modular tool system (`createTool`) encapsulates specific functionalities with Zod schemas for typed inputs/outputs. Memory persistence uses `@mastra/memory` with `PostgresStore` for conversation context and user data.

### Language Model Integration
The system integrates with OpenAI's GPT-4o-mini via Replit AI Integrations for cost-effective analysis, using the `generateLegacy` method from `@ai-sdk/openai` for compatibility.

### Tool Architecture
The system employs eight specialized tools:
1.  **Market Data Tool**: Fetches historical OHLCV data from CoinGecko (crypto) and Yahoo Finance (stocks).
2.  **Technical Analysis Tool**: Calculates indicators like RSI, MACD, EMAs, SMAs, and Bollinger Bands using the `technicalindicators` library.
3.  **Holdings Tool**: Manages user watchlists.
4.  **Scanner Tool**: Scans top assets for strong buy signals.
5.  **Chart Generator Tool**: Creates visual price charts with EMA overlays via QuickChart.io.
6.  **Dexscreener Tool**: Searches DEX pairs across various chains.
7.  **DEX Analysis Tool**: Provides specialized technical analysis for DEX pairs, including rug-risk detection and liquidity scoring.
8.  **NFT Tool**: Analyzes popular NFT collections, displaying floor price, volume, market cap, and other data.
Each tool uses Zod schemas for validation, clear descriptions for AI agent use, logging, and error handling.

### Workflow Design
The `darkwaveWorkflow` is a single-step workflow that receives Telegram messages, invokes the DarkWave-V2 agent with conversation history, and returns formatted analysis responses, allowing the agent to autonomously decide tool usage.

### Message Processing Pipeline
The pipeline involves Telegram webhooks → Inngest workflow → Mastra agent → Tools → Response formatting. Inngest (`@mastra/inngest`) provides event-driven workflow execution with retry logic and step memoization.

### Type Safety & Validation
The project uses TypeScript with strict mode and ES2022 target. Zod schemas provide runtime validation for all tool inputs/outputs and workflow data.

### Logging & Observability
Pino logger (`@mastra/loggers`) is used for structured JSON logging with custom formatters, including trace context for relevant information like ticker symbols and user IDs.

### UI/UX Decisions
-   **Trending Carousel**: Auto-scrolling animation for live prices and 24h changes.
-   **Token Launchpad UI**: Launch card UI with neon gradient borders and shimmer animations.
-   **Crypto Cat Mascot**: Toggleable grumpy guru with varied personality, body language, and sarcastic commentary, appearing in glossary tooltips and feature banners. Integrated with app state management and localStorage.
-   **Category-Based Projects Page**: Token series organized by category tags (cryptoCat, conspiracy, religious, general) with dedicated sections, professional messaging, and teasers for limited editions and community airdrops. Each category has customizable title, description, and teaser fields in CATEGORY_CONFIG.

### Feature Specifications
-   **DEX Pair Support**: Dexscreener integration for rug-risk detection and liquidity scoring.
-   **NFT Collection Analysis**: Curated database of popular collections, searchable by name or contract address.
-   **Live Trending Carousel**: Fetches data from CoinGecko and Dexscreener with 5-minute browser caching.
-   **Database-backed Session Management**: 30-day expiry for user sessions.
-   **Tracked Wallets**: Read-only, multi-chain support (Solana, Ethereum, Polygon, Arbitrum, Base, BSC) with automatic balance fetching.
-   **Subscription Notification System**: Telegram and email notifications for Stripe and Coinbase Commerce payments.
-   **Admin Dashboard**: `/admin` provides subscriber metrics, whitelist management, and revenue tracking.
-   **Token Submission System**: Allows projects to submit tokens with social links, documents, and trust indicators. Features robust three-layer file validation (data URI, base64 decoding, magic bytes) for security.
-   **Cryptocurrency Payment Integration**: Coinbase Commerce for BTC, ETH, USDC, LTC, DOGE, BCH, granting 30-day premium access. Webhook signature verification for security.
-   **DarkWave Token Launchpad**: Live countdown, whitelist signup, premium-gated access, integration with existing payment systems.
-   **DarkWave Whitepaper**: Covers mission, tokenomics (100M fixed supply, 25% presale, 10% dev), utility (discounts, staking, governance), deflationary mechanisms, revenue model, presale structure, roadmap, and risk disclosures.

### System Design Choices
-   **Security**: Browser-generated unique user IDs for session isolation. Admin dashboard protected by `ADMIN_ACCESS_CODE`. File upload validation with three-layer security (data URI parsing, base64 decoding, magic byte signature checking).
-   **Access Control**: Dual-method access system supporting both access code ("lucky 777" for 7-day free trial) and email whitelist (for permanent premium access). Whitelisted emails automatically grant permanent premium access when entered at login - no expiration unless manually removed from whitelist.
-   **Pricing Model**: Three tiers - Free Trial (7 days, 20 searches/day), Basic ($2/mo, 20 searches/day unlimited time), Premium ($5/mo, unlimited everything). After trial expires, users must upgrade to Basic or Premium.
-   **Performance**: 5-minute browser caching for live data to minimize API calls.

## External Dependencies

### AI & LLM Services
-   **OpenAI GPT-4o-mini**: Accessed via Replit AI Integrations.
-   **Vercel AI SDK** (`ai`, `@ai-sdk/openai`): Unified interface for LLM interactions.

### Market Data APIs
-   **CoinGecko API**: Free cryptocurrency market data.
-   **Yahoo Finance (via axios)**: Free stock market data.
-   **Dexscreener API**: Free DEX pair data (300 requests/minute limit).
-   **QuickChart.io**: Free Chart.js image generation for price charts.
-   **Helius API**: For Solana wallet balance fetching.
-   **Alchemy API**: For EVM chain wallet balance fetching.

### Database & Storage
-   **PostgreSQL** (`@mastra/pg`): Primary database for conversation memory, user holdings, and workflow state.

### Infrastructure & Deployment
-   **Inngest** (`inngest`, `@mastra/inngest`): Serverless workflow engine.
-   **Stripe**: For subscription payments.
-   **Coinbase Commerce**: For cryptocurrency payments.

### Messaging Platform
-   **Telegram Bot API**: For webhook-based message processing (requires `TELEGRAM_BOT_TOKEN`).

### Technical Analysis Libraries
-   **technicalindicators**: For calculating various technical indicators.

### Supporting Libraries
-   **axios**: HTTP client.
-   **zod**: Schema validation.