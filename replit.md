# DarkWave-V2 Technical Analysis Bot

## Overview

DarkWave-V2 is an advanced technical analysis bot built with the Mastra framework that provides comprehensive cryptocurrency, stock market, and NFT analysis. The system integrates with Telegram to deliver real-time buy/sell signals based on proven technical indicators including RSI, MACD, moving averages, Bollinger Bands, and volume analysis.

The application uses a workflow-based architecture to process user messages through an AI agent that has access to specialized market analysis tools. It maintains conversation history and user watchlists using PostgreSQL storage, enabling personalized and context-aware interactions.

**New in v2.1**: DEX pair and meme coin support via Dexscreener integration with specialized rug-risk detection, liquidity scoring, and visual price charts.

**New in v2.2**: NFT collection analysis with curated database of popular collections (BAYC, Azuki, Pudgy Penguins, DeGods, Milady, Lil Pudgys). Supports search by collection name or contract address. Educational glossary expanded with 8 NFT-specific terms (Floor Price, Mint, Reveal, Utility, Royalties, Trait Rarity, Allowlist, Bluechip NFT).

**New in v2.3**: Live trending carousel with auto-scroll animation showing real-time prices and 24h changes for all categories. Fetches live data from CoinGecko (crypto) and Dexscreener (DEX pairs) with 5-minute browser caching to minimize API calls. Supports 10-20 users with 100+ daily loads under free API tier limits.

**New in v2.4**: Database-backed session management with PostgreSQL storage (30-day expiry). Tracked wallets feature (read-only, up to 5 wallets per user) with multi-chain support (Solana, Ethereum, Polygon, Arbitrum, Base, BSC). Automatic balance fetching via Helius API (Solana) and Alchemy free API (EVM chains).

**New in v2.5**: Comprehensive subscription notification system and admin dashboard. When users subscribe via Stripe, admin receives instant notifications via Telegram (formatted alerts) and Email (HTML formatted with revenue tracking). Admin dashboard at /admin provides real-time subscriber metrics, whitelist management, and revenue tracking. All admin actions are logged for security and traceability.

**New in v2.6**: Professional token submission system with comprehensive project presentation capabilities. Projects can submit tokens with social media links (website, Twitter/X, Telegram, Discord), upload documents (whitepaper, tokenomics, audit reports), and display trust indicators (doxxed team, locked liquidity). Admin approval workflow with robust three-layer file validation prevents XSS/injection attacks by verifying data URI format, decoding base64 payloads, and checking magic bytes to ensure file signatures match declared MIME types (prevents HTML/JS disguised as PDFs). Size limits: 2MB for logos, 5MB for PDFs. Production-ready security implementation.

**New in v2.7**: Cryptocurrency payment integration via Coinbase Commerce. Users can now pay with Bitcoin, Ethereum, USDC, Litecoin, Dogecoin, and Bitcoin Cash as an alternative to credit cards. Crypto payments grant 30-day premium access (no auto-renew). Webhook signature verification (HMAC-SHA256) prevents fraudulent payment confirmations. Admin receives Telegram notifications for both Stripe and crypto payments. 1% Coinbase Commerce transaction fee vs 2.9% + $0.30 Stripe fee.

**New in v2.8**: Crypto Cat mascot integration - toggleable grumpy crypto guru with varied personality, body language, and sarcastic commentary. Appears in glossary term tooltips (20+ terms with custom quotes and poses like "*flipping middle finger up*", "*slow clapping*", "*face-palming*") and feature banners. Fully integrated with app state management and localStorage persistence. Users can toggle Crypto Cat on/off in Settings. Represents CryptoCat House branding with authentic personality from the "school of hard knocks."

**New in v2.9**: Token Launchpad "Launching Soon" section with real countdown timer to December 25, 2025 (DarkWave token launch date). Features include: live countdown display (days/hours/mins/secs), whitelist signup system with modal forms, launch card UI with neon gradient borders and shimmer animations, premium-gated whitelist access, integration with existing payment systems (Stripe + Coinbase Commerce). Database schema includes tokenLaunches and launchWhitelist tables for future backend implementation. Christmas 2025 target for full DarkWave token presale and Raydium liquidity pool launch.

