import express from 'express';
import cors from 'cors';
import { apiKeyService, API_SCOPES } from '../services/apiKeyService.js';

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
function getClientIp(req: express.Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
    || req.socket?.remoteAddress 
    || 'unknown';
}

async function validateApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  const startTime = Date.now();
  const apiKey = req.headers['x-pulse-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key', code: 'MISSING_API_KEY' });
  }
  
  const validation = await apiKeyService.validateApiKey(apiKey);
  
  if (!validation.valid || !validation.keyRecord) {
    return res.status(401).json({ error: validation.error || 'Invalid API key', code: 'INVALID_API_KEY' });
  }
  
  const keyRecord = validation.keyRecord;
  const environment = validation.environment || 'live';
  const rateLimit = await apiKeyService.checkRateLimit(keyRecord.id, keyRecord.rateLimit || 60);
  
  if (!rateLimit.allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded', 
      code: 'RATE_LIMIT_EXCEEDED',
      resetIn: rateLimit.resetIn 
    });
  }
  
  const scopes = keyRecord.permissions ? JSON.parse(keyRecord.permissions) : ['market:read'];
  
  (req as any).apiKey = {
    keyId: keyRecord.id,
    tier: keyRecord.tier,
    scopes,
    userId: keyRecord.userId,
    rateLimit: keyRecord.rateLimit,
    environment
  };
  (req as any).startTime = startTime;
  
  // Log request after response is sent
  res.on('finish', () => {
    const latencyMs = Date.now() - startTime;
    apiKeyService.logRequest({
      keyId: keyRecord.id,
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      latencyMs,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      requestParams: JSON.stringify(req.query),
    });
  });
  
  next();
}

function requireScope(scope: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const scopes = (req as any).apiKey?.scopes || [];
    if (!scopes.includes(scope) && !scopes.includes('*')) {
      return res.status(403).json({ 
        error: `Missing required scope: ${scope}`, 
        code: 'INSUFFICIENT_SCOPE' 
      });
    }
    next();
  };
}

// Mock data for test environment
const MOCK_MARKET_DATA = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 45000, price_change_percentage_24h: 2.5, market_cap: 850000000000 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2500, price_change_percentage_24h: 1.8, market_cap: 300000000000 },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 98, price_change_percentage_24h: 5.2, market_cap: 42000000000 },
];

const MOCK_SIGNALS = [
  { id: 'test-1', ticker: 'BTC', signal: 'BUY', confidence: '0.75', priceAtPrediction: '45000', createdAt: new Date() },
  { id: 'test-2', ticker: 'ETH', signal: 'HOLD', confidence: '0.60', priceAtPrediction: '2500', createdAt: new Date() },
  { id: 'test-3', ticker: 'SOL', signal: 'STRONG_BUY', confidence: '0.85', priceAtPrediction: '98', createdAt: new Date() },
];

