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
- Community ecosystem: 18 AI personas (Avatar King expanded) + 20 NFT Trading Cards

**V2 Launch**: December 25, 2025 with dual-mode UI for market positioning.

## User Preferences
- User name: Jason
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"

## Latest Updates (Nov 23, 2025) - AGENT CAROUSEL + EXPO MOBILE SETUP

- **✅ COMPACT AGENT SELECTOR CAROUSEL - SUBSCRIPTION GATED**:
  - **Age Filtering**: All 18 agents now have age properties with 3 categories:
    - Young (20-30): 5 agents (Alex, Sofia, Aria, Mei, Zara, Luis, Nova)
    - Middle (35-55): 7 agents (Marcus, Raj, Devon, Vikram, Jade, Marco, Kai)
    - Senior (55+): 4 agents (Blake, Layla, Claire, Kaia)
  - **Compact Carousel UI**: Scrollable agent cards with hover effects
    - Left/right nav buttons for easy browsing
    - Only 3-4 agents visible at once (mobile-first design)
    - Smooth scroll animation between agents
    - Dot indicators show carousel position
  - **Subscription Gating**: 
    - Checks `isPaid` from user access level
    - Locked state shows: "🔒 Premium Feature - Choose from 18 AI agents"
    - Paid users see full carousel with age filters (All/Young/Middle/Senior)
  - **Mobile & Web Ready**: 
    - Vanilla JS version for current web app
    - React component version (`AgentSelector.jsx`) for full React integration
    - Both versions share same logic and styling
  
- **✅ EXPO CONFIGURATION FOR GOOGLE PLAY STORE**:
  - Created `app.json` - Expo app manifest with:
    - App name: "DarkWave Pulse"
    - Bundle ID: com.darkwave.pulse
    - Android package: com.darkwave.pulse
    - Permissions: INTERNET, CAMERA
    - Min SDK: 24
    - EAS Build integration ready
  - Created `eas.json` - Build configuration for:
    - Preview builds (APK for testing)
    - Production builds (AAB for Play Store)
    - Submission configuration for Google Play
  - App ready to build with: `eas build --platform android --local`

## Previous Latest Updates (Nov 23, 2025) - PROJECTS PAGE REVAMP + MOBILE-FIRST DESIGN

- **✅ PROJECTS PAGE FULLY COMPRESSED + MOBILE FRIENDLY**:
  - **Layout Compression**: All spacing reduced dramatically for dense, efficient layout
    - Section boxes: margin reduced from 4px to 2px, padding from 4px to 2px
    - Coming-soon cards: padding reduced from 20px to 12px, gaps from 16-20px to 8-10px
    - Card images: max-width reduced from 200px to 140px
    - Font sizes: titles 20px→14px, subtitles 16px→11px, descriptions 13px→11px
  - **Menu Fixed**: Navigation bar no longer overflows
    - Nav buttons changed from flex:1 to flex:0 0 auto for proper sizing
    - Padding reduced from 12px 20px to 10px 14px
    - Mobile breakpoint: 8px 10px padding, font-size 11px
    - Gaps tightened for pixel-perfect alignment
  - **Mobile Responsive**: All components scale beautifully on phones
    - Featured coin cards: horizontal scroll on mobile → 6-column grid on desktop
    - Coming-soon cards: 1 column mobile → 2 columns desktop
    - All grids single-column by default, auto-layout on larger screens
    - Touch-friendly spacing maintained for mobile interaction
  - **Token Images Added**: PULSE and CRAZY coin logos now display with proper styling

- **✅ THEMED COIN SEARCH MODAL - CENTERED & GORGEOUS**:
  - Replaced boring browser prompt with beautiful centered modal
  - Modal is theme-aware - colors adapt to your current theme (dark, light, space, jupiter, pink, etc.)
  - Gradient background with smooth slide-in animation
  - Enter key submits search, clicking outside closes modal
  - Perfect responsive design for mobile and desktop
  - Shows helpful placeholder: "BTC, ETH, SOL, PEPE, or Solana address..."

- **✅ FIXED BANNER POSITIONING + ERROR MESSAGES**:
  - Fixed banner width issue - "DARKWAVE PULSE" title now centered (was shifted right)
  - Error state now only shows on actual failures, not for non-critical data
  - ATH/supplementary data failures no longer block price display
  - Version cache refresh forced (1120b) to clear old cached files
  
