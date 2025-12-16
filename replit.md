# Pulse - AI Trading Analysis Platform

## Overview
Pulse, by DarkWave Studios, LLC, is an AI-driven trading platform that leverages the Mastra AI framework to deliver predictive signals and institutional-grade technical analysis for cryptocurrency and stocks. Its core purpose is to provide users with a competitive edge by identifying market trends early and offering sophisticated, risk-adjusted analytics. The platform integrates with the broader DarkWave Studios ecosystem, powered by the DWAV token, aiming to empower traders with advanced AI capabilities and significant market potential.

## User Preferences
- User name: Jason (Owner/Admin)
- Preferred communication style: Simple, everyday language
- Call him "Jason" not "DW"
- **IMPORTANT**: Always check with Jason before proceeding to verify any task - confirm changes look correct before moving on
- Agent diversity: Equal distribution across age groups, gender, race, and hair color
- Design aesthetic: Solid black/dark gray backgrounds (#0f0f0f, #1a1a1a, #141414) with free-floating elements featuring glow effects. Glassmorphism (backdrop-filter blur + semi-transparent backgrounds) is ALLOWED for cards site-wide, but NOT for backgrounds, buttons, or other non-card elements.

## System Architecture

### UI/UX Decisions
The platform features a solid dark theme (`#0f0f0f`, `#1a1a1a`, `#141414`) with free-floating elements and glow effects. Glassmorphism (backdrop-filter blur + semi-transparent backgrounds) is used for cards site-wide, but NOT for backgrounds, buttons, or other non-card elements. The design includes a slim 50px header with a hamburger menu, a dynamic footer, SVG gauge components for market sentiment, metric cards for market cap and volume, and a customizable Bitcoin chart using `lightweight-charts`. UI elements should avoid frames or boxes, with agents appearing as if walking in front of a screen, using full-body, rembg-treated, Pixar/MIB style with sweep-in animations. The color palette strictly avoids orange, yellow, and brown. A light mode theme with softer blue-tinted grays and enhanced contrast is also implemented.

### Coin Table System (Updated Dec 2025)
- **Categories**: Top, Gainers, Losers, Meme, DeFi, DEX - each fetches 20 coins from CoinGecko API
- **Timeframe Toggle**: 1H/24H buttons to switch between hourly and daily price changes
- **Category Ranking**: Shows 1-20 within each category (not overall market rank)
- **API Endpoint**: `/api/crypto/category/:category?timeframe=1h|24h`
- **Mobile Responsive**: Simplified columns (#, Coin, Price, Change, Volume) for all screen sizes

### Technical Implementations
- **Frontend**: React 19 and Vite 7 web app, plus React Native + Expo mobile app (darkwave-mobile/) with tab navigation (Markets, StrikeAgent, Portfolio, Settings).
- **Backend**: Mastra AI framework with an Express server, powered by the DarkWave-V2 AI agent supporting tool calling and memory.
- **Database**: PostgreSQL, specifically Neon-backed.
- **Authentication**: Session-based, using an email whitelist and access codes.
- **Workflow Management**: Inngest for event-driven processing and cron jobs.
- **Prediction Tracking**: Logs AI signals, tracks outcomes at various intervals, calculates accuracy, and hashes predictions on the Solana blockchain.
- **ML Learning System**: Features include logistic regression for predictions, automated weekly training via Inngest, and feature extraction from indicators like RSI, MACD, EMA spreads, Bollinger position, volume delta, spike score, and volatility. **AI Status Widget** (Dec 2025): Interactive card on dashboard showing overall accuracy (64.7%+) and breakdown by horizon (1h, 4h, 24h, 7d). Clickable modal with two tabs: "How It Works" explaining the AI learning process and "My Predictions" showing user's prediction history with outcomes. API endpoints: `/api/ml/stats`, `/api/ml/user-history`.
- **Personal Dashboard System**: Unique Hallmark ID per user, customizable landing page, favorite coins, market gauges, and main chart widget.
- **StrikeAgent**: An AI-powered tool for real-time token discovery, incorporating safety filters (anti-MEV, mint/freeze authority, honeypot simulation), smart auto mode, and multi-chain support (Solana, Ethereum, Base, Polygon, Arbitrum, BSC, and 17 other EVM chains).
- **Manual Token Watchlist/Limit Orders**: System for setting entry, exit, and stop-loss orders across four token slots, monitored by Inngest.
- **Multi-Chain Built-in Wallet**: Custom HD wallet with Trust Wallet-style UX, supporting Solana and 22 EVM chains. Features BIP39 mnemonic generation, AES-256-GCM encrypted storage, client-side crypto operations, and multi-wallet support. **Premium UI redesign (Dec 2025)**: Hero section with Pixar agent Marcus and glowing balance display, FlipCarousel for chain selection with 3D hover effects and shimmer animations, Quick Actions Hub (Send/Receive/Dust Buster) with neon gradient cards, accordion-style chain details on click.
- **Dust Buster**: Solana wallet cleanup utility that scans for empty/dust token accounts, recovers locked SOL rent (~0.002 SOL per account), supports close/burn modes with threshold controls ($1/$2/$5/custom), 12.5% fee structure, database tracking for history and lifetime stats.
- **Automatic Versioning System**: Manages `version.json` for frontend and backend, with scripts for auto-incrementing patch versions.
- **ORBIT Ecosystem Integration**: Cross-app communication for activity logging, code snippet sharing, metrics reporting, and alerts.
- **Feature Specifications**: Includes user authentication, real-time crypto price tracking, AI prediction/analysis modals, admin dashboard, Telegram bot integration with StrikeAgent notifications, 54 diverse AI Agent personas (balanced by gender, age, race with NFT Trading Cards), a comprehensive Knowledge Base, and a custom Avatar Creator with DiceBear integration supporting 5 professional avatar styles. A Skins System offers 304 customizable themes across 14 categories, with free and subscriber-exclusive options.
- **Stripe Integration**: 3 pricing tiers (Pulse Pro $14.99/mo, StrikeAgent Elite $30/mo, DarkWave Complete $39.99/mo) with 2-day free trials for subscriptions. Annual plans available with ~17% discount.

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

## 🎯 PRIORITY: AI Autonomous Trading System Roadmap

**Goal:** Build a self-learning AI that can autonomously trigger StrikeAgent trades based on proven prediction accuracy.

### Phase 1: Data Collection ✅ ACTIVE (December 2025)
**Status:** Fixed and collecting data as of Dec 12, 2025

**What's Working:**
- Every `/api/analyze` call logs predictions to `prediction_events` table
- Full indicator snapshots saved (RSI, MACD, EMAs, Bollinger, volume, volatility)
- Inngest workers check outcomes at 1h, 4h, 24h, 7d horizons
- Feature extraction for ML training (`prediction_features` table)
- Prediction hashing for blockchain stamping

**Key Files:**
- `src/services/predictionTrackingService.ts` - Logs predictions, records outcomes
- `src/services/predictionLearningService.ts` - Feature extraction, model training
- `src/mastra/inngest/predictionWorker.ts` - Outcome checking, weekly training cron

**Database Tables:**
- `prediction_events` - Every signal with indicators
- `prediction_outcomes` - Results at each time horizon
- `prediction_features` - Normalized features for ML
- `prediction_model_versions` - Trained model coefficients
- `prediction_accuracy_stats` - Win rates per ticker/signal/horizon

**Minimum Data Needed:** 50+ samples per time horizon before ML can train

---

### Phase 2: Model Training & Accuracy Tracking (After 50+ samples)
**Status:** Ready - runs automatically every Sunday 3 AM

**What It Does:**
- Logistic regression training on collected features
- 80/20 train/validation split
- Calculates accuracy, precision, recall, F1, AUROC
- Auto-activates models with >55% accuracy
- Drift detection alerts when performance degrades

**Confidence Levels:**
- Probability >= 0.7 → BUY with HIGH confidence
- Probability >= 0.6 → BUY with MEDIUM confidence
- Probability <= 0.3 → SELL with HIGH confidence
- Probability <= 0.4 → SELL with MEDIUM confidence
- Otherwise → HOLD

**Training Triggers:**
- Automatic: Every Sunday 3 AM via Inngest cron
- Manual: Send `model/train` event to Inngest

---

### Phase 3: StrikeAgent Integration ✅ COMPLETE
**Status:** Fully implemented

**What's Built:**
- `src/services/strikeAgentTrackingService.ts` - Logs predictions for StrikeAgent discoveries
- `strikeagentPredictions` table for sniper-specific data
- `strikeagentOutcomes` table for tracking results
- Memecoin-specific feature extraction (token age, holder %, bot %, liquidity, safety metrics)
- Outcome tracking at 30min, 1h, 4h, 24h horizons via Inngest worker

**Integration Points:**
- `/api/sniper/discover` - Logs token discoveries
- `/api/sniper/analyze-token` - Logs individual token analysis

---

### Phase 4: Autonomous Trading ✅ COMPLETE
**Status:** Fully implemented - waiting for proven accuracy before enabling

**Prerequisites:**
- Phase 1-3 complete
- 100+ predictions with tracked outcomes
- Model accuracy proven >55% across 30+ days
- User opt-in for auto-trading

**Safety Layers:**
1. **Confidence Gate:** Only trade when model confidence > threshold (configurable: 60/70/80%)
2. **Accuracy Gate:** Only trade when historical accuracy > threshold (55/60/65%)
3. **Position Limits:** Max $ per trade, max $ per day, max open positions
4. **Kill Switch:** Instant stop button, auto-pause on consecutive losses
5. **Approval Mode:** First notify user, wait for confirmation (training wheels)

**Trading Modes:**
- **Observer:** Log recommendations only, don't execute
- **Approval:** Send notification, wait for user to approve
- **Semi-Auto:** Execute small positions, notify user
- **Full Auto:** Execute within limits, log everything

**Configuration Schema:**
```typescript
interface AutoTradeConfig {
  enabled: boolean;
  mode: 'observer' | 'approval' | 'semi-auto' | 'full-auto';
  confidenceThreshold: number; // 0.6 - 0.9
  accuracyThreshold: number; // 0.55 - 0.75
  maxPerTrade: number; // USD
  maxPerDay: number; // USD
  maxOpenPositions: number;
  stopAfterLosses: number; // Pause after X consecutive losses
  allowedSignals: ('BUY' | 'STRONG_BUY')[]; // Which signals trigger trades
  allowedHorizons: ('1h' | '4h' | '24h')[]; // Which time horizons
  notifyOnTrade: boolean;
  notifyChannel: 'telegram' | 'email' | 'both';
}
```

**Gradual Autonomy Path:**
1. Week 1-4: Observer mode (learn patterns)
2. Week 5-8: Approval mode (user confirms each trade)
3. Week 9-12: Semi-auto with tiny positions ($5-10 max)
4. Week 13+: Full auto if accuracy stays >60%

---

### Current Progress Tracking

**Phase 1 Checklist:**
- [x] Prediction logging integrated into `/api/analyze`
- [x] Outcome tracking workers running (hourly checks)
- [x] Feature extraction working
- [x] Weekly model training cron configured
- [x] Database tables created and synced
- [ ] Collect 50+ samples for 1h horizon
- [ ] Collect 50+ samples for 4h horizon
- [ ] Collect 50+ samples for 24h horizon
- [ ] First model trained with >55% accuracy

**Phase 2 Checklist:**
- [x] Training algorithm implemented (logistic regression)
- [x] Model versioning system
- [x] Drift detection
- [ ] Accuracy dashboard UI
- [ ] Model comparison tools
- [ ] Alert on performance drop

**Phase 3 Checklist:**
- [x] StrikeAgent prediction logging (integrated into /api/sniper/discover and /api/sniper/analyze-token)
- [x] Memecoin-specific feature extraction (token age, holder %, bot %, liquidity, safety metrics)
- [ ] Sniper model training (waiting for 50+ samples)
- [x] Token outcome tracking (Inngest worker at 30min past each hour)

**Phase 4 Checklist:**
- [x] Auto-trade config schema (`src/services/autoTradeService.ts`, `src/db/schema.ts`)
- [x] Trading mode selector (observer, approval, semi-auto, full-auto)
- [x] Position management (max per trade, max per day, max open positions)
- [x] Kill switch (pause/resume, stop after consecutive losses)
- [x] Notification integration (telegram/email)
- [x] Risk dashboard UI (`darkwave-web/src/components/tabs/RiskDashboardTab.jsx`)

---

### Key Metrics to Track
- Total predictions logged
- Predictions with outcomes
- Accuracy by signal type (BUY/SELL/HOLD)
- Accuracy by time horizon (1h/4h/24h/7d)
- Model drift score
- Auto-trade P&L (when enabled)