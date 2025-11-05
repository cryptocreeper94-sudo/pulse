import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const commandsTool = createTool({
  id: "commands-tool",
  description: "Shows the complete list of available commands when user types 'commands', 'help', or asks about what the bot can do",
  
  inputSchema: z.object({
    query: z.string().optional().describe("Optional query to filter commands"),
  }),
  
  outputSchema: z.object({
    commandsList: z.string(),
  }),
  
  execute: async ({ mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('📋 [CommandsTool] Displaying commands list');

    const commandsList = `🤖 **DarkWave-V2 Commands**

**📊 MARKET ANALYSIS**
• \`BTC\` or \`ETH\` - Analyze bluechip crypto (Bitcoin, Ethereum, SOL, etc.)
• \`AAPL\` or \`TSLA\` - Analyze stocks (Apple, Tesla, NVDA, etc.)
• \`PEPE\` or \`BONK\` - Analyze DEX/meme coins with rug-risk detection
• \`0x123abc...\` - Analyze any token by contract address

**📈 PORTFOLIO TRACKING**
• \`hold BTC\` - Add an asset to your watchlist
• \`remove BTC\` - Remove an asset from your watchlist
• \`list\` - Show your current watchlist
• \`clear\` - Clear your entire watchlist

**🔍 MARKET SCANNING**
• \`market\` - Quick scan (top 10 cryptos + 10 stocks) ~5-7 seconds
• \`crypto\` - Full crypto scan (top 50 cryptos) ~3-4 minutes
• \`stock\` - Full stock scan (top 100 stocks) ~20-25 seconds

**📚 EDUCATIONAL**
• \`RSI\` - Learn about Relative Strength Index
• \`MACD\` - Learn about Moving Average Convergence Divergence
• \`SIGNALS\` - View multi-signal trading strategies (5-signal = 80%+ accuracy)
• \`support\` - Learn about support and resistance levels
• \`volume\` - Learn about volume analysis
• Ask: "What is [any technical term]?" - Natural language glossary

**📊 VISUAL CHARTS**
• Automatically included with bluechip analysis
• Shows price trends with EMA overlays

**🎯 WHAT YOU GET**
Every analysis includes:
✓ Current Price & Market Cap
✓ RSI (overbought/oversold)
✓ MACD (momentum)
✓ EMA 12/26 (trend direction)
✓ Bollinger Bands (volatility)
✓ Support/Resistance Levels
✓ Volume Analysis
✓ BUY/SELL/HOLD Recommendation
✓ For DEX pairs: Rug Risk + Liquidity Score

**💡 TIPS**
• Combine 5+ signals for 80%+ accuracy
• DEX tokens show rug-risk warnings (LOW/MODERATE/HIGH)
• Use natural language: "analyze bitcoin" or just "BTC"
• Type any technical term to learn more

**🚀 QUICK START**
Try: \`BTC\`, \`PEPE\`, \`market\`, or \`SIGNALS\``;

    logger?.info('✅ [CommandsTool] Commands list generated');

    return {
      commandsList,
    };
  },
});
