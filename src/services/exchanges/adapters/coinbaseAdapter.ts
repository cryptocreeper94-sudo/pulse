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

const COINBASE_API_URL = 'https://api.coinbase.com';

interface CoinbaseAccount {
  uuid: string;
  name: string;
  currency: string;
  available_balance: { value: string; currency: string };
  default: boolean;
  active: boolean;
  hold: { value: string; currency: string };
}

interface CoinbaseProduct {
  product_id: string;
  price: string;
  price_percentage_change_24h: string;
  volume_24h: string;
  volume_percentage_change_24h: string;
  base_currency_id: string;
  quote_currency_id: string;
  base_min_size: string;
  base_max_size: string;
  quote_min_size: string;
  quote_increment: string;
  base_increment: string;
  status: string;
}

interface CoinbaseOrder {
  order_id: string;
  client_order_id: string;
  product_id: string;
  side: string;
  order_type: string;
  status: string;
  time_in_force: string;
  created_time: string;
  completion_percentage: string;
  filled_size: string;
  filled_value: string;
  average_filled_price: string;
  fee: string;
  order_configuration: {
    market_market_ioc?: { quote_size?: string; base_size?: string };
    limit_limit_gtc?: { base_size: string; limit_price: string };
    limit_limit_gtd?: { base_size: string; limit_price: string; end_time: string };
    stop_limit_stop_limit_gtc?: { base_size: string; limit_price: string; stop_price: string };
    stop_limit_stop_limit_gtd?: { base_size: string; limit_price: string; stop_price: string; end_time: string };
  };
}

export class CoinbaseAdapter extends BaseExchangeAdapter {
  name = 'Coinbase';
  type: 'CEX' = 'CEX';
  protected minRequestInterval = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private generateSignature(timestamp: string, method: string, path: string, body: string = ''): string {
    const message = timestamp + method + path + body;
    return crypto
      .createHmac('sha256', this.credentials.apiSecret)
      .update(message)
      .digest('hex');
  }

