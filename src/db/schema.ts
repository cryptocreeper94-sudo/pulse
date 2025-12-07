import { pgTable, varchar, timestamp, boolean, text, integer, serial, json } from 'drizzle-orm/pg-core';

export const subscriptions = pgTable('subscriptions', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  plan: varchar('plan', { length: 50 }).notNull().default('free'), // 'free' | 'basic' | 'premium'
  status: varchar('status', { length: 50 }).notNull().default('inactive'), // 'active' | 'inactive' | 'cancelled' | 'expired'
  provider: varchar('provider', { length: 50 }), // 'stripe' | 'telegram_stars' | 'crypto' | null
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  telegramPaymentId: varchar('telegram_payment_id', { length: 255 }),
  cryptoPaymentId: varchar('crypto_payment_id', { length: 255 }), // Coinbase Commerce charge ID
  expiryDate: timestamp('expiry_date'),
  autoRenew: boolean('auto_renew').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userUsage = pgTable('user_usage', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  searchCount: integer('search_count').notNull().default(0),
  alertCount: integer('alert_count').notNull().default(0),
  lastResetDate: timestamp('last_reset_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const whitelistedUsers = pgTable('whitelisted_users', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }), // Optional: email address for email-based whitelist
  reason: text('reason'), // Optional: why they're whitelisted (e.g., "Early access", "Beta tester", "Paid subscriber")
  expiresAt: timestamp('expires_at'), // Optional: whitelist expiration date
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  token: varchar('token', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }), // Optional: bind session to user (for future use)
  email: varchar('email', { length: 255 }), // Email address for email-based whitelist
  verifiedAt: timestamp('verified_at'), // When email was verified (null = unverified)
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  lastUsed: timestamp('last_used').defaultNow().notNull(),
});

export const trackedWallets = pgTable('tracked_wallets', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull().default('solana'), // 'solana' | 'ethereum' | 'polygon' | 'arbitrum' | 'base' | 'bsc'
  nickname: varchar('nickname', { length: 100 }), // Optional nickname for the wallet
  balance: text('balance'), // JSON string of token balances
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tokenSubmissions = pgTable('token_submissions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  tokenName: varchar('token_name', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  tokenContract: varchar('token_contract', { length: 255 }).notNull(),
  tokenChain: varchar('token_chain', { length: 50 }).notNull(),
  tokenDescription: text('token_description').notNull(),
  tokenContact: varchar('token_contact', { length: 255 }),
  tokenLogo: text('token_logo'), // Base64 encoded image data
  
  // Social Links
  website: varchar('website', { length: 500 }),
  twitter: varchar('twitter', { length: 255 }),
  telegram: varchar('telegram', { length: 255 }),
  discord: varchar('discord', { length: 255 }),
  
  // Documentation (Base64 encoded PDF data or URLs)
  whitepaper: text('whitepaper'),
  tokenomics: text('tokenomics'),
  auditReport: text('audit_report'),
  
  // Project Qualifiers (Yes/No checkboxes)
  hasWhitepaper: boolean('has_whitepaper').default(false),
  hasAudit: boolean('has_audit').default(false),
  isDoxxedTeam: boolean('is_doxxed_team').default(false),
  hasLockedLiquidity: boolean('has_locked_liquidity').default(false),
  
  // Review Status
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  submittedBy: varchar('submitted_by', { length: 255 }).notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'), // Optional: why it was rejected
});

