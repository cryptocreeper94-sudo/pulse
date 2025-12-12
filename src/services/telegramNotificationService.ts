import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TokenAlert {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  safetyScore: string;
  chain: string;
  contractAddress?: string;
}

export interface TradeNotification {
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  total: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface SafetyAlert {
  symbol: string;
  contractAddress: string;
  riskLevel: 'HIGH' | 'CRITICAL';
  warnings: string[];
  chain: string;
}

async function sendTelegramMessage(chatId: string | number, text: string, parseMode: string = 'HTML'): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('[TelegramNotification] No bot token configured');
    return false;
  }

  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true
    });
    return true;
  } catch (error: any) {
    console.error('[TelegramNotification] Failed to send message:', error.message);
    return false;
  }
}

export async function sendHotTokenAlert(chatId: string | number, token: TokenAlert): Promise<boolean> {
  const priceChangeEmoji = token.priceChange24h >= 0 ? '🟢' : '🔴';
  const safetyEmoji = getSafetyEmoji(token.safetyScore);
  
  const message = `
🔥 <b>HOT TOKEN ALERT</b> 🔥

${safetyEmoji} <b>${token.symbol}</b> - ${token.name}
━━━━━━━━━━━━━━━━━━

💰 <b>Price:</b> $${formatNumber(token.price)}
${priceChangeEmoji} <b>24h Change:</b> ${token.priceChange24h >= 0 ? '+' : ''}${token.priceChange24h.toFixed(2)}%
📊 <b>Volume:</b> $${formatVolume(token.volume24h)}
🛡️ <b>Safety Score:</b> ${token.safetyScore}
⛓️ <b>Chain:</b> ${token.chain}

<i>Discovered by StrikeAgent AI</i>
━━━━━━━━━━━━━━━━━━
🚀 <a href="https://strikeagent.io">Open StrikeAgent</a>
`.trim();

  return sendTelegramMessage(chatId, message);
}

export async function sendTradeConfirmation(chatId: string | number, trade: TradeNotification): Promise<boolean> {
  const tradeEmoji = trade.type === 'buy' ? '🟢' : '🔴';
  const actionText = trade.type === 'buy' ? 'BOUGHT' : 'SOLD';
  
  let pnlSection = '';
  if (trade.type === 'sell' && trade.pnl !== undefined && trade.pnlPercent !== undefined) {
    const pnlEmoji = trade.pnl >= 0 ? '📈' : '📉';
    const pnlSign = trade.pnl >= 0 ? '+' : '';
    pnlSection = `
${pnlEmoji} <b>P&L:</b> ${pnlSign}$${formatNumber(trade.pnl)} (${pnlSign}${trade.pnlPercent.toFixed(2)}%)`;
  }

  const message = `
${tradeEmoji} <b>TRADE ${actionText}</b>

📍 <b>Token:</b> ${trade.symbol}
💵 <b>Amount:</b> ${formatNumber(trade.amount)} tokens
💰 <b>Price:</b> $${formatNumber(trade.price)}
📊 <b>Total:</b> $${formatNumber(trade.total)}${pnlSection}

<i>Paper Trading - StrikeAgent Demo</i>
`.trim();

  return sendTelegramMessage(chatId, message);
}

export async function sendSafetyWarning(chatId: string | number, alert: SafetyAlert): Promise<boolean> {
  const riskEmoji = alert.riskLevel === 'CRITICAL' ? '🚨' : '⚠️';
  
  const warningsList = alert.warnings.map(w => `• ${w}`).join('\n');
  
  const message = `
${riskEmoji} <b>SAFETY ALERT</b> ${riskEmoji}

🎯 <b>Token:</b> ${alert.symbol}
⛓️ <b>Chain:</b> ${alert.chain}
🔴 <b>Risk Level:</b> ${alert.riskLevel}

<b>Warnings:</b>
${warningsList}

<code>${alert.contractAddress.slice(0, 8)}...${alert.contractAddress.slice(-6)}</code>

<i>⚠️ Proceed with extreme caution</i>
`.trim();

  return sendTelegramMessage(chatId, message);
}

export async function sendDailyDigest(chatId: string | number, stats: {
  hotTokensCount: number;
  topGainer: TokenAlert | null;
  totalVolume: number;
  safetyAlertsCount: number;
}): Promise<boolean> {
  const topGainerSection = stats.topGainer 
    ? `\n🏆 <b>Top Gainer:</b> ${stats.topGainer.symbol} (+${stats.topGainer.priceChange24h.toFixed(1)}%)`
    : '';

  const message = `
📊 <b>STRIKEAGENT DAILY DIGEST</b>

🔥 <b>Hot Tokens Today:</b> ${stats.hotTokensCount}${topGainerSection}
📈 <b>Total Volume Scanned:</b> $${formatVolume(stats.totalVolume)}
⚠️ <b>Safety Alerts:</b> ${stats.safetyAlertsCount}

━━━━━━━━━━━━━━━━━━
🚀 <a href="https://strikeagent.io">View Full Report</a>
`.trim();

  return sendTelegramMessage(chatId, message);
}

export async function sendWelcomeMessage(chatId: string | number, userName?: string): Promise<boolean> {
  const greeting = userName ? `Hello ${userName}!` : 'Hello!';
  
  const message = `
🎯 <b>Welcome to StrikeAgent</b>

${greeting} Your AI-powered token discovery assistant is ready.

<b>What I can do:</b>
• 🔥 Alert you to hot new tokens
• 🛡️ Warn you about risky contracts  
• 📊 Send daily market digests
• 💰 Confirm your paper trades

<b>Commands:</b>
/start - Get started
/alerts - Manage alert preferences
/digest - Get daily summary
/help - View all commands

━━━━━━━━━━━━━━━━━━
🚀 <a href="https://strikeagent.io">Open StrikeAgent App</a>
`.trim();

  return sendTelegramMessage(chatId, message);
}

function getSafetyEmoji(score: string): string {
  switch (score.toUpperCase()) {
    case 'A': return '🟢';
    case 'B': return '🟡';
    case 'C': return '🟠';
    case 'D': return '🔴';
    case 'F': return '⛔';
    default: return '⚪';
  }
}

function formatNumber(num: number): string {
  if (num < 0.000001) return num.toExponential(2);
  if (num < 0.01) return num.toFixed(6);
  if (num < 1) return num.toFixed(4);
  if (num < 1000) return num.toFixed(2);
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(2)}K`;
  return volume.toFixed(2);
}

export const telegramNotificationService = {
  sendHotTokenAlert,
  sendTradeConfirmation,
  sendSafetyWarning,
  sendDailyDigest,
  sendWelcomeMessage
};
