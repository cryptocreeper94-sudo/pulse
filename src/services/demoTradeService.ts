export interface DemoTrade {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  action: 'buy' | 'sell';
  amountSol: number;
  priceUsd: number;
  tokenAmount: number;
  timestamp: Date;
  status: 'open' | 'closed' | 'stopped';
  entryPrice: number;
  exitPrice?: number;
  pnlSol?: number;
  pnlPercent?: number;
}

export interface DemoPortfolio {
  balanceSol: number;
  initialBalanceSol: number;
  positions: DemoPosition[];
  tradeHistory: DemoTrade[];
  stats: DemoStats;
}

export interface DemoPosition {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAmount: number;
  entryPriceSol: number;
  entryPriceUsd: number;
  currentPriceSol?: number;
  currentPriceUsd?: number;
  pnlSol?: number;
  pnlPercent?: number;
  timestamp: Date;
}

export interface DemoStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnlSol: number;
  totalPnlPercent: number;
  bestTrade: number;
  worstTrade: number;
}

const INITIAL_DEMO_BALANCE = 10000; // $10,000 USD worth

class DemoTradeService {
  private getStorageKey(sessionId: string): string {
    return `demo_portfolio_${sessionId}`;
  }

  initializePortfolio(sessionId: string): DemoPortfolio {
    const portfolio: DemoPortfolio = {
      balanceSol: INITIAL_DEMO_BALANCE,
      initialBalanceSol: INITIAL_DEMO_BALANCE,
      positions: [],
      tradeHistory: [],
      stats: {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalPnlSol: 0,
        totalPnlPercent: 0,
        bestTrade: 0,
        worstTrade: 0,
      },
    };
    return portfolio;
  }

  async executeBuy(
    sessionId: string,
    portfolio: DemoPortfolio,
    token: {
      address: string;
      symbol: string;
      name: string;
      priceUsd: number;
      priceSol: number;
    },
    amountUsd: number
  ): Promise<{ success: boolean; portfolio: DemoPortfolio; trade?: DemoTrade; error?: string }> {
    if (amountUsd > portfolio.balanceSol) {
      return { success: false, portfolio, error: 'Insufficient balance' };
    }

    const tokenAmount = amountUsd / token.priceUsd;
    const trade: DemoTrade = {
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      action: 'buy',
      amountSol: amountUsd,
      priceUsd: token.priceUsd,
      tokenAmount,
      timestamp: new Date(),
      status: 'open',
      entryPrice: token.priceUsd,
    };

    const position: DemoPosition = {
      id: trade.id,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      tokenAmount,
      entryPriceSol: amountUsd,
      entryPriceUsd: token.priceUsd,
      currentPriceUsd: token.priceUsd,
      pnlSol: 0,
      pnlPercent: 0,
      timestamp: new Date(),
    };

    portfolio.balanceSol -= amountUsd;
    portfolio.positions.push(position);
    portfolio.tradeHistory.push(trade);
    portfolio.stats.totalTrades++;

    return { success: true, portfolio, trade };
  }

  async executeSell(
    sessionId: string,
    portfolio: DemoPortfolio,
    positionId: string,
    currentPriceUsd: number
  ): Promise<{ success: boolean; portfolio: DemoPortfolio; trade?: DemoTrade; pnl?: number; error?: string }> {
    const positionIndex = portfolio.positions.findIndex(p => p.id === positionId);
    if (positionIndex === -1) {
      return { success: false, portfolio, error: 'Position not found' };
    }

    const position = portfolio.positions[positionIndex];
    const currentValue = position.tokenAmount * currentPriceUsd;
    const pnlUsd = currentValue - position.entryPriceSol;
    const pnlPercent = ((currentValue - position.entryPriceSol) / position.entryPriceSol) * 100;

    const trade: DemoTrade = {
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tokenAddress: position.tokenAddress,
      tokenSymbol: position.tokenSymbol,
      tokenName: position.tokenName,
      action: 'sell',
      amountSol: currentValue,
      priceUsd: currentPriceUsd,
      tokenAmount: position.tokenAmount,
      timestamp: new Date(),
      status: 'closed',
      entryPrice: position.entryPriceUsd,
      exitPrice: currentPriceUsd,
      pnlSol: pnlUsd,
      pnlPercent,
    };

    portfolio.balanceSol += currentValue;
    portfolio.positions.splice(positionIndex, 1);
    portfolio.tradeHistory.push(trade);

    if (pnlUsd > 0) {
      portfolio.stats.wins++;
    } else {
      portfolio.stats.losses++;
    }

    portfolio.stats.totalPnlSol += pnlUsd;
    portfolio.stats.totalPnlPercent = ((portfolio.balanceSol - portfolio.initialBalanceSol) / portfolio.initialBalanceSol) * 100;
    portfolio.stats.winRate = portfolio.stats.totalTrades > 0 
      ? (portfolio.stats.wins / (portfolio.stats.wins + portfolio.stats.losses)) * 100 
      : 0;

    if (pnlPercent > portfolio.stats.bestTrade) {
      portfolio.stats.bestTrade = pnlPercent;
    }
    if (pnlPercent < portfolio.stats.worstTrade) {
      portfolio.stats.worstTrade = pnlPercent;
    }

    const buyTrade = portfolio.tradeHistory.find(t => t.id === positionId);
    if (buyTrade) {
      buyTrade.status = 'closed';
      buyTrade.exitPrice = currentPriceUsd;
      buyTrade.pnlSol = pnlUsd;
      buyTrade.pnlPercent = pnlPercent;
    }

    return { success: true, portfolio, trade, pnl: pnlUsd };
  }

  updatePositionPrices(portfolio: DemoPortfolio, prices: Record<string, number>): DemoPortfolio {
    portfolio.positions = portfolio.positions.map(position => {
      const currentPrice = prices[position.tokenAddress];
      if (currentPrice) {
        const currentValue = position.tokenAmount * currentPrice;
        const pnlSol = currentValue - position.entryPriceSol;
        const pnlPercent = ((currentValue - position.entryPriceSol) / position.entryPriceSol) * 100;
        return {
          ...position,
          currentPriceUsd: currentPrice,
          pnlSol,
          pnlPercent,
        };
      }
      return position;
    });
    return portfolio;
  }

  getPortfolioValue(portfolio: DemoPortfolio): number {
    const positionsValue = portfolio.positions.reduce((total, pos) => {
      const currentValue = pos.currentPriceUsd 
        ? pos.tokenAmount * pos.currentPriceUsd 
        : pos.entryPriceSol;
      return total + currentValue;
    }, 0);
    return portfolio.balanceSol + positionsValue;
  }

  resetPortfolio(sessionId: string): DemoPortfolio {
    return this.initializePortfolio(sessionId);
  }
}

export const demoTradeService = new DemoTradeService();
