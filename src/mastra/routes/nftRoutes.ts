import { db } from '../../db/client.js';
import { sql } from 'drizzle-orm';
import axios from 'axios';

export const nftRoutes = [
  {
    path: "/api/nft/portfolio/:userId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        
        const result = await db.execute(sql`
          SELECT * FROM nft_holdings
          WHERE user_id = ${userId}
          ORDER BY estimated_value DESC
        `);
        
        const nfts = result.rows || [];
        const totalValue = nfts.reduce((sum: number, nft: any) => sum + (parseFloat(nft.estimated_value) || 0), 0);
        const collections = [...new Set(nfts.map((n: any) => n.collection_name))];
        
        return c.json({
          nfts,
          summary: {
            totalNfts: nfts.length,
            totalValue,
            uniqueCollections: collections.length,
            chains: [...new Set(nfts.map((n: any) => n.chain))]
          }
        });
      } catch (error: any) {
        console.error('NFT portfolio error:', error);
        return c.json({ nfts: [], summary: {} });
      }
    }
  },

  {
    path: "/api/nft/sync-wallet",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const { userId, walletAddress, chain } = await c.req.json();
        
        let nfts: any[] = [];
        
        if (chain === 'solana') {
          try {
            const heliusKey = process.env.HELIUS_API_KEY;
            if (heliusKey) {
              const res = await axios.get(
                `https://api.helius.xyz/v0/addresses/${walletAddress}/nfts?api-key=${heliusKey}`,
                { timeout: 10000 }
              );
              nfts = res.data.map((nft: any) => ({
                token_id: nft.mint,
                collection_name: nft.collectionName || 'Unknown',
                name: nft.name,
                image_url: nft.image,
                chain: 'solana',
                estimated_value: 0
              }));
            }
          } catch (e) {}
        } else if (chain === 'ethereum') {
          try {
            const alchemyKey = process.env.ALCHEMY_API_KEY;
            if (alchemyKey) {
              const res = await axios.get(
                `https://eth-mainnet.g.alchemy.com/nft/v3/${alchemyKey}/getNFTsForOwner?owner=${walletAddress}`,
                { timeout: 10000 }
              );
              nfts = res.data.ownedNfts?.map((nft: any) => ({
                token_id: nft.tokenId,
                collection_name: nft.contract?.name || 'Unknown',
                name: nft.name || nft.title,
                image_url: nft.image?.cachedUrl,
                chain: 'ethereum',
                contract_address: nft.contract?.address,
                estimated_value: 0
              })) || [];
            }
          } catch (e) {}
        }
        
        for (const nft of nfts) {
          await db.execute(sql`
            INSERT INTO nft_holdings (user_id, wallet_address, chain, token_id, collection_name, name, image_url, contract_address, estimated_value, last_synced)
            VALUES (${userId}, ${walletAddress}, ${nft.chain}, ${nft.token_id}, ${nft.collection_name}, ${nft.name}, ${nft.image_url}, ${nft.contract_address || null}, ${nft.estimated_value}, NOW())
            ON CONFLICT (user_id, chain, token_id) DO UPDATE SET
              estimated_value = EXCLUDED.estimated_value,
              last_synced = NOW()
          `);
        }
        
        return c.json({ 
          success: true, 
          synced: nfts.length,
          message: `Synced ${nfts.length} NFTs from ${chain}`
        });
      } catch (error: any) {
        console.error('NFT sync error:', error);
        return c.json({ error: 'Failed to sync NFTs' }, 500);
      }
    }
  },

  {
    path: "/api/nft/collections/trending",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const collections = [
          { name: 'Bored Ape Yacht Club', floor: 28.5, volume24h: 156.2, change24h: 5.2, chain: 'ethereum' },
          { name: 'Mutant Ape Yacht Club', floor: 5.8, volume24h: 89.4, change24h: -2.1, chain: 'ethereum' },
          { name: 'Azuki', floor: 8.2, volume24h: 67.3, change24h: 8.7, chain: 'ethereum' },
          { name: 'DeGods', floor: 4.5, volume24h: 234.5, change24h: 12.3, chain: 'solana' },
          { name: 'Mad Lads', floor: 85, volume24h: 1234, change24h: 15.6, chain: 'solana' },
          { name: 'Pudgy Penguins', floor: 12.3, volume24h: 45.6, change24h: 3.4, chain: 'ethereum' },
          { name: 'Okay Bears', floor: 12.5, volume24h: 567.8, change24h: -4.5, chain: 'solana' },
          { name: 'y00ts', floor: 2.1, volume24h: 345.2, change24h: 7.8, chain: 'polygon' }
        ];
        
        return c.json({ collections });
      } catch (error: any) {
        console.error('Trending collections error:', error);
        return c.json({ collections: [] });
      }
    }
  },

  {
    path: "/api/nft/collection/:slug",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const slug = c.req.param('slug');
        
        return c.json({
          name: slug,
          description: 'Collection details',
          floorPrice: 5.5,
          totalVolume: 12345,
          owners: 5678,
          items: 10000,
          royalty: 5,
          chain: 'ethereum',
          verified: true,
          socials: {
            twitter: `https://twitter.com/${slug}`,
            discord: `https://discord.gg/${slug}`
          }
        });
      } catch (error: any) {
        console.error('Collection details error:', error);
        return c.json({ error: 'Failed to fetch collection' }, 500);
      }
    }
  },

  {
    path: "/api/nft/floor-alerts/:userId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        
        const result = await db.execute(sql`
          SELECT * FROM nft_floor_alerts
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `);
        
        return c.json({ alerts: result.rows || [] });
      } catch (error: any) {
        console.error('Floor alerts error:', error);
        return c.json({ alerts: [] });
      }
    }
  },

  {
    path: "/api/nft/floor-alert",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const { userId, collectionSlug, targetPrice, direction } = await c.req.json();
        
        await db.execute(sql`
          INSERT INTO nft_floor_alerts (user_id, collection_slug, target_price, direction, enabled, created_at)
          VALUES (${userId}, ${collectionSlug}, ${targetPrice}, ${direction}, true, NOW())
        `);
        
        return c.json({ success: true });
      } catch (error: any) {
        console.error('Create floor alert error:', error);
        return c.json({ error: 'Failed to create alert' }, 500);
      }
    }
  }
];
