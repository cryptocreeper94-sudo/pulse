import crypto from 'crypto';
import { db } from '../db/client.js';
import { exchangeConnections, exchangeOrders, exchangeBalanceSnapshots } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import {
  ExchangeConnector,
  DEXConnector,
  ExchangeCredentials,
  EncryptionService,
  Balance,
  Order,
  CreateOrderParams,
  Ticker,
  OrderBook,
  MarketInfo
} from './exchanges/exchangeConnector.js';
import { BinanceAdapter } from './exchanges/adapters/binanceAdapter.js';
import { CoinbaseAdapter } from './exchanges/adapters/coinbaseAdapter.js';
import { JupiterAdapter } from './exchanges/adapters/jupiterAdapter.js';
import { UniswapAdapter } from './exchanges/adapters/uniswapAdapter.js';

export type SupportedExchange = 'binance' | 'coinbase' | 'jupiter' | 'uniswap';

interface ExchangeConnectionInfo {
  id: string;
  exchangeName: string;
  exchangeType: 'CEX' | 'DEX';
  nickname?: string;
  isActive: boolean;
  validationStatus: string;
  lastValidated?: Date;
  createdAt: Date;
}

interface AggregatedBalance {
  asset: string;
  total: number;
  available: number;
  locked: number;
  byExchange: Record<string, Balance>;
}

interface ConnectExchangeParams {
  userId: string;
  exchangeName: SupportedExchange;
  credentials: ExchangeCredentials;
  nickname?: string;
}

interface DEXConnectParams {
  userId: string;
  exchangeName: 'jupiter' | 'uniswap';
  walletAddress: string;
  privateKey?: string;
  chain?: string;
  nickname?: string;
}

class ExchangeService {
  private activeConnectors: Map<string, ExchangeConnector | DEXConnector> = new Map();

  private createAdapter(exchangeName: SupportedExchange, credentials: ExchangeCredentials): ExchangeConnector {
    switch (exchangeName) {
      case 'binance':
        return new BinanceAdapter(credentials);
      case 'coinbase':
        return new CoinbaseAdapter(credentials);
      default:
        throw new Error(`Unsupported CEX exchange: ${exchangeName}`);
    }
  }

  private createDEXAdapter(
    exchangeName: 'jupiter' | 'uniswap',
    walletAddress?: string,
    privateKey?: string,
    chain?: string
  ): DEXConnector {
    switch (exchangeName) {
      case 'jupiter':
        return new JupiterAdapter(walletAddress, privateKey);
      case 'uniswap':
        return new UniswapAdapter(walletAddress, privateKey, chain);
      default:
        throw new Error(`Unsupported DEX exchange: ${exchangeName}`);
    }
  }

