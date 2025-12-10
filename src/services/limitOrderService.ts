import { db } from '../db/client';
import { limitOrders } from '../db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import { tokenScannerService } from './tokenScannerService';
import { tradeExecutorService } from './tradeExecutorService';

const logger = pino({ name: 'LimitOrderService' });

export type LimitOrderStatus = 
  | 'PENDING'
  | 'WATCHING'
  | 'FILLED_ENTRY'
  | 'FILLED_EXIT'
  | 'STOPPED_OUT'
  | 'CANCELLED';

export interface LimitOrder {
  id: string;
  userId: string;
  tokenAddress: string;
  tokenSymbol: string;
  entryPrice: string;
  exitPrice?: string | null;
  stopLoss?: string | null;
  buyAmountSol: string;
  walletAddress: string;
  status: LimitOrderStatus;
  entryTxSignature?: string | null;
  exitTxSignature?: string | null;
  actualEntryPrice?: string | null;
  actualExitPrice?: string | null;
  tokensReceived?: string | null;
  createdAt: Date;
  updatedAt: Date;
  filledEntryAt?: Date | null;
  filledExitAt?: Date | null;
}

export interface CreateLimitOrderInput {
  userId: string;
  tokenAddress: string;
  tokenSymbol: string;
  entryPrice: string;
  exitPrice?: string;
  stopLoss?: string;
  buyAmountSol: string;
  walletAddress: string;
}

class LimitOrderService {
  async createOrder(input: CreateLimitOrderInput): Promise<LimitOrder> {
    const id = uuidv4();
    const now = new Date();
    
    logger.info({ orderId: id, userId: input.userId, tokenSymbol: input.tokenSymbol }, '[LimitOrder] Creating new order');
    
    await db.insert(limitOrders).values({
      id,
      userId: input.userId,
      tokenAddress: input.tokenAddress,
      tokenSymbol: input.tokenSymbol,
      entryPrice: input.entryPrice,
      exitPrice: input.exitPrice || null,
      stopLoss: input.stopLoss || null,
      buyAmountSol: input.buyAmountSol,
      walletAddress: input.walletAddress,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });
    
    logger.info({ orderId: id }, '[LimitOrder] Order created successfully');
    
    return {
      id,
      userId: input.userId,
      tokenAddress: input.tokenAddress,
      tokenSymbol: input.tokenSymbol,
      entryPrice: input.entryPrice,
      exitPrice: input.exitPrice || null,
      stopLoss: input.stopLoss || null,
      buyAmountSol: input.buyAmountSol,
      walletAddress: input.walletAddress,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
  }

  async getUserOrders(userId: string): Promise<LimitOrder[]> {
    logger.info({ userId }, '[LimitOrder] Fetching user orders');
    
    const orders = await db.select().from(limitOrders)
      .where(eq(limitOrders.userId, userId))
      .orderBy(desc(limitOrders.createdAt));
    
    return orders.map(this.mapDbOrderToLimitOrder);
  }

  async getOrderById(orderId: string): Promise<LimitOrder | null> {
    const results = await db.select().from(limitOrders)
      .where(eq(limitOrders.id, orderId));
    
    return results[0] ? this.mapDbOrderToLimitOrder(results[0]) : null;
  }

  async updateOrderStatus(orderId: string, status: LimitOrderStatus): Promise<void> {
    logger.info({ orderId, status }, '[LimitOrder] Updating order status');
    
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date(),
    };
    
    if (status === 'FILLED_ENTRY') {
      updateData.filledEntryAt = new Date();
    } else if (status === 'FILLED_EXIT' || status === 'STOPPED_OUT') {
      updateData.filledExitAt = new Date();
    }
    
    await db.update(limitOrders)
      .set(updateData)
      .where(eq(limitOrders.id, orderId));
  }

  async cancelOrder(orderId: string): Promise<void> {
    logger.info({ orderId }, '[LimitOrder] Cancelling order');
    
    await db.update(limitOrders)
      .set({ 
        status: 'CANCELLED',
        updatedAt: new Date(),
      })
      .where(eq(limitOrders.id, orderId));
  }

  async updateOrder(orderId: string, updates: Partial<CreateLimitOrderInput>): Promise<void> {
    logger.info({ orderId, updates }, '[LimitOrder] Updating order');
    
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };
    
    if (updates.entryPrice) updateData.entryPrice = updates.entryPrice;
    if (updates.exitPrice !== undefined) updateData.exitPrice = updates.exitPrice;
    if (updates.stopLoss !== undefined) updateData.stopLoss = updates.stopLoss;
    if (updates.buyAmountSol) updateData.buyAmountSol = updates.buyAmountSol;
    
