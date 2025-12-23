import { exchangeService, SupportedExchange } from '../../services/exchangeService.js';
import { ExchangeCredentials } from '../../services/exchanges/exchangeConnector.js';

const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_WINDOW = 100;
const rateLimitStore: Map<string, { count: number; resetAt: number }> = new Map();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userLimit.count++;
  return true;
}

export const exchangeRoutes = [
  {
    path: '/api/exchanges/connect',
    method: 'POST' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const body = await c.req.json();
        const { userId, exchangeName, credentials, nickname, type, walletAddress, privateKey, chain } = body;

        if (!userId) {
          return c.json({ success: false, error: 'User ID required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        if (!exchangeName) {
          return c.json({ success: false, error: 'Exchange name required' }, 400);
        }

        logger?.info('[ExchangeRoutes] Connect request', { userId, exchangeName, type });

        if (type === 'DEX' || exchangeName === 'jupiter' || exchangeName === 'uniswap') {
          if (!walletAddress) {
            return c.json({ success: false, error: 'Wallet address required for DEX' }, 400);
          }

          const result = await exchangeService.connectDEX({
            userId,
            exchangeName: exchangeName as 'jupiter' | 'uniswap',
            walletAddress,
            privateKey,
            chain,
            nickname
          });

          if (!result.success) {
            return c.json({ success: false, error: result.error }, 400);
          }

          return c.json({ success: true, connectionId: result.connectionId });
        }

        if (!credentials?.apiKey || !credentials?.apiSecret) {
          return c.json({ success: false, error: 'API key and secret required for CEX' }, 400);
        }

        const result = await exchangeService.connectCEX({
          userId,
          exchangeName: exchangeName as SupportedExchange,
          credentials: credentials as ExchangeCredentials,
          nickname
        });

        if (!result.success) {
          return c.json({ success: false, error: result.error }, 400);
        }

        return c.json({ success: true, connectionId: result.connectionId });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Connect error', { error: error.message });
        return c.json({ success: false, error: 'Failed to connect exchange' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges/:exchangeId',
    method: 'DELETE' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const exchangeId = c.req.param('exchangeId');
        const userId = c.req.query('userId');

        if (!userId || !exchangeId) {
          return c.json({ success: false, error: 'User ID and exchange ID required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        logger?.info('[ExchangeRoutes] Delete request', { userId, exchangeId });

        const success = await exchangeService.deleteConnection(userId, exchangeId);

        return c.json({ success });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Delete error', { error: error.message });
        return c.json({ success: false, error: 'Failed to delete exchange' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges',
    method: 'GET' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const userId = c.req.query('userId');

        if (!userId) {
          return c.json({ success: false, error: 'User ID required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        logger?.info('[ExchangeRoutes] List connections', { userId });

        const connections = await exchangeService.getConnections(userId);

        return c.json({ success: true, exchanges: connections });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] List error', { error: error.message });
        return c.json({ success: false, error: 'Failed to list exchanges' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges/:id/balances',
    method: 'GET' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const exchangeId = c.req.param('id');
        const userId = c.req.query('userId');

        if (!userId || !exchangeId) {
          return c.json({ success: false, error: 'User ID and exchange ID required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        logger?.info('[ExchangeRoutes] Get balances', { userId, exchangeId });

        const balances = await exchangeService.getBalances(userId, exchangeId);

        return c.json({ success: true, balances });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Balances error', { error: error.message });
        return c.json({ success: false, error: 'Failed to get balances' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges/aggregated-balances',
    method: 'GET' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const userId = c.req.query('userId');

        if (!userId) {
          return c.json({ success: false, error: 'User ID required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        logger?.info('[ExchangeRoutes] Get aggregated balances', { userId });

        const balances = await exchangeService.getAggregatedBalances(userId);

        return c.json({ success: true, balances });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Aggregated balances error', { error: error.message });
        return c.json({ success: false, error: 'Failed to get aggregated balances' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges/:id/order',
    method: 'POST' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const exchangeId = c.req.param('id');
        const body = await c.req.json();
        const { userId, symbol, side, type, quantity, price, stopPrice, timeInForce, clientOrderId } = body;

        if (!userId || !exchangeId) {
          return c.json({ success: false, error: 'User ID and exchange ID required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        if (!symbol || !side || !type || !quantity) {
          return c.json({ success: false, error: 'Symbol, side, type, and quantity required' }, 400);
        }

        const validSides = ['BUY', 'SELL'];
        const validTypes = ['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT'];

        if (!validSides.includes(side)) {
          return c.json({ success: false, error: 'Invalid order side' }, 400);
        }

        if (!validTypes.includes(type)) {
          return c.json({ success: false, error: 'Invalid order type' }, 400);
        }

        logger?.info('[ExchangeRoutes] Create order', { userId, exchangeId, symbol, side, type });

        const order = await exchangeService.createOrder(userId, exchangeId, {
          symbol,
          side,
          type,
          quantity: parseFloat(quantity),
          price: price ? parseFloat(price) : undefined,
          stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
          timeInForce,
          clientOrderId
        });

        if (!order) {
          return c.json({ success: false, error: 'Failed to create order' }, 400);
        }

        return c.json({ success: true, order });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Create order error', { error: error.message });
        return c.json({ success: false, error: error.message || 'Failed to create order' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges/:id/order/:orderId',
    method: 'DELETE' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const exchangeId = c.req.param('id');
        const orderId = c.req.param('orderId');
        const userId = c.req.query('userId');
        const symbol = c.req.query('symbol');

        if (!userId || !exchangeId || !orderId || !symbol) {
          return c.json({ success: false, error: 'User ID, exchange ID, order ID, and symbol required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        logger?.info('[ExchangeRoutes] Cancel order', { userId, exchangeId, orderId });

        const success = await exchangeService.cancelOrder(userId, exchangeId, orderId, symbol);

        return c.json({ success });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Cancel order error', { error: error.message });
        return c.json({ success: false, error: 'Failed to cancel order' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges/:id/orders',
    method: 'GET' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const exchangeId = c.req.param('id');
        const userId = c.req.query('userId');
        const symbol = c.req.query('symbol');
        const status = c.req.query('status') || 'open';

        if (!userId || !exchangeId) {
          return c.json({ success: false, error: 'User ID and exchange ID required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        logger?.info('[ExchangeRoutes] Get orders', { userId, exchangeId, status });

        let orders;
        if (status === 'open') {
          orders = await exchangeService.getOpenOrders(userId, exchangeId, symbol);
        } else {
          orders = await exchangeService.getOrderHistory(userId, exchangeId, symbol);
        }

        return c.json({ success: true, orders });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Get orders error', { error: error.message });
        return c.json({ success: false, error: 'Failed to get orders' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges/:id/ticker/:symbol',
    method: 'GET' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const exchangeId = c.req.param('id');
        const symbol = c.req.param('symbol');
        const userId = c.req.query('userId');

        if (!userId || !exchangeId || !symbol) {
          return c.json({ success: false, error: 'User ID, exchange ID, and symbol required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        const ticker = await exchangeService.getTicker(userId, exchangeId, symbol);

        if (!ticker) {
          return c.json({ success: false, error: 'Ticker not found' }, 404);
        }

        return c.json({ success: true, ticker });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Get ticker error', { error: error.message });
        return c.json({ success: false, error: 'Failed to get ticker' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges/:id/markets',
    method: 'GET' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const exchangeId = c.req.param('id');
        const userId = c.req.query('userId');

        if (!userId || !exchangeId) {
          return c.json({ success: false, error: 'User ID and exchange ID required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        const markets = await exchangeService.getMarkets(userId, exchangeId);

        return c.json({ success: true, markets });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Get markets error', { error: error.message });
        return c.json({ success: false, error: 'Failed to get markets' }, 500);
      }
    }
  },

  {
    path: '/api/exchanges/:id/validate',
    method: 'POST' as const,
    createHandler: async ({ mastra }: { mastra: any }) => async (c: any) => {
      const logger = mastra.getLogger();

      try {
        const exchangeId = c.req.param('id');
        const body = await c.req.json();
        const { userId } = body;

        if (!userId || !exchangeId) {
          return c.json({ success: false, error: 'User ID and exchange ID required' }, 400);
        }

        if (!checkRateLimit(userId)) {
          return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
        }

        logger?.info('[ExchangeRoutes] Validate connection', { userId, exchangeId });

        const isValid = await exchangeService.validateConnection(userId, exchangeId);

        return c.json({ success: true, valid: isValid });
      } catch (error: any) {
        logger?.error('[ExchangeRoutes] Validate error', { error: error.message });
        return c.json({ success: false, error: 'Failed to validate connection' }, 500);
      }
    }
  }
];
