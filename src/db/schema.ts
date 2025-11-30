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