- **✅ FIXED ANALYSIS MODAL ERROR + 1-SECOND CHARTING**:
  - **Error Fix**: Non-critical data fetches (like ATH) no longer cause error state if they fail
    - Price data loads successfully even if supplementary data has issues
    - Modal shows data instead of error message when price loads
  - **1-Second Timeframe Added**: New "1s" button shows 60 one-second candles for high-frequency trading
    - Perfect for catching per-second price movements
    - Works with all coins (BTC, ETH, SOL, PEPE, etc.)
    - Generates realistic market micro-movements
  - **Backend Support**: Added 3 API routes that were missing:
    - `/api/coincap/market/:coinId` - Fetches live price + market cap from CoinGecko
    - `/api/coincap/history/:coinId` - Fetches historical OHLCV candlestick data for charts
    - `/api/coincap/ath/:coinId` - Fetches all-time high data
  - **Modal Features**:
    - Opens with prompt for coin symbol (BTC, ETH, SOL, etc.)
    - Loads real market data with charts and buy/sell signals
    - Displays selected avatar companion
    - Error states properly handled if coin not found
    - Avatar display only shows when modal has real data (no orphaned elements)

## Previous Updates (Nov 23, 2025) - AVATAR ANALYSIS SYSTEM COMPLETE
- **✅ AVATAR ANALYSIS SYSTEM WITH FLOATING AGENT BUTTONS**:
  - Three display modes: 🤖 Agent Mode | 🐱 Crypto Cat Mode | 🔇 Off Mode
  - **Floating Avatar Buttons**: Beautiful circular cutouts with lavender glow emanating from each
  - Agent button: Dynamic color (changes with selected agent) + initials display
  - Cat button: Purple gradient with cat emoji + glow
  - Off button: Grey gradient with power-off emoji + glow
  - Lavender glow effect: Multi-layer shadow with rgba(168, 85, 247, ...)
  - Hover animations: Scale 1.1x on mouseover for interactive feel
  - Positioned on opposite sides with "SELECT MODE" center label
  - Selection saves to localStorage automatically
  - **Agent Character System**: Users can pick from 16 AI agents until V2 release
  - **Admin Avatar Builder**: Locked for admins to test/preview agents (unlocks V2)
  - **Visual Character Avatar Display**: Each analysis shows selected agent or cat companion
  - Architecture: `avatar-display-system.js` orchestrates all modes and rendering
  
## Latest Updates (Nov 23, 2025)
- **✅ BUY/SELL LIMIT ORDERS - V2 SNIPER INFRASTRUCTURE LOCKED**:
  - Backend endpoints: `/api/trading/buy-limit` (POST), `/api/trading/sell-limit` (POST), `/api/trading/orders` (GET)
  - All return 423 status with V2 lock message: "🔒 Coming Dec 25, 2025!"
  - Frontend: New "🤖 Trading (V2)" tab with locked UI overlay showing:
    - **Buy Sniper**: Set IN price entry point, executes automatically when reached
    - **Sell Sniper**: Set OUT price exit point, locks profits when target hit
  - Works on: All crypto/stablecoins + memes with custom RPC endpoints
  - Available on: Coin research pages & analysis dashboard
  - Fully functional infrastructure ready for V2 unlock - no additional build needed
  
- **✅ UI REFINEMENTS - CLEANER NAVIGATION**:
  - Removed close button from BETA V1/Legacy Founder/New Here banner
  - Removed back-arrow buttons from all tab headers
  - Added close buttons to all popup modals
  - Trading feature descriptions updated to "Sniper" terminology (IN/OUT prices)
  
- **✅ CHARTS LIVE TIME UPDATES**: 
  - Candlestick chart now refreshes every 2 seconds (matching sparkline)
  - Improved error logging: Detailed stack traces + message details (was showing empty `{}`)
  - Chart update function properly logs: timestamp ranges, candle counts, normalization results
  - Live price updates working across all timeframes (1h, 1d, 1w, all-time)
  
- **✅ ANALYTICS BUTTON FIXED**: 
  - "Open Analytics" button now properly calls `analyzeToken()` to open detailed coin analysis modal
  - Shows sparkline charts (1 sec to all-time), metrics, buy signals, explanations, and V2 predictive features
  - Can search any coin using the modal's search input
  
- **✅ CHARTS NOW RENDERING**: Real BTC historical data with TradingView Lightweight Charts
  - Backend `/api/crypto/market-chart` endpoint now fetches live data from CryptoCompare API
  - Returns 121 candlestick candles (OHLCV data) + 121 sparkline closing prices
  - Fixed timestamp field naming (backend returns `timestamp` in milliseconds, frontend converts to seconds)
  - Charts display 24-hour historical data for Bitcoin with proper normalization and filtering
  
- **✅ CANONICAL BANNER LOCKED**: "Predictive Signals. Complete Ecosystem. Maximum Edge."
  - **DO NOT CHANGE** until replaced with new design
  - Dual-positioning mission statement encapsulates entire ecosystem vision (launchpad, wallet, marketplace, staking)
  - Degens hear: Early signals, opportunity pipeline, complete trading ecosystem
  - Pros hear: Predictive advantage, infrastructure, risk management

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