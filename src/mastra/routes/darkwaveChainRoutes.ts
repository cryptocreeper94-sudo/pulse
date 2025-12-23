import { darkwaveChainClient } from '../../services/darkwaveChainClient.js';

export const darkwaveChainRoutes = [
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
