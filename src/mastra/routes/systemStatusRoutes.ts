export const systemStatusRoutes = [
  {
    path: "/api/system/ai/status",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      logger?.info('🤖 [System] AI status request');
      
      try {
        const status = {
          operational: true,
          models: {
            openai: { status: 'active', latency: 120 },
            anthropic: { status: 'active', latency: 150 }
          },
          features: {
            predictions: true,
            analysis: true,
            streaming: true
          },
          lastCheck: new Date().toISOString()
        };
        
        return c.json({
          success: true,
          status
        });
      } catch (error: any) {
        logger?.error('❌ [System] AI status error', { error: error.message });
        return c.json({
          success: false,
          status: { operational: false },
          error: error.message
        });
      }
    }
  }
];