    await db.update(limitOrders)
      .set(updateData)
      .where(eq(limitOrders.id, orderId));
  }

  async checkPriceAndExecute(order: LimitOrder): Promise<{
    executed: boolean;
    action?: 'entry' | 'exit' | 'stop_loss';
    error?: string;
  }> {
    try {
      const tokenDetails = await tokenScannerService.getTokenDetails(order.tokenAddress);
      
      if (!tokenDetails) {
        logger.warn({ orderId: order.id, tokenAddress: order.tokenAddress }, '[LimitOrder] Token not found');
        return { executed: false, error: 'Token not found on DEX' };
      }
      
      const currentPrice = parseFloat(tokenDetails.priceUsd || '0');
      const entryPrice = parseFloat(order.entryPrice);
      const exitPrice = order.exitPrice ? parseFloat(order.exitPrice) : null;
      const stopLoss = order.stopLoss ? parseFloat(order.stopLoss) : null;
      
      logger.debug({ 
        orderId: order.id, 
        currentPrice, 
        entryPrice, 
        exitPrice, 
        stopLoss,
        status: order.status 
      }, '[LimitOrder] Checking price conditions');
      
      if (order.status === 'PENDING' || order.status === 'WATCHING') {
        if (currentPrice <= entryPrice) {
          logger.info({ orderId: order.id, currentPrice, entryPrice }, '[LimitOrder] Entry price hit, executing buy');
          
          const quote = await tradeExecutorService.getBuyQuote(
            order.tokenAddress,
            parseFloat(order.buyAmountSol),
            5
          );
          
          if (quote) {
            await this.updateOrderStatus(order.id, 'FILLED_ENTRY');
            await db.update(limitOrders)
              .set({ 
                actualEntryPrice: tokenDetails.priceUsd,
                status: 'FILLED_ENTRY',
                filledEntryAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(limitOrders.id, order.id));
            
            logger.info({ orderId: order.id }, '[LimitOrder] Entry filled successfully');
            return { executed: true, action: 'entry' };
          } else {
            logger.error({ orderId: order.id }, '[LimitOrder] Failed to get buy quote');
            return { executed: false, error: 'Failed to get buy quote' };
          }
        }
      }
      
      if (order.status === 'FILLED_ENTRY') {
        if (stopLoss && currentPrice <= stopLoss) {
          logger.info({ orderId: order.id, currentPrice, stopLoss }, '[LimitOrder] Stop loss hit, executing sell');
          
          await db.update(limitOrders)
            .set({ 
              actualExitPrice: tokenDetails.priceUsd,
              status: 'STOPPED_OUT',
              filledExitAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(limitOrders.id, order.id));
          
          logger.info({ orderId: order.id }, '[LimitOrder] Stop loss executed');
          return { executed: true, action: 'stop_loss' };
        }
        
        if (exitPrice && currentPrice >= exitPrice) {
          logger.info({ orderId: order.id, currentPrice, exitPrice }, '[LimitOrder] Exit price hit, executing sell');
          
          await db.update(limitOrders)
            .set({ 
              actualExitPrice: tokenDetails.priceUsd,
              status: 'FILLED_EXIT',
              filledExitAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(limitOrders.id, order.id));
          
          logger.info({ orderId: order.id }, '[LimitOrder] Exit filled successfully');
          return { executed: true, action: 'exit' };
        }
      }
      
      return { executed: false };
    } catch (error: any) {
      logger.error({ orderId: order.id, error: error.message }, '[LimitOrder] Error checking price');
      return { executed: false, error: error.message };
    }
  }

  async monitorAllActiveOrders(): Promise<{
    ordersChecked: number;
    ordersExecuted: number;
    errors: number;
  }> {
    logger.info('[LimitOrder] Starting active orders monitoring');
    
    const activeOrders = await db.select().from(limitOrders)
      .where(
        or(
          eq(limitOrders.status, 'PENDING'),
          eq(limitOrders.status, 'WATCHING'),
          eq(limitOrders.status, 'FILLED_ENTRY')
        )
      );
    
    logger.info({ count: activeOrders.length }, '[LimitOrder] Found active orders');
    
    let ordersExecuted = 0;
    let errors = 0;
    
    for (const dbOrder of activeOrders) {
      const order = this.mapDbOrderToLimitOrder(dbOrder);
      const result = await this.checkPriceAndExecute(order);
      
      if (result.executed) {
        ordersExecuted++;
      }
      if (result.error) {
        errors++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.info({ ordersChecked: activeOrders.length, ordersExecuted, errors }, '[LimitOrder] Monitoring complete');
    
    return {
      ordersChecked: activeOrders.length,
      ordersExecuted,
      errors,
    };
  }

  async getActiveOrders(): Promise<LimitOrder[]> {
    const orders = await db.select().from(limitOrders)
      .where(
        or(
          eq(limitOrders.status, 'PENDING'),
          eq(limitOrders.status, 'WATCHING'),
          eq(limitOrders.status, 'FILLED_ENTRY')
        )
      )
      .orderBy(desc(limitOrders.createdAt));
    
    return orders.map(this.mapDbOrderToLimitOrder);
  }

  private mapDbOrderToLimitOrder(dbOrder: any): LimitOrder {
    return {
      id: dbOrder.id,
      userId: dbOrder.userId,
      tokenAddress: dbOrder.tokenAddress,
      tokenSymbol: dbOrder.tokenSymbol,
      entryPrice: dbOrder.entryPrice,
      exitPrice: dbOrder.exitPrice,
      stopLoss: dbOrder.stopLoss,
      buyAmountSol: dbOrder.buyAmountSol,
      walletAddress: dbOrder.walletAddress,
      status: dbOrder.status as LimitOrderStatus,
      entryTxSignature: dbOrder.entryTxSignature,
      exitTxSignature: dbOrder.exitTxSignature,
      actualEntryPrice: dbOrder.actualEntryPrice,
      actualExitPrice: dbOrder.actualExitPrice,
      tokensReceived: dbOrder.tokensReceived,
      createdAt: dbOrder.createdAt,
      updatedAt: dbOrder.updatedAt,
      filledEntryAt: dbOrder.filledEntryAt,
      filledExitAt: dbOrder.filledExitAt,
    };
  }
}

export const limitOrderService = new LimitOrderService();
