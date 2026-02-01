import { Connection, VersionedTransaction, Transaction } from '@solana/web3.js'

const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote'
const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap'
const ONEINCH_BASE_URL = 'https://api.1inch.dev/swap/v6.0'

const CHAIN_IDS = {
  ethereum: 1,
  base: 8453,
  arbitrum: 42161,
  polygon: 137,
  optimism: 10,
  bsc: 56,
  avalanche: 43114,
}

const NATIVE_TOKENS = {
  solana: 'So11111111111111111111111111111111111111112',
  ethereum: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  base: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  arbitrum: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  polygon: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  optimism: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  bsc: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  avalanche: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
}

const DECIMALS = {
  SOL: 9,
  ETH: 18,
  MATIC: 18,
  BNB: 18,
  AVAX: 18,
}

const RPC_ENDPOINTS = {
  solana: 'https://api.mainnet-beta.solana.com',
  ethereum: 'https://eth.llamarpc.com',
  base: 'https://mainnet.base.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  polygon: 'https://polygon-rpc.com',
  optimism: 'https://mainnet.optimism.io',
  bsc: 'https://bsc-dataseed.binance.org',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
}

const EXPLORER_URLS = {
  solana: 'https://solscan.io/tx/',
  ethereum: 'https://etherscan.io/tx/',
  base: 'https://basescan.org/tx/',
  arbitrum: 'https://arbiscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
  optimism: 'https://optimistic.etherscan.io/tx/',
  bsc: 'https://bscscan.com/tx/',
  avalanche: 'https://snowtrace.io/tx/',
}

class DexSwapService {
  constructor() {
    this.solanaConnection = new Connection(RPC_ENDPOINTS.solana, 'confirmed')
    this.oneInchApiKey = ''
  }

  setOneInchApiKey(apiKey) {
    this.oneInchApiKey = apiKey
  }

  async getQuote(request) {
    const { chain, inputToken, outputToken, amount, slippage, userAddress } = request

    if (chain === 'solana') {
      return this.getJupiterQuote(inputToken, outputToken, amount, slippage, userAddress)
    } else {
      return this.get1inchQuote(chain, inputToken, outputToken, amount, slippage, userAddress)
    }
  }

  async getJupiterQuote(inputToken, outputToken, amount, slippage, userAddress) {
    const inputMint = inputToken === 'SOL' ? NATIVE_TOKENS.solana : inputToken
    const amountLamports = Math.floor(parseFloat(amount) * Math.pow(10, 9))

    const params = new URLSearchParams({
      inputMint,
      outputMint: outputToken,
      amount: amountLamports.toString(),
      slippageBps: (slippage * 100).toString(),
    })

    const response = await fetch(`${JUPITER_QUOTE_API}?${params}`)
    if (!response.ok) {
      throw new Error('Failed to get Jupiter quote')
    }

    const quoteData = await response.json()

    const outputAmount = parseInt(quoteData.outAmount) / Math.pow(10, quoteData.outputDecimals || 6)
    const outputAmountMin = parseInt(quoteData.otherAmountThreshold || quoteData.outAmount) / Math.pow(10, quoteData.outputDecimals || 6)
    const priceImpact = quoteData.priceImpactPct ? (parseFloat(quoteData.priceImpactPct) * 100).toFixed(2) : '0.00'

    return {
      chain: 'solana',
      inputToken,
      outputToken,
      inputAmount: amount,
      outputAmount: outputAmount.toString(),
      outputAmountMin: outputAmountMin.toString(),
      priceImpact,
      route: quoteData.routePlan?.map(r => r.swapInfo?.label).filter(Boolean).join(' → ') || 'Jupiter',
      fee: '0.00',
      rawQuote: quoteData,
    }
  }

