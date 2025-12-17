import crypto from 'crypto';

const MOONPAY_API_KEY = process.env.MOONPAY_API_KEY || '';
const MOONPAY_SECRET_KEY = process.env.MOONPAY_SECRET_KEY || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const MOONPAY_WIDGET_URL = IS_PRODUCTION 
  ? 'https://buy.moonpay.com' 
  : 'https://buy-sandbox.moonpay.com';

export const moonpayRoutes = [
  {
    path: "/api/crypto/moonpay/widget-url",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { 
          walletAddress, 
          currencyCode = 'sol',
          baseCurrencyCode = 'usd',
          baseCurrencyAmount,
          network = 'solana'
        } = await c.req.json();

        if (!MOONPAY_API_KEY) {
          return c.json({ 
            error: 'MoonPay not configured', 
            needsSetup: true,
            message: 'MOONPAY_API_KEY not set'
          }, 400);
        }

        const params = new URLSearchParams({
          apiKey: MOONPAY_API_KEY,
          currencyCode: currencyCode.toLowerCase(),
          baseCurrencyCode: baseCurrencyCode.toLowerCase(),
          colorCode: '#00D4FF',
          theme: 'dark'
        });

        if (baseCurrencyAmount) {
          params.append('baseCurrencyAmount', baseCurrencyAmount.toString());
        }

        if (walletAddress) {
          params.append('walletAddress', walletAddress);
        }

        let widgetUrl = `${MOONPAY_WIDGET_URL}?${params.toString()}`;

        if (MOONPAY_SECRET_KEY && walletAddress) {
          const signature = crypto
            .createHmac('sha256', MOONPAY_SECRET_KEY)
            .update(new URL(widgetUrl).search)
            .digest('base64');
          widgetUrl += `&signature=${encodeURIComponent(signature)}`;
        }

        logger?.info('✅ [MoonPay] Widget URL generated', { 
          currencyCode, 
          network,
          hasWallet: !!walletAddress 
        });

        return c.json({ 
          success: true, 
          widgetUrl,
          provider: 'moonpay',
          environment: IS_PRODUCTION ? 'production' : 'sandbox'
        });
      } catch (error: any) {
        logger?.error('❌ [MoonPay] Generate widget URL error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/crypto/moonpay/sign-url",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { urlForSignature } = await c.req.json();

        if (!MOONPAY_SECRET_KEY) {
          return c.json({ error: 'MoonPay signing not configured' }, 400);
        }

        if (!urlForSignature) {
          return c.json({ error: 'URL for signature required' }, 400);
        }

        const url = new URL(urlForSignature);
        const signature = crypto
          .createHmac('sha256', MOONPAY_SECRET_KEY)
          .update(url.search)
          .digest('base64');

        logger?.info('✅ [MoonPay] URL signed');
        return c.json({ success: true, signature });
      } catch (error: any) {
        logger?.error('❌ [MoonPay] Sign URL error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/crypto/moonpay/config",
    method: "GET",
    createHandler: async () => async (c: any) => {
      return c.json({
        success: true,
        configured: !!MOONPAY_API_KEY,
        environment: IS_PRODUCTION ? 'production' : 'sandbox',
        supportedCurrencies: ['sol', 'eth', 'btc', 'usdc', 'matic'],
        supportedNetworks: ['solana', 'ethereum', 'polygon', 'base', 'arbitrum'],
        provider: 'moonpay'
      });
    }
  }
];
