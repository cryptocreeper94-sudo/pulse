import { pgTable, varchar, timestamp, boolean, text, integer, serial, json, numeric, decimal } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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
  accessLevel: varchar('access_level', { length: 50 }), // 'user' | 'premium' | 'admin' | 'owner'
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

// ============================================
// AI SNIPER BOT SYSTEM
// Token discovery, safety analysis, trade execution
// ============================================

// User Wallets - Connected wallets for trading
export const userWallets = pgTable('user_wallets', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Wallet Details
  address: varchar('address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull().default('solana'), // 'solana' | 'ethereum' | etc.
  nickname: varchar('nickname', { length: 100 }), // Optional friendly name
  
  // Connection Status
  isConnected: boolean('is_connected').default(false),
  isPrimary: boolean('is_primary').default(false), // Primary trading wallet
  lastConnectedAt: timestamp('last_connected_at'),
  
  // Balance Cache (updated periodically)
  solBalance: varchar('sol_balance', { length: 50 }), // SOL balance
  lastBalanceUpdate: timestamp('last_balance_update'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Snipe Presets - Saved filter configurations
export const snipePresets = pgTable('snipe_presets', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Preset Identity
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false),
  
  // Mode
  mode: varchar('mode', { length: 20 }).notNull().default('simple'), // 'simple' | 'advanced'
  
  // === TOKEN SAFETY FILTERS (What to AVOID) ===
  maxBotPercent: integer('max_bot_percent').default(80), // Skip if bot % > this
  maxBundlePercent: integer('max_bundle_percent').default(50), // Bundle detection threshold
  maxTop10HoldersPercent: integer('max_top10_holders_percent').default(80), // Concentration limit
  minLiquidityUsd: integer('min_liquidity_usd').default(5000), // Minimum liquidity depth
  checkCreatorWallet: boolean('check_creator_wallet').default(true), // Check creator history
  
  // === TOKEN DISCOVERY FILTERS (What to LOOK FOR) ===
  minTokenAgeMinutes: integer('min_token_age_minutes').default(5), // Minimum age
  maxTokenAgeMinutes: integer('max_token_age_minutes').default(1440), // Maximum age (24hrs default)
  minHolders: integer('min_holders').default(50), // Minimum holder count
  minWatchers: integer('min_watchers').default(10), // Minimum real people watching
  
  // === MOVEMENT FILTERS (Critical for finding momentum) ===
  minPriceChangePercent: varchar('min_price_change_percent', { length: 20 }).default('1.5'), // Min % move in timeframe
  movementTimeframeMinutes: integer('movement_timeframe_minutes').default(5), // Timeframe for movement check
  minVolumeMultiplier: varchar('min_volume_multiplier', { length: 20 }).default('2'), // Volume spike threshold (2x, 5x, 10x)
  minTradesPerMinute: integer('min_trades_per_minute').default(5), // Trade frequency
  minBuySellRatio: varchar('min_buy_sell_ratio', { length: 20 }).default('1.2'), // More buyers than sellers
  minHolderGrowthPercent: varchar('min_holder_growth_percent', { length: 20 }).default('5'), // Holder growth rate
  
  // === DEX PREFERENCES ===
  enabledDexes: text('enabled_dexes'), // JSON array: ['raydium', 'pumpfun', 'jupiter', 'orca', 'meteora']
  preferredDex: varchar('preferred_dex', { length: 50 }).default('jupiter'), // Primary DEX for swaps
  
  // === TRADE EXECUTION CONTROLS ===
  buyAmountSol: varchar('buy_amount_sol', { length: 50 }).default('0.5'), // Default buy amount
  slippagePercent: varchar('slippage_percent', { length: 20 }).default('5'), // Slippage tolerance
  priorityFee: varchar('priority_fee', { length: 20 }).default('auto'), // 'low' | 'medium' | 'high' | 'auto'
  takeProfitPercent: varchar('take_profit_percent', { length: 20 }).default('50'), // Exit at +X%
  stopLossPercent: varchar('stop_loss_percent', { length: 20 }).default('20'), // Exit at -X%
  trailingStopPercent: varchar('trailing_stop_percent', { length: 20 }), // Optional trailing stop
  
  // === SMART AUTO MODE SETTINGS ===
  maxTradesPerSession: integer('max_trades_per_session').default(10),
  maxSolPerSession: varchar('max_sol_per_session', { length: 50 }).default('5'), // Max SOL to spend
  cooldownSeconds: integer('cooldown_seconds').default(60), // Wait between trades
  maxConsecutiveLosses: integer('max_consecutive_losses').default(3), // Auto-stop trigger
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Snipe Orders - Active/pending order configurations
export const snipeOrders = pgTable('snipe_orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  walletId: varchar('wallet_id', { length: 255 }).notNull(), // Reference to userWallets
  presetId: varchar('preset_id', { length: 255 }), // Optional preset used
  
  // Order Type
  orderType: varchar('order_type', { length: 50 }).notNull(), // 'snipe' | 'limit' | 'auto'
  
  // Target Token (for specific snipes, null for discovery mode)
  targetTokenAddress: varchar('target_token_address', { length: 255 }),
  targetTokenSymbol: varchar('target_token_symbol', { length: 50 }),
  targetTokenName: varchar('target_token_name', { length: 255 }),
  
  // Filter Snapshot (copy of active filters at order creation)
  filterSnapshot: text('filter_snapshot').notNull(), // JSON of all filter settings
  
  // Trade Parameters
  buyAmountSol: varchar('buy_amount_sol', { length: 50 }).notNull(),
  slippagePercent: varchar('slippage_percent', { length: 20 }).notNull(),
  priorityFee: varchar('priority_fee', { length: 20 }).notNull(),
  takeProfitPercent: varchar('take_profit_percent', { length: 20 }),
  stopLossPercent: varchar('stop_loss_percent', { length: 20 }),
  
  // Smart Auto Mode
  isAutoMode: boolean('is_auto_mode').default(false),
  maxTradesRemaining: integer('max_trades_remaining'),
  maxSolRemaining: varchar('max_sol_remaining', { length: 50 }),
  tradesExecuted: integer('trades_executed').default(0),
  consecutiveLosses: integer('consecutive_losses').default(0),
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('active'), // 'active' | 'paused' | 'completed' | 'cancelled' | 'expired'
  statusReason: text('status_reason'), // Why it was stopped
  
  // Scheduling
  expiresAt: timestamp('expires_at'), // Optional expiration
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Snipe Executions - Individual trade outcomes
export const snipeExecutions = pgTable('snipe_executions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  orderId: varchar('order_id', { length: 255 }).notNull(), // Reference to snipeOrders
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Token Details
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  tokenName: varchar('token_name', { length: 255 }),
  
  // Trade Execution
  dex: varchar('dex', { length: 50 }).notNull(), // Which DEX was used
  txSignature: varchar('tx_signature', { length: 128 }), // Solana transaction signature
  
  // Entry Details
  entryPriceUsd: varchar('entry_price_usd', { length: 50 }),
  entryPriceSol: varchar('entry_price_sol', { length: 50 }),
  amountSolSpent: varchar('amount_sol_spent', { length: 50 }).notNull(),
  tokensReceived: varchar('tokens_received', { length: 100 }),
  actualSlippage: varchar('actual_slippage', { length: 20 }),
  
  // Exit Details (null until position closed)
  exitPriceUsd: varchar('exit_price_usd', { length: 50 }),
  exitPriceSol: varchar('exit_price_sol', { length: 50 }),
  exitTxSignature: varchar('exit_tx_signature', { length: 128 }),
  exitReason: varchar('exit_reason', { length: 50 }), // 'take_profit' | 'stop_loss' | 'manual' | 'trailing_stop'
  
  // Performance
  pnlSol: varchar('pnl_sol', { length: 50 }), // Profit/loss in SOL
  pnlUsd: varchar('pnl_usd', { length: 50 }), // Profit/loss in USD
  pnlPercent: varchar('pnl_percent', { length: 20 }), // % change
  holdDurationSeconds: integer('hold_duration_seconds'),
  
  // Token Safety Metrics at Entry (for learning)
  safetyMetrics: text('safety_metrics'), // JSON: { botPercent, bundlePercent, top10Percent, liquidity, holderCount }
  movementMetrics: text('movement_metrics'), // JSON: { priceChange, volumeMultiplier, tradesPerMin, buySellRatio }
  
  // AI Analysis
  aiRecommendation: varchar('ai_recommendation', { length: 50 }), // What AI suggested
  aiConfidence: varchar('ai_confidence', { length: 20 }),
  aiReasoning: text('ai_reasoning'),
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'executed' | 'failed' | 'holding' | 'closed'
  errorMessage: text('error_message'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  executedAt: timestamp('executed_at'),
  closedAt: timestamp('closed_at'),
});

// Sniper Bot Session Stats - Aggregated performance metrics
export const sniperSessionStats = pgTable('sniper_session_stats', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Session Window
  sessionDate: timestamp('session_date').notNull(), // Date of session
  
  // Trade Counts
  totalTrades: integer('total_trades').notNull().default(0),
  winningTrades: integer('winning_trades').notNull().default(0),
  losingTrades: integer('losing_trades').notNull().default(0),
  
  // Performance
  winRate: varchar('win_rate', { length: 20 }),
  totalPnlSol: varchar('total_pnl_sol', { length: 50 }),
  totalPnlUsd: varchar('total_pnl_usd', { length: 50 }),
  avgPnlPercent: varchar('avg_pnl_percent', { length: 20 }),
  bestTradePnl: varchar('best_trade_pnl', { length: 50 }),
  worstTradePnl: varchar('worst_trade_pnl', { length: 50 }),
  
  // Volume
  totalSolSpent: varchar('total_sol_spent', { length: 50 }),
  totalSolReturned: varchar('total_sol_returned', { length: 50 }),
  
  // Learning Metrics
  avgHoldDuration: integer('avg_hold_duration'), // Seconds
  mostProfitableDex: varchar('most_profitable_dex', { length: 50 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// LIMIT ORDER SYSTEM
// Price-based limit orders for automated trading
// ============================================

export const limitOrders = pgTable('limit_orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Token Details
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  
  // Price Targets
  entryPrice: numeric('entry_price', { precision: 30, scale: 18 }).notNull(),
  exitPrice: numeric('exit_price', { precision: 30, scale: 18 }),
  stopLoss: numeric('stop_loss', { precision: 30, scale: 18 }),
  
  // Trade Amount
  buyAmountSol: numeric('buy_amount_sol', { precision: 18, scale: 9 }).notNull(),
  
  // Wallet
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  
  // Status: PENDING | WATCHING | FILLED_ENTRY | FILLED_EXIT | STOPPED_OUT | CANCELLED
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  
  // Execution Details
  entryTxSignature: varchar('entry_tx_signature', { length: 128 }),
  exitTxSignature: varchar('exit_tx_signature', { length: 128 }),
  actualEntryPrice: numeric('actual_entry_price', { precision: 30, scale: 18 }),
  actualExitPrice: numeric('actual_exit_price', { precision: 30, scale: 18 }),
  tokensReceived: varchar('tokens_received', { length: 100 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  filledEntryAt: timestamp('filled_entry_at'),
  filledExitAt: timestamp('filled_exit_at'),
});

// ============================================
// MULTI-CHAIN STRIKEAGENT TRADES
// Trade ledger for Adaptive AI learning across all chains
// ============================================

export const strikeAgentTrades = pgTable('strike_agent_trades', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  chain: varchar('chain', { length: 50 }).notNull(), // solana, ethereum, base, polygon, arbitrum, bsc
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  tokenName: varchar('token_name', { length: 255 }),
  
  tradeType: varchar('trade_type', { length: 20 }).notNull(), // buy, sell
  source: varchar('source', { length: 50 }).notNull(), // strikeagent_auto, strikeagent_manual, limit_order, watchlist
  
  entryPrice: varchar('entry_price', { length: 50 }).notNull(),
  exitPrice: varchar('exit_price', { length: 50 }),
  amount: varchar('amount', { length: 50 }).notNull(),
  amountUsd: varchar('amount_usd', { length: 50 }).notNull(),
  
  safetyScore: integer('safety_score'),
  safetyGrade: varchar('safety_grade', { length: 5 }),
  
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, executed, partial, cancelled, failed
  txHash: varchar('tx_hash', { length: 255 }),
  gasFeeUsd: varchar('gas_fee_usd', { length: 50 }),
  
  entryTimestamp: timestamp('entry_timestamp').notNull(),
  exitTimestamp: timestamp('exit_timestamp'),
  
  profitLoss: varchar('profit_loss', { length: 50 }),
  profitLossPercent: varchar('profit_loss_percent', { length: 50 }),
  isWin: boolean('is_win'),
  
  aiPrediction: text('ai_prediction'), // JSON: { signal, confidence, probability }
  indicators: text('indicators'), // JSON: technical indicators at entry
  notes: text('notes'),
  
  predictionId: varchar('prediction_id', { length: 255 }), // Links to prediction_events for adaptive AI learning
  horizon: varchar('horizon', { length: 10 }), // 1h, 4h, 24h, 7d - time horizon for prediction learning
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// REFERRAL SYSTEM
// Tracks user referrals and rewards
// ============================================

export const referrals = pgTable('referrals', {
  id: varchar('id', { length: 255 }).primaryKey(),
  referrerUserId: varchar('referrer_user_id', { length: 255 }).notNull(),
  referredUserId: varchar('referred_user_id', { length: 255 }),
  referralCode: varchar('referral_code', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'completed' | 'rewarded'
  rewardAmount: varchar('reward_amount', { length: 50 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// STRIKEAGENT PREDICTION TRACKING
// Logs memecoin/DEX token discoveries for ML learning
// ============================================

export const strikeagentPredictions = pgTable('strikeagent_predictions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  
  // Token Information
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  tokenName: varchar('token_name', { length: 255 }),
  dex: varchar('dex', { length: 50 }),
  chain: varchar('chain', { length: 50 }).notNull().default('solana'),
  
  // Price at Discovery
  priceUsd: varchar('price_usd', { length: 50 }).notNull(),
  priceSol: varchar('price_sol', { length: 50 }),
  marketCapUsd: varchar('market_cap_usd', { length: 50 }),
  liquidityUsd: varchar('liquidity_usd', { length: 50 }),
  tokenAgeMinutes: integer('token_age_minutes'),
  
  // AI Recommendation
  aiRecommendation: varchar('ai_recommendation', { length: 20 }).notNull(), // 'snipe' | 'watch' | 'avoid'
  aiScore: integer('ai_score').notNull(), // 0-100
  aiReasoning: text('ai_reasoning'),
  
  // Safety Metrics (JSON)
  safetyMetrics: text('safety_metrics'), // { botPercent, bundlePercent, top10HoldersPercent, liquidityUsd, holderCount, etc }
  
  // Movement Metrics (JSON)
  movementMetrics: text('movement_metrics'), // { priceChangePercent, volumeMultiplier, tradesPerMinute, buySellRatio, holderGrowthPercent }
  
  // Additional Memecoin Features
  holderCount: integer('holder_count'),
  top10HoldersPercent: varchar('top10_holders_percent', { length: 20 }),
  botPercent: varchar('bot_percent', { length: 20 }),
  bundlePercent: varchar('bundle_percent', { length: 20 }),
  mintAuthorityActive: boolean('mint_authority_active'),
  freezeAuthorityActive: boolean('freeze_authority_active'),
  isHoneypot: boolean('is_honeypot'),
  liquidityLocked: boolean('liquidity_locked'),
  isPumpFun: boolean('is_pump_fun'),
  creatorWalletRisky: boolean('creator_wallet_risky'),
  
  // Blockchain Stamp
  payloadHash: varchar('payload_hash', { length: 128 }),
  onchainSignature: varchar('onchain_signature', { length: 128 }),
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'stamped' | 'evaluated'
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  stampedAt: timestamp('stamped_at'),
});

// StrikeAgent Prediction Outcomes - Track what happened to discovered tokens
export const strikeagentOutcomes = pgTable('strikeagent_outcomes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  predictionId: varchar('prediction_id', { length: 255 }).notNull(),
  
  // Time Horizon
  horizon: varchar('horizon', { length: 20 }).notNull(), // '1h' | '4h' | '24h' | '7d'
  
  // Actual Results
  priceAtCheck: varchar('price_at_check', { length: 50 }).notNull(),
  priceChangePercent: varchar('price_change_percent', { length: 20 }).notNull(),
  
  // Market Changes
  marketCapAtCheck: varchar('market_cap_at_check', { length: 50 }),
  liquidityAtCheck: varchar('liquidity_at_check', { length: 50 }),
  holderCountAtCheck: integer('holder_count_at_check'),
  volumeChange: varchar('volume_change', { length: 50 }),
  
  // Outcome Classification
  outcome: varchar('outcome', { length: 20 }).notNull(), // 'PUMP' | 'RUG' | 'SIDEWAYS' | 'MOON'
  isCorrect: boolean('is_correct').notNull(), // Did AI recommendation match actual outcome?
  
  // For snipe recommendations: Was the 2x target hit before any major dump?
  hit2x: boolean('hit_2x'),
  hit5x: boolean('hit_5x'),
  hit10x: boolean('hit_10x'),
  maxGainPercent: varchar('max_gain_percent', { length: 20 }),
  maxDrawdownPercent: varchar('max_drawdown_percent', { length: 20 }),
  
  // Token Status
  isRugged: boolean('is_rugged'),
  liquidityRemaining: varchar('liquidity_remaining', { length: 50 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  evaluatedAt: timestamp('evaluated_at').defaultNow().notNull(),
});

// ============================================
// DUST BUSTER SYSTEM
// Wallet cleanup tool for closing empty token accounts
// ============================================

// Dust Buster History - tracks each cleanup session
export const dustBusterHistory = pgTable('dust_buster_history', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  walletAddress: varchar('wallet_address', { length: 64 }).notNull(),
  accountsClosed: integer('accounts_closed').default(0),
  tokensBurned: integer('tokens_burned').default(0),
  solRecovered: numeric('sol_recovered', { precision: 18, scale: 9 }).default('0'),
  feePaid: numeric('fee_paid', { precision: 18, scale: 9 }).default('0'),
  txSignatures: text('tx_signatures'), // JSON array of signatures
  createdAt: timestamp('created_at').defaultNow(),
});

// Dust Buster Stats - user lifetime stats
export const dustBusterStats = pgTable('dust_buster_stats', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  totalSolRecovered: numeric('total_sol_recovered', { precision: 18, scale: 9 }).default('0'),
  totalFeePaid: numeric('total_fee_paid', { precision: 18, scale: 9 }).default('0'),
  totalAccountsClosed: integer('total_accounts_closed').default(0),
  totalTokensBurned: integer('total_tokens_burned').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// AUTONOMOUS TRADING SYSTEM
// AI-driven auto-trading with safety controls
// ============================================

// Auto Trade Config - user's autonomous trading preferences
export const autoTradeConfig = pgTable('auto_trade_config', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  
  // Master Switch
  enabled: boolean('enabled').default(false),
  
  // Trading Mode: 'observer' | 'approval' | 'semi-auto' | 'full-auto'
  mode: varchar('mode', { length: 20 }).default('observer').notNull(),
  
  // Confidence & Accuracy Gates
  confidenceThreshold: numeric('confidence_threshold', { precision: 4, scale: 2 }).default('0.70'), // 0.60 - 0.90
  accuracyThreshold: numeric('accuracy_threshold', { precision: 4, scale: 2 }).default('0.55'), // 0.55 - 0.75
  
  // Position Limits
  maxPerTrade: numeric('max_per_trade', { precision: 10, scale: 2 }).default('10.00'), // USD
  maxPerDay: numeric('max_per_day', { precision: 10, scale: 2 }).default('50.00'), // USD
  maxOpenPositions: integer('max_open_positions').default(3),
  
  // Safety Controls
  stopAfterLosses: integer('stop_after_losses').default(3), // Pause after X consecutive losses
  isPaused: boolean('is_paused').default(false), // Manual or auto-triggered pause
  pauseReason: text('pause_reason'), // Why trading was paused
  pausedAt: timestamp('paused_at'),
  
  // Signal Filters (JSON arrays)
  allowedSignals: text('allowed_signals').default('["BUY", "STRONG_BUY"]'), // JSON array
  allowedHorizons: text('allowed_horizons').default('["1h", "4h"]'), // JSON array
  
  // Notification Settings
  notifyOnTrade: boolean('notify_on_trade').default(true),
  notifyOnRecommendation: boolean('notify_on_recommendation').default(true),
  notifyChannel: varchar('notify_channel', { length: 20 }).default('telegram'), // 'telegram' | 'email' | 'both'
  
  // Wallet for trading (references built-in wallet)
  tradingWalletId: varchar('trading_wallet_id', { length: 255 }),
  
  // Stats
  totalTradesExecuted: integer('total_trades_executed').default(0),
  winningTrades: integer('winning_trades').default(0),
  losingTrades: integer('losing_trades').default(0),
  totalProfitLoss: numeric('total_profit_loss', { precision: 18, scale: 8 }).default('0'),
  consecutiveLosses: integer('consecutive_losses').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// STRIKE AGENT SIGNALS - Top 10 Tokens to Watch
// Scored tokens from DexScreener with safety/technical analysis
// ============================================

export const strikeAgentSignals = pgTable('strike_agent_signals', {
  id: varchar('id', { length: 255 }).primaryKey(),
  
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  tokenName: varchar('token_name', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull().default('solana'),
  
  priceUsd: numeric('price_usd', { precision: 24, scale: 12 }),
  marketCapUsd: numeric('market_cap_usd', { precision: 24, scale: 2 }),
  liquidityUsd: numeric('liquidity_usd', { precision: 24, scale: 2 }),
  
  compositeScore: integer('composite_score').notNull().default(0),
  technicalScore: integer('technical_score').notNull().default(0),
  safetyScore: integer('safety_score').notNull().default(0),
  momentumScore: integer('momentum_score').notNull().default(0),
  mlConfidence: numeric('ml_confidence', { precision: 5, scale: 4 }),
  
  indicators: text('indicators'),
  reasoning: text('reasoning'),
  
  rank: integer('rank').notNull().default(0),
  category: varchar('category', { length: 50 }).notNull().default('new'),
  dex: varchar('dex', { length: 50 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Auto Trades - track each trade executed by the autonomous system
export const autoTrades = pgTable('auto_trades', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Trade Details
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }),
  tokenName: varchar('token_name', { length: 255 }),
  chain: varchar('chain', { length: 50 }).default('solana'),
  
  // Signal that triggered the trade
  signalType: varchar('signal_type', { length: 20 }).notNull(), // 'BUY' | 'STRONG_BUY' | 'SELL'
  signalConfidence: numeric('signal_confidence', { precision: 4, scale: 2 }).notNull(),
  modelAccuracy: numeric('model_accuracy', { precision: 4, scale: 2 }),
  horizon: varchar('horizon', { length: 20 }), // '1h' | '4h' | '24h'
  predictionId: varchar('prediction_id', { length: 255 }), // Link to prediction
  
  // Trade Execution
  tradeType: varchar('trade_type', { length: 10 }).notNull(), // 'BUY' | 'SELL'
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' | 'awaiting_approval' | 'approved' | 'executed' | 'failed' | 'cancelled' | 'rejected'
  
  // Amounts
  amountUSD: numeric('amount_usd', { precision: 10, scale: 2 }).notNull(),
  amountToken: numeric('amount_token', { precision: 18, scale: 8 }),
  amountNative: numeric('amount_native', { precision: 18, scale: 8 }), // SOL/ETH amount
  
  // Prices
  entryPrice: numeric('entry_price', { precision: 18, scale: 8 }),
  exitPrice: numeric('exit_price', { precision: 18, scale: 8 }),
  currentPrice: numeric('current_price', { precision: 18, scale: 8 }),
  
  // Profit/Loss
  profitLossUSD: numeric('profit_loss_usd', { precision: 10, scale: 2 }),
  profitLossPercent: numeric('profit_loss_percent', { precision: 6, scale: 2 }),
  isWinning: boolean('is_winning'),
  
  // Transaction Details
  txSignature: varchar('tx_signature', { length: 255 }),
  txError: text('tx_error'),
  gasUsed: numeric('gas_used', { precision: 18, scale: 8 }),
  
  // Approval (for approval mode)
  requiresApproval: boolean('requires_approval').default(false),
  approvedBy: varchar('approved_by', { length: 255 }),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  
  // Timing
  recommendedAt: timestamp('recommended_at').defaultNow().notNull(),
  executedAt: timestamp('executed_at'),
  closedAt: timestamp('closed_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// QUANT SYSTEM - Automated Token Scanning & Trading
// PIN-protected developer controls with public metrics
// ============================================

// Quant Scan Config - Per-category auto-scanning settings
export const quantScanConfig = pgTable('quant_scan_config', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Category: 'top' | 'meme' | 'defi' | 'dex' | 'gainers' | 'losers' | 'blue_chip'
  category: varchar('category', { length: 50 }).notNull(),
  
  // Chains to scan (JSON array: ["solana", "ethereum", "base", "polygon", "arbitrum", "bsc"])
  chains: text('chains').default('["solana","ethereum","base","polygon","arbitrum","bsc"]'),
  
  // Scanning Configuration
  enabled: boolean('enabled').default(false),
  scanIntervalMinutes: integer('scan_interval_minutes').default(5), // 5-10 minutes
  maxTokensPerScan: integer('max_tokens_per_scan').default(20),
  
  // Filter Thresholds
  minLiquidityUsd: numeric('min_liquidity_usd', { precision: 18, scale: 2 }).default('5000'),
  minMarketCapUsd: numeric('min_market_cap_usd', { precision: 18, scale: 2 }).default('10000'),
  maxMarketCapUsd: numeric('max_market_cap_usd', { precision: 18, scale: 2 }),
  minSafetyScore: integer('min_safety_score').default(50),
  minCompositeScore: integer('min_composite_score').default(60),
  
  // Auto-trade settings for this category
  autoTradeEnabled: boolean('auto_trade_enabled').default(false),
  maxTradeAmountSol: numeric('max_trade_amount_sol', { precision: 10, scale: 4 }).default('0.1'),
  takeProfitPercent: numeric('take_profit_percent', { precision: 6, scale: 2 }).default('50'),
  stopLossPercent: numeric('stop_loss_percent', { precision: 6, scale: 2 }).default('20'),
  
  // Last Scan Info
  lastScanAt: timestamp('last_scan_at'),
  lastScanTokensFound: integer('last_scan_tokens_found').default(0),
  lastScanSignalsGenerated: integer('last_scan_signals_generated').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quant Trade Sessions - Track test trading sessions
export const quantTradeSessions = pgTable('quant_trade_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Session Identity
  sessionName: varchar('session_name', { length: 100 }),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active' | 'paused' | 'completed' | 'cancelled'
  
  // Session Limits
  maxTradesAllowed: integer('max_trades_allowed').default(10),
  maxSolAllowed: numeric('max_sol_allowed', { precision: 10, scale: 4 }).default('5'),
  
  // Session Performance
  totalTrades: integer('total_trades').default(0),
  winningTrades: integer('winning_trades').default(0),
  losingTrades: integer('losing_trades').default(0),
  totalSolUsed: numeric('total_sol_used', { precision: 10, scale: 4 }).default('0'),
  totalPnlSol: numeric('total_pnl_sol', { precision: 18, scale: 8 }).default('0'),
  totalPnlUsd: numeric('total_pnl_usd', { precision: 18, scale: 2 }).default('0'),
  
  // Best/Worst Trade
  bestTradePercent: numeric('best_trade_percent', { precision: 10, scale: 2 }),
  worstTradePercent: numeric('worst_trade_percent', { precision: 10, scale: 2 }),
  
  // Strategy Used
  strategyNotes: text('strategy_notes'),
  
  // Timing
  startedAt: timestamp('started_at').defaultNow().notNull(),
  pausedAt: timestamp('paused_at'),
  completedAt: timestamp('completed_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quant Trade Actions - Individual buys/sells within sessions
export const quantTradeActions = pgTable('quant_trade_actions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Token Info
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }),
  tokenName: varchar('token_name', { length: 255 }),
  chain: varchar('chain', { length: 50 }).default('solana'),
  
  // Action Type
  actionType: varchar('action_type', { length: 10 }).notNull(), // 'BUY' | 'SELL'
  triggerSource: varchar('trigger_source', { length: 50 }), // 'manual' | 'auto_scanner' | 'signal' | 'stop_loss' | 'take_profit'
  
  // Status
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' | 'executing' | 'executed' | 'failed' | 'cancelled'
  
  // Amounts
  amountSol: numeric('amount_sol', { precision: 18, scale: 8 }),
  amountToken: numeric('amount_token', { precision: 24, scale: 8 }),
  amountUsd: numeric('amount_usd', { precision: 18, scale: 2 }),
  
  // Prices
  priceAtAction: numeric('price_at_action', { precision: 24, scale: 12 }),
  slippagePercent: numeric('slippage_percent', { precision: 6, scale: 2 }),
  
  // For SELL actions - Calculate P&L
  entryPriceUsd: numeric('entry_price_usd', { precision: 24, scale: 12 }),
  exitPriceUsd: numeric('exit_price_usd', { precision: 24, scale: 12 }),
  pnlSol: numeric('pnl_sol', { precision: 18, scale: 8 }),
  pnlUsd: numeric('pnl_usd', { precision: 18, scale: 2 }),
  pnlPercent: numeric('pnl_percent', { precision: 10, scale: 2 }),
  isWinning: boolean('is_winning'),
  
  // Signal that triggered this trade (if any)
  signalId: varchar('signal_id', { length: 255 }),
  compositeScore: integer('composite_score'),
  safetyScore: integer('safety_score'),
  
  // Transaction Details
  txSignature: varchar('tx_signature', { length: 255 }),
  txError: text('tx_error'),
  
  // Timing
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  executedAt: timestamp('executed_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quant Learning Metrics - Aggregated stats for public display
export const quantLearningMetrics = pgTable('quant_learning_metrics', {
  id: varchar('id', { length: 255 }).primaryKey(),
  
  // Time Period
  periodType: varchar('period_type', { length: 20 }).notNull(), // 'daily' | 'weekly' | 'monthly' | 'all_time'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end'),
  
  // Category Filter (null = all)
  category: varchar('category', { length: 50 }),
  
  // Scan Metrics
  totalScans: integer('total_scans').default(0),
  totalTokensAnalyzed: integer('total_tokens_analyzed').default(0),
  signalsGenerated: integer('signals_generated').default(0),
  
  // Trade Metrics
  totalTrades: integer('total_trades').default(0),
  winningTrades: integer('winning_trades').default(0),
  losingTrades: integer('losing_trades').default(0),
  winRate: numeric('win_rate', { precision: 6, scale: 2 }),
  
  // P&L
  totalPnlSol: numeric('total_pnl_sol', { precision: 18, scale: 8 }).default('0'),
  totalPnlUsd: numeric('total_pnl_usd', { precision: 18, scale: 2 }).default('0'),
  avgTradeReturn: numeric('avg_trade_return', { precision: 10, scale: 2 }),
  bestTradeReturn: numeric('best_trade_return', { precision: 10, scale: 2 }),
  worstTradeReturn: numeric('worst_trade_return', { precision: 10, scale: 2 }),
  
  // Model Performance (if ML is active)
  modelAccuracy: numeric('model_accuracy', { precision: 6, scale: 2 }),
  predictionsMade: integer('predictions_made').default(0),
  predictionsCorrect: integer('predictions_correct').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// MULTI-SIG VAULT SYSTEM
// Supports Solana (Squads) + EVM (Safe) multi-sig vaults
// ============================================

// Multi-Sig Vaults - Parent vault record for both Solana and EVM
export const multisigVaults = pgTable('multisig_vaults', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Vault Identity
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  
  // Chain Information
  chainType: varchar('chain_type', { length: 20 }).notNull(), // 'solana' | 'evm'
  chainId: varchar('chain_id', { length: 50 }).notNull(), // 'solana' | 'ethereum' | 'base' | 'polygon' etc.
  
  // Vault Address (PDA for Solana, Safe address for EVM)
  vaultAddress: varchar('vault_address', { length: 255 }).notNull(),
  
  // Solana-specific (Squads)
  multisigPda: varchar('multisig_pda', { length: 255 }),
  createKey: varchar('create_key', { length: 255 }),
  vaultBump: integer('vault_bump'),
  transactionIndex: integer('transaction_index').default(0),
  
  // EVM-specific (Safe)
  safeAddress: varchar('safe_address', { length: 255 }),
  safeVersion: varchar('safe_version', { length: 20 }),
  fallbackHandler: varchar('fallback_handler', { length: 255 }),
  
  // Threshold Configuration
  threshold: integer('threshold').notNull(),
  
  // Optional Features
  timeLock: integer('time_lock').default(0),
  spendingLimit: numeric('spending_limit', { precision: 24, scale: 8 }),
  spendingLimitToken: varchar('spending_limit_token', { length: 255 }),
  
  // Status
  status: varchar('status', { length: 20 }).default('active').notNull(),
  
  // Metadata
  avatarUrl: text('avatar_url'),
  color: varchar('color', { length: 20 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vault Signers - Members who can sign transactions
export const vaultSigners = pgTable('vault_signers', {
  id: varchar('id', { length: 255 }).primaryKey(),
  vaultId: varchar('vault_id', { length: 255 }).notNull(),
  
  // Signer Identity
  address: varchar('address', { length: 255 }).notNull(),
  nickname: varchar('nickname', { length: 100 }),
  
  // Role & Permissions
  role: varchar('role', { length: 20 }).default('signer').notNull(),
  
  // Permissions
  canInitiate: boolean('can_initiate').default(true),
  canVote: boolean('can_vote').default(true),
  canExecute: boolean('can_execute').default(true),
  
  // Status
  status: varchar('status', { length: 20 }).default('active').notNull(),
  addedBy: varchar('added_by', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vault Proposals - Pending transactions requiring approval
export const vaultProposals = pgTable('vault_proposals', {
  id: varchar('id', { length: 255 }).primaryKey(),
  vaultId: varchar('vault_id', { length: 255 }).notNull(),
  
  // Proposal Identity
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  proposalIndex: integer('proposal_index').notNull(),
  
  // Transaction Details
  txType: varchar('tx_type', { length: 50 }).notNull(),
  
  // For transfers
  toAddress: varchar('to_address', { length: 255 }),
  amount: numeric('amount', { precision: 24, scale: 8 }),
  tokenAddress: varchar('token_address', { length: 255 }),
  tokenSymbol: varchar('token_symbol', { length: 20 }),
  tokenDecimals: integer('token_decimals'),
  
  // For config changes
  newThreshold: integer('new_threshold'),
  signerToAdd: varchar('signer_to_add', { length: 255 }),
  signerToRemove: varchar('signer_to_remove', { length: 255 }),
  
  // Raw transaction data
  rawTxData: text('raw_tx_data'),
  
  // Solana-specific
  squadsTransactionPda: varchar('squads_transaction_pda', { length: 255 }),
  
  // EVM-specific
  safeTxHash: varchar('safe_tx_hash', { length: 255 }),
  safeNonce: integer('safe_nonce'),
  
  // Approval Tracking
  approvalsRequired: integer('approvals_required').notNull(),
  approvalsReceived: integer('approvals_received').default(0),
  rejectionsReceived: integer('rejections_received').default(0),
  
  // Timing
  expiresAt: timestamp('expires_at'),
  executionTimeLock: timestamp('execution_time_lock'),
  
  // Status
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  
  // Execution Details
  executedBy: varchar('executed_by', { length: 255 }),
  executedTxHash: varchar('executed_tx_hash', { length: 255 }),
  executionError: text('execution_error'),
  
  // Creator
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  executedAt: timestamp('executed_at'),
});

// Proposal Votes - Individual signer votes on proposals
export const proposalVotes = pgTable('proposal_votes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  proposalId: varchar('proposal_id', { length: 255 }).notNull(),
  vaultId: varchar('vault_id', { length: 255 }).notNull(),
  
  // Voter
  signerAddress: varchar('signer_address', { length: 255 }).notNull(),
  
  // Vote
  vote: varchar('vote', { length: 20 }).notNull(),
  
  // On-chain signature
  signature: text('signature'),
  
  // EVM signature components
  signatureV: integer('signature_v'),
  signatureR: varchar('signature_r', { length: 255 }),
  signatureS: varchar('signature_s', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vault Activity Log - Audit trail
export const vaultActivityLog = pgTable('vault_activity_log', {
  id: varchar('id', { length: 255 }).primaryKey(),
  vaultId: varchar('vault_id', { length: 255 }).notNull(),
  
  // Event Type
  eventType: varchar('event_type', { length: 50 }).notNull(),
  
  // Actor
  actorAddress: varchar('actor_address', { length: 255 }),
  
  // Event Data (JSON)
  eventData: text('event_data'),
  
  // Related entities
  proposalId: varchar('proposal_id', { length: 255 }),
  txHash: varchar('tx_hash', { length: 255 }),
  
  // Amount
  amount: numeric('amount', { precision: 24, scale: 8 }),
  tokenAddress: varchar('token_address', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// PUBLIC API KEY MANAGEMENT SYSTEM
// ============================================

// API Keys - For external developers to access Pulse API
// API Permission Scopes
export const API_SCOPES = [
  'market:read',      // Access market data, prices, overview
  'signals:read',     // Access AI trading signals
  'predictions:read', // Access prediction history and outcomes
  'accuracy:read',    // Access model accuracy statistics
  'strikeagent:read', // Access StrikeAgent token scanning
  'webhooks:write',   // Register webhook callbacks
] as const;

export type ApiScope = typeof API_SCOPES[number];

export const apiKeys = pgTable('api_keys', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Key Details
  name: varchar('name', { length: 255 }).notNull(),
  keyPrefix: varchar('key_prefix', { length: 20 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(),
  
  // Environment (live = production, test = sandbox with mock data)
  environment: varchar('environment', { length: 20 }).notNull().default('live'),
  
  // Tier & Limits
  tier: varchar('tier', { length: 50 }).notNull().default('free'),
  rateLimit: integer('rate_limit').notNull().default(60),
  dailyLimit: integer('daily_limit').notNull().default(2000),
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('active'),
  lastUsedAt: timestamp('last_used_at'),
  
  // Scoped Permissions (JSON array of scope strings)
  permissions: text('permissions'),
  
  // Metadata
  description: text('description'),
  webhookUrl: text('webhook_url'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
});

// API Usage Tracking - Daily usage per API key
export const apiUsageDaily = pgTable('api_usage_daily', {
  id: varchar('id', { length: 255 }).primaryKey(),
  keyId: varchar('key_id', { length: 255 }).notNull(),
  
  // Date (stored as YYYY-MM-DD string for easy grouping)
  date: varchar('date', { length: 10 }).notNull(),
  
  // Usage Counts
  requestCount: integer('request_count').notNull().default(0),
  successCount: integer('success_count').notNull().default(0),
  errorCount: integer('error_count').notNull().default(0),
  
  // Endpoint Breakdown (JSON object with counts per endpoint)
  endpointBreakdown: text('endpoint_breakdown'),
  
  // Rate Limit Hits
  rateLimitHits: integer('rate_limit_hits').notNull().default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// API Request Logs - Individual request logs (optional, for debugging)
export const apiRequestLogs = pgTable('api_request_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  keyId: varchar('key_id', { length: 255 }).notNull(),
  
  // Request Details
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: integer('status_code').notNull(),
  
  // Performance
  latencyMs: integer('latency_ms'),
  
  // Request/Response (truncated for storage)
  requestParams: text('request_params'),
  responsePreview: text('response_preview'),
  
  // Error Details
  errorMessage: text('error_message'),
  
  // Client Info
  ipHash: varchar('ip_hash', { length: 64 }),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// API Subscriptions - Developer API tier subscriptions
export const apiSubscriptions = pgTable('api_subscriptions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  tier: varchar('tier', { length: 50 }).notNull().default('free'), // free, pro, enterprise
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, canceled, past_due
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Analytics - Page Views tracking for Developers Portal
export const pageViews = pgTable('page_views', {
  id: varchar('id', { length: 255 }).primaryKey(),
  tenantId: text('tenant_id').default('pulse'),
  page: text('page').notNull(),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ipHash: text('ip_hash'),
  sessionId: text('session_id'),
  deviceType: text('device_type'),
  browser: text('browser'),
  country: text('country'),
  city: text('city'),
  duration: integer('duration'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// SOCIAL TRADING SYSTEM
// Leaderboards, Copy Trading, Community Signals
// ============================================

// Trader leaderboard - tracks user trading performance
export const traderProfiles = pgTable('trader_profiles', {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  displayName: varchar("display_name", { length: 50 }),
  bio: text("bio"),
  totalPnl: decimal("total_pnl", { precision: 18, scale: 2 }).default("0"),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0"),
  totalTrades: integer("total_trades").default(0),
  followers: integer("followers").default(0),
  rank: integer("rank"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Copy trading subscriptions
export const copyTradingSubscriptions = pgTable('copy_trading_subscriptions', {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id", { length: 36 }).notNull(),
  traderId: varchar("trader_id", { length: 36 }).notNull(),
  allocationPercent: decimal("allocation_percent", { precision: 5, scale: 2 }).default("10"),
  maxPositionSize: decimal("max_position_size", { precision: 18, scale: 2 }),
  isActive: boolean("is_active").default(true),
  totalCopiedTrades: integer("total_copied_trades").default(0),
  totalPnlFromCopying: decimal("total_pnl_from_copying", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community signals
export const communitySignals = pgTable('community_signals', {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  traderId: varchar("trader_id", { length: 36 }).notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  signal: varchar("signal", { length: 20 }).notNull(),
  targetPrice: decimal("target_price", { precision: 18, scale: 8 }),
  stopLoss: decimal("stop_loss", { precision: 18, scale: 8 }),
  analysis: text("analysis"),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Signal votes - track who voted on which signals
export const signalVotes = pgTable('signal_votes', {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  signalId: varchar("signal_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  vote: integer("vote").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// EXCHANGE CONNECTIONS - CEX/DEX Trading
// Encrypted API key storage for exchange integrations
// ============================================

export const exchangeConnections = pgTable('exchange_connections', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  exchangeName: varchar('exchange_name', { length: 50 }).notNull(),
  exchangeType: varchar('exchange_type', { length: 10 }).notNull(),
  
  encryptedCredentials: text('encrypted_credentials').notNull(),
  
  nickname: varchar('nickname', { length: 100 }),
  isActive: boolean('is_active').default(true),
  lastValidated: timestamp('last_validated'),
  validationStatus: varchar('validation_status', { length: 20 }).default('pending'),
  
  permissions: text('permissions'),
  
  rateLimitRemaining: integer('rate_limit_remaining'),
  rateLimitResetAt: timestamp('rate_limit_reset_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const exchangeOrders = pgTable('exchange_orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  connectionId: varchar('connection_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  exchangeOrderId: varchar('exchange_order_id', { length: 255 }).notNull(),
  symbol: varchar('symbol', { length: 50 }).notNull(),
  side: varchar('side', { length: 10 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  
  price: varchar('price', { length: 50 }),
  stopPrice: varchar('stop_price', { length: 50 }),
  quantity: varchar('quantity', { length: 50 }).notNull(),
  executedQty: varchar('executed_qty', { length: 50 }),
  avgPrice: varchar('avg_price', { length: 50 }),
  
  fee: varchar('fee', { length: 50 }),
  feeAsset: varchar('fee_asset', { length: 20 }),
  
  clientOrderId: varchar('client_order_id', { length: 255 }),
  timeInForce: varchar('time_in_force', { length: 10 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  filledAt: timestamp('filled_at'),
});

export const exchangeBalanceSnapshots = pgTable('exchange_balance_snapshots', {
  id: varchar('id', { length: 255 }).primaryKey(),
  connectionId: varchar('connection_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  balances: text('balances').notNull(),
  totalUsdValue: varchar('total_usd_value', { length: 50 }),
  
  snapshotAt: timestamp('snapshot_at').defaultNow().notNull(),
});

// ============================================
// AUTONOMOUS TRADING SYSTEM
// Trading profiles, suggestions, executions, risk management
// ============================================

export const tradingProfiles = pgTable('trading_profiles', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  mode: varchar('mode', { length: 50 }).notNull().default('observer'),
  
  maxPositionSizeUsd: decimal('max_position_size_usd', { precision: 18, scale: 2 }).default('100'),
  maxDailyLossUsd: decimal('max_daily_loss_usd', { precision: 18, scale: 2 }).default('50'),
  maxSimultaneousTrades: integer('max_simultaneous_trades').default(3),
  minConfidenceThreshold: decimal('min_confidence_threshold', { precision: 5, scale: 2 }).default('0.65'),
  
  killSwitchActive: boolean('kill_switch_active').default(false),
  killSwitchReason: text('kill_switch_reason'),
  
  fullAutoUnlocked: boolean('full_auto_unlocked').default(false),
  evaluatedOutcomesAtUnlock: integer('evaluated_outcomes_at_unlock'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tradeSuggestions = pgTable('trade_suggestions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  predictionId: varchar('prediction_id', { length: 255 }),
  
  ticker: varchar('ticker', { length: 50 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull().default('solana'),
  signal: varchar('signal', { length: 50 }).notNull(),
  confidence: decimal('confidence', { precision: 5, scale: 4 }),
  suggestedSizeUsd: decimal('suggested_size_usd', { precision: 18, scale: 2 }),
  entryPrice: decimal('entry_price', { precision: 24, scale: 12 }),
  rationale: text('rationale'),
  
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  expiresAt: timestamp('expires_at'),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tradeExecutions = pgTable('trade_executions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  suggestionId: varchar('suggestion_id', { length: 255 }),
  exchangeConnectionId: varchar('exchange_connection_id', { length: 255 }),
  
  ticker: varchar('ticker', { length: 50 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  side: varchar('side', { length: 10 }).notNull(),
  sizeUsd: decimal('size_usd', { precision: 18, scale: 2 }),
  entryPrice: decimal('entry_price', { precision: 24, scale: 12 }),
  exitPrice: decimal('exit_price', { precision: 24, scale: 12 }),
  
  status: varchar('status', { length: 50 }).notNull().default('open'),
  mode: varchar('mode', { length: 50 }).notNull(),
  
  realizedPnlUsd: decimal('realized_pnl_usd', { precision: 18, scale: 2 }),
  realizedPnlPercent: decimal('realized_pnl_percent', { precision: 10, scale: 4 }),
  
  exchangeOrderId: varchar('exchange_order_id', { length: 255 }),
  errorMessage: text('error_message'),
  
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

export const dailyRiskSnapshots = pgTable('daily_risk_snapshots', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  snapshotDate: timestamp('snapshot_date').notNull(),
  
  totalExposureUsd: decimal('total_exposure_usd', { precision: 18, scale: 2 }).default('0'),
  realizedPnlUsd: decimal('realized_pnl_usd', { precision: 18, scale: 2 }).default('0'),
  unrealizedPnlUsd: decimal('unrealized_pnl_usd', { precision: 18, scale: 2 }).default('0'),
  tradesExecuted: integer('trades_executed').default(0),
  
  killSwitchTriggered: boolean('kill_switch_triggered').default(false),
  killSwitchReason: text('kill_switch_reason'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tradingMilestones = pgTable('trading_milestones', {
  id: varchar('id', { length: 255 }).primaryKey(),
  milestoneName: varchar('milestone_name', { length: 100 }).notNull(),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').default(0),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const webauthnCredentials = pgTable('webauthn_credentials', {
  id: varchar('id', { length: 255 }).primaryKey(),
  sessionToken: varchar('session_token', { length: 255 }).notNull(),
  credentialId: text('credential_id').notNull(),
  publicKey: text('public_key').notNull(),
  counter: integer('counter').notNull().default(0),
  deviceName: varchar('device_name', { length: 255 }),
  transports: text('transports'),
  usedFor: varchar('used_for', { length: 50 }).notNull().default('2fa'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const webauthnChallenges = pgTable('webauthn_challenges', {
  id: varchar('id', { length: 255 }).primaryKey(),
  sessionToken: varchar('session_token', { length: 255 }).notNull(),
  challenge: text('challenge').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ecosystemApps = pgTable('ecosystem_apps', {
  id: varchar('id', { length: 255 }).primaryKey(),
  appName: varchar('app_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  hook: varchar('hook', { length: 255 }).notNull(),
  valueProposition: text('value_proposition').notNull(),
  keyTags: json('key_tags').$type<string[]>().default([]),
  imagePrompt: text('image_prompt'),
  generatedImageUrl: text('generated_image_url'),
  websiteUrl: varchar('website_url', { length: 500 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  submittedBy: varchar('submitted_by', { length: 255 }),
  apiKey: varchar('api_key', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// PORTFOLIO & WEALTH MANAGEMENT SYSTEM
// Multi-wallet aggregation, P&L tracking, tax reports
// ============================================

export const portfolioWallets = pgTable('portfolio_wallets', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  nickname: varchar('nickname', { length: 100 }),
  walletType: varchar('wallet_type', { length: 50 }).default('external'),
  isConnected: boolean('is_connected').default(true),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const portfolioHoldings = pgTable('portfolio_holdings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  walletId: varchar('wallet_id', { length: 255 }),
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  tokenName: varchar('token_name', { length: 255 }),
  chain: varchar('chain', { length: 50 }).notNull(),
  balance: decimal('balance', { precision: 36, scale: 18 }).notNull(),
  balanceUsd: decimal('balance_usd', { precision: 18, scale: 2 }),
  price: decimal('price', { precision: 24, scale: 12 }),
  priceChange24h: decimal('price_change_24h', { precision: 10, scale: 4 }),
  costBasisUsd: decimal('cost_basis_usd', { precision: 18, scale: 2 }),
  unrealizedPnlUsd: decimal('unrealized_pnl_usd', { precision: 18, scale: 2 }),
  unrealizedPnlPercent: decimal('unrealized_pnl_percent', { precision: 10, scale: 4 }),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const portfolioSnapshots = pgTable('portfolio_snapshots', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  snapshotDate: timestamp('snapshot_date').notNull(),
  totalValueUsd: decimal('total_value_usd', { precision: 18, scale: 2 }).notNull(),
  totalCostBasisUsd: decimal('total_cost_basis_usd', { precision: 18, scale: 2 }),
  totalPnlUsd: decimal('total_pnl_usd', { precision: 18, scale: 2 }),
  totalPnlPercent: decimal('total_pnl_percent', { precision: 10, scale: 4 }),
  holdingsCount: integer('holdings_count').default(0),
  topHoldings: text('top_holdings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const portfolioTransactions = pgTable('portfolio_transactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  walletId: varchar('wallet_id', { length: 255 }),
  txHash: varchar('tx_hash', { length: 255 }),
  chain: varchar('chain', { length: 50 }).notNull(),
  txType: varchar('tx_type', { length: 50 }).notNull(),
  tokenIn: varchar('token_in', { length: 255 }),
  tokenOut: varchar('token_out', { length: 255 }),
  amountIn: decimal('amount_in', { precision: 36, scale: 18 }),
  amountOut: decimal('amount_out', { precision: 36, scale: 18 }),
  priceUsd: decimal('price_usd', { precision: 24, scale: 12 }),
  valueUsd: decimal('value_usd', { precision: 18, scale: 2 }),
  feeUsd: decimal('fee_usd', { precision: 18, scale: 6 }),
  realizedPnlUsd: decimal('realized_pnl_usd', { precision: 18, scale: 2 }),
  costBasisMethod: varchar('cost_basis_method', { length: 20 }).default('FIFO'),
  txTimestamp: timestamp('tx_timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const costBasisLots = pgTable('cost_basis_lots', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  acquiredAmount: decimal('acquired_amount', { precision: 36, scale: 18 }).notNull(),
  remainingAmount: decimal('remaining_amount', { precision: 36, scale: 18 }).notNull(),
  costBasisPerUnit: decimal('cost_basis_per_unit', { precision: 24, scale: 12 }).notNull(),
  totalCostBasis: decimal('total_cost_basis', { precision: 18, scale: 2 }).notNull(),
  acquiredAt: timestamp('acquired_at').notNull(),
  txHash: varchar('tx_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// ALERTS & NOTIFICATIONS SYSTEM
// Price alerts, whale alerts, smart money tracking
// ============================================

export const priceAlerts = pgTable('price_alerts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  tokenAddress: varchar('token_address', { length: 255 }),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  chain: varchar('chain', { length: 50 }).default('all'),
  alertType: varchar('alert_type', { length: 50 }).notNull(),
  condition: varchar('condition', { length: 20 }).notNull(),
  targetPrice: decimal('target_price', { precision: 24, scale: 12 }),
  targetPercent: decimal('target_percent', { precision: 10, scale: 4 }),
  currentPrice: decimal('current_price', { precision: 24, scale: 12 }),
  isActive: boolean('is_active').default(true),
  isTriggered: boolean('is_triggered').default(false),
  triggeredAt: timestamp('triggered_at'),
  notifyTelegram: boolean('notify_telegram').default(true),
  notifyEmail: boolean('notify_email').default(false),
  notifyPush: boolean('notify_push').default(false),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const whaleAlerts = pgTable('whale_alerts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  watchedAddress: varchar('watched_address', { length: 255 }).notNull(),
  addressLabel: varchar('address_label', { length: 100 }),
  chain: varchar('chain', { length: 50 }).notNull(),
  minAmountUsd: decimal('min_amount_usd', { precision: 18, scale: 2 }).default('10000'),
  alertOnBuy: boolean('alert_on_buy').default(true),
  alertOnSell: boolean('alert_on_sell').default(true),
  alertOnTransfer: boolean('alert_on_transfer').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const whaleTransactions = pgTable('whale_transactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  whaleAddress: varchar('whale_address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  txHash: varchar('tx_hash', { length: 255 }).notNull(),
  txType: varchar('tx_type', { length: 50 }).notNull(),
  tokenAddress: varchar('token_address', { length: 255 }),
  tokenSymbol: varchar('token_symbol', { length: 50 }),
  amount: decimal('amount', { precision: 36, scale: 18 }),
  valueUsd: decimal('value_usd', { precision: 18, scale: 2 }),
  fromAddress: varchar('from_address', { length: 255 }),
  toAddress: varchar('to_address', { length: 255 }),
  txTimestamp: timestamp('tx_timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const smartMoneyWallets = pgTable('smart_money_wallets', {
  id: varchar('id', { length: 255 }).primaryKey(),
  address: varchar('address', { length: 255 }).notNull().unique(),
  chain: varchar('chain', { length: 50 }).notNull(),
  label: varchar('label', { length: 100 }),
  category: varchar('category', { length: 50 }),
  winRate: decimal('win_rate', { precision: 5, scale: 2 }),
  totalPnlUsd: decimal('total_pnl_usd', { precision: 18, scale: 2 }),
  tradesCount: integer('trades_count').default(0),
  avgHoldTime: varchar('avg_hold_time', { length: 50 }),
  isVerified: boolean('is_verified').default(false),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notificationChannels = pgTable('notification_channels', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  channelType: varchar('channel_type', { length: 50 }).notNull(),
  channelValue: varchar('channel_value', { length: 255 }).notNull(),
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notificationLogs = pgTable('notification_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  alertId: varchar('alert_id', { length: 255 }),
  alertType: varchar('alert_type', { length: 50 }).notNull(),
  channelType: varchar('channel_type', { length: 50 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// SOCIAL & COMMUNITY SYSTEM
// Profiles, follows, leaderboards, signal sharing
// ============================================

export const traderProfiles = pgTable('trader_profiles', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }),
  username: varchar('username', { length: 50 }).unique(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  isPublic: boolean('is_public').default(false),
  showPnl: boolean('show_pnl').default(true),
  showTrades: boolean('show_trades').default(true),
  totalPnlUsd: decimal('total_pnl_usd', { precision: 18, scale: 2 }).default('0'),
  winRate: decimal('win_rate', { precision: 5, scale: 2 }).default('0'),
  tradesCount: integer('trades_count').default(0),
  followersCount: integer('followers_count').default(0),
  followingCount: integer('following_count').default(0),
  rank: integer('rank'),
  badges: text('badges'),
  verifiedTrader: boolean('verified_trader').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const traderFollows = pgTable('trader_follows', {
  id: varchar('id', { length: 255 }).primaryKey(),
  followerId: varchar('follower_id', { length: 255 }).notNull(),
  followingId: varchar('following_id', { length: 255 }).notNull(),
  copyTrading: boolean('copy_trading').default(false),
  copyPercent: decimal('copy_percent', { precision: 5, scale: 2 }),
  maxCopyAmountUsd: decimal('max_copy_amount_usd', { precision: 18, scale: 2 }),
  notifyOnTrade: boolean('notify_on_trade').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sharedSignals = pgTable('shared_signals', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  tokenAddress: varchar('token_address', { length: 255 }),
  chain: varchar('chain', { length: 50 }),
  signalType: varchar('signal_type', { length: 20 }).notNull(),
  entryPrice: decimal('entry_price', { precision: 24, scale: 12 }),
  targetPrice: decimal('target_price', { precision: 24, scale: 12 }),
  stopLoss: decimal('stop_loss', { precision: 24, scale: 12 }),
  reasoning: text('reasoning'),
  confidence: varchar('confidence', { length: 20 }),
  isPublic: boolean('is_public').default(true),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  copiesCount: integer('copies_count').default(0),
  outcome: varchar('outcome', { length: 20 }),
  outcomePercent: decimal('outcome_percent', { precision: 10, scale: 4 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

export const signalComments = pgTable('signal_comments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  signalId: varchar('signal_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  comment: text('comment').notNull(),
  likesCount: integer('likes_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leaderboardSnapshots = pgTable('leaderboard_snapshots', {
  id: varchar('id', { length: 255 }).primaryKey(),
  period: varchar('period', { length: 20 }).notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  rankings: text('rankings').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// DEFI DASHBOARD SYSTEM
// Staking, yield farming, LP positions, APY tracking
// ============================================

export const defiPositions = pgTable('defi_positions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  protocol: varchar('protocol', { length: 100 }).notNull(),
  protocolLogo: text('protocol_logo'),
  positionType: varchar('position_type', { length: 50 }).notNull(),
  poolName: varchar('pool_name', { length: 255 }),
  poolAddress: varchar('pool_address', { length: 255 }),
  token0Symbol: varchar('token0_symbol', { length: 50 }),
  token0Address: varchar('token0_address', { length: 255 }),
  token0Amount: decimal('token0_amount', { precision: 36, scale: 18 }),
  token1Symbol: varchar('token1_symbol', { length: 50 }),
  token1Address: varchar('token1_address', { length: 255 }),
  token1Amount: decimal('token1_amount', { precision: 36, scale: 18 }),
  stakedAmount: decimal('staked_amount', { precision: 36, scale: 18 }),
  rewardToken: varchar('reward_token', { length: 50 }),
  pendingRewards: decimal('pending_rewards', { precision: 36, scale: 18 }),
  valueUsd: decimal('value_usd', { precision: 18, scale: 2 }),
  apy: decimal('apy', { precision: 10, scale: 4 }),
  apr: decimal('apr', { precision: 10, scale: 4 }),
  dailyYieldUsd: decimal('daily_yield_usd', { precision: 18, scale: 6 }),
  impermanentLossPercent: decimal('impermanent_loss_percent', { precision: 10, scale: 4 }),
  healthFactor: decimal('health_factor', { precision: 10, scale: 4 }),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const defiProtocols = pgTable('defi_protocols', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  chain: varchar('chain', { length: 50 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  tvl: decimal('tvl', { precision: 24, scale: 2 }),
  tvlChange24h: decimal('tvl_change_24h', { precision: 10, scale: 4 }),
  avgApy: decimal('avg_apy', { precision: 10, scale: 4 }),
  riskScore: varchar('risk_score', { length: 20 }),
  isAudited: boolean('is_audited').default(false),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const yieldOpportunities = pgTable('yield_opportunities', {
  id: varchar('id', { length: 255 }).primaryKey(),
  protocolId: varchar('protocol_id', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  poolName: varchar('pool_name', { length: 255 }).notNull(),
  poolAddress: varchar('pool_address', { length: 255 }),
  tokens: text('tokens'),
  apy: decimal('apy', { precision: 10, scale: 4 }).notNull(),
  apr: decimal('apr', { precision: 10, scale: 4 }),
  baseApy: decimal('base_apy', { precision: 10, scale: 4 }),
  rewardApy: decimal('reward_apy', { precision: 10, scale: 4 }),
  tvl: decimal('tvl', { precision: 24, scale: 2 }),
  riskLevel: varchar('risk_level', { length: 20 }),
  ilRisk: varchar('il_risk', { length: 20 }),
  depositFee: decimal('deposit_fee', { precision: 5, scale: 4 }),
  withdrawFee: decimal('withdraw_fee', { precision: 5, scale: 4 }),
  lockupPeriod: varchar('lockup_period', { length: 50 }),
  minDeposit: decimal('min_deposit', { precision: 24, scale: 2 }),
  featured: boolean('featured').default(false),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// ============================================
// CALENDAR & EVENTS SYSTEM
// Token unlocks, airdrops, IDOs, network upgrades
// ============================================

export const cryptoEvents = pgTable('crypto_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  tokenSymbol: varchar('token_symbol', { length: 50 }),
  tokenAddress: varchar('token_address', { length: 255 }),
  chain: varchar('chain', { length: 50 }),
  eventDate: timestamp('event_date').notNull(),
  eventEndDate: timestamp('event_end_date'),
  valueUsd: decimal('value_usd', { precision: 24, scale: 2 }),
  impactLevel: varchar('impact_level', { length: 20 }),
  sourceUrl: text('source_url'),
  isConfirmed: boolean('is_confirmed').default(true),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tokenUnlocks = pgTable('token_unlocks', {
  id: varchar('id', { length: 255 }).primaryKey(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  tokenAddress: varchar('token_address', { length: 255 }),
  chain: varchar('chain', { length: 50 }),
  unlockDate: timestamp('unlock_date').notNull(),
  unlockAmount: decimal('unlock_amount', { precision: 36, scale: 18 }).notNull(),
  unlockValueUsd: decimal('unlock_value_usd', { precision: 24, scale: 2 }),
  percentOfSupply: decimal('percent_of_supply', { precision: 10, scale: 4 }),
  unlockType: varchar('unlock_type', { length: 50 }),
  recipientType: varchar('recipient_type', { length: 50 }),
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const airdropTracking = pgTable('airdrop_tracking', {
  id: varchar('id', { length: 255 }).primaryKey(),
  projectName: varchar('project_name', { length: 255 }).notNull(),
  tokenSymbol: varchar('token_symbol', { length: 50 }),
  chain: varchar('chain', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('upcoming'),
  estimatedDate: timestamp('estimated_date'),
  snapshotDate: timestamp('snapshot_date'),
  claimStartDate: timestamp('claim_start_date'),
  claimEndDate: timestamp('claim_end_date'),
  eligibilityCriteria: text('eligibility_criteria'),
  estimatedValueUsd: decimal('estimated_value_usd', { precision: 18, scale: 2 }),
  websiteUrl: text('website_url'),
  twitterUrl: text('twitter_url'),
  discordUrl: text('discord_url'),
  isFeatured: boolean('is_featured').default(false),
  riskLevel: varchar('risk_level', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userEventReminders = pgTable('user_event_reminders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  eventId: varchar('event_id', { length: 255 }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  reminderTime: timestamp('reminder_time').notNull(),
  notified: boolean('notified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// ON-CHAIN ANALYTICS SYSTEM
// DEX volume, holder distribution, token flows, gas tracker
// ============================================

export const tokenHolderStats = pgTable('token_holder_stats', {
  id: varchar('id', { length: 255 }).primaryKey(),
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  totalHolders: integer('total_holders').notNull(),
  top10Percent: decimal('top10_percent', { precision: 10, scale: 4 }),
  top50Percent: decimal('top50_percent', { precision: 10, scale: 4 }),
  top100Percent: decimal('top100_percent', { precision: 10, scale: 4 }),
  holdersChange24h: integer('holders_change_24h'),
  distribution: text('distribution'),
  snapshotAt: timestamp('snapshot_at').defaultNow().notNull(),
});

export const tokenFlows = pgTable('token_flows', {
  id: varchar('id', { length: 255 }).primaryKey(),
  tokenAddress: varchar('token_address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  flowType: varchar('flow_type', { length: 50 }).notNull(),
  fromCategory: varchar('from_category', { length: 50 }),
  toCategory: varchar('to_category', { length: 50 }),
  amount: decimal('amount', { precision: 36, scale: 18 }).notNull(),
  valueUsd: decimal('value_usd', { precision: 18, scale: 2 }),
  txCount: integer('tx_count').default(1),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dexVolumeStats = pgTable('dex_volume_stats', {
  id: varchar('id', { length: 255 }).primaryKey(),
  chain: varchar('chain', { length: 50 }).notNull(),
  dexName: varchar('dex_name', { length: 100 }),
  tokenAddress: varchar('token_address', { length: 255 }),
  tokenSymbol: varchar('token_symbol', { length: 50 }),
  volume24h: decimal('volume_24h', { precision: 24, scale: 2 }).notNull(),
  volumeChange24h: decimal('volume_change_24h', { precision: 10, scale: 4 }),
  trades24h: integer('trades_24h'),
  uniqueBuyers24h: integer('unique_buyers_24h'),
  uniqueSellers24h: integer('unique_sellers_24h'),
  buyVolume: decimal('buy_volume', { precision: 24, scale: 2 }),
  sellVolume: decimal('sell_volume', { precision: 24, scale: 2 }),
  snapshotAt: timestamp('snapshot_at').defaultNow().notNull(),
});

export const gasPrices = pgTable('gas_prices', {
  id: varchar('id', { length: 255 }).primaryKey(),
  chain: varchar('chain', { length: 50 }).notNull(),
  slowGwei: decimal('slow_gwei', { precision: 18, scale: 9 }),
  standardGwei: decimal('standard_gwei', { precision: 18, scale: 9 }),
  fastGwei: decimal('fast_gwei', { precision: 18, scale: 9 }),
  instantGwei: decimal('instant_gwei', { precision: 18, scale: 9 }),
  baseFee: decimal('base_fee', { precision: 18, scale: 9 }),
  priorityFee: decimal('priority_fee', { precision: 18, scale: 9 }),
  estimatedSwapCostUsd: decimal('estimated_swap_cost_usd', { precision: 10, scale: 4 }),
  congestionLevel: varchar('congestion_level', { length: 20 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// NFT PORTFOLIO SYSTEM
// NFT holdings, floor prices, collection tracking
// ============================================

export const nftHoldings = pgTable('nft_holdings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  collectionAddress: varchar('collection_address', { length: 255 }).notNull(),
  collectionName: varchar('collection_name', { length: 255 }),
  tokenId: varchar('token_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  imageUrl: text('image_url'),
  rarity: varchar('rarity', { length: 50 }),
  rarityRank: integer('rarity_rank'),
  lastSalePrice: decimal('last_sale_price', { precision: 24, scale: 12 }),
  estimatedValue: decimal('estimated_value', { precision: 18, scale: 2 }),
  acquiredAt: timestamp('acquired_at'),
  acquiredPrice: decimal('acquired_price', { precision: 24, scale: 12 }),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const nftCollections = pgTable('nft_collections', {
  id: varchar('id', { length: 255 }).primaryKey(),
  address: varchar('address', { length: 255 }).notNull(),
  chain: varchar('chain', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  symbol: varchar('symbol', { length: 50 }),
  imageUrl: text('image_url'),
  bannerUrl: text('banner_url'),
  description: text('description'),
  floorPrice: decimal('floor_price', { precision: 24, scale: 12 }),
  floorPriceUsd: decimal('floor_price_usd', { precision: 18, scale: 2 }),
  floorChange24h: decimal('floor_change_24h', { precision: 10, scale: 4 }),
  volume24h: decimal('volume_24h', { precision: 24, scale: 2 }),
  volumeChange24h: decimal('volume_change_24h', { precision: 10, scale: 4 }),
  totalSupply: integer('total_supply'),
  holders: integer('holders'),
  listedCount: integer('listed_count'),
  websiteUrl: text('website_url'),
  twitterUrl: text('twitter_url'),
  discordUrl: text('discord_url'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// ============================================
// REFERRAL PROGRAM SYSTEM
// Referral codes, tracking, payouts
// ============================================

export const referralCodes = pgTable('referral_codes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  rewardPercent: decimal('reward_percent', { precision: 5, scale: 2 }).default('10'),
  lifetimeReferrals: integer('lifetime_referrals').default(0),
  lifetimeEarningsUsd: decimal('lifetime_earnings_usd', { precision: 18, scale: 2 }).default('0'),
  pendingPayoutUsd: decimal('pending_payout_usd', { precision: 18, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const referralAttributions = pgTable('referral_attributions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  referrerUserId: varchar('referrer_user_id', { length: 255 }).notNull(),
  referredUserId: varchar('referred_user_id', { length: 255 }).notNull(),
  referralCode: varchar('referral_code', { length: 50 }).notNull(),
  signupDate: timestamp('signup_date').defaultNow().notNull(),
  firstPurchaseDate: timestamp('first_purchase_date'),
  totalSpendUsd: decimal('total_spend_usd', { precision: 18, scale: 2 }).default('0'),
  commissionPaidUsd: decimal('commission_paid_usd', { precision: 18, scale: 2 }).default('0'),
  status: varchar('status', { length: 50 }).default('active'),
});

export const referralPayouts = pgTable('referral_payouts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  amountUsd: decimal('amount_usd', { precision: 18, scale: 2 }).notNull(),
  payoutMethod: varchar('payout_method', { length: 50 }).notNull(),
  payoutAddress: varchar('payout_address', { length: 255 }),
  txHash: varchar('tx_hash', { length: 255 }),
  status: varchar('status', { length: 50 }).default('pending'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// ARBITRAGE SCANNER SYSTEM
// Cross-exchange price comparison
// ============================================

export const arbitrageOpportunities = pgTable('arbitrage_opportunities', {
  id: varchar('id', { length: 255 }).primaryKey(),
  tokenSymbol: varchar('token_symbol', { length: 50 }).notNull(),
  tokenAddress: varchar('token_address', { length: 255 }),
  buyExchange: varchar('buy_exchange', { length: 100 }).notNull(),
  buyChain: varchar('buy_chain', { length: 50 }),
  buyPrice: decimal('buy_price', { precision: 24, scale: 12 }).notNull(),
  sellExchange: varchar('sell_exchange', { length: 100 }).notNull(),
  sellChain: varchar('sell_chain', { length: 50 }),
  sellPrice: decimal('sell_price', { precision: 24, scale: 12 }).notNull(),
  spreadPercent: decimal('spread_percent', { precision: 10, scale: 4 }).notNull(),
  estimatedProfitUsd: decimal('estimated_profit_usd', { precision: 18, scale: 2 }),
  minTradeSize: decimal('min_trade_size', { precision: 18, scale: 2 }),
  maxTradeSize: decimal('max_trade_size', { precision: 18, scale: 2 }),
  bridgeFeeUsd: decimal('bridge_fee_usd', { precision: 18, scale: 6 }),
  gasFeeUsd: decimal('gas_fee_usd', { precision: 18, scale: 6 }),
  netProfitUsd: decimal('net_profit_usd', { precision: 18, scale: 2 }),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// MULTI-LANGUAGE SUPPORT (i18n)
// ============================================

export const userLocalePrefs = pgTable('user_locale_prefs', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  locale: varchar('locale', { length: 10 }).notNull().default('en'),
  timezone: varchar('timezone', { length: 100 }),
  dateFormat: varchar('date_format', { length: 50 }),
  numberFormat: varchar('number_format', { length: 50 }),
  currency: varchar('currency', { length: 10 }).default('USD'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
