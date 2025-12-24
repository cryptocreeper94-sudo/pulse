import { darkwaveChainClient } from '../../services/darkwaveChainClient.js';
import crypto from 'crypto';

function verifyWebhookSignatureServer(data: any, signature: string): boolean {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('[DarkWave Chain] WEBHOOK_SECRET not configured');
    return false;
  }
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(data))
    .digest('hex');
  return signature === expectedSig;
}

export const darkwaveChainRoutes = [
  {
    path: "/api/chain-events",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const body = await c.req.json();
        const { event, data, signature } = body;

        if (!signature) {
          return c.json({ error: 'Missing signature' }, 401);
        }

        if (!verifyWebhookSignatureServer(data, signature)) {
          return c.json({ error: 'Invalid signature' }, 401);
        }

        console.log(`[DarkWave Chain Webhook] Received event: ${event}`, data);

        switch (event) {
          case 'swap.executed':
            console.log('[DarkWave Chain] Swap executed:', data);
            break;
          case 'block.produced':
            console.log('[DarkWave Chain] Block produced:', data);
            break;
          case 'stake.created':
            console.log('[DarkWave Chain] Stake created:', data);
            break;
          case 'stake.claimed':
            console.log('[DarkWave Chain] Stake claimed:', data);
            break;
          case 'transaction.confirmed':
            console.log('[DarkWave Chain] Transaction confirmed:', data);
            break;
          case 'liquidity.added':
            console.log('[DarkWave Chain] Liquidity added:', data);
            break;
          case 'token.launched':
            console.log('[DarkWave Chain] Token launched:', data);
            break;
          case 'bridge.locked':
            console.log('[DarkWave Chain] Bridge locked:', data);
            break;
          case 'bridge.released':
            console.log('[DarkWave Chain] Bridge released:', data);
            break;
          default:
            console.log(`[DarkWave Chain] Unknown event: ${event}`, data);
        }

        return c.json({ received: true, event });
      } catch (error: any) {
        console.error('[DarkWave Chain Webhook] Error:', error);
        return c.json({ error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/darkwave-chain/status",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const status = await darkwaveChainClient.getStatus();
        return c.json({
          success: true,
          chain: status
        });
      } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/darkwave-chain/hash/submit",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const body = await c.req.json();
        const { hash, dataType, metadata } = body;
        
        if (!hash || !dataType) {
          return c.json({ success: false, error: 'hash and dataType are required' }, 400);
        }

        const result = await darkwaveChainClient.submitHash({
          hash,
          dataType,
          metadata,
        });

        return c.json({ ...result, success: true });
      } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/darkwave-chain/hash/verify/:hash",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const hash = c.req.param('hash');
        const result = await darkwaveChainClient.verifyHash(hash);
        return c.json({ success: true, ...result });
      } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/darkwave-chain/hallmark/generate",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const body = await c.req.json();
        const { productType, productId, metadata } = body;
        
        if (!productType || !productId) {
          return c.json({ success: false, error: 'productType and productId are required' }, 400);
        }

        const hallmark = await darkwaveChainClient.generateHallmark({
          productType,
          productId,
          metadata,
        });

        return c.json({ success: true, hallmark });
      } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/darkwave-chain/hallmark/:id",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const id = c.req.param('id');
        const hallmark = await darkwaveChainClient.getHallmark(id);
        
        if (!hallmark) {
          return c.json({ success: false, error: 'Hallmark not found' }, 404);
        }

        return c.json({ success: true, hallmark });
      } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/darkwave-chain/hallmark/:id/verify",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const id = c.req.param('id');
        const result = await darkwaveChainClient.verifyHallmark(id);
        return c.json({ success: true, ...result });
      } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/darkwave-chain/prediction/record",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const body = await c.req.json();
        const { id, ticker, signal, confidence, timestamp, agentId } = body;
        
        if (!id || !ticker || !signal || confidence === undefined) {
          return c.json({ 
            success: false,
            error: 'id, ticker, signal, and confidence are required' 
          }, 400);
        }

        const result = await darkwaveChainClient.submitPredictionForVerification({
          id,
          ticker,
          signal,
          confidence,
          timestamp: timestamp || new Date().toISOString(),
          agentId,
        });

        return c.json({ ...result, success: true });
      } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },
];
