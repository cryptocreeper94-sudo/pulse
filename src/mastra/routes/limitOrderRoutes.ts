import { limitOrderService, CreateLimitOrderInput, LimitOrderStatus } from '../../services/limitOrderService';

export const limitOrderRoutes = [
  {
    path: "/api/limit-orders",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { userId, tokenAddress, tokenSymbol, entryPrice, exitPrice, stopLoss, buyAmountSol, walletAddress } = body;
        
        if (!userId || !tokenAddress || !tokenSymbol || !entryPrice || !buyAmountSol || !walletAddress) {
          return c.json({ error: 'Missing required fields: userId, tokenAddress, tokenSymbol, entryPrice, buyAmountSol, walletAddress' }, 400);
        }
        
        const orderInput: CreateLimitOrderInput = {
          userId,
          tokenAddress,
          tokenSymbol,
          entryPrice: entryPrice.toString(),
          exitPrice: exitPrice?.toString(),
          stopLoss: stopLoss?.toString(),
          buyAmountSol: buyAmountSol.toString(),
          walletAddress,
        };
        
        const order = await limitOrderService.createOrder(orderInput);
        logger?.info('✅ [LimitOrder] Order created', { orderId: order.id, userId });
        
        return c.json({ success: true, order });
      } catch (error: any) {
        logger?.error('❌ [LimitOrder] Error creating order', { error: error.message });
        return c.json({ error: 'Failed to create limit order' }, 500);
      }
    }
  },
  {
    path: "/api/limit-orders",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const orders = await limitOrderService.getUserOrders(userId);
        return c.json({ orders, count: orders.length });
      } catch (error: any) {
        logger?.error('❌ [LimitOrder] Error fetching orders', { error: error.message });
        return c.json({ error: 'Failed to fetch limit orders' }, 500);
      }
    }
  },
  {
    path: "/api/limit-orders/:id",
    method: "PUT" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const orderId = c.req.param('id');
        const body = await c.req.json();
        const { userId, entryPrice, exitPrice, stopLoss, buyAmountSol, status } = body;
        
        if (!orderId) {
          return c.json({ error: 'Order ID is required' }, 400);
        }
        
        const existingOrder = await limitOrderService.getOrderById(orderId);
        if (!existingOrder) {
          return c.json({ error: 'Order not found' }, 404);
        }
        
        if (userId && existingOrder.userId !== userId) {
          return c.json({ error: 'Unauthorized' }, 403);
        }
        
        if (status) {
          const validStatuses = ['PENDING', 'WATCHING', 'READY_TO_EXECUTE', 'FILLED_ENTRY', 'READY_TO_EXIT', 'READY_TO_STOP', 'FILLED_EXIT', 'STOPPED_OUT', 'CANCELLED'];
          if (!validStatuses.includes(status)) {
            return c.json({ error: `Invalid status. Valid values: ${validStatuses.join(', ')}` }, 400);
          }
          await limitOrderService.updateOrderStatus(orderId, status as LimitOrderStatus);
        }
        
        if (entryPrice || exitPrice !== undefined || stopLoss !== undefined || buyAmountSol) {
          await limitOrderService.updateOrder(orderId, {
            entryPrice: entryPrice?.toString(),
            exitPrice: exitPrice?.toString(),
            stopLoss: stopLoss?.toString(),
            buyAmountSol: buyAmountSol?.toString(),
          });
        }
        
        const updatedOrder = await limitOrderService.getOrderById(orderId);
        logger?.info('✅ [LimitOrder] Order updated', { orderId });
        
        return c.json({ success: true, order: updatedOrder });
      } catch (error: any) {
        logger?.error('❌ [LimitOrder] Error updating order', { error: error.message });
        return c.json({ error: 'Failed to update limit order' }, 500);
      }
    }
  },
  {
    path: "/api/limit-orders/:id",
    method: "DELETE" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const orderId = c.req.param('id');
        const userId = c.req.query('userId');
        
        if (!orderId) {
          return c.json({ error: 'Order ID is required' }, 400);
        }
        
        if (!userId) {
          return c.json({ error: 'userId is required for authorization' }, 400);
        }
        
        const existingOrder = await limitOrderService.getOrderById(orderId);
        if (!existingOrder) {
          return c.json({ error: 'Order not found' }, 404);
        }
        
        if (existingOrder.userId !== userId) {
          return c.json({ error: 'Unauthorized' }, 403);
        }
        
        await limitOrderService.cancelOrder(orderId);
        logger?.info('✅ [LimitOrder] Order cancelled', { orderId });
        
        return c.json({ success: true, message: 'Order cancelled' });
      } catch (error: any) {
        logger?.error('❌ [LimitOrder] Error cancelling order', { error: error.message });
        return c.json({ error: 'Failed to cancel limit order' }, 500);
      }
    }
  },
  {
    path: "/api/limit-orders/:id/execute",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const orderId = c.req.param('id');
        const { userId } = await c.req.json();
        
        if (!orderId) {
          return c.json({ error: 'Order ID is required' }, 400);
        }
        
        const order = await limitOrderService.getOrderById(orderId);
        if (!order) {
          return c.json({ error: 'Order not found' }, 404);
        }
        
        if (userId && order.userId !== userId) {
          return c.json({ error: 'Unauthorized' }, 403);
        }
        
        logger?.info('🔄 [LimitOrder] Manually triggering execution', { orderId });
        
        const result = await limitOrderService.checkPriceAndExecute(order);
        
        if (result.executed) {
          logger?.info('✅ [LimitOrder] Order executed', { orderId, action: result.action });
          return c.json({ success: true, executed: true, action: result.action });
        } else {
          logger?.info('ℹ️ [LimitOrder] Price conditions not met', { orderId });
          return c.json({ 
            success: true, 
            executed: false, 
            message: result.error || 'Price conditions not met yet' 
          });
        }
      } catch (error: any) {
        logger?.error('❌ [LimitOrder] Error executing order', { error: error.message });
        return c.json({ error: 'Failed to execute limit order' }, 500);
      }
    }
  },
  {
    path: "/api/limit-orders/monitor",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        logger?.info('🔄 [LimitOrder] Triggering monitoring of all active orders');
        
        const result = await limitOrderService.monitorAllActiveOrders();
        
        logger?.info('✅ [LimitOrder] Monitoring complete', result);
        return c.json({ success: true, ...result });
      } catch (error: any) {
        logger?.error('❌ [LimitOrder] Error monitoring orders', { error: error.message });
        return c.json({ error: 'Failed to monitor orders' }, 500);
      }
    }
  },
  {
    path: "/api/limit-orders/active",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const orders = await limitOrderService.getActiveOrders();
        return c.json({ orders, count: orders.length });
      } catch (error: any) {
        logger?.error('❌ [LimitOrder] Error fetching active orders', { error: error.message });
        return c.json({ error: 'Failed to fetch active orders' }, 500);
      }
    }
  },
];