  private async signedRequest<T>(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: object
  ): Promise<T> {
    await this.rateLimit();

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(timestamp, method, path, bodyString);

    const headers: Record<string, string> = {
      'CB-ACCESS-KEY': this.credentials.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'Content-Type': 'application/json'
    };

    const response = await fetch(`${COINBASE_API_URL}${path}`, {
      method,
      headers,
      body: bodyString || undefined
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Coinbase API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.signedRequest('/api/v3/brokerage/accounts');
      return true;
    } catch (error) {
      this.logError('validateConnection', error);
      return false;
    }
  }

  async getBalance(asset: string): Promise<Balance> {
    try {
      const response = await this.signedRequest<{ accounts: CoinbaseAccount[] }>('/api/v3/brokerage/accounts');
      const account = response.accounts.find(
        a => a.currency.toUpperCase() === asset.toUpperCase()
      );

      if (!account) {
        return { available: 0, locked: 0 };
      }

      return {
        available: parseFloat(account.available_balance.value),
        locked: parseFloat(account.hold.value)
      };
    } catch (error) {
      this.logError('getBalance', error);
      return { available: 0, locked: 0 };
    }
  }

  async getBalances(): Promise<Record<string, Balance>> {
    try {
      const response = await this.signedRequest<{ accounts: CoinbaseAccount[] }>('/api/v3/brokerage/accounts');
      const balances: Record<string, Balance> = {};

      for (const account of response.accounts) {
        const available = parseFloat(account.available_balance.value);
        const locked = parseFloat(account.hold.value);
        if (available > 0 || locked > 0) {
          balances[account.currency] = { available, locked };
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
      const response = await this.signedRequest<{ products: CoinbaseProduct[] }>('/api/v3/brokerage/products');

      return response.products.map(p => ({
        symbol: p.product_id,
        baseAsset: p.base_currency_id,
        quoteAsset: p.quote_currency_id,
        minOrderSize: parseFloat(p.base_min_size),
        maxOrderSize: parseFloat(p.base_max_size),
        tickSize: parseFloat(p.quote_increment),
        stepSize: parseFloat(p.base_increment),
        status: p.status === 'online' ? 'active' : 'inactive'
      }));
    } catch (error) {
      this.logError('getMarkets', error);
      return [];
    }
  }

  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBook> {
    try {
      const response = await this.signedRequest<{
        bids: Array<{ price: string; size: string }>;
        asks: Array<{ price: string; size: string }>;
      }>(`/api/v3/brokerage/product_book?product_id=${symbol}&limit=${limit}`);

      return {
        symbol,
        bids: response.bids.map(b => ({ price: parseFloat(b.price), quantity: parseFloat(b.size) })),
        asks: response.asks.map(a => ({ price: parseFloat(a.price), quantity: parseFloat(a.size) })),
        timestamp: Date.now()
      };
    } catch (error) {
      this.logError('getOrderBook', error);
      return { symbol, bids: [], asks: [], timestamp: Date.now() };
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    try {
      const response = await this.signedRequest<CoinbaseProduct>(
        `/api/v3/brokerage/products/${symbol}`
      );

      return {
        symbol: response.product_id,
        lastPrice: parseFloat(response.price),
        bidPrice: parseFloat(response.price),
        askPrice: parseFloat(response.price),
        volume24h: parseFloat(response.volume_24h),
        priceChange24h: 0,
        priceChangePercent24h: parseFloat(response.price_percentage_change_24h),
        high24h: 0,
        low24h: 0,
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
      'PENDING': 'PENDING',
      'OPEN': 'NEW',
      'FILLED': 'FILLED',
      'CANCELLED': 'CANCELED',
      'EXPIRED': 'EXPIRED',
      'FAILED': 'REJECTED'
    };
    return statusMap[status] || 'NEW';
  }

  private mapCoinbaseOrder(o: CoinbaseOrder): Order {
    let price = 0;
    let quantity = 0;
    let stopPrice: number | undefined;

    const config = o.order_configuration;
    if (config.limit_limit_gtc) {
      price = parseFloat(config.limit_limit_gtc.limit_price);
      quantity = parseFloat(config.limit_limit_gtc.base_size);
    } else if (config.limit_limit_gtd) {
      price = parseFloat(config.limit_limit_gtd.limit_price);
      quantity = parseFloat(config.limit_limit_gtd.base_size);
    } else if (config.stop_limit_stop_limit_gtc) {
      price = parseFloat(config.stop_limit_stop_limit_gtc.limit_price);
      quantity = parseFloat(config.stop_limit_stop_limit_gtc.base_size);
      stopPrice = parseFloat(config.stop_limit_stop_limit_gtc.stop_price);
    } else if (config.market_market_ioc) {
      quantity = parseFloat(config.market_market_ioc.base_size || '0');
    }

    return {
      orderId: o.order_id,
      clientOrderId: o.client_order_id,
      symbol: o.product_id,
      side: o.side.toUpperCase() as OrderSide,
      type: this.mapOrderType(o.order_type),
      status: this.mapOrderStatus(o.status),
      price,
      stopPrice,
      quantity,
      executedQty: parseFloat(o.filled_size || '0'),
      avgPrice: parseFloat(o.average_filled_price || '0'),
      fee: parseFloat(o.fee || '0'),
      timeInForce: this.mapTimeInForce(o.time_in_force),
      createdAt: new Date(o.created_time).getTime(),
      updatedAt: Date.now()
    };
  }

  private mapOrderType(type: string): OrderType {
    const typeMap: Record<string, OrderType> = {
      'MARKET': 'MARKET',
      'LIMIT': 'LIMIT',
      'STOP': 'STOP_LOSS',
      'STOP_LIMIT': 'STOP_LOSS_LIMIT'
    };
    return typeMap[type] || 'MARKET';
  }

  private mapTimeInForce(tif: string): TimeInForce {
    const tifMap: Record<string, TimeInForce> = {
      'GOOD_UNTIL_CANCELLED': 'GTC',
      'GOOD_UNTIL_DATE': 'GTD',
      'IMMEDIATE_OR_CANCEL': 'IOC',
      'FILL_OR_KILL': 'FOK'
    };
    return tifMap[tif] || 'GTC';
  }

  async createOrder(params: CreateOrderParams): Promise<Order> {
    try {
      let orderConfiguration: Record<string, any> = {};

      if (params.type === 'MARKET') {
        orderConfiguration.market_market_ioc = {
          base_size: params.quantity.toString()
        };
      } else if (params.type === 'LIMIT') {
        orderConfiguration.limit_limit_gtc = {
          base_size: params.quantity.toString(),
          limit_price: params.price!.toString()
        };
      } else if (params.type === 'STOP_LOSS_LIMIT') {
        orderConfiguration.stop_limit_stop_limit_gtc = {
          base_size: params.quantity.toString(),
          limit_price: params.price!.toString(),
          stop_price: params.stopPrice!.toString()
        };
      }

      const body = {
        client_order_id: params.clientOrderId || crypto.randomUUID(),
        product_id: params.symbol,
        side: params.side,
        order_configuration: orderConfiguration
      };

      const response = await this.signedRequest<{ success: boolean; order: CoinbaseOrder }>(
        '/api/v3/brokerage/orders',
        'POST',
        body
      );

      return this.mapCoinbaseOrder(response.order);
    } catch (error) {
      this.logError('createOrder', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, _symbol: string): Promise<boolean> {
    try {
      await this.signedRequest('/api/v3/brokerage/orders/batch_cancel', 'POST', {
        order_ids: [orderId]
      });
      return true;
    } catch (error) {
      this.logError('cancelOrder', error);
      return false;
    }
  }

  async getOrder(orderId: string, _symbol: string): Promise<Order> {
    try {
      const response = await this.signedRequest<{ order: CoinbaseOrder }>(
        `/api/v3/brokerage/orders/historical/${orderId}`
      );
      return this.mapCoinbaseOrder(response.order);
    } catch (error) {
      this.logError('getOrder', error);
      throw error;
    }
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    try {
      let path = '/api/v3/brokerage/orders/historical/batch?order_status=OPEN';
      if (symbol) {
        path += `&product_id=${symbol}`;
      }

      const response = await this.signedRequest<{ orders: CoinbaseOrder[] }>(path);
      return response.orders.map(o => this.mapCoinbaseOrder(o));
    } catch (error) {
      this.logError('getOpenOrders', error);
      return [];
    }
  }

  async getOrderHistory(symbol?: string, limit: number = 100): Promise<Order[]> {
    try {
      let path = `/api/v3/brokerage/orders/historical/batch?limit=${limit}`;
      if (symbol) {
        path += `&product_id=${symbol}`;
      }

      const response = await this.signedRequest<{ orders: CoinbaseOrder[] }>(path);
      return response.orders.map(o => this.mapCoinbaseOrder(o));
    } catch (error) {
      this.logError('getOrderHistory', error);
      return [];
    }
  }
}
