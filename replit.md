# Pulse - AI Trading Analysis Platform

## Overview
Pulse, powered by DarkWave Studios, LLC, is an AI-driven trading platform utilizing the Mastra AI framework to deliver predictive signals and institutional-grade technical analysis for cryptocurrency and stocks. Its primary goal is to provide users with a significant trading advantage by identifying market trends early and offering sophisticated, risk-adjusted analytics. The platform is designed to integrate with the broader DarkWave Studios ecosystem, powered by the upcoming DWAV token, and aims to empower traders with advanced AI capabilities.

## User Preferences
- User name: Jason (Owner/Admin)
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"
- **IMPORTANT**: Always check with Jason before proceeding to verify any task - confirm changes look correct before moving on
- Agent diversity: Equal distribution across age groups, gender, race, and hair color
- Design aesthetic: Solid black/dark gray backgrounds (#0f0f0f, #1a1a1a, #141414) with free-floating elements featuring glow effects - NO glassmorphism, NO transparency, NO backdrop-filter

## System Architecture

### UI/UX Decisions
The platform features a solid dark theme (`#0f0f0f`, `#1a1a1a`, `#141414`) with free-floating elements and glow effects, explicitly avoiding glassmorphism, transparency, and backdrop-filters. The design includes a slim 50px header with a hamburger menu and a slim, dynamic footer. Key UI components include SVG gauge components for market sentiment (Fear & Greed, Altcoin Season), metric cards for market cap and volume, and a customizable Bitcoin chart using `lightweight-charts` with various display options.

### Technical Implementations
- **Frontend**: Built with React 19 and Vite 7, located in `public/` and `darkwave-web/public/`. A mobile app is in development using React Native + Expo.
- **Backend**: Utilizes the Mastra AI framework with an Express server. The AI agent, DarkWave-V2, supports tool calling and memory.
- **Database**: PostgreSQL, specifically Neon-backed via Replit.
- **Authentication**: Session-based, employing an email whitelist and access codes.
- **Workflow Management**: Inngest is used for event-driven processing and cron jobs.
- **Prediction Tracking**: A robust system logs every AI signal, tracks outcomes at 1hr, 4hr, 24hr, and 7d intervals, and calculates accuracy statistics. Each prediction is hashed and stamped on the Solana blockchain.
- **ML Learning System**: Incorporates feature extraction, training, and inference services (`predictionLearningService.ts`). It uses logistic regression across different time horizons, with automated weekly training via Inngest. Features include RSI, MACD, EMA spreads, Bollinger position, volume delta, spike score, and volatility.
- **Personal Dashboard System**: Each user receives a unique Hallmark ID and a customizable landing page featuring favorite coins, market gauges, and a main chart widget.
- **Favorites System**: Users can save favorite coins with quick analysis access, persisting data to the database.
- **StrikeAgent (formerly Sniper Bot)**: An AI-powered predictive trading tool for real-time token discovery, featuring safety filters (anti-MEV, mint/freeze authority checks, honeypot simulation), smart auto mode, and multi-chain support (Solana, Ethereum, Base, Polygon, Arbitrum, BSC).
- **Manual Token Watchlist/Limit Orders**: A system for setting entry, exit, and stop-loss orders across four token slots, monitored by Inngest cron jobs.
- **Multi-Chain Built-in Wallet**: A custom HD wallet with Trust Wallet-style UX, supporting Solana and multiple EVM chains (Ethereum, Polygon, Base, Arbitrum, BSC). It features BIP39 mnemonic generation, AES-256-GCM encrypted storage, and client-side crypto operations.
- **Automatic Versioning System**: Manages `version.json` files for both frontend and backend, with scripts for auto-incrementing patch versions and promoting to v2.0.0 for token launch.
- **ORBIT Ecosystem Integration**: Facilitates cross-app communication with the ORBIT Developer Hub for activity logging, code snippet sharing, metrics reporting, and alerts.

### Feature Specifications
- User authentication and management.
- Real-time crypto price tracking.
- AI prediction and analysis modals for coins.
- Admin dashboard for user management.
- Telegram bot integration.
- 18 AI Agent personas with NFT Trading Cards.
- Comprehensive Knowledge Base.
- Custom Avatar Creator with DiceBear integration, bento grid layout, and accordion-based customization. Supports 5 professional avatar styles (personas, notionists, avataaars, lorelei, micah).
- **Skins System**: 304 customizable themes across 14 categories (subscriber-exclusive feature). Categories include Classic (3), NFL (32), MLB (30), NBA (30), NHL (32), College Football (40), EPL (20), La Liga (20), Bundesliga (18), Serie A (20), Ligue 1 (18), MLS (29), Golf (2), Nature (9). Free users get 2 demo themes (classic-dark, light). RM+ subscribers unlock all 304 themes. Each team theme includes official logo watermarks.

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

---

## STRIKEAGENT ROADMAP (Dec 2024 → Feb 2026)

### PHASE 1: SAFETY ENGINE MVP (Dec 10-20) ✅ COMPLETE
"The product that makes us different"

| Feature | Status |
|---------|--------|
| Anti-MEV (Jito Bundles) | DONE ✅ |
| Mint Authority Check | DONE ✅ |
| Freeze Authority Check | DONE ✅ |
| Liquidity Lock/Burn Verify | DONE ✅ |
| Honeypot Simulation | DONE ✅ |
| Creator Wallet Scoring | DONE ✅ |
| Token Age Filter | DONE ✅ |
| Safety Report UI | DONE ✅ |
| Safety Engine API Routes | DONE ✅ |

**Key Files:**
- `src/services/safetyEngineService.ts` - Full safety check engine
- `src/services/jitoBundleService.ts` - Jito anti-MEV integration
- `darkwave-web/src/components/trading/SafetyReport.jsx` - Safety report UI
- `src/mastra/routes/sniperBotRoutes.ts` - API endpoints

### PHASE 2: MULTI-CHAIN ARCHITECTURE (Jan → March) ✅ COMPLETE
| Chain | Status |
|-------|--------|
| Solana | DONE ✅ |
| Ethereum | PROVIDER READY ✅ |
| Base | PROVIDER READY ✅ |
| Polygon | PROVIDER READY ✅ |
| Arbitrum | PROVIDER READY ✅ |
| BSC | PROVIDER READY ✅ |

**Key Files (Phase 2):**
- `src/services/multiChainProvider.ts` - Multi-chain provider abstraction (all 6 chains)
- `src/services/evmSafetyEngine.ts` - EVM safety checks (ownership, honeypot, liquidity, contract verification)
- `darkwave-web/src/components/tabs/SniperBotTab.jsx` - Chain selector UI

### PHASE 3: MULTI-CHAIN WALLET (Feb → April)
| Feature | Status |
|---------|--------|
| Multi-chain support | IN PROGRESS |
| One seed phrase | DONE ✅ |
| In-app signing | DONE ✅ |
| Portfolio dashboard | PENDING |

### PHASE 4: ADAPTIVE AI (Parallel R&D) ✅ COMPLETE
| Feature | Status |
|---------|--------|
| Trade Ledger | DONE ✅ |
| StrikeAgent Trade Connection | DONE ✅ |
| Feature Extraction | DONE ✅ |
| Supervised Learning | DONE ✅ |
| Drift Detection | DONE ✅ |
| Auto-Retraining | DONE ✅ |

**Key Files (Phase 4):**
- `src/services/tradeLedgerService.ts` - Trade tracking and AI integration
- `src/services/predictionLearningService.ts` - ML learning with drift detection
- API routes: `/api/sniper/trades`, `/api/sniper/ai/retrain`, `/api/sniper/ai/drift`

---

## TIMELINE TO LAUNCH
- Dec 10-20: Safety Engine ✅
- Dec 20-Jan 10: StrikeAgent landing page + pricing
- Jan 10-25: Stripe setup, trial system
- Jan 25-Feb 1: Testing, whitelist validation
- Feb 1-14: MARKETING PUSH
- FEB 14: DWAV LAUNCH + STRIKEAGENT LIVE

---

## AI AGENT SYSTEM ROADMAP (Dec 2024)

### WAVE 1: AGENT FOUNDATION
**"Make the floating button show YOUR agent"**
- Floating AI Chat button displays user's selected agent (full-body Pixar-style)
- rembg treatment for transparent backgrounds
- Glow effect around the agent
- Agent pop-up system with sweep-in animations from any direction
- Comic-style speech bubbles for dialogue
- 100+ random tips/quotes database
- Appears ~2 times per page randomly

### WAVE 2: AGENT DIVERSITY SYSTEM
**"50+ diverse Pixar-style agents to choose from"**

| Category | Options |
|----------|---------|
| Gender | Male, Female, Non-binary |
| Race | Caucasian, Black, Asian, Hispanic, Middle Eastern, Indian, Mixed |
| Age | Young (20s), Middle (30-40s), Senior (50+) |
| Hair | Black, Brown, Blonde, Red, Gray, White, Bald |
| Facial Hair | Clean-shaven, Beard, Mustache, Goatee |
| Style | All in sharp "Men in Black" suits - professional but fun |

- Full-body poses (standing, hands on hips, pointing, etc.)
- Filter/search by category
- Custom avatar upload option (uses rembg to remove background)

### WAVE 3: VOICE AI CONTROL FOR STRIKEAGENT
**"Talk to your StrikeAgent - the killer differentiator"**

1. User speaks command: "Buy ETH at $3,050, sell at $3,150"
2. AI processes: Speech-to-text → Validates command → Checks market
3. AI responds (voice): Confirms order with market context
4. DOUBLE CONFIRMATION required before execution
5. Voice matches agent gender (male/female based on avatar)
6. Audit logging for all voice commands
7. Worth +$5/month subscription increase

### SUBSCRIPTION MODEL
| Tier | Access | Trial? |
|------|--------|--------|
| Free | Dashboard, Markets, Basic Analysis | - |
| 3-Day Trial | All predictive analysis tools | Auto-expires |
| RM+ | Everything + StrikeAgent + Voice AI | - |
| DWAV Holder | Staking features (when live) | - |

**Key Design Rules:**
- NO frames or boxes around agents
- Agents appear like walking in front of a movie screen
- Full-body, rembg-treated, Pixar/MIB style
- Sweep-in animations from any angle/corner