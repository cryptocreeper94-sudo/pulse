# DarkWave-V2 Technical Analysis Bot

## Overview

DarkWave-V2 is an advanced technical analysis bot built with the Mastra framework that provides comprehensive cryptocurrency and stock market analysis. The system integrates with Telegram to deliver real-time buy/sell signals based on proven technical indicators including RSI, MACD, moving averages, Bollinger Bands, and volume analysis.

The application uses a workflow-based architecture to process user messages through an AI agent that has access to specialized market analysis tools. It maintains conversation history and user watchlists using PostgreSQL storage, enabling personalized and context-aware interactions.

**New in v2.1**: DEX pair and meme coin support via Dexscreener integration with specialized rug-risk detection, liquidity scoring, and visual price charts.

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

The system implements seven specialized tools:

1. **Market Data Tool**: Fetches historical OHLCV data from free APIs (CoinGecko for crypto, Yahoo Finance for stocks)
2. **Technical Analysis Tool**: Calculates technical indicators using the `technicalindicators` library (RSI, MACD, EMAs, SMAs, Bollinger Bands)
3. **Holdings Tool**: Manages user watchlists with add/remove/list/clear operations
4. **Scanner Tool**: Scans top assets and filters for strong buy signals
5. **Chart Generator Tool**: Creates visual price charts with EMA overlays using QuickChart.io (free, no API key)
6. **Dexscreener Tool**: Searches DEX pairs for meme coins and new tokens across all chains (Solana, Ethereum, Base, BSC, etc.)
7. **DEX Analysis Tool**: Specialized technical analysis for high-volatility DEX pairs with rug-risk detection and liquidity scoring

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