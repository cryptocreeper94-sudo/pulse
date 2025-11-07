import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

export const nftTool = createTool({
  id: 'analyze_nft_collection',
  description: 'Analyzes NFT collection data including floor price, volume, holders, and market trends. Supports collections on Ethereum, Polygon, and other chains.',
  inputSchema: z.object({
    query: z.string().describe('NFT collection name or contract address (e.g., "Bored Ape Yacht Club", "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D")'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    collection: z.object({
      name: z.string(),
      slug: z.string().optional(),
      contractAddress: z.string().optional(),
      chain: z.string(),
      floorPrice: z.number().optional(),
      floorPriceUsd: z.number().optional(),
      volume24h: z.number().optional(),
      volume24hUsd: z.number().optional(),
      volumeChange24h: z.number().optional(),
      totalSupply: z.number().optional(),
      owners: z.number().optional(),
      listedCount: z.number().optional(),
      sales24h: z.number().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      marketCap: z.number().optional(),
    }).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    const { query } = context;

    logger?.info('🎨 [NFT Tool] Starting NFT collection analysis', { query });

    try {
      // Reservoir API - Free tier, aggregates OpenSea, Blur, LooksRare, etc.
      const baseUrl = 'https://api.reservoir.tools';
      
      // First, search for the collection
      logger?.info('🔍 [NFT Tool] Searching for collection', { query });
      
      let collectionId = query;
      
      // If query doesn't look like an address, search by name
      if (!query.startsWith('0x')) {
        const searchUrl = `${baseUrl}/search/collections/v2`;
        const searchResponse = await axios.get(searchUrl, {
          params: {
            name: query,
            limit: 1
          },
          headers: {
            'Accept': 'application/json'
          },
          timeout: 8000
        });

        if (searchResponse.data?.collections?.length > 0) {
          collectionId = searchResponse.data.collections[0].id;
          logger?.info('✅ [NFT Tool] Found collection', { collectionId, name: searchResponse.data.collections[0].name });
        } else {
          logger?.warn('⚠️ [NFT Tool] Collection not found', { query });
          return {
            success: false,
            error: `NFT collection "${query}" not found. Try searching with contract address or exact collection name.`
          };
        }
      }

      // Get collection stats
      logger?.info('📊 [NFT Tool] Fetching collection stats', { collectionId });
      const statsUrl = `${baseUrl}/collections/v7`;
      const statsResponse = await axios.get(statsUrl, {
        params: {
          id: collectionId,
          includeTopBid: true,
          normalizeRoyalties: false
        },
        headers: {
          'Accept': 'application/json'
        },
        timeout: 8000
      });

      if (!statsResponse.data?.collections?.length) {
        logger?.warn('⚠️ [NFT Tool] No collection data found', { collectionId });
        return {
          success: false,
          error: `Unable to fetch data for collection "${query}"`
        };
      }

      const collection = statsResponse.data.collections[0];
      logger?.info('✅ [NFT Tool] Collection data retrieved', { name: collection.name });

      // Calculate market cap (floor price * total supply)
      const floorPriceEth = collection.floorAsk?.price?.amount?.native || 0;
      const floorPriceUsd = collection.floorAsk?.price?.amount?.usd || 0;
      const totalSupply = collection.tokenCount || 0;
      const marketCapUsd = floorPriceUsd * totalSupply;

      // Volume changes
      const volume1d = collection.volume?.['1day'] || 0;
      const volume7d = collection.volume?.['7day'] || 0;
      const volumeChange = volume7d > 0 ? ((volume1d - (volume7d / 7)) / (volume7d / 7)) * 100 : 0;

      const result = {
        success: true,
        collection: {
          name: collection.name || 'Unknown Collection',
          slug: collection.slug,
          contractAddress: collection.primaryContract,
          chain: collection.chainId === 1 ? 'Ethereum' : 
                 collection.chainId === 137 ? 'Polygon' :
                 collection.chainId === 8453 ? 'Base' :
                 collection.chainId === 42161 ? 'Arbitrum' : 'Other',
          floorPrice: parseFloat(floorPriceEth.toFixed(4)),
          floorPriceUsd: parseFloat(floorPriceUsd.toFixed(2)),
          volume24h: parseFloat((volume1d || 0).toFixed(4)),
          volume24hUsd: parseFloat(((collection.volume?.['1day'] || 0) * (floorPriceUsd / floorPriceEth)).toFixed(2)),
          volumeChange24h: parseFloat(volumeChange.toFixed(2)),
          totalSupply: totalSupply,
          owners: collection.ownerCount || 0,
          listedCount: collection.onSaleCount || 0,
          sales24h: collection.salesCount?.['1day'] || 0,
          description: collection.description || '',
          image: collection.image || '',
          marketCap: parseFloat(marketCapUsd.toFixed(2)),
        }
      };

      logger?.info('✅ [NFT Tool] Analysis complete', { 
        name: result.collection.name,
        floor: result.collection.floorPriceUsd,
        volume24h: result.collection.volume24hUsd
      });

      return result;

    } catch (error: any) {
      logger?.error('❌ [NFT Tool] Error analyzing NFT collection', { 
        query, 
        error: error.message,
        code: error.code
      });

      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Request timeout - NFT data service is slow. Please try again.'
        };
      }

      return {
        success: false,
        error: `Unable to analyze NFT collection: ${error.message}`
      };
    }
  },
});
