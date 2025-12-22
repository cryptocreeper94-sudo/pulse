import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const commandsTool = createTool({
  id: "commands-tool",
  description: "Shows the complete list of available commands when user types 'commands', 'help', or asks about what the bot can do",
  inputSchema: z.object({
    query: z.string().optional().describe("Optional query to filter commands")
  }),
  outputSchema: z.object({
    commandsList: z.string()
  }),
  execute: async ({ mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F4CB} [CommandsTool] Displaying commands list");
    const commandsList = `\u{1F916} **DarkWave-V2 Commands**

**\u{1F4CA} MARKET ANALYSIS**
\u2022 \`BTC\` or \`ETH\` - Analyze bluechip crypto (Bitcoin, Ethereum, SOL, etc.)
\u2022 \`AAPL\` or \`TSLA\` - Analyze stocks (Apple, Tesla, NVDA, etc.)
\u2022 \`PEPE\` or \`BONK\` - Analyze DEX/meme coins with rug-risk detection
\u2022 \`0x123abc...\` - Analyze any token by contract address

**\u{1F4C8} PORTFOLIO TRACKING**
\u2022 \`hold BTC\` - Add an asset to your watchlist
\u2022 \`remove BTC\` - Remove an asset from your watchlist
\u2022 \`list\` - Show your current watchlist
\u2022 \`clear\` - Clear your entire watchlist

**\u{1F4BC} SOLANA WALLET** *(NEW!)*
\u2022 \`wallet\` - Create or view your Solana wallet
\u2022 \`balance\` - Check your wallet's SOL balance
\u2022 \`withdraw 0.5 ABC123...\` - Withdraw SOL to your Phantom wallet

**\u{1F50D} MARKET SCANNING**
\u2022 \`crypto\` - Scan top 50 cryptocurrencies for BUY signals (~8-9 minutes)
\u2022 \`stock\` - Scan top 100 stocks for BUY signals (~20-25 seconds)

**\u{1F4DA} EDUCATIONAL**
\u2022 \`RSI\` - Learn about Relative Strength Index
\u2022 \`MACD\` - Learn about Moving Average Convergence Divergence
\u2022 \`SIGNALS\` - View multi-signal trading strategies (5-signal = 80%+ accuracy)
\u2022 \`support\` - Learn about support and resistance levels
\u2022 \`volume\` - Learn about volume analysis
\u2022 Ask: "What is [any technical term]?" - Natural language glossary

**\u{1F3AF} WHAT YOU GET**
Every analysis includes:
\u2713 Current Price & Market Cap
\u2713 RSI (overbought/oversold)
\u2713 MACD (momentum)
\u2713 EMA 12/26 (trend direction)
\u2713 Bollinger Bands (volatility)
\u2713 Support/Resistance Levels
\u2713 Volume Analysis
\u2713 BUY/SELL/HOLD Recommendation
\u2713 For DEX pairs: Rug Risk + Liquidity Score

**\u{1F4A1} TIPS**
\u2022 Combine 5+ signals for 80%+ accuracy
\u2022 DEX tokens show rug-risk warnings (LOW/MODERATE/HIGH)
\u2022 Use natural language: "analyze bitcoin" or just "BTC"
\u2022 Type any technical term to learn more

**\u{1F680} QUICK START**
Try: \`BTC\`, \`PEPE\`, \`crypto\`, or \`SIGNALS\``;
    logger?.info("\u2705 [CommandsTool] Commands list generated");
    return {
      commandsList
    };
  }
});

export { commandsTool };
//# sourceMappingURL=58243ffe-8abf-4fcd-b44a-b47dcc717894.mjs.map
