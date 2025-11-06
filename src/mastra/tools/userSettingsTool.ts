import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * User Settings Tool - Manages bot preferences and toggles
 * Stores user preferences like auto-execute, exchange links, safety limits
 */

export const userSettingsTool = createTool({
  id: 'user-settings',
  description: `Control Center - Manages ALL bot settings and toggles with simple on/off commands. 
  Use this when the user wants to:
  - View all settings ("settings")
  - Toggle features ("on alerts", "off sniping", "on auto trading")
  - Change asset scope ("stocks only", "coins only", "both")
  - Change exchange links ("kraken links", "dex links")
  - Set spending limits ("set max spend 0.5")
  - Any simple toggle or preference change
  
  This is the MAIN settings interface - users prefer toggles over complex commands.`,
  inputSchema: z.object({
    action: z.enum(['view', 'update']).describe('View or update settings'),
    userId: z.string().describe('User ID from Telegram'),
    settings: z.object({
      autoExecuteLimitOrders: z.boolean().optional().describe('Auto-execute limit orders when triggered'),
      autoExecuteSniping: z.boolean().optional().describe('Auto-execute token sniping when criteria met'),
      defaultExchangeLink: z.enum(['kraken', 'dexscreener']).optional().describe('Default exchange for hyperlinks'),
      maxAutoSpendPerTrade: z.number().optional().describe('Max SOL to spend per auto-executed trade'),
      snipingEnabled: z.boolean().optional().describe('Enable/disable sniping features'),
      priceAlertsEnabled: z.boolean().optional().describe('Enable/disable price alert monitoring'),
      assetScope: z.enum(['coins', 'stocks', 'both']).optional().describe('Which assets to analyze'),
      autoMonitorWatchlist: z.boolean().optional().describe('Auto-create alerts for watchlist items'),
    }).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    settings: z.object({
      autoExecuteLimitOrders: z.boolean(),
      autoExecuteSniping: z.boolean(),
      defaultExchangeLink: z.string(),
      maxAutoSpendPerTrade: z.number(),
      snipingEnabled: z.boolean(),
      priceAlertsEnabled: z.boolean(),
      assetScope: z.string(),
      autoMonitorWatchlist: z.boolean(),
    }).optional(),
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, settings } = context;
    const userId = context.userId || (runtimeContext as any)?.resourceId || 'default-user';
    const SETTINGS_KEY = `user_settings_${userId}`;

    logger?.info('⚙️ [UserSettings] Starting settings operation', {
      action,
      userId,
    });

    try {
      const memory = mastra?.memory;
      
      // Get current settings from memory
      let currentSettings = {
        autoExecuteLimitOrders: false,
        autoExecuteSniping: false,
        defaultExchangeLink: 'dexscreener',
        maxAutoSpendPerTrade: 0.1, // 0.1 SOL default (~$15-20)
        snipingEnabled: false,
        priceAlertsEnabled: false,
        assetScope: 'both', // coins, stocks, or both
        autoMonitorWatchlist: false,
      };
      
      try {
        if (memory) {
          const messages = await memory.getMessages({
            resourceId: userId,
            threadId: SETTINGS_KEY,
          });
          
          if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.content) {
              currentSettings = { ...currentSettings, ...JSON.parse(lastMessage.content as string) };
            }
          }
        }
      } catch (e) {
        logger?.warn('[UserSettings] No existing settings found, using defaults');
      }

      if (action === 'view') {
        logger?.info('👁️ [UserSettings] Viewing Control Center', { userId });

        const toggle = (enabled: boolean) => enabled ? '✅ ON' : '❌ OFF';
        const safeMode = !currentSettings.autoExecuteLimitOrders && !currentSettings.autoExecuteSniping;
        
        // Check wallet status from memory
        let walletStatus = '❌ Not connected';
        try {
          if (memory) {
            const walletMessages = await memory.getMessages({
              resourceId: userId,
              threadId: `wallet_${userId}`,
            });
            if (walletMessages && walletMessages.length > 0) {
              const lastWallet = walletMessages[walletMessages.length - 1];
              if (lastWallet.content) {
                const walletData = JSON.parse(lastWallet.content as string);
                if (walletData.publicKey) {
                  const short = walletData.publicKey.slice(0, 6) + '...' + walletData.publicKey.slice(-4);
                  walletStatus = `✅ ${short}`;
                }
              }
            }
          }
        } catch (e) {
          // No wallet connected
        }
        
        const controlCenter = `
╔═══════════════════════════════════════╗
║   🌊 DarkWave Control Center V2.1    ║
╚═══════════════════════════════════════╝

📱 WALLET
├─ Status: ${walletStatus}
└─ Quick: "connect wallet" | "disconnect"

🎯 PRICE ALERTS
├─ Enabled: ${toggle(currentSettings.priceAlertsEnabled)}
├─ Auto-monitor watchlist: ${toggle(currentSettings.autoMonitorWatchlist)}
└─ Quick: "on alerts" | "BTC alert 65000"

💱 TRADING ${safeMode ? '(SAFE MODE ✅)' : '(AUTO MODE ⚠️)'}
├─ Auto-execute orders: ${toggle(currentSettings.autoExecuteLimitOrders)}
├─ Max spend: ${currentSettings.maxAutoSpendPerTrade} SOL/trade
└─ Exchange links: ${currentSettings.defaultExchangeLink}

🎯 SNIPING
├─ Enabled: ${toggle(currentSettings.snipingEnabled)}
├─ Auto-execute: ${toggle(currentSettings.autoExecuteSniping)}
└─ Quick: "on sniping" | "off sniping"

🔍 ANALYSIS
├─ Asset scope: ${currentSettings.assetScope === 'both' ? '📊 Stocks + 🪙 Crypto' : currentSettings.assetScope === 'stocks' ? '📊 Stocks only' : '🪙 Crypto only'}
└─ Quick: "stocks only" | "coins only" | "both"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SUPER SIMPLE COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Toggle anything:
  "on [feature]" → Enable
  "off [feature]" → Disable
  
Examples:
  "on auto trading" "off sniping"
  "stocks only" "coins only"
  "kraken links" "dex links"
  
${!safeMode ? '\n⚠️ AUTO-TRADING ACTIVE - Bot will execute trades automatically!\n' : ''}`.trim();
        
        return {
          success: true,
          message: controlCenter,
          settings: currentSettings,
        };
      }

      if (action === 'update') {
        if (!settings) {
          return {
            success: false,
            message: 'No settings provided to update',
          };
        }

        // Merge new settings
        const updatedSettings = { ...currentSettings, ...settings };

        // Validation
        if (updatedSettings.maxAutoSpendPerTrade < 0 || updatedSettings.maxAutoSpendPerTrade > 10) {
          return {
            success: false,
            message: 'Max auto-spend must be between 0 and 10 SOL for safety',
          };
        }

        // Save to memory
        if (memory) {
          await memory.saveMessages({
            messages: [{
              role: 'assistant',
              content: JSON.stringify(updatedSettings),
            }],
            resourceId: userId,
            threadId: SETTINGS_KEY,
          });
        }

        logger?.info('✅ [UserSettings] Settings updated', {
          userId,
          changes: settings,
        });

        // Build update message
        let updateMsg = '✅ Settings updated:\n\n';
        if (settings.autoExecuteLimitOrders !== undefined) {
          updateMsg += `${settings.autoExecuteLimitOrders ? '✅' : '❌'} Auto-execute limit orders: ${settings.autoExecuteLimitOrders ? 'ENABLED' : 'DISABLED'}\n`;
        }
        if (settings.autoExecuteSniping !== undefined) {
          updateMsg += `${settings.autoExecuteSniping ? '✅' : '❌'} Auto-execute sniping: ${settings.autoExecuteSniping ? 'ENABLED' : 'DISABLED'}\n`;
        }
        if (settings.snipingEnabled !== undefined) {
          updateMsg += `${settings.snipingEnabled ? '✅' : '❌'} Sniping features: ${settings.snipingEnabled ? 'ENABLED' : 'DISABLED'}\n`;
        }
        if (settings.priceAlertsEnabled !== undefined) {
          updateMsg += `${settings.priceAlertsEnabled ? '✅' : '❌'} Price alerts: ${settings.priceAlertsEnabled ? 'ENABLED' : 'DISABLED'}\n`;
        }
        if (settings.autoMonitorWatchlist !== undefined) {
          updateMsg += `${settings.autoMonitorWatchlist ? '✅' : '❌'} Auto-monitor watchlist: ${settings.autoMonitorWatchlist ? 'ENABLED' : 'DISABLED'}\n`;
        }
        if (settings.assetScope) {
          const scopeText = settings.assetScope === 'both' ? '📊 Stocks + 🪙 Crypto' : 
                           settings.assetScope === 'stocks' ? '📊 Stocks only' : '🪙 Crypto only';
          updateMsg += `🔍 Asset scope: ${scopeText}\n`;
        }
        if (settings.defaultExchangeLink) {
          updateMsg += `🔗 Exchange links: ${settings.defaultExchangeLink}\n`;
        }
        if (settings.maxAutoSpendPerTrade !== undefined) {
          updateMsg += `💰 Max auto-spend: ${settings.maxAutoSpendPerTrade} SOL/trade\n`;
        }

        if (updatedSettings.autoExecuteLimitOrders || updatedSettings.autoExecuteSniping) {
          updateMsg += `\n⚠️ AUTO-TRADING ENABLED - The bot will execute trades automatically using your connected wallet.`;
        } else {
          updateMsg += `\n✅ SAFE MODE - All trades require manual approval in Phantom.`;
        }

        return {
          success: true,
          message: updateMsg,
          settings: updatedSettings,
        };
      }

      return {
        success: false,
        message: 'Unknown action',
      };
    } catch (error) {
      logger?.error('❌ [UserSettings] Error:', error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});
