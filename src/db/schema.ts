import { pgTable, varchar, timestamp, boolean, text, integer } from 'drizzle-orm/pg-core';

export const subscriptions = pgTable('subscriptions', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  plan: varchar('plan', { length: 50 }).notNull().default('free'), // 'free' | 'premium'
  status: varchar('status', { length: 50 }).notNull().default('inactive'), // 'active' | 'inactive' | 'cancelled' | 'expired'
  provider: varchar('provider', { length: 50 }), // 'stripe' | 'telegram_stars' | null
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  telegramPaymentId: varchar('telegram_payment_id', { length: 255 }),
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
