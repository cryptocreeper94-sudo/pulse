# DarkWave-V2 Technical Analysis Bot

## Overview
DarkWave-V2 is an advanced technical analysis bot built with the Mastra framework, offering comprehensive cryptocurrency, stock market, and NFT analysis. It integrates with Telegram to deliver real-time buy/sell signals based on technical indicators. The system features DEX pair and meme coin support with rug-risk detection, NFT collection analysis, a live trending carousel, database-backed session management, and multi-chain wallet tracking. It also includes a subscription notification system, a professional token submission system, and cryptocurrency payment integration via Coinbase Commerce. A "Crypto Cat" mascot provides interactive commentary. The project aims to launch the DarkWave (DWLP) token on December 25, 2025, with a whitepaper detailing its mission, tokenomics, utility, and roadmap.

## User Preferences
- User name: Jason
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"

## Recent Changes (November 23, 2025 - Build Session)
- **React/Vite Migration Completed**: Frontend migrated from vanilla JavaScript to React + Vite framework
- **Full App Restoration**: All 40+ public JavaScript files, CSS, and assets recovered from git history
- **Hybrid Architecture**: Mastra backend (port 3001) + React frontend (port 5000) running concurrently
- **Vite Proxy Setup**: Frontend proxies `/api` requests to Mastra backend on port 3001
- **Dev Server**: Single `run-dev.sh` script starts both services with proper port configuration
- **Mobile Responsive Fixes**:
  - Metric boxes: Increased height and spacing for better mobile display
  - Metric values: Repositioned above gauges for F&G/ALT, centered for Market Cap/Volume
  - Font sizes: Larger on mobile (13-16px) for readability
  - Proper alignment: Values now positioned at `top: 18-22px` depending on box type
- **Banner Restored**: Simple CSS scrolling background image (banner-scroll.jpg) with candlesticks/waveforms and centered title overlay—clean and working perfectly
- **Avatar King Launch**: 16-agent selector system fully implemented for Twitter marketing
  - 👤 Button added to top navigation
  - Agent modal displays all 16 diverse AI agents (Sofia, Luis, Marco, Jade, Layla, Blake, Devon, Aria, Mei, Claire, Vikram, Zara, Marco, Jade, Luis, Kaia)
  - Agent profiles include title, career highlight, and fun fact for each persona
  - Persistent agent selection via localStorage
  - System initialized on page load for seamless UX
- **NFT Trading Cards System Implemented** (V2 Feature - Locked Until Dec 25):
  - 🎴 **20 Collectible Agent Trading Cards** - 10 male + 10 female across 5 race categories (Asian, Caucasian, African American, Latino, Mixed)
  - **2.5D Professional Renders** - Transparent backgrounds, DarkWave emblem on jacket breast pocket, studio lighting
  - **Unique Refractor Colors** - 20 distinct holographic color gradients (Neon Cyan, Electric Gold, Crimson Flame, etc.)
  - **Career Stats & Fun Facts** - Interesting, funny, and collectible with serialized IDs and hallmark system
  - **Trading Card Carousel UI** - Full-featured carousel with navigation, info boxes, and dot indicators on Projects page
  - **QR Code Profile Pages** - Each card generates scannable QR codes linking to individual agent profile pages
  - **V2 Lock System** - Carousel shows "LOCKED" state with 32-day countdown until Dec 25; admin can unlock for testing
  - **Hair Variations** - Caucasians with red, blonde, brown, black; males include bald options; all race-appropriate
  - **Ages Mixed** - Some agents show "UNKNOWN" age, others with specific ages (27-50 range) for personality
- **App Status**: Fully functional with all features restored (gauges, charts, Agent System, Avatar King, Trading Cards, navigation tabs, themes)
- **Visual Theme**: Currently using Pro Blue (dark) theme with wave watermark; 9-theme system fully functional

## System Architecture

### Frontend Framework (React + Vite)
The DarkWave Pulse frontend is built with React 19 and Vite 7, providing a modern development experience with hot module replacement and optimized builds. The application loads external utility scripts (CSS, themes, gauges, chart managers, etc.) from the public directory as window objects, maintaining compatibility with existing vanilla JavaScript modules while leveraging React's component model.

### Agent Framework (Mastra Core)
The application uses the Mastra framework for an AI agent (DarkWave-V2) capable of calling tools, maintaining memory, and processing natural language. Workflow orchestration is handled by `createWorkflow` and `createStep` for deterministic execution. A modular tool system (`createTool`) encapsulates specific functionalities with Zod schemas for typed inputs/outputs. Memory persistence uses `@mastra/memory` with `PostgresStore` for conversation context and user data.

### Language Model Integration
The system integrates with OpenAI's GPT-4o-mini via Replit AI Integrations using the `generateLegacy` method from `@ai-sdk/openai`.

### Tool Architecture
The system employs eight specialized tools: Market Data, Technical Analysis, Holdings, Scanner, Chart Generator, Dexscreener, DEX Analysis (including rug-risk detection), and NFT Tool. Each tool uses Zod schemas for validation, clear descriptions for AI agent use, logging, and error handling.

### Workflow Design
The `darkwaveWorkflow` processes Telegram messages, invokes the DarkWave-V2 agent with conversation history, and returns formatted analysis responses, allowing the agent to autonomously decide tool usage.

