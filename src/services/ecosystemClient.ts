import crypto from 'crypto';

export class EcosystemClient {
  private hubUrl: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(hubUrl: string, apiKey: string, apiSecret: string) {
    this.hubUrl = hubUrl;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private generateSignature(method: string, path: string, body: string, timestamp: string): string {
    const message = `${method}:${path}:${body}:${timestamp}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  private async request(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<any> {
    const timestamp = Date.now().toString();
    const bodyStr = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(method, endpoint, bodyStr, timestamp);

    const headers: any = {
      'X-Api-Key': this.apiKey,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'Content-Type': 'application/json',
    };

    const url = `${this.hubUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers,
      body: bodyStr || undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hub error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async syncW2Payroll(year: number, employees: any[]) {
    return this.request('POST', '/api/ecosystem/sync/w2', { year, employees });
  }

  async sync1099Payments(year: number, contractors: any[]) {
    return this.request('POST', '/api/ecosystem/sync/1099', { year, contractors });
  }

  async syncWorkers(workers: any[]) {
    return this.request('POST', '/api/ecosystem/sync/workers', { workers });
  }

  async syncContractors(contractors: any[]) {
    return this.request('POST', '/api/ecosystem/sync/contractors', { contractors });
  }

  async syncTimesheets(timesheets: any[]) {
    return this.request('POST', '/api/ecosystem/sync/timesheets', { timesheets });
  }

  async syncCertifications(certifications: any[]) {
    return this.request('POST', '/api/ecosystem/sync/certifications', { certifications });
  }

  async getShopWorkers(shopId: string) {
    return this.request('GET', `/api/ecosystem/shops/${shopId}/workers`);
  }

  async getShopPayroll(shopId: string) {
    return this.request('GET', `/api/ecosystem/shops/${shopId}/payroll`);
  }

  async getStatus() {
    return this.request('GET', '/api/ecosystem/status');
  }

  async getLogs(limit = 50, offset = 0) {
    return this.request('GET', `/api/ecosystem/logs?limit=${limit}&offset=${offset}`);
  }

  async pushSnippet(name: string, code: string, language: string, category: string, tags?: string[]) {
    return this.request('POST', '/api/ecosystem/snippets', {
      name,
      code,
      language,
      category,
      tags,
    });
  }

  async getSnippet(snippetId: string) {
    return this.request('GET', `/api/ecosystem/snippets/${snippetId}`);
  }

  async logActivity(action: string, details: any) {
    return this.request('POST', '/api/ecosystem/logs', { action, details });
  }
}
