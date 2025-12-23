const TRANSAK_API_KEY = process.env.TRANSAK_API_KEY || '';
const TRANSAK_SECRET_KEY = process.env.TRANSAK_SECRET_KEY || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const TRANSAK_API_URL = IS_PRODUCTION 
  ? 'https://api-gateway.transak.com' 
  : 'https://api-gateway-stg.transak.com';

const TRANSAK_WIDGET_URL = IS_PRODUCTION 
  ? 'https://global.transak.com' 
  : 'https://global-stg.transak.com';

const getBaseUrl = () => process.env.REPLIT_DEV_DOMAIN 
  ? 'https://' + process.env.REPLIT_DEV_DOMAIN 
  : 'http://localhost:5000';

export const transakRoutes = [
  {
    path: "/api/crypto/transak/widget-url",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { 
          walletAddress, 
          cryptoCurrencyCode = 'SOL',
          fiatCurrency = 'USD',
          fiatAmount,
          network = 'solana',
          email
        } = await c.req.json();

        if (!TRANSAK_API_KEY) {
          return c.json({ 
            error: 'Transak not configured', 
            needsSetup: true,
            message: 'TRANSAK_API_KEY not set'
          }, 400);
        }

        const params = new URLSearchParams({
          apiKey: TRANSAK_API_KEY,
          cryptoCurrencyCode: cryptoCurrencyCode.toUpperCase(),
          fiatCurrency: fiatCurrency.toUpperCase(),
          network: network,
          themeColor: '00D4FF',
          hideMenu: 'true',
          productsAvailed: 'BUY'
        });

        if (fiatAmount) {
          params.append('fiatAmount', fiatAmount.toString());
        }

        if (walletAddress) {
          params.append('walletAddress', walletAddress);
          params.append('disableWalletAddressForm', 'true');
        }

        if (email) {
          params.append('email', email);
        }

        const widgetUrl = `${TRANSAK_WIDGET_URL}?${params.toString()}`;

        logger?.info('✅ [Transak] Widget URL generated', { 
          cryptoCurrencyCode, 
          network,
          hasWallet: !!walletAddress 
        });

        return c.json({ 
          success: true, 
          widgetUrl,
          provider: 'transak',
          environment: IS_PRODUCTION ? 'production' : 'staging'
        });
      } catch (error: any) {
        logger?.error('❌ [Transak] Generate widget URL error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/crypto/transak/config",
    method: "GET" as const,
    createHandler: async () => async (c: any) => {
      return c.json({
        success: true,
        configured: !!TRANSAK_API_KEY,
        environment: IS_PRODUCTION ? 'production' : 'staging',
        supportedCurrencies: ['SOL', 'ETH', 'BTC', 'USDC', 'MATIC', 'USDT'],
        supportedNetworks: ['solana', 'ethereum', 'polygon', 'base', 'arbitrum', 'bsc'],
        supportedFiat: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
        provider: 'transak'
      });
    }
  },

  {
    path: "/api/crypto/transak/webhook",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { eventID, webhookData } = body;

        logger?.info('📥 [Transak] Webhook received', { eventID });

        switch (eventID) {
          case 'ORDER_COMPLETED':
            logger?.info('✅ [Transak] Order completed', { 
              orderId: webhookData?.id,
              cryptoAmount: webhookData?.cryptoAmount,
              cryptoCurrency: webhookData?.cryptoCurrency
            });
            break;
          case 'ORDER_FAILED':
            logger?.error('❌ [Transak] Order failed', { 
              orderId: webhookData?.id,
              reason: webhookData?.failureReason
            });
            break;
          case 'ORDER_PAYMENT_VERIFYING':
            logger?.info('⏳ [Transak] Payment verifying', { orderId: webhookData?.id });
            break;
          default:
            logger?.info(`[Transak] Unhandled event: ${eventID}`);
        }

        return c.json({ success: true });
      } catch (error: any) {
        logger?.error('❌ [Transak] Webhook error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  }
];