### Message Processing Pipeline
The pipeline involves Telegram webhooks → Inngest workflow → Mastra agent → Tools → Response formatting. Inngest (`@mastra/inngest`) provides event-driven workflow execution with retry logic.

### Type Safety & Validation
The project uses TypeScript with strict mode and ES2022 target. Zod schemas provide runtime validation for all tool inputs/outputs and workflow data.

### Logging & Observability
Pino logger (`@mastra/loggers`) is used for structured JSON logging with custom formatters, including trace context.

### UI/UX Decisions
The UI features a CoinMarketCap-style market overview with a 9-column data table and 7 distinct category tabs. It incorporates a Crypto.com-style design overhaul with dark navy backgrounds, a three-column responsive grid, elevated cards, and angular dividers. Visual content integration includes stock images and a live news headlines section. An enhanced color scheme uses electric blue accents with gold and purple highlights. 

**Personalized 9-Theme System:** The application includes a sophisticated theme system with subtle organic CSS gradient patterns (watermark-style backgrounds) for personalization:
- **Default Themes (3):** Electric Night (blue), Clean Green (light), Pro Blue (dark)
- **Feminine Themes (2):** Cherry Blossom (soft pink flow), Pastel Dreams (lavender/mint blend)
- **Masculine Themes (2):** Cyber Glitch (matrix green grid), Neon Grid (electric pink geometric)
- **Neutral Themes (2):** Ocean Waves (teal flow), Galaxy (cosmic purple with stars)

Each theme uses ::before pseudo-elements with low-opacity radial/linear gradients mixed with whites for natural depth without interfering with content readability. The system maintains the same layout across all themes while changing color schemes and background patterns.

The Crypto Cat mascot is toggleable with varied personality, body language, and sarcastic first-person commentary in console logs, glossary tooltips, and feature banners. Banner system: sound wave banner on all pages except Glossary, which displays "Good, I was bored anyway" Crypto Cat image. Projects are organized into category-based pages.

### Feature Specifications
Key features include DEX pair support with rug-risk detection and liquidity scoring, NFT collection analysis, a live trending carousel, and database-backed session management. It supports tracked, multi-chain wallets (Solana, Ethereum, Polygon, Arbitrum, Base, BSC). A subscription notification system, admin dashboard, and a professional token submission system with robust three-layer file validation are implemented. Cryptocurrency payments are integrated via Coinbase Commerce. A DarkWave Token Launchpad features a live countdown, whitelist signup, and premium-gated access. The system also includes a "Bot Detection System" for DEX pair rug risk analysis.

### System Design Choices
Security is addressed with browser-generated unique user IDs and an admin dashboard protected by an `ADMIN_ACCESS_CODE`. File upload validation employs data URI parsing, base64 decoding, and magic byte signature checking. Access control is managed through a dual-method system supporting an access code ("lucky 777" for free trial) and an email whitelist for premium access. The pricing model includes Free Trial, Basic, and Premium tiers. Performance is optimized with 5-minute browser caching for live data.

## External Dependencies

### AI & LLM Services
-   OpenAI GPT-4o-mini (via Replit AI Integrations)
-   Vercel AI SDK (`ai`, `@ai-sdk/openai`)

### Market Data APIs
-   CoinGecko API
-   Yahoo Finance (via axios)
-   Dexscreener API
-   QuickChart.io
-   Helius API (for Solana wallet balance)
-   Alchemy API (for EVM chain wallet balance)
-   Alpha Vantage (fallback for stock data)

### Database & Storage
-   PostgreSQL (`@mastra/pg`)

### Infrastructure & Deployment
-   Inngest (`inngest`, `@mastra/inngest`)
-   Stripe
-   Coinbase Commerce

### Messaging Platform
-   Telegram Bot API

### Technical Analysis Libraries
-   technicalindicators

### Supporting Libraries
-   axios
-   zod
-   React 19
-   Vite 7

## Workflow Configuration

### Start application (Port 5000)
Runs `./run-dev.sh` which:
1. Starts Mastra backend on port 3001 with `-p 3001` flag
2. Waits 3 seconds for backend initialization
3. Starts Vite dev server on port 5000 in darkwave-web directory
4. Vite proxies `/api/*` requests to `http://localhost:3001`

The frontend displays on port 5000; backend API available internally on port 3001.

## Project Structure
```
/home/runner/workspace/
├── run-dev.sh                 # Unified dev server script
├── src/                       # Mastra backend source (TypeScript)
│   └── mastra/               # Agent framework, tools, workflows
├── darkwave-web/             # React frontend application
│   ├── src/                  # React components
│   │   ├── App.jsx          # Main React component
│   │   ├── main.jsx         # Entry point
│   │   └── *.css            # Styling
│   ├── public/               # Static assets loaded as window objects
│   │   ├── styles.css       # Global styles
│   │   ├── themes-config.js # Theme definitions
│   │   ├── app.js           # Main app initialization
│   │   ├── gauges-clean.js  # Fear & Greed, Altcoin Season gauges
│   │   ├── chartIndicatorManager.js # Chart functionality
│   │   ├── agent-cards.js   # Agent Series avatars
│   │   └── [25+ other utility files]
│   ├── index.html           # Vite entry HTML
│   ├── vite.config.js       # Vite configuration with API proxy
│   └── package.json         # React dependencies (React 19, Vite 7)
└── package.json             # Root dependencies (Mastra, AI SDK, etc.)