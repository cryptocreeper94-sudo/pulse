import { c as createTool, z, i as index, K as Keypair, C as Connection, P as PublicKey, T as Transaction, S as SystemProgram, s as sendAndConfirmTransaction, L as LAMPORTS_PER_SOL } from '../mastra.mjs';
import { decryptPrivateKey } from './a6ad7153-1de7-479e-a03d-2d23d004c8c4.mjs';
import 'pino';
import 'path';
import 'fs';
import 'util';
import 'child_process';
import 'node:process';
import 'stream/web';
import 'crypto';
import 'node:crypto';
import 'buffer';
import 'string_decoder';
import 'stream';
import 'async_hooks';
import 'node:url';
import 'http2';
import 'inngest';
import 'http';
import 'https';
import 'url';
import 'assert';
import 'tty';
import 'os';
import 'zlib';
import 'events';
import 'pg';
import 'inngest/hono';
import 'module';
import 'punycode';
import 'uuid';
import 'rpc-websockets';
import 'net';
import 'tls';
import 'bufferutil';
import 'utf-8-validate';
import 'fs/promises';
import 'bcrypt';
import 'xmlbuilder';
import 'timers';

const withdrawTool = createTool({
  id: "withdraw-tool",
  description: "Withdraws SOL from the user's bot wallet to their Phantom wallet address. Specify amount and destination address.",
  inputSchema: z.object({
    amount: z.number().describe("Amount of SOL to withdraw"),
    destinationAddress: z.string().describe("Phantom wallet address to send SOL to")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    signature: z.string(),
    message: z.string(),
    amountWithdrawn: z.number()
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    try {
      const userId = runtimeContext?.resourceId || context.userId || "default-user";
      logger?.info("\u{1F527} [WithdrawTool] Starting withdrawal", {
        userId,
        amount: context.amount,
        destination: context.destinationAddress
      });
      const WALLET_KEY = `user_wallet_${userId}`;
      const memory = mastra?.memory;
      if (!memory) {
        throw new Error("Memory storage not available");
      }
      const messages = await memory.getMessages({
        resourceId: userId,
        threadId: WALLET_KEY
      });
      if (!messages || messages.length === 0) {
        throw new Error("No wallet found. Create a wallet first with /wallet");
      }
      const lastMessage = messages[messages.length - 1];
      const walletData = JSON.parse(lastMessage.content);
      const decryptedPrivateKey = decryptPrivateKey(walletData.privateKey);
      logger?.info("\u{1F513} [WithdrawTool] Private key decrypted", { userId });
      const privateKeyArray = index.decode(decryptedPrivateKey);
      const keypair = Keypair.fromSecretKey(privateKeyArray);
      logger?.info("\u{1F511} [WithdrawTool] Loaded wallet keypair", {
        userId,
        fromAddress: keypair.publicKey.toBase58()
      });
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      let destinationPubKey;
      try {
        destinationPubKey = new PublicKey(context.destinationAddress);
      } catch (e) {
        throw new Error("Invalid destination wallet address");
      }
      const balance = await connection.getBalance(keypair.publicKey);
      const balanceSOL = balance / LAMPORTS_PER_SOL;
      if (balanceSOL < context.amount) {
        throw new Error(`Insufficient balance. You have ${balanceSOL.toFixed(4)} SOL, trying to withdraw ${context.amount} SOL`);
      }
      const amountLamports = Math.floor(context.amount * LAMPORTS_PER_SOL);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: destinationPubKey,
          lamports: amountLamports
        })
      );
      logger?.info("\u{1F4E4} [WithdrawTool] Sending transaction", {
        from: keypair.publicKey.toBase58(),
        to: context.destinationAddress,
        amount: context.amount
      });
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keypair],
        {
          commitment: "confirmed"
        }
      );
      logger?.info("\u2705 [WithdrawTool] Withdrawal successful", {
        userId,
        signature,
        amount: context.amount
      });
      return {
        success: true,
        signature,
        message: `Successfully withdrew ${context.amount} SOL to ${context.destinationAddress}. Transaction: https://solscan.io/tx/${signature}`,
        amountWithdrawn: context.amount
      };
    } catch (error) {
      logger?.error("\u274C [WithdrawTool] Error withdrawing", { error: error.message });
      return {
        success: false,
        signature: "",
        message: `Withdrawal failed: ${error.message}`,
        amountWithdrawn: 0
      };
    }
  }
});

export { withdrawTool };
//# sourceMappingURL=7a2d0ff1-3738-4e35-a58a-41cf821e0fbd.mjs.map
