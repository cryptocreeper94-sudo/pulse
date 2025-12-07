import { EcosystemClient } from './ecosystemClient.js';

const ORBIT_HUB_URL = process.env.ORBIT_HUB_URL || '';
const ORBIT_API_KEY = process.env.ORBIT_API_KEY || '';
const ORBIT_API_SECRET = process.env.ORBIT_API_SECRET || '';

const APP_ID = 'pulse';
const APP_NAME = 'DarkWave Pulse';

class EcosystemService {
  private client: EcosystemClient | null = null;
  private isConfigured = false;
  private initAttempted = false;

  private ensureInitialized(): void {
    if (this.initAttempted) return;
    this.initialize();
  }

  initialize(): boolean {
    this.initAttempted = true;
    
    if (!ORBIT_HUB_URL || !ORBIT_API_KEY || !ORBIT_API_SECRET) {
      console.log('[Ecosystem] Not configured - missing ORBIT credentials');
      return false;
    }

    this.client = new EcosystemClient(ORBIT_HUB_URL, ORBIT_API_KEY, ORBIT_API_SECRET);
    this.isConfigured = true;
    console.log('[Ecosystem] Connected to ORBIT Developer Hub');
    return true;
  }

  isConnected(): boolean {
    this.ensureInitialized();
    return this.isConfigured && this.client !== null;
  }

  async getHubStatus(): Promise<any> {
    this.ensureInitialized();
    if (!this.client) {
      return { connected: false, message: 'Ecosystem client not configured. Set ORBIT_HUB_URL, ORBIT_API_KEY, ORBIT_API_SECRET.' };
    }

    try {
      const status = await this.client.getStatus();
      return { connected: true, ...status };
    } catch (error: any) {
      return { connected: false, error: error.message };
    }
  }

  async logAppActivity(action: string, details: any = {}): Promise<boolean> {
    this.ensureInitialized();
    if (!this.client) return false;

    try {
      await this.client.logActivity(action, {
        appId: APP_ID,
        appName: APP_NAME,
        timestamp: new Date().toISOString(),
        ...details,
      });
      return true;
    } catch (error: any) {
      console.error('[Ecosystem] Failed to log activity:', error.message);
      return false;
    }
  }

  async logPrediction(ticker: string, signal: string, confidence: string): Promise<boolean> {
    return this.logAppActivity('prediction_generated', {
      ticker,
      signal,
      confidence,
    });
  }

  async logUserLogin(userId: string, email: string): Promise<boolean> {
    return this.logAppActivity('user_login', {
      userId,
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
    });
  }

  async logSubscription(userId: string, tier: string, action: 'created' | 'upgraded' | 'cancelled'): Promise<boolean> {
    return this.logAppActivity('subscription_event', {
      userId,
      tier,
      action,
    });
  }

  async pushCodeSnippet(name: string, code: string, language: string, category: string, tags?: string[]): Promise<any> {
    this.ensureInitialized();
    if (!this.client) {
      throw new Error('Ecosystem client not configured. Set ORBIT_HUB_URL, ORBIT_API_KEY, ORBIT_API_SECRET.');
    }

    return this.client.pushSnippet(name, code, language, category, tags);
  }

  async getCodeSnippet(snippetId: string): Promise<any> {
    this.ensureInitialized();
    if (!this.client) {
      throw new Error('Ecosystem client not configured. Set ORBIT_HUB_URL, ORBIT_API_KEY, ORBIT_API_SECRET.');
    }

    return this.client.getSnippet(snippetId);
  }

  async getActivityLogs(limit = 50, offset = 0): Promise<any> {
    this.ensureInitialized();
    if (!this.client) {
      return { logs: [], total: 0 };
    }

    try {
      return await this.client.getLogs(limit, offset);
    } catch (error: any) {
      console.error('[Ecosystem] Failed to get logs:', error.message);
      return { logs: [], error: error.message };
    }
  }

  async reportMetrics(metrics: {
    activeUsers?: number;
    predictionsToday?: number;
    accuracyRate?: number;
    revenue?: number;
  }): Promise<boolean> {
    return this.logAppActivity('metrics_report', {
      reportedAt: new Date().toISOString(),
      metrics,
    });
  }

  async sendAlert(severity: 'info' | 'warning' | 'critical', message: string, details?: any): Promise<boolean> {
    return this.logAppActivity('alert', {
      severity,
      message,
      details,
    });
  }
}

export const ecosystemService = new EcosystemService();