  async connectCEX(params: ConnectExchangeParams): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    try {
      const adapter = this.createAdapter(params.exchangeName, params.credentials);

      const isValid = await adapter.validateConnection();
      if (!isValid) {
        return { success: false, error: 'Invalid API credentials or insufficient permissions' };
      }

      const encryptedCredentials = EncryptionService.encryptCredentials(params.credentials);

      const connectionId = crypto.randomUUID();

      await db.insert(exchangeConnections).values({
        id: connectionId,
        userId: params.userId,
        exchangeName: params.exchangeName,
        exchangeType: 'CEX',
        encryptedCredentials,
        nickname: params.nickname,
        isActive: true,
        lastValidated: new Date(),
        validationStatus: 'valid',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      this.activeConnectors.set(connectionId, adapter);

      console.log(`[ExchangeService] Connected ${params.exchangeName} for user ${params.userId}`);

      return { success: true, connectionId };
    } catch (error: any) {
      console.error('[ExchangeService] Connect CEX error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async connectDEX(params: DEXConnectParams): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    try {
      const adapter = this.createDEXAdapter(
        params.exchangeName,
        params.walletAddress,
        params.privateKey,
        params.chain
      );

      const isValid = await adapter.validateConnection();
      if (!isValid) {
        return { success: false, error: 'Failed to connect to DEX' };
      }

      const credentials: ExchangeCredentials = {
        apiKey: params.walletAddress,
        apiSecret: params.privateKey || ''
      };
      const encryptedCredentials = EncryptionService.encryptCredentials(credentials);

      const connectionId = crypto.randomUUID();

      await db.insert(exchangeConnections).values({
        id: connectionId,
        userId: params.userId,
        exchangeName: params.exchangeName,
        exchangeType: 'DEX',
        encryptedCredentials,
        nickname: params.nickname,
        isActive: true,
        lastValidated: new Date(),
        validationStatus: 'valid',
        permissions: JSON.stringify({ chain: params.chain || 'default' }),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      this.activeConnectors.set(connectionId, adapter);

      console.log(`[ExchangeService] Connected ${params.exchangeName} DEX for user ${params.userId}`);

      return { success: true, connectionId };
    } catch (error: any) {
      console.error('[ExchangeService] Connect DEX error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async disconnect(userId: string, connectionId: string): Promise<boolean> {
    try {
      const result = await db
        .update(exchangeConnections)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(exchangeConnections.id, connectionId), eq(exchangeConnections.userId, userId)));

      this.activeConnectors.delete(connectionId);

      console.log(`[ExchangeService] Disconnected exchange ${connectionId}`);
      return true;
    } catch (error: any) {
      console.error('[ExchangeService] Disconnect error:', error.message);
      return false;
    }
  }

  async deleteConnection(userId: string, connectionId: string): Promise<boolean> {
    try {
      await db
        .delete(exchangeConnections)
        .where(and(eq(exchangeConnections.id, connectionId), eq(exchangeConnections.userId, userId)));

      this.activeConnectors.delete(connectionId);

      console.log(`[ExchangeService] Deleted exchange connection ${connectionId}`);
      return true;
    } catch (error: any) {
      console.error('[ExchangeService] Delete error:', error.message);
      return false;
    }
  }

  async getConnections(userId: string): Promise<ExchangeConnectionInfo[]> {
    try {
      const connections = await db
        .select({
          id: exchangeConnections.id,
          exchangeName: exchangeConnections.exchangeName,
          exchangeType: exchangeConnections.exchangeType,
          nickname: exchangeConnections.nickname,
          isActive: exchangeConnections.isActive,
          validationStatus: exchangeConnections.validationStatus,
          lastValidated: exchangeConnections.lastValidated,
          createdAt: exchangeConnections.createdAt
        })
        .from(exchangeConnections)
        .where(eq(exchangeConnections.userId, userId));

      return connections.map(c => ({
        ...c,
        exchangeType: c.exchangeType as 'CEX' | 'DEX',
        nickname: c.nickname || undefined,
        isActive: c.isActive ?? true,
        validationStatus: c.validationStatus || 'unknown',
        lastValidated: c.lastValidated || undefined
      }));
    } catch (error: any) {
      console.error('[ExchangeService] Get connections error:', error.message);
      return [];
    }
  }

  private async getConnector(userId: string, connectionId: string): Promise<ExchangeConnector | DEXConnector | null> {
    if (this.activeConnectors.has(connectionId)) {
      return this.activeConnectors.get(connectionId)!;
    }

    try {
      const [connection] = await db
        .select()
        .from(exchangeConnections)
        .where(and(eq(exchangeConnections.id, connectionId), eq(exchangeConnections.userId, userId)));

      if (!connection || !connection.isActive) {
        return null;
      }

      const credentials = EncryptionService.decryptCredentials(connection.encryptedCredentials);

      let adapter: ExchangeConnector | DEXConnector;

      if (connection.exchangeType === 'DEX') {
        const permissions = connection.permissions ? JSON.parse(connection.permissions) : {};
        adapter = this.createDEXAdapter(
          connection.exchangeName as 'jupiter' | 'uniswap',
          credentials.apiKey,
          credentials.apiSecret || undefined,
          permissions.chain
        );
      } else {
        adapter = this.createAdapter(connection.exchangeName as SupportedExchange, credentials);
      }

      this.activeConnectors.set(connectionId, adapter);
      return adapter;
    } catch (error: any) {
      console.error('[ExchangeService] Get connector error:', error.message);
      return null;
    }
  }

  async getBalances(userId: string, connectionId: string): Promise<Record<string, Balance>> {
    const connector = await this.getConnector(userId, connectionId);
    if (!connector) {
      return {};
    }

    try {
      return await connector.getBalances();
    } catch (error: any) {
      console.error('[ExchangeService] Get balances error:', error.message);
      return {};
    }
  }

  async getAggregatedBalances(userId: string): Promise<AggregatedBalance[]> {
    const connections = await this.getConnections(userId);
    const activeConnections = connections.filter(c => c.isActive);

    const allBalances: Array<{ exchangeName: string; balances: Record<string, Balance> }> = [];

    await Promise.all(
      activeConnections.map(async conn => {
        const balances = await this.getBalances(userId, conn.id);
        allBalances.push({ exchangeName: conn.exchangeName, balances });
      })
    );

    const aggregated: Record<string, AggregatedBalance> = {};

    for (const { exchangeName, balances } of allBalances) {
      for (const [asset, balance] of Object.entries(balances)) {
        if (!aggregated[asset]) {
          aggregated[asset] = {
            asset,
            total: 0,
            available: 0,
            locked: 0,
            byExchange: {}
          };
        }

        aggregated[asset].available += balance.available;
        aggregated[asset].locked += balance.locked;
        aggregated[asset].total += balance.available + balance.locked;
        aggregated[asset].byExchange[exchangeName] = balance;
      }
    }

    return Object.values(aggregated);
  }

  async getTicker(userId: string, connectionId: string, symbol: string): Promise<Ticker | null> {
    const connector = await this.getConnector(userId, connectionId);
    if (!connector) return null;

    try {
      return await connector.getTicker(symbol);
    } catch (error: any) {
      console.error('[ExchangeService] Get ticker error:', error.message);
      return null;
    }
  }

  async getOrderBook(userId: string, connectionId: string, symbol: string, limit?: number): Promise<OrderBook | null> {
    const connector = await this.getConnector(userId, connectionId);
    if (!connector) return null;

    try {
      return await connector.getOrderBook(symbol, limit);
    } catch (error: any) {
      console.error('[ExchangeService] Get order book error:', error.message);
      return null;
    }
  }

  async getMarkets(userId: string, connectionId: string): Promise<MarketInfo[]> {
    const connector = await this.getConnector(userId, connectionId);
    if (!connector) return [];

    try {
      return await connector.getMarkets();
    } catch (error: any) {
      console.error('[ExchangeService] Get markets error:', error.message);
      return [];
    }
  }

  async createOrder(userId: string, connectionId: string, params: CreateOrderParams): Promise<Order | null> {
    const connector = await this.getConnector(userId, connectionId);
    if (!connector) return null;

    try {
      const order = await connector.createOrder(params);

      await db.insert(exchangeOrders).values({
        id: crypto.randomUUID(),
        connectionId,
        userId,
        exchangeOrderId: order.orderId,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        status: order.status,
        price: order.price?.toString(),
        stopPrice: order.stopPrice?.toString(),
        quantity: order.quantity.toString(),
        executedQty: order.executedQty?.toString(),
        avgPrice: order.avgPrice?.toString(),
        fee: order.fee?.toString(),
        feeAsset: order.feeAsset,
        clientOrderId: order.clientOrderId,
        timeInForce: order.timeInForce,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`[ExchangeService] Order created: ${order.orderId}`);
      return order;
    } catch (error: any) {
      console.error('[ExchangeService] Create order error:', error.message);
      throw error;
    }
  }

  async cancelOrder(userId: string, connectionId: string, orderId: string, symbol: string): Promise<boolean> {
    const connector = await this.getConnector(userId, connectionId);
    if (!connector) return false;

    try {
      const success = await connector.cancelOrder(orderId, symbol);

      if (success) {
        await db
          .update(exchangeOrders)
          .set({ status: 'CANCELED', updatedAt: new Date() })
          .where(and(eq(exchangeOrders.exchangeOrderId, orderId), eq(exchangeOrders.userId, userId)));
      }

      return success;
    } catch (error: any) {
      console.error('[ExchangeService] Cancel order error:', error.message);
      return false;
    }
  }

  async getOpenOrders(userId: string, connectionId: string, symbol?: string): Promise<Order[]> {
    const connector = await this.getConnector(userId, connectionId);
    if (!connector) return [];

    try {
      return await connector.getOpenOrders(symbol);
    } catch (error: any) {
      console.error('[ExchangeService] Get open orders error:', error.message);
      return [];
    }
  }

  async getOrderHistory(userId: string, connectionId: string, symbol?: string, limit?: number): Promise<Order[]> {
    const connector = await this.getConnector(userId, connectionId);
    if (!connector) return [];

    try {
      return await connector.getOrderHistory(symbol, limit);
    } catch (error: any) {
      console.error('[ExchangeService] Get order history error:', error.message);
      return [];
    }
  }

  async validateConnection(userId: string, connectionId: string): Promise<boolean> {
    const connector = await this.getConnector(userId, connectionId);
    if (!connector) return false;

    try {
      const isValid = await connector.validateConnection();

      await db
        .update(exchangeConnections)
        .set({
          lastValidated: new Date(),
          validationStatus: isValid ? 'valid' : 'invalid',
          updatedAt: new Date()
        })
        .where(and(eq(exchangeConnections.id, connectionId), eq(exchangeConnections.userId, userId)));

      return isValid;
    } catch (error: any) {
      console.error('[ExchangeService] Validate connection error:', error.message);
      return false;
    }
  }

  async snapshotBalances(userId: string, connectionId: string): Promise<void> {
    try {
      const balances = await this.getBalances(userId, connectionId);
      
      if (Object.keys(balances).length === 0) return;

      await db.insert(exchangeBalanceSnapshots).values({
        id: crypto.randomUUID(),
        connectionId,
        userId,
        balances: JSON.stringify(balances),
        snapshotAt: new Date()
      });
    } catch (error: any) {
      console.error('[ExchangeService] Snapshot balances error:', error.message);
    }
  }

  isDEXConnector(connector: ExchangeConnector | DEXConnector): connector is DEXConnector {
    return connector.type === 'DEX';
  }
}

export const exchangeService = new ExchangeService();
