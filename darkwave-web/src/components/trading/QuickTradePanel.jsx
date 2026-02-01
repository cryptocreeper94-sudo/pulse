import { useState, useCallback, useEffect } from 'react'
import { useSolanaWallet } from '../../hooks/useSolanaWallet'
import { useEthereumWallet } from '../../hooks/useEthereumWallet'
import { dexSwapService } from '../../services/dexSwapService'
import './QuickTradePanel.css'

const CHAINS = [
  { id: 'solana', name: 'Solana', icon: '◎', color: '#9945FF', native: 'SOL' },
  { id: 'ethereum', name: 'Ethereum', icon: 'Ξ', color: '#627EEA', native: 'ETH' },
  { id: 'base', name: 'Base', icon: '🔵', color: '#0052FF', native: 'ETH', chainId: 8453 },
  { id: 'polygon', name: 'Polygon', icon: '⬡', color: '#8247E5', native: 'MATIC', chainId: 137 },
  { id: 'bsc', name: 'BNB Chain', icon: '🔶', color: '#F3BA2F', native: 'BNB', chainId: 56 },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: '#28A0F0', native: 'ETH', chainId: 42161 },
  { id: 'optimism', name: 'Optimism', icon: '🔴', color: '#FF0420', native: 'ETH', chainId: 10 },
  { id: 'avalanche', name: 'Avalanche', icon: '🔺', color: '#E84142', native: 'AVAX', chainId: 43114 },
]

const SOLANA_DEXES = [
  { name: 'Jupiter', url: (token) => `https://jup.ag/swap/SOL-${token}`, primary: true },
  { name: 'Raydium', url: (token) => `https://raydium.io/swap/?inputMint=sol&outputMint=${token}` },
  { name: 'Orca', url: (token) => `https://www.orca.so/swap?inputMint=sol&outputMint=${token}` },
]

const EVM_DEXES = {
  ethereum: [
    { name: '1inch', url: (token) => `https://app.1inch.io/#/1/simple/swap/ETH/${token}`, primary: true },
    { name: 'Uniswap', url: (token) => `https://app.uniswap.org/swap?outputCurrency=${token}` },
  ],
  base: [
    { name: '1inch', url: (token) => `https://app.1inch.io/#/8453/simple/swap/ETH/${token}`, primary: true },
    { name: 'Uniswap', url: (token) => `https://app.uniswap.org/swap?chain=base&outputCurrency=${token}` },
  ],
  polygon: [
    { name: '1inch', url: (token) => `https://app.1inch.io/#/137/simple/swap/MATIC/${token}`, primary: true },
    { name: 'QuickSwap', url: (token) => `https://quickswap.exchange/#/swap?outputCurrency=${token}` },
  ],
  bsc: [
    { name: '1inch', url: (token) => `https://app.1inch.io/#/56/simple/swap/BNB/${token}`, primary: true },
    { name: 'PancakeSwap', url: (token) => `https://pancakeswap.finance/swap?outputCurrency=${token}` },
  ],
  arbitrum: [
    { name: '1inch', url: (token) => `https://app.1inch.io/#/42161/simple/swap/ETH/${token}`, primary: true },
  ],
  optimism: [
    { name: '1inch', url: (token) => `https://app.1inch.io/#/10/simple/swap/ETH/${token}`, primary: true },
  ],
  avalanche: [
    { name: '1inch', url: (token) => `https://app.1inch.io/#/43114/simple/swap/AVAX/${token}`, primary: true },
    { name: 'TraderJoe', url: (token) => `https://traderjoexyz.com/avalanche/trade?outputCurrency=${token}` },
  ],
}

const PRESET_AMOUNTS = ['0.1', '0.25', '0.5', '1']