**ROADMAP - DarkWave Token Launch (Dec 25, 2025)**:
- **Phase 1 (Now - Dec 15)**: Whitelist collection, community building, Crypto Cat hype campaigns
- **Phase 2 (Dec 15-24)**: Presale period via integrated payment systems, raise capital for liquidity
- **Phase 3 (Dec 25)**: Official token launch on Raydium DEX with instant liquidity pool, listing on Jupiter aggregator
- **Liquidity Strategy**: Use presale funds to create Raydium pool (recommended 10-20 SOL + equivalent DWLP tokens for stable liquidity)
- **Backend TODO**: API endpoints for whitelist/purchase processing, admin dashboard for launch management, real-time allocation tracking, webhook integration for payment confirmation

**Security Note**: Current implementation uses browser-generated unique user IDs for session isolation. For production Telegram Mini App deployment, implement Telegram initData HMAC-SHA256 signature validation to cryptographically verify user identity and prevent ID spoofing. Admin dashboard protected by ADMIN_ACCESS_CODE environment variable. File upload validation uses three-layer security: data URI parsing, base64 decoding with size verification, and magic byte signature checking to prevent malicious file uploads.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Agent Framework (Mastra Core)
The application is built on Mastra, a TypeScript agent framework that provides primitives for building AI applications. Key architectural decisions include:

- **Agent-based architecture**: Uses the `Agent` class from `@mastra/core` to create an AI assistant (DarkWave-V2) that can call tools, maintain memory, and process natural language requests
- **Workflow orchestration**: Implements `createWorkflow` and `createStep` from Mastra to create deterministic execution flows for processing Telegram messages
- **Tool system**: Modular tools (`createTool`) encapsulate specific functionality (market data fetching, technical analysis, holdings management, market scanning) with typed inputs/outputs using Zod schemas
- **Memory persistence**: Leverages `@mastra/memory` with `PostgresStore` to maintain conversation context and user data across sessions

**Rationale**: The agent framework provides a structured way to combine LLMs with domain-specific tools while maintaining type safety and enabling complex multi-step workflows. This separates concerns between AI decision-making and deterministic business logic.

### Language Model Integration
- **OpenAI via Replit AI Integrations**: Uses `@ai-sdk/openai` with custom base URL and API key from Replit's AI integrations
- **Model selection**: GPT-4o-mini for cost-effective analysis while maintaining quality
- **AI SDK version**: Uses `generateLegacy` method for compatibility with AI SDK v4

**Rationale**: Replit AI Integrations provides managed access to OpenAI models without requiring separate API keys. The legacy generate method ensures compatibility during the AI SDK transition period.

### Tool Architecture

The system implements eight specialized tools:

1. **Market Data Tool**: Fetches historical OHLCV data from free APIs (CoinGecko for crypto, Yahoo Finance for stocks)
2. **Technical Analysis Tool**: Calculates technical indicators using the `technicalindicators` library (RSI, MACD, EMAs, SMAs, Bollinger Bands)
3. **Holdings Tool**: Manages user watchlists with add/remove/list/clear operations
4. **Scanner Tool**: Scans top assets and filters for strong buy signals
5. **Chart Generator Tool**: Creates visual price charts with EMA overlays using QuickChart.io (free, no API key)
6. **Dexscreener Tool**: Searches DEX pairs for meme coins and new tokens across all chains (Solana, Ethereum, Base, BSC, etc.)
7. **DEX Analysis Tool**: Specialized technical analysis for high-volatility DEX pairs with rug-risk detection and liquidity scoring
8. **NFT Tool**: Analyzes NFT collections with curated database of 6 popular collections (BAYC, Azuki, Pudgy Penguins, DeGods, Milady, Lil Pudgys). Supports search by name or contract address. Displays floor price, volume, market cap, owners, listings, and sales data. Zero API costs.

**Design pattern**: Each tool follows a consistent structure with:
- Zod schemas for input/output validation
- Clear descriptions for the AI agent to understand when to use them
- Logging integration for observability
- Error handling with graceful degradation

**Rationale**: Separating functionality into discrete tools makes the system modular, testable, and allows the AI agent to compose complex analyses by chaining tool calls. Type-safe schemas prevent runtime errors.

### Workflow Design

The `darkwaveWorkflow` implements a single-step workflow that:
1. Receives Telegram messages with user context
2. Invokes the DarkWave-V2 agent with conversation history
3. Returns formatted analysis responses

**Alternative considered**: Multi-step workflows with explicit tool orchestration, but rejected in favor of letting the agent autonomously decide which tools to use based on the user's request.

**Pros**: Flexibility and natural language interaction
**Cons**: Less deterministic execution path

### Message Processing Pipeline

Telegram webhooks → Inngest workflow → Mastra agent → Tools → Response formatting

- **Inngest integration** (`@mastra/inngest`): Provides event-driven workflow execution with built-in retry logic and step memoization
- **API routes**: Custom route registration system that bridges HTTP endpoints to Inngest events

**Rationale**: Inngest provides infrastructure for reliable background job processing, automatic retries, and observability without managing queues or workers. The integration with Mastra workflows creates a unified development experience.

### Type Safety & Validation

- **TypeScript**: Strict mode enabled with ES2022 target
- **Zod schemas**: Runtime validation for all tool inputs/outputs and workflow data
- **Module resolution**: Bundler strategy for modern ESM compatibility

**Rationale**: Type safety catches errors at compile time and provides better IDE support. Zod bridges the gap between TypeScript's compile-time types and runtime validation, essential for validating external data from APIs and user input.

### Logging & Observability

- **Pino logger** (`@mastra/loggers`): Structured JSON logging with custom formatters
- **Log levels**: Debug, info, warn, error with production-optimized configuration
- **Trace context**: Logs include relevant context (ticker symbols, user IDs, operation types)

**Rationale**: Pino is one of the fastest Node.js loggers and structured JSON logs enable better parsing and querying in production environments.

## External Dependencies

### AI & LLM Services
- **OpenAI GPT-4o-mini**: Via Replit AI Integrations for natural language understanding and generation
- **Vercel AI SDK** (`ai`, `@ai-sdk/openai`): Unified interface for LLM interactions with streaming support

### Market Data APIs
- **CoinGecko API**: Free cryptocurrency market data (prices, volume, market cap)
- **Yahoo Finance (via axios)**: Free stock market data and historical prices
- **Dexscreener API**: Free DEX pair data with 300 requests/minute limit (no API key required)
- **QuickChart.io**: Free Chart.js image generation for price charts with technical indicators
- **Rate limiting**: Scanner tool limited to top 20 assets per scan to respect free tier limits

### Database & Storage
- **PostgreSQL** (`@mastra/pg`): Primary database for conversation memory, user holdings, and workflow state
- **Connection string**: Configurable via `DATABASE_URL` environment variable (defaults to localhost)
- **Shared storage pattern**: Single `PostgresStore` instance reused across agents and workflows

**Note**: The application references PostgreSQL storage but may need explicit Postgres setup in deployment environments.

### Infrastructure & Deployment
- **Inngest** (`inngest`, `@mastra/inngest`): Serverless workflow engine with step execution, retries, and event routing
- **Realtime middleware** (`@inngest/realtime`): Enables live workflow monitoring during development
- **Development mode**: Configured with `baseUrl: localhost:3000` and `isDev: true` flag

### Messaging Platform
- **Telegram Bot API** (`@slack/web-api` also present but unused): Webhook-based message processing
- **Environment variable**: `TELEGRAM_BOT_TOKEN` required for bot authentication

### Technical Analysis Libraries
- **technicalindicators**: Pure JavaScript library for calculating RSI, MACD, moving averages, Bollinger Bands

### Development Tools
- **tsx**: TypeScript execution for development
- **Mastra CLI** (`mastra`): Development server and build tooling
- **Prettier**: Code formatting
- **dotenv**: Environment variable management

### Supporting Libraries
- **axios**: HTTP client for API requests
- **zod**: Schema validation and type inference
- **exa-js**: Purpose unclear from repository context