export const approvedTokens = pgTable('approved_tokens', {
  id: varchar('id', { length: 255 }).primaryKey(),
  address: varchar('address', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  symbol: varchar('symbol', { length: 50 }).notNull(),
  description: text('description'),
  platform: varchar('platform', { length: 50 }).notNull().default('pumpfun'), // 'pumpfun' | 'raydium'
  chain: varchar('chain', { length: 50 }).notNull().default('solana'),
  logo: text('logo'), // Base64 encoded image or URL
  
  // Social Links
  website: varchar('website', { length: 500 }),
  twitter: varchar('twitter', { length: 255 }),
  telegram: varchar('telegram', { length: 255 }),
  discord: varchar('discord', { length: 255 }),
  
  // Documentation
  whitepaper: text('whitepaper'),
  tokenomics: text('tokenomics'),
  auditReport: text('audit_report'),
  
  // Project Qualifiers
  hasWhitepaper: boolean('has_whitepaper').default(false),
  hasAudit: boolean('has_audit').default(false),
  isDoxxedTeam: boolean('is_doxxed_team').default(false),
  hasLockedLiquidity: boolean('has_locked_liquidity').default(false),
  
  featured: boolean('featured').default(true),
  displayOrder: integer('display_order').default(0), // For sorting
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Crypto Payments Tracking (Coinbase Commerce)
export const cryptoPayments = pgTable('crypto_payments', {
  id: varchar('id', { length: 255 }).primaryKey(), // UUID
  userId: varchar('user_id', { length: 255 }).notNull(),
  coinbaseChargeId: varchar('coinbase_charge_id', { length: 255 }).notNull().unique(), // Coinbase Commerce charge ID
  coinbaseChargeCode: varchar('coinbase_charge_code', { length: 255 }), // Charge code for URL
  
  // Payment Details
  amountUSD: varchar('amount_usd', { length: 50 }).notNull(), // Amount in USD (e.g., "5.00")
  cryptoCurrency: varchar('crypto_currency', { length: 50 }), // BTC, ETH, USDC, etc.
  cryptoAmount: varchar('crypto_amount', { length: 100 }), // Amount in crypto
  
  // Status Tracking
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'completed' | 'failed' | 'expired'
  hostedUrl: text('hosted_url'), // Coinbase Commerce payment page URL
  expiresAt: timestamp('expires_at'), // When the payment request expires
  
  // Metadata
  description: text('description'), // What the payment is for
  metadata: text('metadata'), // JSON string for additional data
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'), // When payment was confirmed
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Token Launches - For upcoming IDOs/Presales
export const tokenLaunches = pgTable('token_launches', {
  id: varchar('id', { length: 255 }).primaryKey(),
  tokenId: varchar('token_id', { length: 255 }).notNull(), // Links to approvedTokens
  
  // Launch Details
  launchDate: timestamp('launch_date').notNull(),
  launchPrice: varchar('launch_price', { length: 100 }), // e.g., "$0.01"
  totalSupply: varchar('total_supply', { length: 100 }),
  initialMarketCap: varchar('initial_market_cap', { length: 100 }),
  
  // Whitelist Configuration
  maxWhitelistSpots: integer('max_whitelist_spots').default(1000),
  currentWhitelistCount: integer('current_whitelist_count').default(0),
  whitelistEnabled: boolean('whitelist_enabled').default(true),
  whitelistCloseDate: timestamp('whitelist_close_date'),
  
  // Allocation Details
  minAllocation: varchar('min_allocation', { length: 100 }), // Min investment (e.g., "0.1 SOL")
  maxAllocation: varchar('max_allocation', { length: 100 }), // Max investment (e.g., "5 SOL")
  acceptedCurrencies: text('accepted_currencies'), // JSON array: ["SOL", "USDC"]
  
  // Launch Status
  status: varchar('status', { length: 50 }).notNull().default('upcoming'), // 'upcoming' | 'live' | 'completed' | 'cancelled'
  featured: boolean('featured').default(true),
  displayOrder: integer('display_order').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Launch Whitelist - Users who signed up for launches
export const launchWhitelist = pgTable('launch_whitelist', {
  id: varchar('id', { length: 255 }).primaryKey(),
  launchId: varchar('launch_id', { length: 255 }).notNull(), // Links to tokenLaunches
  userId: varchar('user_id', { length: 255 }).notNull(),
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull().default('solana'),
  
  // Allocation
  allocatedAmount: varchar('allocated_amount', { length: 100 }), // Amount they'll be able to invest
  contributedAmount: varchar('contributed_amount', { length: 100 }), // Amount they actually invested
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'approved' | 'participated' | 'claimed'
  signedUpAt: timestamp('signed_up_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
});

// ============================================
// SOLANA AUDIT TRAIL & HALLMARK NFT SYSTEM
// ============================================

// Audit Events - All important events that get hashed to Solana
export const auditEvents = pgTable('audit_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Event Details
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventCategory: varchar('event_category', { length: 50 }).notNull(),
  actor: varchar('actor', { length: 255 }),
  
  // Payload & Hash
  payload: text('payload').notNull(),
  payloadHash: varchar('payload_hash', { length: 128 }).notNull(),
  hashAlgorithm: varchar('hash_algorithm', { length: 20 }).notNull().default('SHA-256'),
  
  // On-Chain Status
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  onchainSignature: varchar('onchain_signature', { length: 128 }),
  heliusTxId: varchar('helius_tx_id', { length: 128 }),
  solanaSlot: integer('solana_slot'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  confirmedAt: timestamp('confirmed_at'),
});

// Hallmark Profiles - User configuration for their Hallmark NFTs
export const hallmarkProfiles = pgTable('hallmark_profiles', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  
  // Avatar Configuration
  avatarType: varchar('avatar_type', { length: 50 }).notNull().default('agent'),
  avatarId: varchar('avatar_id', { length: 100 }),
  customAvatarUrl: text('custom_avatar_url'),
  
  // Serial Number Tracking
  currentSerial: integer('current_serial').notNull().default(0),
  preferredTemplate: varchar('preferred_template', { length: 50 }).default('classic'),
  
  // Metadata
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Hallmark Mints - Individual Hallmark NFTs that have been purchased/minted
export const hallmarkMints = pgTable('hallmark_mints', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Serial & Identity
  serialNumber: varchar('serial_number', { length: 100 }).notNull().unique(),
  avatarSnapshot: text('avatar_snapshot'),
  templateUsed: varchar('template_used', { length: 50 }).notNull().default('classic'),
  
  // Hash & On-Chain Reference
  payloadHash: varchar('payload_hash', { length: 128 }).notNull(),
  auditEventIds: text('audit_event_ids'),
  memoSignature: varchar('memo_signature', { length: 128 }),
  heliusTxId: varchar('helius_tx_id', { length: 128 }),
  
  // Artwork
  artworkUrl: text('artwork_url'),
  metadataUri: text('metadata_uri'),
  
  // Payment
  priceUsd: varchar('price_usd', { length: 20 }).notNull().default('1.99'),
  paymentProvider: varchar('payment_provider', { length: 50 }),
  paymentId: varchar('payment_id', { length: 255 }),
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
  mintedAt: timestamp('minted_at'),
});

// System Configuration - For storing wallet addresses and system settings
export const systemConfig = pgTable('system_config', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  isSecret: boolean('is_secret').default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// PREDICTION TRACKING & ACCURACY SYSTEM
// Logs every signal, tracks outcomes, calculates accuracy
// ============================================

// Prediction Events - Every BUY/SELL/HOLD signal with full indicator snapshot
export const predictionEvents = pgTable('prediction_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }), // null for system-generated predictions
  
  // Asset Information
  ticker: varchar('ticker', { length: 50 }).notNull(),
  assetType: varchar('asset_type', { length: 20 }).notNull().default('crypto'), // 'crypto' | 'stock'
  priceAtPrediction: varchar('price_at_prediction', { length: 50 }).notNull(),
  
  // The Prediction
  signal: varchar('signal', { length: 20 }).notNull(), // 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL'
  confidence: varchar('confidence', { length: 20 }), // 'HIGH' | 'MEDIUM' | 'LOW'
  
  // Full Indicator Snapshot (JSON)
  indicators: text('indicators').notNull(), // JSON: { rsi, macd, ema9, ema21, ema50, ema200, sma50, sma200, bollingerBands, support, resistance, volumeDelta, spikeScore, volatility }
  
  // Signal Details
  bullishSignals: integer('bullish_signals').notNull().default(0),
  bearishSignals: integer('bearish_signals').notNull().default(0),
  signalsList: text('signals_list'), // JSON array of individual signals
  
  // Blockchain Stamp
  payloadHash: varchar('payload_hash', { length: 128 }).notNull(),
  auditEventId: varchar('audit_event_id', { length: 255 }), // Reference to audit_events
  onchainSignature: varchar('onchain_signature', { length: 128 }),
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'stamped' | 'evaluated'
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  stampedAt: timestamp('stamped_at'),
});

// Prediction Outcomes - Actual results at different time horizons
export const predictionOutcomes = pgTable('prediction_outcomes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  predictionId: varchar('prediction_id', { length: 255 }).notNull(),
  
  // Time Horizon
  horizon: varchar('horizon', { length: 20 }).notNull(), // '1h' | '4h' | '24h' | '7d'
  
  // Actual Results
  priceAtCheck: varchar('price_at_check', { length: 50 }).notNull(),
  priceChange: varchar('price_change', { length: 50 }).notNull(), // Dollar change
  priceChangePercent: varchar('price_change_percent', { length: 20 }).notNull(), // Percentage
  
  // Outcome Classification
  outcome: varchar('outcome', { length: 20 }).notNull(), // 'WIN' | 'LOSS' | 'NEUTRAL'
  isCorrect: boolean('is_correct').notNull(), // Did signal direction match price movement?
  
  // Additional Metrics
  volatilityDuring: varchar('volatility_during', { length: 20 }), // Volatility during the period
  maxDrawdown: varchar('max_drawdown', { length: 20 }), // Worst point during period
  maxGain: varchar('max_gain', { length: 20 }), // Best point during period
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  evaluatedAt: timestamp('evaluated_at').defaultNow().notNull(),
});

// Prediction Accuracy Stats - Aggregated accuracy metrics
export const predictionAccuracyStats = pgTable('prediction_accuracy_stats', {
  id: varchar('id', { length: 255 }).primaryKey(),
  
  // Grouping (can be null for global stats)
  ticker: varchar('ticker', { length: 50 }), // null = all tickers
  signal: varchar('signal', { length: 20 }), // null = all signals
  horizon: varchar('horizon', { length: 20 }), // null = all horizons
  
  // Accuracy Metrics
  totalPredictions: integer('total_predictions').notNull().default(0),
  correctPredictions: integer('correct_predictions').notNull().default(0),
  winRate: varchar('win_rate', { length: 10 }).notNull().default('0'), // Percentage
  
  // Performance Metrics
  avgReturn: varchar('avg_return', { length: 20 }), // Average % return when signal followed
  avgWinReturn: varchar('avg_win_return', { length: 20 }), // Avg return on wins
  avgLossReturn: varchar('avg_loss_return', { length: 20 }), // Avg return on losses
  bestReturn: varchar('best_return', { length: 20 }),
  worstReturn: varchar('worst_return', { length: 20 }),
  
  // Streaks
  currentStreak: integer('current_streak').default(0), // Positive = wins, negative = losses
  longestWinStreak: integer('longest_win_streak').default(0),
  longestLossStreak: integer('longest_loss_streak').default(0),
  
  // Time-weighted metrics (more recent predictions weighted higher)
  weightedWinRate: varchar('weighted_win_rate', { length: 10 }),
  
  // Last updated
  lastPredictionAt: timestamp('last_prediction_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// PREDICTION LEARNING SYSTEM
// ML model training, versioning, and inference
// ============================================

// Prediction Features - Normalized feature vectors for ML training
export const predictionFeatures = pgTable('prediction_features', {
  id: varchar('id', { length: 255 }).primaryKey(),
  predictionId: varchar('prediction_id', { length: 255 }).notNull(),
  horizon: varchar('horizon', { length: 20 }).notNull(), // '1h' | '4h' | '24h' | '7d'
  
  // Normalized Features (all scaled 0-1 or -1 to 1)
  rsiNormalized: varchar('rsi_normalized', { length: 20 }), // RSI / 100
  macdSignal: varchar('macd_signal', { length: 20 }), // MACD histogram direction (-1, 0, 1)
  macdStrength: varchar('macd_strength', { length: 20 }), // Normalized MACD distance
  
  // EMA Spreads (price position relative to EMAs)
  ema9Spread: varchar('ema9_spread', { length: 20 }), // (price - EMA9) / price * 100
  ema21Spread: varchar('ema21_spread', { length: 20 }),
  ema50Spread: varchar('ema50_spread', { length: 20 }),
  ema200Spread: varchar('ema200_spread', { length: 20 }),
  
  // EMA Crossovers
  ema9Over21: boolean('ema9_over_21'), // Golden cross indicator
  ema50Over200: boolean('ema50_over_200'), // Major trend indicator
  
  // Bollinger Band Position
  bbPosition: varchar('bb_position', { length: 20 }), // -1 (below lower) to 1 (above upper)
  bbWidth: varchar('bb_width', { length: 20 }), // Band width as % of price
  
  // Volume & Momentum
  volumeDeltaNorm: varchar('volume_delta_norm', { length: 20 }), // Normalized volume delta
  spikeScoreNorm: varchar('spike_score_norm', { length: 20 }), // Normalized spike score
  volatilityNorm: varchar('volatility_norm', { length: 20 }), // Normalized volatility
  
  // Support/Resistance
  distanceToSupport: varchar('distance_to_support', { length: 20 }), // % distance to support
  distanceToResistance: varchar('distance_to_resistance', { length: 20 }), // % distance to resistance
  
  // Labels (from outcomes)
  priceChangePercent: varchar('price_change_percent', { length: 20 }),
  isWin: boolean('is_win'), // Target label for classification
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Prediction Model Versions - Trained model coefficients and metadata
export const predictionModelVersions = pgTable('prediction_model_versions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  
  // Model Identity
  modelName: varchar('model_name', { length: 100 }).notNull().default('logistic_v1'),
  horizon: varchar('horizon', { length: 20 }).notNull(), // '1h' | '4h' | '24h' | '7d'
  version: integer('version').notNull(),
  
  // Model Coefficients (JSON)
  coefficients: text('coefficients').notNull(), // JSON: { intercept, weights: { rsi: 0.5, macd: -0.3, ... } }
  featureNames: text('feature_names').notNull(), // JSON array of feature names in order
  
  // Training Metadata
  trainingSamples: integer('training_samples').notNull(),
  validationSamples: integer('validation_samples').notNull(),
  trainingDateRange: text('training_date_range'), // JSON: { start, end }
  
  // Performance Metrics
  accuracy: varchar('accuracy', { length: 10 }).notNull(), // Validation accuracy
  precision: varchar('precision', { length: 10 }), // Precision for WIN class
  recall: varchar('recall', { length: 10 }), // Recall for WIN class
  f1Score: varchar('f1_score', { length: 10 }),
  auroc: varchar('auroc', { length: 10 }), // Area under ROC curve
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('training'), // 'training' | 'validated' | 'active' | 'retired'
  isActive: boolean('is_active').notNull().default(false), // Only one active per horizon
  
  // Timestamps
  trainedAt: timestamp('trained_at').defaultNow().notNull(),
  activatedAt: timestamp('activated_at'),
  retiredAt: timestamp('retired_at'),
});

// Prediction Model Metrics - Rolling performance tracking for deployed models
export const predictionModelMetrics = pgTable('prediction_model_metrics', {
  id: varchar('id', { length: 255 }).primaryKey(),
  modelVersionId: varchar('model_version_id', { length: 255 }).notNull(),
  
  // Time Window
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // Performance
  predictionsCount: integer('predictions_count').notNull().default(0),
  correctCount: integer('correct_count').notNull().default(0),
  rollingAccuracy: varchar('rolling_accuracy', { length: 10 }),
  
  // Drift Detection
  featureDrift: varchar('feature_drift', { length: 20 }), // KL divergence or similar
  performanceDrift: boolean('performance_drift').default(false), // Flag if accuracy drops significantly
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// USER FAVORITES & DASHBOARD CONFIGURATION
// ============================================

// User Favorites - Saved coins/tokens for quick access
export const userFavorites = pgTable('user_favorites', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Asset Information
  assetId: varchar('asset_id', { length: 255 }).notNull(), // CoinGecko ID or stock ticker
  assetType: varchar('asset_type', { length: 20 }).notNull().default('crypto'), // 'crypto' | 'stock'
  symbol: varchar('symbol', { length: 50 }).notNull(), // BTC, ETH, XRP, etc.
  name: varchar('name', { length: 255 }).notNull(), // Bitcoin, Ethereum, etc.
  
  // User preferences for this favorite
  displayOrder: integer('display_order').default(0), // For custom sorting
  notes: text('notes'), // User notes about this asset
  alertsEnabled: boolean('alerts_enabled').default(false),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Dashboard Config - Personal dashboard settings
export const userDashboardConfigs = pgTable('user_dashboard_configs', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  
  // Hallmark Identity
  hallmarkId: varchar('hallmark_id', { length: 100 }).unique(), // PULSE-XXXX-2026
  
  // Landing Page Preference
  defaultLandingTab: varchar('default_landing_tab', { length: 50 }).default('dashboard'), // 'dashboard' | 'markets' | 'portfolio' | 'stocks'
  
  // Dashboard Layout (JSON)
  layout: text('layout'), // JSON: widget positions, sizes, visibility
  
  // Display Preferences
  showFavoritesOnly: boolean('show_favorites_only').default(false),
  defaultChart: varchar('default_chart', { length: 50 }).default('bitcoin'), // Which coin to show by default
  chartTimeframe: varchar('chart_timeframe', { length: 20 }).default('7D'), // 1D, 7D, 30D, 1Y, ALL
  theme: varchar('theme', { length: 50 }).default('dark'),
  
  // Notification Preferences
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  
  // Avatar Config (can override or reference AvatarContext)
  avatarConfig: text('avatar_config'), // JSON: full avatar configuration
  avatarMode: varchar('avatar_mode', { length: 20 }).default('custom'), // 'custom' | 'agent'
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
