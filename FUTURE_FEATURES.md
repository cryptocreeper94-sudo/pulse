# Future Features - DarkWave V2

## 🎯 TP/SL Trade Manager (Priority: High)
**Status:** Deferred - Requires proper wallet integration and testing
**Estimated Effort:** 4-6 hours development + 2-3 hours testing
**AI Cost:** ~$8-12

### Feature Description
Restart-safe Take Profit / Stop Loss order monitoring with automatic execution.

### Code Snippet (Reference Implementation)
```typescript
// restart-safe TP/SL logic with checkpointing
export const manageTrade = async (trade) => {
  const { entryPrice, stopLoss, takeProfit, symbol } = trade;
  const currentPrice = await getLivePrice(symbol);

  const stateKey = `tradeState_${symbol}`;
  const savedState = await loadState(stateKey) || {};

  if (!savedState.active) {
    await saveState(stateKey, { active: true, entryPrice, stopLoss, takeProfit });
  }

  if (currentPrice <= stopLoss) {
    await executeSell(symbol);
    await saveState(stateKey, { active: false });
    logEvent(`Stop loss triggered for ${symbol}`);
  } else if (currentPrice >= takeProfit) {
    await executeSell(symbol);
    await saveState(stateKey, { active: false });
    logEvent(`Take profit triggered for ${symbol}`);
  }
};
```

### Requirements for Production
1. **Real Jupiter DEX Integration**
   - Swap execution via Jupiter API
   - Transaction signing with user wallets
   - Slippage tolerance settings

2. **Price Feed Infrastructure**
   - Real-time monitoring (Helius/Pyth/Jupiter)
   - Backup price sources
   - Price validation logic

3. **Security & Safety**
   - User approval before TP/SL activation
   - Spending limits per trade
   - Emergency kill switch
   - Slippage protection
   - Authentication checks

4. **Monitoring System**
   - Cron job or webhook for price checking
   - Event-driven execution (not polling)
   - State persistence in PostgreSQL

### Integration Points
- Extends `jupiterLimitOrderTool` with auto-execution
- Uses `walletCache` for wallet management
- Stores state in PostgreSQL (not cache)
- Requires Helius webhooks for price updates

### Testing Plan
1. Test on Solana devnet first
2. Small amounts only ($1-5 max)
3. Manual verification before production
4. Extensive logging and monitoring

---

## 🧠 Sentient Trigger (Priority: Medium)
**Status:** Deferred - Requires sentiment API integration
**Estimated Effort:** 2-3 hours development
**AI Cost:** ~$3-5

### Feature Description
Combines RSI technical signals with market sentiment analysis to identify "emotionally undervalued" assets.

### Code Snippet (Reference Implementation)
```typescript
// Sentient trigger combining RSI + sentiment
export const sentientTrigger = async (symbol) => {
  const rsi = await getRSI(symbol);
  const sentiment = await getSentimentScore(symbol);

  if (rsi < 30 && sentiment > 0.6) {
    logEvent(`Sentient trigger: ${symbol} is emotionally undervalued`);
    return true;
  }

  return false;
};
```

### Requirements for Production
1. **Sentiment Data Source** (choose one):
   - **LunarCrush** (crypto sentiment) - $0-50/month, 100 calls/day free
   - **Santiment** (on-chain + social) - $50-200/month
   - **Fear & Greed Index** (free, crypto-wide only)
   - **CoinGecko Sentiment** (FREE - already using) - Basic per-token sentiment

2. **Better Approach - Use Sentiment as Confirmation**:
   ```typescript
   // Use sentiment to CONFIRM signals, not trigger them
   if (rsi < 30) {
     const sentiment = await getSentiment(symbol);
     const confidence = sentiment > 0.6 ? "HIGH" : "MEDIUM";
     return { signal: "BUY", confidence };
   }
   ```

3. **Integration Points**:
   - Add to `technicalAnalysisTool` as optional flag
   - Store sentiment history in PostgreSQL
   - Cache sentiment data (5-15 min TTL)

### Testing Plan
1. Backtest against historical data
2. Compare with RSI-only signals
3. Validate sentiment sources aren't manipulated
4. A/B test with users

### Notes
- Sentiment often lags price (reacts AFTER moves)
- Easily manipulated by bots/shills
- Best as confirmation, not primary signal
- CoinGecko provides basic sentiment for FREE (already integrated)

---

## Other Future Features
(Add more features here as they come up)