// List available scopes
app.get('/api/v1/scopes', (req, res) => {
  res.json({ 
    scopes: API_SCOPES,
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: '1.0.0', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/v1/market-overview', validateApiKey, requireScope('market:read'), async (req, res) => {
  try {
    const environment = (req as any).apiKey?.environment;
    const category = (req.query.category as string) || 'top';
    
    // Return mock data for test environment
    if (environment === 'test') {
      return res.json({
        success: true,
        data: MOCK_MARKET_DATA,
        meta: { category, count: MOCK_MARKET_DATA.length, environment: 'test', timestamp: new Date().toISOString() }
      });
    }
    
    const { coinGeckoClient } = await import('../lib/coinGeckoClient.js');
    
    const categoryMap: Record<string, string | undefined> = {
      'top': undefined,
      'defi': 'decentralized-finance-defi',
      'meme': 'meme-token',
      'layer1': 'layer-1',
      'layer2': 'layer-2'
    };
    
    const data = await coinGeckoClient.getMarkets({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 20,
      category: categoryMap[category]
    });
    
    res.json({
      success: true,
      data,
      meta: { category, count: data.length, environment: 'live', timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    console.error('[Public API] Market overview error:', error.message);
    res.status(500).json({ error: 'Failed to fetch market data', code: 'INTERNAL_ERROR' });
  }
});

app.get('/api/v1/price/:symbol', validateApiKey, requireScope('market:read'), async (req, res) => {
  try {
    const environment = (req as any).apiKey?.environment;
    const { symbol } = req.params;
    
    // Return mock data for test environment
    if (environment === 'test') {
      const mockCoin = MOCK_MARKET_DATA.find(c => c.symbol === symbol.toLowerCase());
      if (mockCoin) {
        return res.json({
          success: true,
          data: { [mockCoin.id]: { usd: mockCoin.current_price, usd_24h_change: mockCoin.price_change_percentage_24h } },
          meta: { symbol: symbol.toUpperCase(), environment: 'test', timestamp: new Date().toISOString() }
        });
      }
    }
    
    const { coinGeckoClient } = await import('../lib/coinGeckoClient.js');
    const data = await coinGeckoClient.getSimplePrice(symbol.toLowerCase());
    
    if (!data || Object.keys(data).length === 0) {
      return res.status(404).json({ error: 'Symbol not found', code: 'NOT_FOUND' });
    }
    
    res.json({
      success: true,
      data,
      meta: { symbol: symbol.toUpperCase(), environment: 'live', timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    console.error('[Public API] Price error:', error.message);
    res.status(500).json({ error: 'Failed to fetch price', code: 'INTERNAL_ERROR' });
  }
});

app.get('/api/v1/signals', validateApiKey, requireScope('signals:read'), async (req, res) => {
  try {
    const environment = (req as any).apiKey?.environment;
    
    // Return mock data for test environment
    if (environment === 'test') {
      return res.json({
        success: true,
        data: MOCK_SIGNALS,
        meta: { count: MOCK_SIGNALS.length, environment: 'test', timestamp: new Date().toISOString() }
      });
    }
    
    const { db } = await import('../db/client.js');
    const { predictionEvents } = await import('../db/schema.js');
    const { desc } = await import('drizzle-orm');
    
    const signals = await db.select()
      .from(predictionEvents)
      .orderBy(desc(predictionEvents.createdAt))
      .limit(20);
    
    res.json({
      success: true,
      data: signals.map(s => ({
        id: s.id,
        ticker: s.ticker,
        signal: s.signal,
        confidence: s.confidence,
        priceAtPrediction: s.priceAtPrediction,
        createdAt: s.createdAt
      })),
      meta: { count: signals.length, environment: 'live', timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    console.error('[Public API] Signals error:', error.message);
    res.status(500).json({ error: 'Failed to fetch signals', code: 'INTERNAL_ERROR' });
  }
});

app.get('/api/v1/predictions/:symbol', validateApiKey, requireScope('predictions:read'), async (req, res) => {
  try {
    const tier = (req as any).apiKey?.tier;
    const environment = (req as any).apiKey?.environment;
    
    if (tier === 'free') {
      return res.status(403).json({ 
        error: 'Predictions require Pro or Enterprise tier', 
        code: 'UPGRADE_REQUIRED' 
      });
    }
    
    const { symbol } = req.params;
    
    // Return mock data for test environment
    if (environment === 'test') {
      const mockPredictions = MOCK_SIGNALS.filter(s => s.ticker === symbol.toUpperCase());
      return res.json({
        success: true,
        data: mockPredictions,
        meta: { symbol: symbol.toUpperCase(), count: mockPredictions.length, environment: 'test', timestamp: new Date().toISOString() }
      });
    }
    
    const { db } = await import('../db/client.js');
    const { predictionEvents, predictionOutcomes } = await import('../db/schema.js');
    const { eq, desc } = await import('drizzle-orm');
    
    const predictions = await db.select()
      .from(predictionEvents)
      .leftJoin(predictionOutcomes, eq(predictionEvents.id, predictionOutcomes.predictionId))
      .where(eq(predictionEvents.ticker, symbol.toUpperCase()))
      .orderBy(desc(predictionEvents.createdAt))
      .limit(10);
    
    res.json({
      success: true,
      data: predictions,
      meta: { symbol: symbol.toUpperCase(), count: predictions.length, environment: 'live', timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    console.error('[Public API] Predictions error:', error.message);
    res.status(500).json({ error: 'Failed to fetch predictions', code: 'INTERNAL_ERROR' });
  }
});

app.get('/api/v1/accuracy', validateApiKey, requireScope('accuracy:read'), async (req, res) => {
  try {
    const environment = (req as any).apiKey?.environment;
    
    // Return mock data for test environment
    if (environment === 'test') {
      return res.json({
        success: true,
        data: [
          { ticker: 'BTC', signalType: 'BUY', horizon: '24h', accuracy: 0.68, sampleCount: 150 },
          { ticker: 'ETH', signalType: 'BUY', horizon: '24h', accuracy: 0.62, sampleCount: 120 },
          { ticker: 'SOL', signalType: 'STRONG_BUY', horizon: '4h', accuracy: 0.71, sampleCount: 85 },
        ],
        meta: { count: 3, environment: 'test', timestamp: new Date().toISOString() }
      });
    }
    
    const { db } = await import('../db/client.js');
    const { predictionAccuracyStats } = await import('../db/schema.js');
    
    const stats = await db.select().from(predictionAccuracyStats).limit(50);
    
    res.json({
      success: true,
      data: stats,
      meta: { count: stats.length, environment: 'live', timestamp: new Date().toISOString() }
    });
  } catch (error: any) {
    console.error('[Public API] Accuracy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch accuracy stats', code: 'INTERNAL_ERROR' });
  }
});

export function startPublicApiServer(port: number = 3002) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🔌 Public API Server running on port ${port}`);
  });
}

// Start server when run directly
startPublicApiServer(3002);

export default app;
