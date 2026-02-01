import { db } from '../../db/client.js';
import { portfolioTransactions } from '../../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export const taxRoutes = [
  {
    path: "/api/tax/reports/:userId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        const year = parseInt(c.req.query('year') || new Date().getFullYear().toString());
        
        const transactions = await db.select()
          .from(portfolioTransactions)
          .where(eq(portfolioTransactions.userId, userId))
          .orderBy(portfolioTransactions.timestamp);
        
        const yearTransactions = transactions.filter(tx => {
          const txYear = new Date(tx.timestamp!).getFullYear();
          return txYear === year;
        });
        
        let totalGains = 0;
        let totalLosses = 0;
        let shortTermGains = 0;
        let longTermGains = 0;
        const holdings: Record<string, { quantity: number, costBasis: number, purchases: any[] }> = {};
        const taxEvents: any[] = [];
        
        for (const tx of yearTransactions) {
          const symbol = tx.symbol!;
          if (!holdings[symbol]) {
            holdings[symbol] = { quantity: 0, costBasis: 0, purchases: [] };
          }
          
          if (tx.type === 'buy') {
            const qty = parseFloat(tx.quantity || '0');
            const price = parseFloat(tx.price || '0');
            holdings[symbol].purchases.push({
              quantity: qty,
              price: price,
              date: tx.timestamp,
              totalCost: qty * price
            });
            holdings[symbol].quantity += qty;
            holdings[symbol].costBasis += qty * price;
          } else if (tx.type === 'sell') {
            const sellQuantity = parseFloat(tx.quantity || '0');
            const sellPrice = parseFloat(tx.price || '0');
            const sellTotal = sellQuantity * sellPrice;
            let costBasisUsed = 0;
            let remainingToSell = sellQuantity;
            
            while (remainingToSell > 0 && holdings[symbol].purchases.length > 0) {
              const oldest = holdings[symbol].purchases[0];
              const takeFromOldest = Math.min(remainingToSell, oldest.quantity);
              costBasisUsed += takeFromOldest * oldest.price;
              oldest.quantity -= takeFromOldest;
              remainingToSell -= takeFromOldest;
              
              if (oldest.quantity <= 0) {
                holdings[symbol].purchases.shift();
              }
            }
            
            const gain = sellTotal - costBasisUsed;
            const isLongTerm = false;
            
            if (gain > 0) {
              totalGains += gain;
              if (isLongTerm) longTermGains += gain;
              else shortTermGains += gain;
            } else {
              totalLosses += Math.abs(gain);
            }
            
            taxEvents.push({
              date: tx.timestamp,
              symbol,
              type: 'sell',
              quantity: sellQuantity,
              proceeds: sellTotal,
              costBasis: costBasisUsed,
              gainLoss: gain,
              term: isLongTerm ? 'long' : 'short'
            });
            
            holdings[symbol].quantity -= sellQuantity;
            holdings[symbol].costBasis -= costBasisUsed;
          }
        }
        
        return c.json({
          year,
          summary: {
            totalGains,
            totalLosses,
            netGainLoss: totalGains - totalLosses,
            shortTermGains,
            longTermGains,
            taxableEvents: taxEvents.length
          },
          taxEvents,
          holdings: Object.entries(holdings).map(([symbol, data]) => ({
            symbol,
            quantity: data.quantity,
            costBasis: data.costBasis,
            avgCostPerUnit: data.quantity > 0 ? data.costBasis / data.quantity : 0
          }))
        });
      } catch (error: any) {
        console.error('Tax report error:', error);
        return c.json({ error: 'Failed to generate tax report' }, 500);
      }
    }
  },

  {
    path: "/api/tax/export/:userId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        const year = c.req.query('year') || new Date().getFullYear().toString();
        const format = c.req.query('format') || 'csv';
        
        const transactions = await db.select()
          .from(portfolioTransactions)
          .where(eq(portfolioTransactions.userId, userId));
        
        const yearTransactions = transactions.filter(tx => {
          const txYear = new Date(tx.timestamp!).getFullYear();
          return txYear === parseInt(year);
        });
        
        if (format === 'csv') {
          let csv = 'Date,Type,Symbol,Quantity,Price,Total\n';
          for (const tx of yearTransactions) {
            const total = parseFloat(tx.quantity || '0') * parseFloat(tx.price || '0');
            csv += `${tx.timestamp},${tx.type},${tx.symbol},${tx.quantity},${tx.price},${total}\n`;
          }
          
          c.header('Content-Type', 'text/csv');
          c.header('Content-Disposition', `attachment; filename="tax_report_${year}.csv"`);
          return c.body(csv);
        } else if (format === 'turbotax') {
          let txf = '!MTAX01\nVERSION 042\n';
          for (const tx of yearTransactions) {
            if (tx.type === 'sell') {
              const total = parseFloat(tx.quantity || '0') * parseFloat(tx.price || '0');
              txf += `TD\nN323\nC1\nL1\nP${tx.symbol}\nD${tx.timestamp}\n$${total}\n^\n`;
            }
          }
          
          c.header('Content-Type', 'application/x-txf');
          c.header('Content-Disposition', `attachment; filename="tax_report_${year}.txf"`);
          return c.body(txf);
        }
        
        return c.json({ error: 'Invalid format' }, 400);
      } catch (error: any) {
        console.error('Tax export error:', error);
        return c.json({ error: 'Failed to export tax data' }, 500);
      }
    }
  },

  {
    path: "/api/tax/cost-basis/:userId/:symbol",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        const symbol = c.req.param('symbol');
        const method = c.req.query('method') || 'fifo';
        
        const transactions = await db.select()
          .from(portfolioTransactions)
          .where(and(
            eq(portfolioTransactions.userId, userId),
            eq(portfolioTransactions.symbol, symbol)
          ))
          .orderBy(method === 'lifo' ? desc(portfolioTransactions.timestamp) : portfolioTransactions.timestamp);
        
        let totalQuantity = 0;
        let totalCostBasis = 0;
        const lots: any[] = [];
        
        for (const tx of transactions) {
          if (tx.type === 'buy') {
            const quantity = parseFloat(tx.quantity || '0');
            const price = parseFloat(tx.price || '0');
            totalQuantity += quantity;
            totalCostBasis += quantity * price;
            lots.push({
              date: tx.timestamp,
              quantity,
              price,
              costBasis: quantity * price
            });
          }
        }
        
        return c.json({
          symbol,
          method,
          totalQuantity,
          totalCostBasis,
          averageCostPerUnit: totalQuantity > 0 ? totalCostBasis / totalQuantity : 0,
          lots
        });
      } catch (error: any) {
        console.error('Cost basis error:', error);
        return c.json({ error: 'Failed to calculate cost basis' }, 500);
      }
    }
  }
];