  async get1inchQuote(chain, inputToken, outputToken, amount, slippage, userAddress) {
    const chainId = CHAIN_IDS[chain]
    if (!chainId) throw new Error(`Unsupported chain: ${chain}`)

    const inputAddress = ['ETH', 'MATIC', 'BNB', 'AVAX'].includes(inputToken) 
      ? NATIVE_TOKENS[chain] 
      : inputToken
    
    const decimals = DECIMALS[inputToken] || 18
    const amountWei = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals))).toString()

    const params = new URLSearchParams({
      src: inputAddress,
      dst: outputToken,
      amount: amountWei,
      from: userAddress,
      slippage: slippage.toString(),
      disableEstimate: 'true',
    })

    const headers = {
      'Accept': 'application/json',
    }
    if (this.oneInchApiKey) {
      headers['Authorization'] = `Bearer ${this.oneInchApiKey}`
    }

    const response = await fetch(`${ONEINCH_BASE_URL}/${chainId}/swap?${params}`, { headers })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('1inch API error:', errorText)
      throw new Error('Failed to get 1inch quote - try a different amount or token')
    }

    const data = await response.json()

    const outputDecimals = data.dstToken?.decimals || 18
    const outputAmount = parseInt(data.dstAmount) / Math.pow(10, outputDecimals)
    const minReturn = data.tx?.minReturnAmount || data.dstAmount
    const outputAmountMin = parseInt(minReturn) / Math.pow(10, outputDecimals)

    return {
      chain,
      inputToken,
      outputToken,
      inputAmount: amount,
      outputAmount: outputAmount.toString(),
      outputAmountMin: outputAmountMin.toString(),
      priceImpact: '0.50',
      route: data.protocols?.flat()?.map(p => p[0]?.name).filter(Boolean).join(' → ') || '1inch',
      fee: '0.00',
      estimatedGas: data.tx?.gas?.toString(),
      rawQuote: data,
    }
  }

  async buildSwapTransaction(quote, userAddress) {
    if (quote.chain === 'solana') {
      return this.buildJupiterTransaction(quote, userAddress)
    } else {
      return this.build1inchTransaction(quote, userAddress)
    }
  }

  async buildJupiterTransaction(quote, userAddress) {
    const response = await fetch(JUPITER_SWAP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote.rawQuote,
        userPublicKey: userAddress,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to build Jupiter swap transaction')
    }

    const { swapTransaction } = await response.json()
    const transactionBuffer = Buffer.from(swapTransaction, 'base64')
    const transaction = VersionedTransaction.deserialize(transactionBuffer)

    return {
      chain: 'solana',
      transaction,
      type: 'solana',
      explorerBaseUrl: EXPLORER_URLS.solana,
    }
  }

  async build1inchTransaction(quote, userAddress) {
    const txData = quote.rawQuote.tx
    if (!txData) {
      throw new Error('No transaction data in 1inch quote')
    }

    return {
      chain: quote.chain,
      transaction: {
        to: txData.to,
        data: txData.data,
        value: txData.value || '0',
        gasLimit: txData.gas?.toString(),
      },
      type: 'evm',
      explorerBaseUrl: EXPLORER_URLS[quote.chain] || EXPLORER_URLS.ethereum,
    }
  }

  async trackTransaction(chain, txHash) {
    const explorerUrl = (EXPLORER_URLS[chain] || EXPLORER_URLS.ethereum) + txHash

    if (chain === 'solana') {
      return this.trackSolanaTransaction(txHash, explorerUrl)
    } else {
      return this.trackEvmTransaction(chain, txHash, explorerUrl)
    }
  }

  async trackSolanaTransaction(signature, explorerUrl) {
    try {
      const maxAttempts = 30
      for (let i = 0; i < maxAttempts; i++) {
        const status = await this.solanaConnection.getSignatureStatus(signature)
        
        if (status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized') {
          return {
            success: !status.value.err,
            txHash: signature,
            explorerUrl,
            status: 'confirmed',
            error: status.value.err ? 'Transaction failed' : undefined,
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      return {
        success: false,
        txHash: signature,
        explorerUrl,
        status: 'pending',
        error: 'Transaction confirmation timeout',
      }
    } catch (err) {
      return {
        success: false,
        txHash: signature,
        explorerUrl,
        status: 'failed',
        error: err.message || 'Failed to track transaction',
      }
    }
  }

  async trackEvmTransaction(chain, txHash, explorerUrl) {
    try {
      const rpcUrl = RPC_ENDPOINTS[chain] || RPC_ENDPOINTS.ethereum
      
      const maxAttempts = 60
      for (let i = 0; i < maxAttempts; i++) {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          }),
        })
        
        const data = await response.json()
        
        if (data.result) {
          const success = data.result.status === '0x1'
          return {
            success,
            txHash,
            explorerUrl,
            status: 'confirmed',
            error: success ? undefined : 'Transaction reverted',
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      return {
        success: false,
        txHash,
        explorerUrl,
        status: 'pending',
        error: 'Transaction confirmation timeout',
      }
    } catch (err) {
      return {
        success: false,
        txHash,
        explorerUrl,
        status: 'failed',
        error: err.message || 'Failed to track transaction',
      }
    }
  }
}

export const dexSwapService = new DexSwapService()
export default dexSwapService
