import axios from 'axios';
import { inngest } from './client';
import { db } from '../../db/client.js';
import { strikeAgentSignals } from '../../db/schema.js';
import { desc, gte } from 'drizzle-orm';

// StrikeAgent bot for signal broadcasts (primary)
const STRIKEAGENT_BOT_TOKEN = process.env.TELEGRAM_MINIAPP_BOT_TOKEN;
// Fallback to main bot if StrikeAgent bot not configured
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

// Use StrikeAgent bot for signals, fall back to main bot
const SIGNAL_BOT_TOKEN = STRIKEAGENT_BOT_TOKEN || TELEGRAM_BOT_TOKEN;

async function sendChannelMessage(text: string): Promise<boolean> {
  if (!SIGNAL_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.warn('[TelegramBroadcast] Missing bot token or TELEGRAM_CHANNEL_ID');
    return false;
  }

  try {
    const botName = STRIKEAGENT_BOT_TOKEN ? 'StrikeAgent' : 'Main';
    const response = await axios.post(`https://api.telegram.org/bot${SIGNAL_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHANNEL_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    console.log(`[TelegramBroadcast] Message sent via ${botName} bot successfully`);
    return response.data.ok;
  } catch (error: any) {
    console.error('[TelegramBroadcast] Failed to send message:', error.message);
    return false;
  }
}

interface StrikeSignalData {
  symbol: string;
  name: string;
  chain: string;
  signal: 'SNIPE' | 'WATCH' | 'AVOID';
  price: number;
  marketCap: number;
  liquidity: number;
  compositeScore: number;
  safetyScore: number;
  momentumScore: number;
  reasoning: string;
}

async function getStrikeAgentSignals(): Promise<StrikeSignalData[]> {
  try {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    
    const recentSignals = await db.select()
      .from(strikeAgentSignals)
      .where(gte(strikeAgentSignals.createdAt, fourHoursAgo))
      .orderBy(desc(strikeAgentSignals.compositeScore))
      .limit(5);

    const signals: StrikeSignalData[] = [];
    const seenTokens = new Set<string>();

    for (const sig of recentSignals) {
      if (seenTokens.has(sig.tokenAddress)) continue;
      seenTokens.add(sig.tokenAddress);

      const composite = sig.compositeScore || 0;
      const safety = sig.safetyScore || 0;
      
      let signal: 'SNIPE' | 'WATCH' | 'AVOID' = 'WATCH';
      if (composite >= 75 && safety >= 60) {
        signal = 'SNIPE';
      } else if (composite < 40 || safety < 30) {
        signal = 'AVOID';
      }

      signals.push({
        symbol: sig.tokenSymbol,
        name: sig.tokenName,
        chain: sig.chain || 'solana',
        signal,
        price: parseFloat(sig.priceUsd?.toString() || '0'),
        marketCap: parseFloat(sig.marketCapUsd?.toString() || '0'),
        liquidity: parseFloat(sig.liquidityUsd?.toString() || '0'),
        compositeScore: composite,
        safetyScore: safety,
        momentumScore: sig.momentumScore || 0,
        reasoning: sig.reasoning || 'AI analysis complete'
      });

      if (signals.length >= 3) break;
    }

    return signals;
  } catch (error: any) {
    console.error('[TelegramBroadcast] Error fetching StrikeAgent signals:', error.message);
    return [];
  }
}

async function fetchDexScreenerTrending(): Promise<StrikeSignalData[]> {
  try {
    const response = await axios.get('https://api.dexscreener.com/latest/dex/tokens/SOL', {
      timeout: 10000
    });

    const pairs = response.data?.pairs || [];
    const signals: StrikeSignalData[] = [];

    for (const pair of pairs.slice(0, 5)) {
      const priceChange = pair.priceChange?.h24 || 0;
      const liquidity = pair.liquidity?.usd || 0;
      const volume = pair.volume?.h24 || 0;
      
      if (liquidity < 10000) continue;
      
      let signal: 'SNIPE' | 'WATCH' | 'AVOID' = 'WATCH';
      let safetyScore = 50;
      
      if (liquidity > 100000 && volume > 50000) {
        safetyScore = 70;
        if (priceChange > 20) signal = 'SNIPE';
      } else if (liquidity < 25000) {
        safetyScore = 30;
        signal = 'AVOID';
      }

      signals.push({
        symbol: pair.baseToken?.symbol || 'UNKNOWN',
        name: pair.baseToken?.name || 'Unknown Token',
        chain: 'solana',
        signal,
        price: parseFloat(pair.priceUsd || '0'),
        marketCap: pair.fdv || 0,
        liquidity,
        compositeScore: Math.min(100, Math.round((priceChange + 50) * safetyScore / 100)),
        safetyScore,
        momentumScore: Math.min(100, Math.round(priceChange + 50)),
        reasoning: priceChange > 10 ? 'Strong momentum detected' : 'Market activity monitoring'
      });

      if (signals.length >= 3) break;
    }

    return signals;
  } catch (error: any) {
    console.error('[TelegramBroadcast] Error fetching DexScreener:', error.message);
    return [];
  }
}

function formatPrice(price: number): string {
  if (price === 0) return '$0.00';
  if (price < 0.000001) return `$${price.toExponential(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatMarketCap(mc: number): string {
  if (mc >= 1000000) return `$${(mc / 1000000).toFixed(1)}M`;
  if (mc >= 1000) return `$${(mc / 1000).toFixed(0)}K`;
  return `$${mc.toFixed(0)}`;
}

function formatStrikeAgentMessage(signals: StrikeSignalData[]): string {
  if (signals.length === 0) {
    return '';
  }

  let message = `<b>StrikeAgent</b>\n🎯 <b>Top Token Signals</b>\n\n`;

  for (const sig of signals) {
    const emoji = sig.signal === 'SNIPE' ? '🎯' : sig.signal === 'WATCH' ? '👀' : '⚠️';
    const safetyEmoji = sig.safetyScore >= 70 ? '🟢' : sig.safetyScore >= 40 ? '🟡' : '🔴';
    
    message += `${emoji} <b>${sig.symbol}</b> (${sig.name})\n`;
    message += `Signal: <b>${sig.signal}</b>\n`;
    message += `Price: ${formatPrice(sig.price)} | MC: ${formatMarketCap(sig.marketCap)}\n`;
    message += `${safetyEmoji} Safety: ${sig.safetyScore}% | Score: ${sig.compositeScore}%\n`;
    message += `<i>${sig.reasoning}</i>\n\n`;
  }

  message += `<i>🔒 Full access: Pulse Pro subscription</i>\n`;
  message += `<i>Signals update every 4 hours. Not financial advice.</i>`;

  return message;
}

export const telegramSignalBroadcast = inngest.createFunction(
  {
    id: "telegram-signal-broadcast",
    name: "Broadcast Signals to Telegram Channel",
  },
  [
    { cron: "0 */4 * * *" },
    { event: "telegram/broadcast-signals" },
  ],
  async ({ event, step }) => {
    console.log("📢 [TelegramBroadcast] Starting StrikeAgent signal broadcast...");

    if (!TELEGRAM_CHANNEL_ID) {
      console.warn("⚠️ [TelegramBroadcast] TELEGRAM_CHANNEL_ID not configured - skipping broadcast");
      return { 
        success: false, 
        error: "TELEGRAM_CHANNEL_ID not configured",
        timestamp: new Date().toISOString() 
      };
    }

    let signals = await step.run("get-strikeagent-signals", async () => {
      const dbSignals = await getStrikeAgentSignals();
      if (dbSignals.length >= 2) {
        console.log(`[TelegramBroadcast] Found ${dbSignals.length} StrikeAgent signals from database`);
        return dbSignals;
      }
      console.log('[TelegramBroadcast] Not enough DB signals, fetching from DexScreener...');
      return await fetchDexScreenerTrending();
    });

    if (signals.length === 0) {
      console.warn("⚠️ [TelegramBroadcast] No StrikeAgent signals available");
      return { 
        success: false, 
        error: "No signals available",
        timestamp: new Date().toISOString() 
      };
    }

    const message = formatStrikeAgentMessage(signals);

    const sent = await step.run("send-broadcast", async () => {
      return await sendChannelMessage(message);
    });

    console.log(`✅ [TelegramBroadcast] Broadcast ${sent ? 'succeeded' : 'failed'}`);

    return {
      success: sent,
      signalsCount: signals.length,
      signals: signals.map(s => ({ symbol: s.symbol, signal: s.signal, score: s.compositeScore })),
      timestamp: new Date().toISOString()
    };
  }
);

export const telegramBroadcastWorkerFunctions = [
  telegramSignalBroadcast,
];
