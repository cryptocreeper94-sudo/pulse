/**
 * Shared in-memory caches for wallet and trading features
 * These caches are shared across all tools and API routes
 */

export const walletCache = new Map<string, { address: string; connectedAt: string }>();
export const ordersCache = new Map<string, any[]>();
export const settingsCache = new Map<string, any>();
export const snipingCache = new Map<string, any>();
