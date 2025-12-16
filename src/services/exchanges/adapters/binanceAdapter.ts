import crypto from 'crypto';
import {
  BaseExchangeAdapter,
  Balance,
  MarketInfo,
  OrderBook,
  Ticker,
  Order,
  CreateOrderParams,
  ExchangeCredentials,
  OrderStatus,
  OrderSide,
  OrderType,
  TimeInForce
} from '../exchangeConnector.js';

const BINANCE_API_URL = 'https://api.binance.com';

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

interface BinanceSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  filters: Array<{
    filterType: string;
    minPrice?: string;
    maxPrice?: string;
    tickSize?: string;
    minQty?: string;
    maxQty?: string;
    stepSize?: string;
    minNotional?: string;
  }>;
}

interface BinanceOrder {
  symbol: string;
  orderId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice?: string;
  time: number;
  updateTime: number;
}

export class BinanceAdapter extends BaseExchangeAdapter {
  name = 'Binance';
  type: 'CEX' = 'CEX';
  protected minRequestInterval = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.credentials.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  private async signedRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    params: Record<string, string | number> = {}
  ): Promise<T> {
    await this.rateLimit();

    const timestamp = Date.now();
    const allParams = { ...params, timestamp };
    const queryString = new URLSearchParams(
      Object.entries(allParams).map(([k, v]) => [k, String(v)])
    ).toString();
    const signature = this.generateSignature(queryString);
    const signedQueryString = `${queryString}&signature=${signature}`;

    const url = `${BINANCE_API_URL}${endpoint}?${signedQueryString}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'X-MBX-APIKEY': this.credentials.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ msg: 'Unknown error' }));
      throw new Error(`Binance API error: ${error.msg || response.statusText}`);
    }

    return response.json();
  }

  private async publicRequest<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    await this.rateLimit();

    const queryString = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    const url = queryString ? `${BINANCE_API_URL}${endpoint}?${queryString}` : `${BINANCE_API_URL}${endpoint}`;

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ msg: 'Unknown error' }));
      throw new Error(`Binance API error: ${error.msg || response.statusText}`);
    }

    return response.json();
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.signedRequest('/api/v3/account');
      return true;
    } catch (error) {
      this.logError('validateConnection', error);
      return false;
    }
  }

  async getBalance(asset: string): Promise<Balance> {
    try {
      const account = await this.signedRequest<{ balances: BinanceBalance[] }>('/api/v3/account');
      const balance = account.balances.find(b => b.asset.toUpperCase() === asset.toUpperCase());
      
      if (!balance) {
        return { available: 0, locked: 0 };
      }

      return {
        available: parseFloat(balance.free),
        locked: parseFloat(balance.locked)
      };
    } catch (error) {
      this.logError('getBalance', error);
      return { available: 0, locked: 0 };
    }
  }

  async getBalances(): Promise<Record<string, Balance>> {
    try {
      const account = await this.signedRequest<{ balances: BinanceBalance[] }>('/api/v3/account');
      const balances: Record<string, Balance> = {};

      for (const b of account.balances) {
        const available = parseFloat(b.free);
        const locked = parseFloat(b.locked);
        if (available > 0 || locked > 0) {
          balances[b.asset] = { available, locked };
        }
      }

      return balances;
    } catch (error) {
      this.logError('getBalances', error);
      return {};
    }
  }

  async getMarkets(): Promise<MarketInfo[]> {
    try {
      const exchangeInfo = await this.publicRequest<{ symbols: BinanceSymbol[] }>('/api/v3/exchangeInfo');
      
      return exchangeInfo.symbols.map(s => {
        const priceFilter = s.filters.find(f => f.filterType === 'PRICE_FILTER');
        const lotSize = s.filters.find(f => f.filterType === 'LOT_SIZE');
        const minNotional = s.filters.find(f => f.filterType === 'MIN_NOTIONAL');

        return {
          symbol: s.symbol,
          baseAsset: s.baseAsset,
          quoteAsset: s.quoteAsset,
          minOrderSize: parseFloat(lotSize?.minQty || '0'),
          maxOrderSize: lotSize?.maxQty ? parseFloat(lotSize.maxQty) : undefined,
          tickSize: parseFloat(priceFilter?.tickSize || '0.00000001'),
          stepSize: parseFloat(lotSize?.stepSize || '0.00000001'),
          status: s.status === 'TRADING' ? 'active' : 'inactive'
        };
      });
    } catch (error) {
      this.logError('getMarkets', error);
      return [];
    }
  }

  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBook> {
    try {
      const data = await this.publicRequest<{
        bids: [string, string][];
        asks: [string, string][];
      }>('/api/v3/depth', { symbol: symbol.toUpperCase(), limit });

      return {
        symbol,
        bids: data.bids.map(([price, qty]) => ({ price: parseFloat(price), quantity: parseFloat(qty) })),
        asks: data.asks.map(([price, qty]) => ({ price: parseFloat(price), quantity: parseFloat(qty) })),
        timestamp: Date.now()
      };
    } catch (error) {
      this.logError('getOrderBook', error);
      return { symbol, bids: [], asks: [], timestamp: Date.now() };
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    try {
      const data = await this.publicRequest<{
        symbol: string;
        lastPrice: string;
        bidPrice: string;
        askPrice: string;
        volume: string;
        priceChange: string;
        priceChangePercent: string;
        highPrice: string;
        lowPrice: string;
      }>('/api/v3/ticker/24hr', { symbol: symbol.toUpperCase() });

      return {
        symbol: data.symbol,
        lastPrice: parseFloat(data.lastPrice),
        bidPrice: parseFloat(data.bidPrice),
        askPrice: parseFloat(data.askPrice),
        volume24h: parseFloat(data.volume),
        priceChange24h: parseFloat(data.priceChange),
        priceChangePercent24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        timestamp: Date.now()
      };
    } catch (error) {
      this.logError('getTicker', error);
      return {
        symbol,
        lastPrice: 0,
        bidPrice: 0,
        askPrice: 0,
        volume24h: 0,
        priceChange24h: 0,
        priceChangePercent24h: 0,
        high24h: 0,
        low24h: 0,
        timestamp: Date.now()
      };
    }
  }

  private mapOrderStatus(status: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      'NEW': 'NEW',
      'PARTIALLY_FILLED': 'PARTIALLY_FILLED',
      'FILLED': 'FILLED',
      'CANCELED': 'CANCELED',
      'REJECTED': 'REJECTED',
      'EXPIRED': 'EXPIRED',
      'PENDING_CANCEL': 'PENDING'
    };
    return statusMap[status] || 'NEW';
  }

  private mapBinanceOrder(o: BinanceOrder): Order {
    return {
      orderId: String(o.orderId),
      clientOrderId: o.clientOrderId,
      symbol: o.symbol,
      side: o.side as OrderSide,
      type: o.type as OrderType,
      status: this.mapOrderStatus(o.status),
      price: parseFloat(o.price),
      stopPrice: o.stopPrice ? parseFloat(o.stopPrice) : undefined,
      quantity: parseFloat(o.origQty),
      executedQty: parseFloat(o.executedQty),
      avgPrice: parseFloat(o.executedQty) > 0
        ? parseFloat(o.cummulativeQuoteQty) / parseFloat(o.executedQty)
        : 0,
      timeInForce: o.timeInForce as TimeInForce,
      createdAt: o.time,
      updatedAt: o.updateTime
    };
  }

  async createOrder(params: CreateOrderParams): Promise<Order> {
    try {
      const orderParams: Record<string, string | number> = {
        symbol: params.symbol.toUpperCase(),
        side: params.side,
        type: params.type,
        quantity: params.quantity
      };

      if (params.type === 'LIMIT' || params.type === 'STOP_LOSS_LIMIT' || params.type === 'TAKE_PROFIT_LIMIT') {
        if (!params.price) throw new Error('Price is required for limit orders');
        orderParams.price = params.price;
        orderParams.timeInForce = params.timeInForce || 'GTC';
      }

      if (params.stopPrice) {
        orderParams.stopPrice = params.stopPrice;
      }

      if (params.clientOrderId) {
        orderParams.newClientOrderId = params.clientOrderId;
      }

      const response = await this.signedRequest<BinanceOrder>('/api/v3/order', 'POST', orderParams);
      return this.mapBinanceOrder(response);
    } catch (error) {
      this.logError('createOrder', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    try {
      await this.signedRequest('/api/v3/order', 'DELETE', {
        symbol: symbol.toUpperCase(),
        orderId: parseInt(orderId)
      });
      return true;
    } catch (error) {
      this.logError('cancelOrder', error);
      return false;
    }
  }

  async getOrder(orderId: string, symbol: string): Promise<Order> {
    try {
      const response = await this.signedRequest<BinanceOrder>('/api/v3/order', 'GET', {
        symbol: symbol.toUpperCase(),
        orderId: parseInt(orderId)
      });
      return this.mapBinanceOrder(response);
    } catch (error) {
      this.logError('getOrder', error);
      throw error;
    }
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    try {
      const params: Record<string, string | number> = {};
      if (symbol) params.symbol = symbol.toUpperCase();

      const response = await this.signedRequest<BinanceOrder[]>('/api/v3/openOrders', 'GET', params);
      return response.map(o => this.mapBinanceOrder(o));
    } catch (error) {
      this.logError('getOpenOrders', error);
      return [];
    }
  }

  async getOrderHistory(symbol?: string, limit: number = 100): Promise<Order[]> {
    try {
      const params: Record<string, string | number> = { limit };
      if (symbol) params.symbol = symbol.toUpperCase();

      const response = await this.signedRequest<BinanceOrder[]>('/api/v3/allOrders', 'GET', params);
      return response.map(o => this.mapBinanceOrder(o));
    } catch (error) {
      this.logError('getOrderHistory', error);
      return [];
    }
  }
}
