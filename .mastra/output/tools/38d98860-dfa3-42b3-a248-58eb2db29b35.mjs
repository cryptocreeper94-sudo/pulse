import { c as createTool, z, i as index } from '../mastra.mjs';
import { Keypair } from '@solana/web3.js';
import { encryptPrivateKey } from './7beaaf51-b750-4c18-8437-fd208f2462bc.mjs';
import 'stream/web';
import 'crypto';
import 'node:url';
import 'node:path';
import 'node:module';
import 'events';
import 'pino';
import 'node:crypto';
import 'path';
import 'util';
import 'buffer';
import 'string_decoder';
import 'stream';
import 'async_hooks';
import 'url';
import 'node:process';
import 'inngest';
import 'http';
import 'https';
import 'fs';
import 'http2';
import 'assert';
import 'tty';
import 'os';
import 'zlib';
import 'pg';
import '@mastra/inngest';
import 'uuid';
import 'net';
import 'tls';
import 'child_process';
import 'fs/promises';
import '@solana/spl-token';
import 'bcrypt';
import '@simplewebauthn/server';
import 'rss-parser';

const walletGeneratorTool = createTool({
  id: "wallet-generator-tool",
  description: "Generates a new Solana wallet for the user. Returns the wallet address (public key) that users can send SOL to from their Phantom wallet. The bot manages this wallet for trading.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    walletAddress: z.string(),
    success: z.boolean(),
    message: z.string(),
    isNewWallet: z.boolean()
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    try {
      const userId = context.userId || "default-user";
      logger?.info("\u{1F527} [WalletGeneratorTool] Starting wallet retrieval/generation", { userId });
      const WALLET_KEY = `user_wallet_${userId}`;
      let existingWallet = null;
      try {
        const memory2 = mastra?.memory;
        if (memory2) {
          const messages = await memory2.getMessages({
            resourceId: userId,
            threadId: WALLET_KEY
          });
          if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.content) {
              existingWallet = JSON.parse(lastMessage.content);
              logger?.info("\u2705 [WalletGeneratorTool] Found existing wallet", {
                userId,
                walletAddress: existingWallet.publicKey
              });
              return {
                walletAddress: existingWallet.publicKey,
                success: true,
                message: `Your existing wallet address: ${existingWallet.publicKey}`,
                isNewWallet: false
              };
            }
          }
        }
      } catch (e) {
        logger?.info("[WalletGeneratorTool] No existing wallet found, creating new one");
      }
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toBase58();
      const privateKey = index.encode(keypair.secretKey);
      logger?.info("\u{1F511} [WalletGeneratorTool] Generated new wallet", {
        userId,
        walletAddress: publicKey
      });
      const encryptedPrivateKey = encryptPrivateKey(privateKey);
      logger?.info("\u{1F512} [WalletGeneratorTool] Private key encrypted", { userId });
      const memory = mastra?.memory;
      if (memory) {
        await memory.saveMessages({
          messages: [{
            role: "system",
            content: JSON.stringify({
              publicKey,
              privateKey: encryptedPrivateKey,
              // Encrypted using AES-256-GCM
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            })
          }],
          resourceId: userId,
          threadId: WALLET_KEY
        });
        logger?.info("\u{1F4BE} [WalletGeneratorTool] Saved encrypted wallet to database", { userId });
      }
      logger?.info("\u2705 [WalletGeneratorTool] Wallet generation complete", {
        userId,
        walletAddress: publicKey
      });
      return {
        walletAddress: publicKey,
        success: true,
        message: `New wallet created! Send SOL from your Phantom wallet to: ${publicKey}`,
        isNewWallet: true
      };
    } catch (error) {
      logger?.error("\u274C [WalletGeneratorTool] Error generating wallet", { error: error.message });
      return {
        walletAddress: "",
        success: false,
        message: `Failed to generate wallet: ${error.message}`,
        isNewWallet: false
      };
    }
  }
});

export { walletGeneratorTool };
//# sourceMappingURL=38d98860-dfa3-42b3-a248-58eb2db29b35.mjs.map
