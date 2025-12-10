import { walletService } from '../../wallet/walletService';

export const walletRoutes = [
  {
    path: "/api/wallet/create",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { wordCount = 12, password } = await c.req.json();
        
        if (wordCount !== 12 && wordCount !== 24) {
          return c.json({ error: 'Word count must be 12 or 24' }, 400);
        }
        
        const mnemonic = walletService.generateMnemonic(wordCount);
        const accounts = walletService.deriveAddresses(mnemonic);
        const walletId = walletService.createWalletId();
        
        let encryptedMnemonic: string | undefined;
        if (password) {
          encryptedMnemonic = walletService.encryptMnemonic(mnemonic, password);
        }
        
        logger?.info('✅ [Wallet] New wallet created', { walletId, chains: accounts.length });
        
        return c.json({
          success: true,
          wallet: {
            id: walletId,
            mnemonic,
            accounts,
            encryptedMnemonic
          }
        });
      } catch (error: any) {
        logger?.error('❌ [Wallet] Create error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/wallet/import",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { mnemonic, password } = await c.req.json();
        
        if (!mnemonic) {
          return c.json({ error: 'Mnemonic is required' }, 400);
        }
        
        if (!walletService.validateMnemonic(mnemonic)) {
          return c.json({ error: 'Invalid mnemonic phrase' }, 400);
        }
        
        const accounts = walletService.deriveAddresses(mnemonic);
        const walletId = walletService.createWalletId();
        
        let encryptedMnemonic: string | undefined;
        if (password) {
          encryptedMnemonic = walletService.encryptMnemonic(mnemonic, password);
        }
        
        logger?.info('✅ [Wallet] Wallet imported', { walletId, chains: accounts.length });
        
        return c.json({
          success: true,
          wallet: {
            id: walletId,
            accounts,
            encryptedMnemonic
          }
        });
      } catch (error: any) {
        logger?.error('❌ [Wallet] Import error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/wallet/decrypt",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { encryptedMnemonic, password } = await c.req.json();
        
        if (!encryptedMnemonic || !password) {
          return c.json({ error: 'Encrypted mnemonic and password required' }, 400);
        }
        
        const mnemonic = walletService.decryptMnemonic(encryptedMnemonic, password);
        
        return c.json({ success: true, mnemonic });
      } catch (error: any) {
        logger?.error('❌ [Wallet] Decrypt error', { error: error.message });
        return c.json({ error: 'Invalid password or corrupted data' }, 400);
      }
    }
  },
  
  {
    path: "/api/wallet/chains",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const chains = walletService.getSupportedChains();
        return c.json({ chains });
      } catch (error: any) {
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/wallet/balance",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { chain, address } = await c.req.json();
        
        if (!chain || !address) {
          return c.json({ error: 'Chain and address required' }, 400);
        }
        
        const balance = await walletService.getBalance(chain, address);
        return c.json({ success: true, ...balance });
      } catch (error: any) {
        logger?.error('❌ [Wallet] Balance error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/wallet/balances",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { accounts } = await c.req.json();
        
        if (!accounts || !Array.isArray(accounts)) {
          return c.json({ error: 'Accounts array required' }, 400);
        }
        
        const balances = await walletService.getAllBalances(accounts);
        const totalUsd = Object.values(balances).reduce((sum, b) => sum + b.usd, 0);
        
        return c.json({ 
          success: true, 
          balances,
          totalUsd
        });
      } catch (error: any) {
        logger?.error('❌ [Wallet] Balances error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/wallet/estimate-gas",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { chain, from, to, amount } = await c.req.json();
        
        if (!chain || !from || !to || !amount) {
          return c.json({ error: 'Chain, from, to, and amount required' }, 400);
        }
        
        const estimate = await walletService.estimateGas(chain, from, to, amount);
        return c.json({ success: true, ...estimate });
      } catch (error: any) {
        logger?.error('❌ [Wallet] Gas estimate error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/wallet/send",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { chain, mnemonic, to, amount } = await c.req.json();
        
        if (!chain || !mnemonic || !to || !amount) {
          return c.json({ error: 'Chain, mnemonic, to, and amount required' }, 400);
        }
        
        if (!walletService.validateMnemonic(mnemonic)) {
          return c.json({ error: 'Invalid mnemonic' }, 400);
        }
        
        const result = await walletService.sendTransaction(chain, mnemonic, to, amount);
        
        if (result.success) {
          logger?.info('✅ [Wallet] Transaction sent', { chain, txHash: result.txHash });
        } else {
          logger?.error('❌ [Wallet] Transaction failed', { chain, error: result.error });
        }
        
        return c.json(result);
      } catch (error: any) {
        logger?.error('❌ [Wallet] Send error', { error: error.message });
        return c.json({ success: false, error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/wallet/send-signed",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { chain, privateKey, to, amount } = await c.req.json();
        
        if (!chain || !privateKey || !to || !amount) {
          return c.json({ error: 'Chain, privateKey, to, and amount required' }, 400);
        }
        
        const result = await walletService.sendWithPrivateKey(chain, privateKey, to, amount);
        
        if (result.success) {
          logger?.info('✅ [Wallet] Transaction sent', { chain, txHash: result.txHash });
        } else {
          logger?.error('❌ [Wallet] Transaction failed', { chain, error: result.error });
        }
        
        return c.json(result);
      } catch (error: any) {
        logger?.error('❌ [Wallet] Send error', { error: error.message });
        return c.json({ success: false, error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/wallet/validate",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const { mnemonic } = await c.req.json();
        const valid = walletService.validateMnemonic(mnemonic || '');
        return c.json({ valid });
      } catch (error: any) {
        return c.json({ valid: false });
      }
    }
  },
  
  {
    path: "/api/wallet/derive",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { mnemonic } = await c.req.json();
        
        if (!mnemonic || !walletService.validateMnemonic(mnemonic)) {
          return c.json({ error: 'Valid mnemonic required' }, 400);
        }
        
        const accounts = walletService.deriveAddresses(mnemonic);
        return c.json({ success: true, accounts });
      } catch (error: any) {
        logger?.error('❌ [Wallet] Derive error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  }
];
