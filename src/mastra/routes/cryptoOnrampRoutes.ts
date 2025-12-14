import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
});

const SUPPORTED_NETWORKS = ['solana', 'ethereum', 'polygon', 'base', 'arbitrum'] as const;
const SUPPORTED_CURRENCIES: Record<string, string[]> = {
  solana: ['sol', 'usdc'],
  ethereum: ['eth', 'usdc'],
  polygon: ['matic', 'usdc'],
  base: ['eth', 'usdc'],
  arbitrum: ['eth', 'usdc'],
};

export const cryptoOnrampRoutes = [
  {
    path: "/api/crypto/onramp/create-session",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { 
          walletAddress, 
          network = 'solana', 
          currency = 'sol',
          amount,
          userId 
        } = await c.req.json();
        
        if (!walletAddress) {
          return c.json({ error: 'Wallet address required' }, 400);
        }

        if (!SUPPORTED_NETWORKS.includes(network)) {
          return c.json({ 
            error: `Network not supported. Use: ${SUPPORTED_NETWORKS.join(', ')}` 
          }, 400);
        }

        const networkWallets: Record<string, string> = {};
        if (network === 'solana') {
          networkWallets.solana = walletAddress;
        } else {
          networkWallets.ethereum = walletAddress;
        }

        const sessionParams: any = {
          wallet_addresses: networkWallets,
          destination_network: network,
          destination_currency: currency,
        };

        if (amount) {
          sessionParams.source_amount = amount.toString();
          sessionParams.source_currency = 'usd';
        }

        const session = await (stripe as any).crypto.onrampSessions.create(sessionParams);

        logger?.info('✅ [Crypto Onramp] Session created', { 
          sessionId: session.id, 
          network, 
          currency,
          userId 
        });

        return c.json({ 
          success: true, 
          clientSecret: session.client_secret,
          sessionId: session.id,
          redirectUrl: session.redirect_url
        });
      } catch (error: any) {
        logger?.error('❌ [Crypto Onramp] Create session error', { error: error.message });
        
        if (error.message?.includes('onramp')) {
          return c.json({ 
            error: 'Crypto onramp not enabled. Please apply for access in Stripe Dashboard.',
            needsSetup: true
          }, 400);
        }
        
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/crypto/onramp/session-status",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const sessionId = c.req.query('sessionId');
        
        if (!sessionId) {
          return c.json({ error: 'Session ID required' }, 400);
        }

        const session = await (stripe as any).crypto.onrampSessions.retrieve(sessionId);

        return c.json({ 
          success: true,
          status: session.status,
          destinationAmount: session.destination_amount,
          destinationCurrency: session.destination_currency,
          network: session.destination_network
        });
      } catch (error: any) {
        logger?.error('❌ [Crypto Onramp] Get session status error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/crypto/onramp/supported",
    method: "GET",
    createHandler: async () => async (c: any) => {
      return c.json({
        success: true,
        networks: SUPPORTED_NETWORKS,
        currencies: SUPPORTED_CURRENCIES,
        note: 'Currently available for US customers only'
      });
    }
  }
];
