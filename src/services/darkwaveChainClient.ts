import crypto from 'crypto';

interface HashSubmission {
  hash: string;
  dataType: 'prediction' | 'hallmark' | 'audit' | 'custom';
  metadata?: Record<string, any>;
}

interface HallmarkRequest {
  productType: string;
  productId: string;
  metadata?: Record<string, any>;
}

interface HallmarkResponse {
  id: string;
  format: string;
  qrCodeUrl: string;
  verificationUrl: string;
  createdAt: string;
  blockNumber?: number;
  txHash?: string;
}

interface ChainStatus {
  connected: boolean;
  chainId: string;
  blockHeight: number;
  consensusType: string;
  blockTime: string;
}

export class DarkWaveChainClient {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private sessionToken: string | null = null;
  private sessionExpiresAt: number = 0;

  constructor() {
    this.baseUrl = process.env.DARKWAVE_CHAIN_URL || 'https://chain.darkwave.io';
    this.apiKey = process.env.DARKWAVE_API_KEY || '';
    this.apiSecret = process.env.DARKWAVE_API_SECRET || '';
  }

  private isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  private generateSignature(method: string, path: string, body: string, timestamp: string): string {
    const message = `${method}:${path}:${body}:${timestamp}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  private async ensureSession(): Promise<void> {
    if (this.sessionToken && Date.now() < this.sessionExpiresAt) {
      return;
    }

    const timestamp = Date.now().toString();
    const authBody = JSON.stringify({ apiKey: this.apiKey });
    const signature = this.generateSignature('POST', '/api/developer/auth', authBody, timestamp);

    const response = await fetch(`${this.baseUrl}/api/developer/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      },
      body: authBody,
    });

    if (!response.ok) {
      throw new Error(`DarkWave Chain auth failed: ${response.status}`);
    }

    const data = await response.json();
    this.sessionToken = data.sessionToken;
    this.sessionExpiresAt = Date.now() + (55 * 60 * 1000);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('DarkWave Chain not configured. Set DARKWAVE_API_KEY and DARKWAVE_API_SECRET.');
    }

    await this.ensureSession();

    const timestamp = Date.now().toString();
    const bodyStr = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(method, endpoint, bodyStr, timestamp);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
    };

    if (this.sessionToken) {
      headers['X-Developer-Session'] = this.sessionToken;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers,
      body: bodyStr || undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DarkWave Chain error: ${response.status} - ${error}`);
    }

    return response.json() as T;
  }

  async getStatus(): Promise<ChainStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/status`);
      if (!response.ok) {
        return { 
          connected: false, 
          chainId: 'darkwave-1',
          blockHeight: 0,
          consensusType: 'PoA',
          blockTime: '400ms'
        };
      }
      const data = await response.json();
      return { connected: true, ...data };
    } catch (error) {
      return { 
        connected: false, 
        chainId: 'darkwave-1',
        blockHeight: 0,
        consensusType: 'PoA',
        blockTime: '400ms'
      };
    }
  }

  async submitHash(submission: HashSubmission): Promise<{
    success: boolean;
    txHash?: string;
    blockNumber?: number;
    timestamp?: string;
  }> {
    return this.request('POST', '/api/hash/submit', {
      hash: submission.hash,
      dataType: submission.dataType,
      sourceApp: 'pulse',
      metadata: submission.metadata || {},
      timestamp: new Date().toISOString(),
    });
  }

  async verifyHash(hash: string): Promise<{
    verified: boolean;
    txHash?: string;
    blockNumber?: number;
    submittedAt?: string;
    sourceApp?: string;
  }> {
    return this.request('GET', `/api/hash/verify/${hash}`);
  }

  async generateHallmark(request: HallmarkRequest): Promise<HallmarkResponse> {
    return this.request('POST', '/api/hallmark/generate', {
      productType: request.productType,
      productId: request.productId,
      sourceApp: 'pulse',
      metadata: request.metadata || {},
    });
  }

  async getHallmark(hallmarkId: string): Promise<HallmarkResponse | null> {
    try {
      return await this.request('GET', `/api/hallmark/${hallmarkId}`);
    } catch {
      return null;
    }
  }

  async verifyHallmark(hallmarkId: string): Promise<{
    valid: boolean;
    hallmark?: HallmarkResponse;
    onChain: boolean;
    blockNumber?: number;
  }> {
    return this.request('GET', `/api/hallmark/${hallmarkId}/verify`);
  }

  async registerApp(appInfo: {
    name: string;
    description: string;
    webhookUrl?: string;
  }): Promise<{
    appId: string;
    apiKey: string;
    registered: boolean;
  }> {
    return this.request('POST', '/api/developer/register', {
      appName: appInfo.name,
      description: appInfo.description,
      webhookUrl: appInfo.webhookUrl,
    });
  }

  async submitPredictionForVerification(prediction: {
    id: string;
    ticker: string;
    signal: string;
    confidence: number;
    timestamp: string;
    agentId?: string;
  }): Promise<{
    success: boolean;
    txHash?: string;
    verificationId?: string;
  }> {
    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(prediction))
      .digest('hex');

    const result = await this.submitHash({
      hash: payloadHash,
      dataType: 'prediction',
      metadata: {
        predictionId: prediction.id,
        ticker: prediction.ticker,
        signal: prediction.signal,
        confidence: prediction.confidence,
        agentId: prediction.agentId,
      },
    });

    return {
      success: result.success,
      txHash: result.txHash,
      verificationId: payloadHash,
    };
  }
}

export const darkwaveChainClient = new DarkWaveChainClient();