function isSolanaAddress(address) {
  return !address.startsWith('0x') && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

function isEvmAddress(address) {
  return address.startsWith('0x') && address.length === 42
}

export function QuickTradePanel({ tokenAddress, tokenSymbol, tokenName, recommendation = 'watch', onClose, onTradeComplete }) {
  const tokenIsSolana = isSolanaAddress(tokenAddress)
  const tokenIsEvm = isEvmAddress(tokenAddress)
  
  const availableChains = tokenIsSolana 
    ? CHAINS.filter(c => c.id === 'solana')
    : tokenIsEvm 
      ? CHAINS.filter(c => c.id !== 'solana')
      : CHAINS

  const [selectedChain, setSelectedChain] = useState(tokenIsSolana ? 'solana' : 'ethereum')
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false)
  const [amount, setAmount] = useState('0.1')
  const [customAmount, setCustomAmount] = useState('')
  const [isSwapping, setIsSwapping] = useState(false)
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [error, setError] = useState(null)
  const [txResult, setTxResult] = useState(null)

  const solanaWallet = useSolanaWallet()
  const ethereumWallet = useEthereumWallet()

  const currentChainInfo = CHAINS.find(c => c.id === selectedChain)
  const isSolana = selectedChain === 'solana'
  const wallet = isSolana ? solanaWallet.wallet : ethereumWallet.wallet
  const isConnected = isSolana ? !!solanaWallet.wallet : !!ethereumWallet.wallet
  const balance = isSolana 
    ? solanaWallet.balances?.[0]?.amount || '0'
    : ethereumWallet.balances?.[0]?.amount || '0'

  const connectWallet = useCallback(async () => {
    setError(null)
    try {
      if (isSolana) {
        await solanaWallet.connectPhantom()
      } else {
        await ethereumWallet.connectMetaMask()
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet')
    }
  }, [isSolana, solanaWallet, ethereumWallet])

  const getQuote = useCallback(async () => {
    if (!wallet) return
    setQuoteLoading(true)
    setError(null)
    try {
      const inputAmount = customAmount || amount
      const nativeToken = currentChainInfo.native

      const q = await dexSwapService.getQuote({
        chain: selectedChain,
        inputToken: nativeToken,
        outputToken: tokenAddress,
        amount: inputAmount,
        slippage: 1,
        userAddress: isSolana ? solanaWallet.wallet.publicKey : ethereumWallet.wallet.address,
      })
      setQuote(q)
    } catch (err) {
      setError(err.message || 'Failed to get quote')
    } finally {
      setQuoteLoading(false)
    }
  }, [wallet, amount, customAmount, selectedChain, tokenAddress, isSolana, currentChainInfo, solanaWallet.wallet, ethereumWallet.wallet])

  const executeSwap = useCallback(async () => {
    if (!quote || !wallet) return
    setIsSwapping(true)
    setError(null)
    try {
      const userAddress = isSolana ? solanaWallet.wallet.publicKey : ethereumWallet.wallet.address
      const swapTx = await dexSwapService.buildSwapTransaction(quote, userAddress)

      let signature
      if (isSolana) {
        const signedTx = await solanaWallet.signTransaction({ rawTransaction: swapTx.transaction })
        signature = signedTx.signature || ''
      } else {
        const txData = swapTx.transaction
        const signedTx = await ethereumWallet.signTransaction({
          to: txData.to,
          data: txData.data,
          value: txData.value || '0',
          gasLimit: txData.gasLimit,
        })
        signature = signedTx.hash || signedTx.signedRaw || ''
      }

      const result = await dexSwapService.trackTransaction(selectedChain, signature)
      setTxResult(result)
      
      if (result.success && onTradeComplete) {
        onTradeComplete(result)
      }
    } catch (err) {
      setError(err.message || 'Swap failed')
    } finally {
      setIsSwapping(false)
    }
  }, [quote, wallet, isSolana, selectedChain, solanaWallet, ethereumWallet, onTradeComplete])

  const dexes = isSolana ? SOLANA_DEXES : (EVM_DEXES[selectedChain] || [])

  useEffect(() => {
    if (ethereumWallet.wallet && !isSolana && currentChainInfo?.chainId) {
      if (ethereumWallet.wallet.chainId !== currentChainInfo.chainId) {
        ethereumWallet.switchNetwork(currentChainInfo.chainId).catch(() => {})
      }
    }
  }, [selectedChain, ethereumWallet, isSolana, currentChainInfo])

  return (
    <div className="quick-trade-panel">
      <div className="qtp-header">
        <div className="qtp-token-info">
          <div className="qtp-chain-icon" style={{ background: currentChainInfo?.color }}>
            {currentChainInfo?.icon}
          </div>
          <div>
            <h3 className="qtp-title">Trade ${tokenSymbol}</h3>
            <p className="qtp-subtitle">{tokenName || tokenAddress.slice(0, 8)}...</p>
          </div>
        </div>
        {onClose && (
          <button className="qtp-close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      {availableChains.length > 1 && (
        <div className="qtp-chain-selector">
          <button 
            className="qtp-chain-button"
            onClick={() => setChainDropdownOpen(!chainDropdownOpen)}
          >
            <span className="qtp-chain-selected">
              <span>{currentChainInfo?.icon}</span>
              <span>{currentChainInfo?.name}</span>
            </span>
            <span className={`qtp-chevron ${chainDropdownOpen ? 'open' : ''}`}>▼</span>
          </button>
          {chainDropdownOpen && (
            <div className="qtp-chain-dropdown">
              {availableChains.map((chain) => (
                <button
                  key={chain.id}
                  className={`qtp-chain-option ${selectedChain === chain.id ? 'active' : ''}`}
                  onClick={() => { setSelectedChain(chain.id); setChainDropdownOpen(false); setQuote(null); }}
                >
                  <span>{chain.icon}</span>
                  <span>{chain.name}</span>
                  {selectedChain === chain.id && <span className="qtp-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {availableChains.length === 1 && (
        <div className="qtp-chain-info">
          <span>{currentChainInfo?.icon}</span>
          <span>{currentChainInfo?.name}</span>
          <span className="qtp-chain-type">{tokenIsSolana ? 'Solana token' : 'EVM token'}</span>
        </div>
      )}

      {!isConnected ? (
        <button className="qtp-connect-btn" onClick={connectWallet} style={{ background: currentChainInfo?.color }}>
          🔗 Connect {isSolana ? 'Phantom' : 'MetaMask'}
        </button>
      ) : (
        <>
          <div className="qtp-balance-row">
            <div>
              <p className="qtp-label">Your Balance</p>
              <p className="qtp-balance">{parseFloat(balance).toFixed(4)} {currentChainInfo?.native}</p>
            </div>
            <div className="qtp-connected">
              <span className="qtp-dot"></span>
              <span className="qtp-address">
                {(isSolana ? solanaWallet.wallet?.publicKey : ethereumWallet.wallet?.address)?.slice(0, 6)}...
              </span>
            </div>
          </div>

          <div className="qtp-amount-section">
            <p className="qtp-label">Amount ({currentChainInfo?.native})</p>
            <div className="qtp-preset-grid">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  className={`qtp-preset ${amount === preset && !customAmount ? 'active' : ''}`}
                  onClick={() => { setAmount(preset); setCustomAmount(''); setQuote(null); }}
                  style={amount === preset && !customAmount ? { background: currentChainInfo?.color } : {}}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Custom amount..."
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setQuote(null); }}
              className="qtp-custom-input"
            />
          </div>

          <button 
            className="qtp-quote-btn" 
            onClick={getQuote} 
            disabled={quoteLoading}
          >
            {quoteLoading ? '⏳ Getting Quote...' : '🔄 Get Quote'}
          </button>

          {quote && (
            <div className="qtp-quote-box">
              <div className="qtp-quote-header">
                <span>You'll receive (est.)</span>
                <span className="qtp-impact">{quote.priceImpact}% impact</span>
              </div>
              <div className="qtp-quote-amount">
                <span className="qtp-output">{parseFloat(quote.outputAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span className="qtp-symbol">${tokenSymbol}</span>
              </div>
              <p className="qtp-min">Min: {parseFloat(quote.outputAmountMin).toLocaleString()} (with slippage)</p>
              
              <button 
                className={`qtp-execute-btn ${recommendation}`}
                onClick={executeSwap}
                disabled={isSwapping}
              >
                {isSwapping ? '⏳ Swapping...' : '⚡ Execute Swap'}
              </button>
            </div>
          )}

          {txResult && (
            <div className={`qtp-result ${txResult.success ? 'success' : 'failed'}`}>
              <span>{txResult.success ? '✅' : '❌'}</span>
              <span>{txResult.success ? 'Swap Successful!' : 'Swap Failed'}</span>
              {txResult.txHash && (
                <a href={txResult.explorerUrl} target="_blank" rel="noopener noreferrer" className="qtp-explorer-link">
                  View on Explorer ↗
                </a>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="qtp-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="qtp-dex-links">
        <p className="qtp-label">Or trade on:</p>
        <div className="qtp-dex-grid">
          {dexes.map((dex) => (
            <a
              key={dex.name}
              href={dex.url(tokenAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className={`qtp-dex-link ${dex.primary ? 'primary' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {dex.name} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickTradePanel
