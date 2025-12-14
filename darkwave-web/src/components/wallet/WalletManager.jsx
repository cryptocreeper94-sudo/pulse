import { useState, useEffect, useCallback, useMemo } from 'react'
import InfoTooltip from '../ui/InfoTooltip'
import { useBuiltInWallet } from '../../context/BuiltInWalletContext'
import DustBuster from './DustBuster'
import clientWalletService from '../../services/clientWalletService'

function BentoTile({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={`wallet-bento-tile ${className}`}
      onClick={onClick}
      style={{
        background: '#0f0f0f',
        border: '1px solid #222',
        borderRadius: 12,
        padding: 16,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#333'
        e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#222'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </div>
  )
}

function TileLabel({ children, color = '#555' }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      color,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

const CHAIN_CATEGORIES = {
  major: {
    label: 'Major Networks',
    chains: ['solana', 'ethereum', 'polygon', 'base', 'bsc']
  },
  layer2: {
    label: 'Layer 2',
    chains: ['arbitrum', 'optimism', 'zksync', 'linea', 'scroll', 'mantle']
  },
  other: {
    label: 'Other Networks',
    chains: ['avalanche', 'fantom', 'cronos', 'gnosis', 'celo', 'moonbeam', 'moonriver', 'harmony', 'metis', 'aurora', 'kava', 'evmos']
  }
}

const WALLET_TIPS = [
  "Your portfolio is looking great!",
  "Ready to make moves?",
  "Stay vigilant, stay profitable!",
  "DeFi awaits your next play.",
  "Diversification is key!",
  "HODL strong, trade smart.",
  "The market never sleeps!",
]

const WALLET_DEFINITIONS = {
  mnemonic: {
    term: 'Recovery Phrase',
    definition: 'A 12 or 24 word phrase that backs up your wallet. Anyone with these words can access your funds. Never share it!',
  },
  privateKey: {
    term: 'Private Key',
    definition: 'A secret code that proves ownership of your wallet. Keep it safe and never share it with anyone.',
  },
  gasEstimate: {
    term: 'Gas Fee',
    definition: 'A small fee paid to process your transaction on the blockchain. Varies by network congestion.',
  },
  hdWallet: {
    term: 'HD Wallet',
    definition: 'One recovery phrase creates addresses on multiple blockchains. All your crypto in one place.',
  },
}

const CHAIN_INFO = {
  solana: { name: 'Solana', symbol: 'SOL', color: '#9945FF', gradient: 'linear-gradient(135deg, #9945FF, #14F195)', icon: '◎' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', gradient: 'linear-gradient(135deg, #627EEA, #454A75)', icon: 'Ξ' },
  polygon: { name: 'Polygon', symbol: 'MATIC', color: '#8247E5', gradient: 'linear-gradient(135deg, #8247E5, #A46EFF)', icon: '⬡' },
  base: { name: 'Base', symbol: 'ETH', color: '#0052FF', gradient: 'linear-gradient(135deg, #0052FF, #3B7AFF)', icon: '⬡' },
  arbitrum: { name: 'Arbitrum', symbol: 'ETH', color: '#28A0F0', gradient: 'linear-gradient(135deg, #28A0F0, #1B6CB0)', icon: '⬡' },
  bsc: { name: 'BSC', symbol: 'BNB', color: '#F3BA2F', gradient: 'linear-gradient(135deg, #F3BA2F, #E8A914)', icon: '⬡' },
  avalanche: { name: 'Avalanche', symbol: 'AVAX', color: '#E84142', gradient: 'linear-gradient(135deg, #E84142, #C73032)', icon: '⬡' },
  fantom: { name: 'Fantom', symbol: 'FTM', color: '#1969FF', gradient: 'linear-gradient(135deg, #1969FF, #0D4FC5)', icon: '⬡' },
  optimism: { name: 'Optimism', symbol: 'ETH', color: '#FF0420', gradient: 'linear-gradient(135deg, #FF0420, #CC031A)', icon: '⬡' },
  cronos: { name: 'Cronos', symbol: 'CRO', color: '#002D74', gradient: 'linear-gradient(135deg, #002D74, #001A45)', icon: '⬡' },
  gnosis: { name: 'Gnosis', symbol: 'xDAI', color: '#04795B', gradient: 'linear-gradient(135deg, #04795B, #035F47)', icon: '⬡' },
  celo: { name: 'Celo', symbol: 'CELO', color: '#35D07F', gradient: 'linear-gradient(135deg, #35D07F, #28A865)', icon: '⬡' },
  moonbeam: { name: 'Moonbeam', symbol: 'GLMR', color: '#53CBC8', gradient: 'linear-gradient(135deg, #53CBC8, #3FA3A1)', icon: '⬡' },
  moonriver: { name: 'Moonriver', symbol: 'MOVR', color: '#F2B705', gradient: 'linear-gradient(135deg, #F2B705, #C99504)', icon: '⬡' },
  harmony: { name: 'Harmony', symbol: 'ONE', color: '#00AEE9', gradient: 'linear-gradient(135deg, #00AEE9, #0090C1)', icon: '⬡' },
  metis: { name: 'Metis', symbol: 'METIS', color: '#00D2FF', gradient: 'linear-gradient(135deg, #00D2FF, #00A8CC)', icon: '⬡' },
  aurora: { name: 'Aurora', symbol: 'ETH', color: '#70D44B', gradient: 'linear-gradient(135deg, #70D44B, #59B03C)', icon: '⬡' },
  zksync: { name: 'zkSync', symbol: 'ETH', color: '#4E529A', gradient: 'linear-gradient(135deg, #4E529A, #3D417A)', icon: '⬡' },
  linea: { name: 'Linea', symbol: 'ETH', color: '#121212', gradient: 'linear-gradient(135deg, #61DFFF, #4BB8D6)', icon: '⬡' },
  scroll: { name: 'Scroll', symbol: 'ETH', color: '#FFEEDA', gradient: 'linear-gradient(135deg, #FFEEDA, #E8D4C0)', icon: '⬡' },
  mantle: { name: 'Mantle', symbol: 'MNT', color: '#000000', gradient: 'linear-gradient(135deg, #65B3AE, #4E908C)', icon: '⬡' },
  kava: { name: 'Kava', symbol: 'KAVA', color: '#FF564F', gradient: 'linear-gradient(135deg, #FF564F, #E84842)', icon: '⬡' },
  evmos: { name: 'Evmos', symbol: 'EVMOS', color: '#ED4E33', gradient: 'linear-gradient(135deg, #ED4E33, #C94229)', icon: '⬡' },
}

export default function WalletManager({ userId }) {
  const builtInWallet = useBuiltInWallet()
  
  const [view, setView] = useState('landing')
  const [mnemonic, setMnemonic] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [importPhrase, setImportPhrase] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [unlockPassword, setUnlockPassword] = useState('')
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [walletName, setWalletName] = useState('')
  
  const [sendChain, setSendChain] = useState('solana')
  const [sendTo, setSendTo] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendPassword, setSendPassword] = useState('')
  const [gasEstimate, setGasEstimate] = useState(null)
  const [showSendPanel, setShowSendPanel] = useState(false)
  const [activeChain, setActiveChain] = useState(null)
  const [showDustBuster, setShowDustBuster] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState('major')
  
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [recoveryMnemonic, setRecoveryMnemonic] = useState('')
  const [showRecoveryWords, setShowRecoveryWords] = useState(false)
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [buyNetwork, setBuyNetwork] = useState('solana')
  const [buyCurrency, setBuyCurrency] = useState('sol')
  const [buyAmount, setBuyAmount] = useState('')
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyError, setBuyError] = useState('')
  const [onrampSession, setOnrampSession] = useState(null)
  
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapTokens, setSwapTokens] = useState([])
  const [swapFromToken, setSwapFromToken] = useState({ address: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', decimals: 9, logoURI: null })
  const [swapToToken, setSwapToToken] = useState(null)
  const [swapAmount, setSwapAmount] = useState('')
  const [swapSlippage, setSwapSlippage] = useState('50')
  const [swapQuote, setSwapQuote] = useState(null)
  const [swapLoading, setSwapLoading] = useState(false)
  const [swapExecuting, setSwapExecuting] = useState(false)
  const [swapPassword, setSwapPassword] = useState('')
  const [swapError, setSwapError] = useState('')
  const [swapSuccess, setSwapSuccess] = useState('')
  const [swapFromSearch, setSwapFromSearch] = useState('')
  const [swapToSearch, setSwapToSearch] = useState('')
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  
  useEffect(() => {
    if (builtInWallet.hasWallet) {
      if (builtInWallet.isUnlocked) {
        setView('main')
      } else {
        setView('unlock')
      }
    }
  }, [builtInWallet.hasWallet, builtInWallet.isUnlocked])
  
  const clearMessages = () => {
    setError('')
    setSuccess('')
  }
  
  const handleCreateWallet = async () => {
    clearMessages()
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    try {
      const name = walletName.trim() || `Wallet ${builtInWallet.wallets.length + 1}`
      const newMnemonic = await builtInWallet.createWallet(password, name, 12)
      setMnemonic(newMnemonic)
      setShowMnemonic(true)
      setView('backup')
      setWalletName('')
      setSuccess('Wallet created! Save your recovery phrase now.')
    } catch (err) {
      setError(err.message)
    }
  }
  
  const handleImportWallet = async () => {
    clearMessages()
    if (!importPhrase.trim()) {
      setError('Please enter your recovery phrase')
      return
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    try {
      const name = walletName.trim() || `Imported Wallet ${builtInWallet.wallets.length + 1}`
      await builtInWallet.importWallet(importPhrase.trim(), password, name)
      setView('main')
      setWalletName('')
      setSuccess('Wallet imported successfully!')
    } catch (err) {
      setError(err.message)
    }
  }
  
  const handleUnlockWallet = async () => {
    clearMessages()
    try {
      await builtInWallet.unlock(unlockPassword)
      setView('main')
    } catch (err) {
      setError(err.message || 'Invalid password')
    }
  }
  
  const estimateGas = async () => {
    if (!sendTo || !sendAmount || !builtInWallet.addresses) return
    
    const address = builtInWallet.addresses[sendChain]
    if (!address) return
    
    try {
      const res = await fetch('/api/wallet/estimate-gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chain: sendChain,
          from: address,
          to: sendTo,
          amount: sendAmount,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setGasEstimate(data)
      }
    } catch (err) {
      console.error('Gas estimate error:', err)
    }
  }
  
  useEffect(() => {
    if (sendTo && sendAmount && parseFloat(sendAmount) > 0) {
      const timer = setTimeout(estimateGas, 500)
      return () => clearTimeout(timer)
    }
  }, [sendTo, sendAmount, sendChain])
  
  const handleSendTransaction = async () => {
    clearMessages()
    if (!sendTo || !sendAmount || !sendPassword) {
      setError('Please fill in all fields including password')
      return
    }
    
    try {
      const result = await builtInWallet.signAndSend(sendPassword, sendChain, sendTo, sendAmount)
      if (!result.success) throw new Error(result.error)
      
      setSuccess(`Transaction sent! Hash: ${result.txHash?.slice(0, 20)}...`)
      setSendTo('')
      setSendAmount('')
      setSendPassword('')
      setGasEstimate(null)
      setShowSendPanel(false)
    } catch (err) {
      setError(err.message)
    }
  }
  
  const handleLockWallet = () => {
    builtInWallet.lock()
    setUnlockPassword('')
    setView('unlock')
  }
  
  const handleDeleteWallet = () => {
    if (confirm('Are you sure? This will remove your wallet from this device. Make sure you have your recovery phrase saved!')) {
      if (builtInWallet.activeWalletId) {
        builtInWallet.deleteWallet(builtInWallet.activeWalletId)
      }
      if (!builtInWallet.hasWallet) {
        setView('landing')
      }
    }
  }
  
  const handleViewRecoveryPhrase = async () => {
    clearMessages()
    if (!recoveryPassword) {
      setError('Please enter your password')
      return
    }
    
    setRecoveryLoading(true)
    try {
      const result = await clientWalletService.unlock(recoveryPassword, builtInWallet.activeWalletId)
      setRecoveryMnemonic(result.mnemonic)
      setShowRecoveryWords(false)
      setError('')
    } catch (err) {
      setError('Invalid password. Please try again.')
    } finally {
      setRecoveryLoading(false)
    }
  }
  
  const closeRecoveryModal = () => {
    setShowRecoveryModal(false)
    setRecoveryPassword('')
    setRecoveryMnemonic('')
    setShowRecoveryWords(false)
    setError('')
  }
  
  const handleBuyCrypto = async () => {
    setBuyLoading(true)
    setBuyError('')
    
    try {
      const walletAddress = buyNetwork === 'solana' 
        ? builtInWallet.addresses?.solana 
        : builtInWallet.addresses?.ethereum
      
      if (!walletAddress) {
        setBuyError('Wallet address not available')
        return
      }
      
      const res = await fetch('/api/crypto/onramp/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          network: buyNetwork,
          currency: buyCurrency,
          amount: buyAmount ? parseFloat(buyAmount) : undefined,
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        if (data.needsSetup) {
          setBuyError('Stripe Crypto Onramp is not enabled. To enable it, visit your Stripe Dashboard and apply for access to the Crypto Onramp feature.')
        } else {
          setBuyError(data.error || 'Failed to create onramp session')
        }
        return
      }
      
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank')
        closeBuyModal()
      } else if (data.clientSecret) {
        setOnrampSession(data)
      }
    } catch (err) {
      setBuyError(err.message || 'Failed to connect to onramp service')
    } finally {
      setBuyLoading(false)
    }
  }
  
  const closeBuyModal = () => {
    setShowBuyModal(false)
    setBuyNetwork('solana')
    setBuyCurrency('sol')
    setBuyAmount('')
    setBuyError('')
    setBuyLoading(false)
    setOnrampSession(null)
  }
  
  const fetchSwapTokens = async () => {
    try {
      const res = await fetch('/api/swap/tokens')
      const data = await res.json()
      if (data.success && data.tokens) {
        setSwapTokens(data.tokens)
      }
    } catch (err) {
      console.error('Failed to fetch swap tokens:', err)
    }
  }
  
  const fetchSwapQuote = async () => {
    if (!swapFromToken || !swapToToken || !swapAmount || parseFloat(swapAmount) <= 0) {
      setSwapQuote(null)
      return
    }
    
    setSwapLoading(true)
    setSwapError('')
    
    try {
      const amountInBaseUnits = Math.floor(parseFloat(swapAmount) * Math.pow(10, swapFromToken.decimals)).toString()
      
      const params = new URLSearchParams({
        inputMint: swapFromToken.address,
        outputMint: swapToToken.address,
        amount: amountInBaseUnits,
        slippageBps: swapSlippage
      })
      
      const res = await fetch(`/api/swap/quote?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setSwapQuote(data)
      } else {
        setSwapError(data.error || 'Failed to get quote')
        setSwapQuote(null)
      }
    } catch (err) {
      setSwapError(err.message || 'Failed to get quote')
      setSwapQuote(null)
    } finally {
      setSwapLoading(false)
    }
  }
  
  const handleSwapExecute = async () => {
    if (!swapQuote || !swapPassword) {
      setSwapError('Please enter your password')
      return
    }
    
    if (!swapQuote?.quoteResponse) {
      setSwapError('Quote data is missing. Please get a new quote.')
      return
    }
    
    if (!builtInWallet?.addresses?.solana) {
      setSwapError('Wallet not ready. Please unlock your wallet first.')
      return
    }
    
    setSwapExecuting(true)
    setSwapError('')
    setSwapSuccess('')
    
    try {
      const prepareRes = await fetch('/api/swap/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: swapQuote.quoteResponse,
          userPublicKey: builtInWallet.addresses.solana
        })
      })
      
      const prepareData = await prepareRes.json()
      
      if (!prepareData.success) {
        throw new Error(prepareData.error || 'Failed to prepare swap')
      }
      
      const signedTransaction = await clientWalletService.signSolanaTransaction(
        swapPassword,
        prepareData.swapTransaction,
        builtInWallet.activeWalletId
      )
      
      const broadcastRes = await fetch('/api/swap/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedTransaction })
      })
      
      const broadcastData = await broadcastRes.json()
      
      if (broadcastData.success) {
        setSwapSuccess(`Swap successful! View on explorer: ${broadcastData.explorerUrl}`)
        setSwapQuote(null)
        setSwapAmount('')
        setSwapPassword('')
      } else {
        throw new Error(broadcastData.error || 'Failed to broadcast transaction')
      }
    } catch (err) {
      setSwapError(err.message || 'Swap failed')
    } finally {
      setSwapExecuting(false)
    }
  }
  
  const closeSwapModal = () => {
    setShowSwapModal(false)
    setSwapTokens([])
    setSwapFromToken({ address: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', decimals: 9, logoURI: null })
    setSwapToToken(null)
    setSwapAmount('')
    setSwapSlippage('50')
    setSwapQuote(null)
    setSwapLoading(false)
    setSwapExecuting(false)
    setSwapPassword('')
    setSwapError('')
    setSwapSuccess('')
    setSwapFromSearch('')
    setSwapToSearch('')
    setShowFromDropdown(false)
    setShowToDropdown(false)
  }
  
  useEffect(() => {
    if (swapFromToken && swapToToken && swapAmount && parseFloat(swapAmount) > 0) {
      const timer = setTimeout(fetchSwapQuote, 500)
      return () => clearTimeout(timer)
    }
  }, [swapFromToken, swapToToken, swapAmount, swapSlippage])
  
  const copyAddress = (address) => {
    navigator.clipboard.writeText(address)
    setSuccess('Address copied!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const openSendPanel = (chainKey) => {
    setSendChain(chainKey)
    setShowSendPanel(true)
  }
  
  const renderLanding = () => (
    <div className="wallet-landing-v2">
      <div className="wallet-hero">
        <div className="wallet-hero-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="walletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D4FF" />
                <stop offset="100%" stopColor="#0099FF" />
              </linearGradient>
            </defs>
            <rect x="2" y="6" width="20" height="14" rx="3" stroke="url(#walletGrad)" strokeWidth="2"/>
            <path d="M22 10h-4a2 2 0 100 4h4" stroke="url(#walletGrad)" strokeWidth="2"/>
            <circle cx="18" cy="12" r="1.5" fill="#00D4FF"/>
          </svg>
        </div>
        <h1>Multi-Chain Wallet</h1>
        <p>
          One seed phrase. All your crypto.
          <InfoTooltip definition={WALLET_DEFINITIONS.hdWallet} />
        </p>
      </div>
      
      <div className="wallet-chains-showcase">
        {Object.entries(CHAIN_INFO).map(([key, chain], i) => (
          <div 
            key={key} 
            className="wallet-chain-card"
            style={{ 
              '--chain-color': chain.color,
              '--chain-gradient': chain.gradient,
              animationDelay: `${i * 0.1}s`
            }}
          >
            <span className="chain-icon">{chain.icon}</span>
            <span className="chain-name">{chain.name}</span>
          </div>
        ))}
      </div>

      <div className="wallet-features">
        <div className="wallet-feature">
          <span className="feature-icon">🔐</span>
          <span>Client-side encryption</span>
        </div>
        <div className="wallet-feature">
          <span className="feature-icon">⚡</span>
          <span>Instant transactions</span>
        </div>
        <div className="wallet-feature">
          <span className="feature-icon">🛡️</span>
          <span>Non-custodial</span>
        </div>
      </div>
      
      <div className="wallet-cta-group">
        <button className="wallet-cta primary" onClick={() => setView('create')}>
          <span className="cta-icon">+</span>
          Create New Wallet
        </button>
        <button className="wallet-cta secondary" onClick={() => setView('import')}>
          <span className="cta-icon">↓</span>
          Import Existing
        </button>
      </div>
    </div>
  )
  
  const renderCreate = () => (
    <div className="wallet-form-v2">
      <button className="wallet-back-btn" onClick={() => { setView('landing'); clearMessages(); }}>
        ← Back
      </button>
      <div className="form-header">
        <div className="form-icon create">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
        </div>
        <h2>Create Your Wallet</h2>
        <p>Set a strong password to protect your wallet</p>
      </div>
      
      <div className="form-fields">
        <div className="form-field">
          <label>Wallet Name (optional)</label>
          <input
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            placeholder="My Trading Wallet"
          />
          <span className="field-hint">Give your wallet a memorable name</span>
        </div>
        
        <div className="form-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
          <span className="field-hint">Used to encrypt your wallet locally</span>
        </div>
        
        <div className="form-field">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
          />
        </div>
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button 
        className="wallet-cta primary full-width" 
        onClick={handleCreateWallet} 
        disabled={builtInWallet.loading}
      >
        {builtInWallet.loading ? 'Creating...' : 'Create Wallet'}
      </button>
    </div>
  )
  
  const renderBackup = () => (
    <div className="wallet-form-v2">
      <div className="form-header warning">
        <div className="form-icon warning">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h2>Save Your Recovery Phrase</h2>
        <p className="warning-text">
          Write these words down in order. This is the ONLY way to recover your wallet!
          <InfoTooltip definition={WALLET_DEFINITIONS.mnemonic} />
        </p>
      </div>
      
      <div className="mnemonic-grid">
        {mnemonic?.split(' ').map((word, i) => (
          <div key={i} className="mnemonic-word">
            <span className="word-num">{i + 1}</span>
            <span className="word-text">{showMnemonic ? word : '•••••'}</span>
          </div>
        ))}
      </div>
      
      <button 
        className="wallet-cta secondary full-width" 
        onClick={() => setShowMnemonic(!showMnemonic)}
      >
        {showMnemonic ? '🙈 Hide Words' : '👁️ Reveal Words'}
      </button>
      
      {success && <div className="form-success">{success}</div>}
      
      <button 
        className="wallet-cta primary full-width" 
        onClick={() => { setMnemonic(''); setView('main'); }}
      >
        I've Saved My Phrase ✓
      </button>
    </div>
  )
  
  const renderImport = () => (
    <div className="wallet-form-v2">
      <button className="wallet-back-btn" onClick={() => { setView('landing'); clearMessages(); }}>
        ← Back
      </button>
      <div className="form-header">
        <div className="form-icon import">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <h2>Import Wallet</h2>
        <p>Enter your 12 or 24 word recovery phrase</p>
      </div>
      
      <div className="form-fields">
        <div className="form-field">
          <label>
            Recovery Phrase
            <InfoTooltip definition={WALLET_DEFINITIONS.mnemonic} />
          </label>
          <textarea
            value={importPhrase}
            onChange={(e) => setImportPhrase(e.target.value)}
            placeholder="word1 word2 word3 ..."
            rows={3}
          />
        </div>
        
        <div className="form-field">
          <label>Wallet Name (optional)</label>
          <input
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            placeholder="Imported Wallet"
          />
        </div>
        
        <div className="form-field">
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>
        
        <div className="form-field">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
          />
        </div>
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button 
        className="wallet-cta primary full-width" 
        onClick={handleImportWallet} 
        disabled={builtInWallet.loading}
      >
        {builtInWallet.loading ? 'Importing...' : 'Import Wallet'}
      </button>
    </div>
  )
  
  const renderUnlock = () => (
    <div className="wallet-form-v2 unlock">
      <div className="unlock-icon">
        <div className="lock-glow"></div>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <h2>Welcome Back</h2>
      <p>Enter your password to unlock</p>
      
      <div className="form-field single">
        <input
          type="password"
          value={unlockPassword}
          onChange={(e) => setUnlockPassword(e.target.value)}
          placeholder="Enter password"
          onKeyDown={(e) => e.key === 'Enter' && handleUnlockWallet()}
          autoFocus
        />
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button 
        className="wallet-cta primary full-width" 
        onClick={handleUnlockWallet} 
        disabled={builtInWallet.loading}
      >
        {builtInWallet.loading ? 'Unlocking...' : 'Unlock Wallet'}
      </button>
      
      <button className="wallet-link" onClick={handleDeleteWallet}>
        Remove wallet from this device
      </button>
    </div>
  )
  
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const [editingWalletId, setEditingWalletId] = useState(null)
  const [newWalletName, setNewWalletName] = useState('')
  const [switchingWalletId, setSwitchingWalletId] = useState(null)
  const [switchPassword, setSwitchPassword] = useState('')
  
  const handleSwitchWallet = async () => {
    if (!switchingWalletId || !switchPassword) return
    try {
      await builtInWallet.switchWallet(switchingWalletId, switchPassword)
      setSwitchingWalletId(null)
      setSwitchPassword('')
      setSuccess('Wallet switched!')
    } catch (err) {
      setError(err.message || 'Failed to switch wallet')
    }
  }
  
  const handleRenameWallet = (walletId) => {
    if (!newWalletName.trim()) return
    builtInWallet.renameWallet(walletId, newWalletName.trim())
    setEditingWalletId(null)
    setNewWalletName('')
    setSuccess('Wallet renamed!')
  }
  
  const handleDeleteSpecificWallet = (walletId) => {
    const wallet = builtInWallet.wallets.find(w => w.id === walletId)
    if (confirm(`Delete wallet "${wallet?.name}"? Make sure you have your recovery phrase saved!`)) {
      builtInWallet.deleteWallet(walletId)
      setShowWalletMenu(false)
    }
  }
  
  const activeWallet = builtInWallet.wallets.find(w => w.id === builtInWallet.activeWalletId)
  
  const currentTip = useMemo(() => WALLET_TIPS[Math.floor(Math.random() * WALLET_TIPS.length)], [])
  
  const chainSlides = useMemo(() => {
    if (!builtInWallet.addresses) return []
    const entries = Object.entries(builtInWallet.addresses).filter(([k]) => CHAIN_INFO[k])
    const slides = []
    for (let i = 0; i < entries.length; i += 2) {
      slides.push(entries.slice(i, i + 2))
    }
    return slides
  }, [builtInWallet.addresses])
  
  const renderChainCard = (chainKey, address) => {
    const chain = CHAIN_INFO[chainKey]
    if (!chain) return null
    const balance = builtInWallet.balances[chainKey]
    const isExpanded = activeChain === chainKey
    
    return (
      <div 
        key={chainKey}
        className={`chain-card-premium ${isExpanded ? 'expanded' : ''}`}
        style={{ '--chain-color': chain.color, '--chain-gradient': chain.gradient }}
        onClick={() => setActiveChain(isExpanded ? null : chainKey)}
      >
        <div className="chain-card-shimmer"></div>
        <div className="chain-card-content">
          <div className="chain-card-icon">{chain.icon}</div>
          <div className="chain-card-info">
            <span className="chain-card-name">{chain.name}</span>
            <span className="chain-card-symbol">{chain.symbol}</span>
          </div>
          <div className="chain-card-balance">
            <span className="chain-balance-crypto">{balance ? balance.balance : '...'}</span>
            <span className="chain-balance-usd">${balance ? balance.usd.toFixed(2) : '0.00'}</span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="accordion-chain-details">
            <div className="accordion-address" onClick={(e) => { e.stopPropagation(); copyAddress(address); }}>
              <span className="address-text">{address}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </div>
            <div className="accordion-actions">
              <button className="accordion-action send" onClick={(e) => { e.stopPropagation(); openSendPanel(chainKey); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22,2 15,22 11,13 2,9"/>
                </svg>
                Send
              </button>
              <button className="accordion-action receive" onClick={(e) => { e.stopPropagation(); copyAddress(address); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Receive
              </button>
            </div>
            <div className="accordion-transactions">
              <span className="transactions-placeholder">Recent transactions coming soon...</span>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  const renderMain = () => (
    <div className="wallet-main-v2">
      <div className="wallet-selector-bar">
        <div className="wallet-selector" onClick={() => setShowWalletMenu(!showWalletMenu)}>
          <span className="wallet-selector-icon">💼</span>
          <span className="wallet-selector-name">{activeWallet?.name || 'My Wallet'}</span>
          <span className="wallet-selector-arrow">{showWalletMenu ? '▲' : '▼'}</span>
        </div>
        
        {showWalletMenu && (
          <div className="wallet-dropdown">
            <div className="wallet-dropdown-header">Your Wallets</div>
            {builtInWallet.wallets.map(wallet => (
              <div 
                key={wallet.id} 
                className={`wallet-dropdown-item ${wallet.id === builtInWallet.activeWalletId ? 'active' : ''}`}
              >
                {editingWalletId === wallet.id ? (
                  <div className="wallet-rename-inline">
                    <input
                      type="text"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      placeholder={wallet.name}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameWallet(wallet.id)
                        if (e.key === 'Escape') { setEditingWalletId(null); setNewWalletName('') }
                      }}
                    />
                    <button onClick={() => handleRenameWallet(wallet.id)}>✓</button>
                    <button onClick={() => { setEditingWalletId(null); setNewWalletName('') }}>✕</button>
                  </div>
                ) : (
                  <>
                    <span 
                      className="wallet-item-name"
                      onClick={() => {
                        if (wallet.id !== builtInWallet.activeWalletId) {
                          setSwitchingWalletId(wallet.id)
                          setShowWalletMenu(false)
                        }
                      }}
                    >
                      {wallet.name}
                      {wallet.id === builtInWallet.activeWalletId && <span className="active-badge">Active</span>}
                    </span>
                    <div className="wallet-item-actions">
                      <button title="Rename" onClick={(e) => { e.stopPropagation(); setEditingWalletId(wallet.id); setNewWalletName(wallet.name) }}>✏️</button>
                      {builtInWallet.wallets.length > 1 && (
                        <button title="Delete" onClick={(e) => { e.stopPropagation(); handleDeleteSpecificWallet(wallet.id) }}>🗑️</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div className="wallet-dropdown-divider"></div>
            <button className="wallet-dropdown-add" onClick={() => { setShowWalletMenu(false); setView('create') }}>
              <span>+</span> Add New Wallet
            </button>
            <button className="wallet-dropdown-add import" onClick={() => { setShowWalletMenu(false); setView('import') }}>
              <span>↓</span> Import Wallet
            </button>
          </div>
        )}
      </div>
      
      {switchingWalletId && (
        <div className="wallet-switch-modal">
          <div className="wallet-switch-content">
            <h3>Switch Wallet</h3>
            <p>Enter password for "{builtInWallet.wallets.find(w => w.id === switchingWalletId)?.name}"</p>
            <input
              type="password"
              value={switchPassword}
              onChange={(e) => setSwitchPassword(e.target.value)}
              placeholder="Enter wallet password"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSwitchWallet()}
            />
            {error && <div className="form-error">{error}</div>}
            <div className="wallet-switch-actions">
              <button className="wallet-cta secondary" onClick={() => { setSwitchingWalletId(null); setSwitchPassword(''); setError('') }}>Cancel</button>
              <button className="wallet-cta primary" onClick={handleSwitchWallet}>Unlock & Switch</button>
            </div>
          </div>
        </div>
      )}
      
      {/* PREMIUM HERO SECTION */}
      <div className="wallet-hero-premium">
        <div className="wallet-hero-glow"></div>
        <div className="wallet-hero-content">
          <div className="wallet-hero-balance">
            <span className="hero-balance-label">Total Balance</span>
            <span className="hero-balance-value">${builtInWallet.totalUsd.toFixed(2)}</span>
            <div className="hero-actions">
              <button className="hero-action-btn" onClick={builtInWallet.refreshBalances}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
              </button>
              <button className="hero-action-btn lock" onClick={handleLockWallet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="wallet-hero-agent">
            <div className="speech-bubble">
              <span>{currentTip}</span>
              <div className="speech-bubble-tail"></div>
            </div>
            <img src="/agents/pixar/marcus.png" alt="Marcus" className="agent-image" />
          </div>
        </div>
      </div>
      
      {success && <div className="form-success">{success}</div>}
      {error && <div className="form-error">{error}</div>}
      
      {/* BENTO GRID LAYOUT */}
      <div className="wallet-bento-grid">
        {/* CHAIN SELECTION TILE */}
        <BentoTile className="chains-tile" style={{ gridColumn: 'span 8' }}>
          <TileLabel color="#00D4FF">Your Networks</TileLabel>
          <div className="chain-accordion">
            {Object.entries(CHAIN_CATEGORIES).map(([catKey, category]) => {
              const isExpanded = expandedCategory === catKey
              const chainsInCategory = category.chains.filter(c => builtInWallet.addresses?.[c])
              const categoryTotal = chainsInCategory.reduce((sum, c) => sum + (builtInWallet.balances[c]?.usd || 0), 0)
              
              return (
                <div key={catKey} className="chain-category">
                  <div 
                    className={`chain-category-header ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setExpandedCategory(isExpanded ? null : catKey)}
                  >
                    <div className="category-info">
                      <span className="category-label">{category.label}</span>
                      <span className="category-count">{chainsInCategory.length} networks</span>
                    </div>
                    <div className="category-right">
                      <span className="category-total">${categoryTotal.toFixed(2)}</span>
                      <span className="category-arrow">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="chain-category-content">
                      {chainsInCategory.map(chainKey => {
                        const chain = CHAIN_INFO[chainKey]
                        const address = builtInWallet.addresses[chainKey]
                        const balance = builtInWallet.balances[chainKey]
                        const isChainExpanded = activeChain === chainKey
                        
                        return (
                          <div 
                            key={chainKey}
                            className={`chain-accordion-item ${isChainExpanded ? 'expanded' : ''}`}
                            style={{ '--chain-color': chain.color }}
                          >
                            <div 
                              className="chain-item-header"
                              onClick={() => setActiveChain(isChainExpanded ? null : chainKey)}
                            >
                              <div className="chain-item-left">
                                <span className="chain-icon" style={{ color: chain.color }}>{chain.icon}</span>
                                <span className="chain-name">{chain.name}</span>
                              </div>
                              <div className="chain-item-right">
                                <span className="chain-balance">{balance ? balance.balance : '0'} {chain.symbol}</span>
                                <span className="chain-usd">${balance ? balance.usd.toFixed(2) : '0.00'}</span>
                              </div>
                            </div>
                            
                            {isChainExpanded && (
                              <div className="chain-item-details">
                                <div className="chain-address" onClick={(e) => { e.stopPropagation(); copyAddress(address); }}>
                                  <span>{address?.slice(0, 12)}...{address?.slice(-8)}</span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                  </svg>
                                </div>
                                <div className="chain-item-actions">
                                  <button onClick={(e) => { e.stopPropagation(); openSendPanel(chainKey); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
                                    </svg>
                                    Send
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); copyAddress(address); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                    Receive
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {chainsInCategory.length === 0 && (
                        <div className="no-chains-message">No wallets in this category</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </BentoTile>
        
        {/* QUICK ACTIONS TILE */}
        <BentoTile className="quick-actions-tile" style={{ gridColumn: 'span 4' }}>
          <TileLabel color="#00D4FF">Quick Actions</TileLabel>
          <div className="quick-actions-bento">
            <button className="quick-action-btn" onClick={() => { setSendChain('solana'); setShowSendPanel(true); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
              </svg>
              <span>Send</span>
            </button>
            <button className="quick-action-btn" onClick={() => builtInWallet.addresses?.solana && copyAddress(builtInWallet.addresses.solana)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Receive</span>
            </button>
            <button className="quick-action-btn swap" onClick={() => { setShowSwapModal(true); fetchSwapTokens(); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/>
              </svg>
              <span>Swap</span>
            </button>
            <button className="quick-action-btn buy" onClick={() => setShowBuyModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              <span>Buy</span>
            </button>
            {builtInWallet.addresses?.solana && (
              <button className="quick-action-btn dust" onClick={() => setShowDustBuster(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 6l2 14h14l2-14M3 6l4-4h10l4 4"/><path d="M9 10v6M12 10v6M15 10v6"/>
                </svg>
                <span>Dust Buster</span>
              </button>
            )}
            <button className="quick-action-btn backup" onClick={() => setShowRecoveryModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15V3M12 3l-4 4M12 3l4 4"/><path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/>
              </svg>
              <span>Backup</span>
            </button>
          </div>
        </BentoTile>
        
        {/* MULTI-SIG WALLET TILE */}
        <BentoTile className="multisig-tile" style={{ gridColumn: 'span 12' }}>
          <TileLabel color="#9945FF">Multi-Sig Wallets</TileLabel>
          <div className="multisig-placeholder">
            <div className="multisig-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9945FF" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div className="multisig-info">
              <h4>Team Vaults & Multi-Signature Wallets</h4>
              <p>Create secure multi-sig wallets that require multiple approvals for transactions. Perfect for teams, DAOs, and organizations.</p>
              <span className="coming-soon-badge">Coming Soon</span>
            </div>
          </div>
        </BentoTile>
      </div>

      {showDustBuster && (
        <div className="dust-buster-overlay" onClick={() => setShowDustBuster(false)}>
          <div className="dust-buster-panel" onClick={(e) => e.stopPropagation()}>
            <div className="dust-buster-header">
              <h3>Dust Buster</h3>
              <button className="close-btn" onClick={() => setShowDustBuster(false)}>×</button>
            </div>
            <DustBuster 
              walletAddress={builtInWallet.addresses?.solana}
              onClose={() => setShowDustBuster(false)}
            />
          </div>
        </div>
      )}

      {showSendPanel && (
        <div className="send-overlay" onClick={() => setShowSendPanel(false)}>
          <div className="send-panel" onClick={(e) => e.stopPropagation()}>
            <div className="send-header">
              <h3>Send {CHAIN_INFO[sendChain]?.symbol}</h3>
              <button className="close-btn" onClick={() => setShowSendPanel(false)}>×</button>
            </div>
            
            <div className="send-chain-preview">
              <span style={{ color: CHAIN_INFO[sendChain]?.color }}>{CHAIN_INFO[sendChain]?.icon}</span>
              <span>{CHAIN_INFO[sendChain]?.name}</span>
            </div>
            
            <div className="form-field">
              <label>Recipient Address</label>
              <input
                type="text"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="Enter recipient address"
              />
            </div>
            
            <div className="form-field">
              <label>Amount ({CHAIN_INFO[sendChain]?.symbol})</label>
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.0"
                step="0.001"
              />
            </div>
            
            <div className="form-field">
              <label>
                Wallet Password
                <InfoTooltip definition={WALLET_DEFINITIONS.privateKey} />
              </label>
              <input
                type="password"
                value={sendPassword}
                onChange={(e) => setSendPassword(e.target.value)}
                placeholder="Enter password to sign"
              />
            </div>
            
            {gasEstimate && (
              <div className="gas-estimate">
                <span>
                  Network Fee
                  <InfoTooltip definition={WALLET_DEFINITIONS.gasEstimate} />
                </span>
                <span>{gasEstimate.gasFee} {CHAIN_INFO[sendChain]?.symbol}</span>
              </div>
            )}
            
            {error && <div className="form-error">{error}</div>}
            
            <button 
              className="wallet-cta primary full-width" 
              onClick={handleSendTransaction} 
              disabled={builtInWallet.loading || !sendTo || !sendAmount || !sendPassword}
            >
              {builtInWallet.loading ? 'Sending...' : 'Send Transaction'}
            </button>
          </div>
        </div>
      )}

      {showRecoveryModal && (
        <div className="recovery-overlay" onClick={closeRecoveryModal}>
          <div className="recovery-panel" onClick={(e) => e.stopPropagation()}>
            <div className="recovery-header">
              <h3>View Recovery Phrase</h3>
              <button className="close-btn" onClick={closeRecoveryModal}>×</button>
            </div>
            
            {!recoveryMnemonic ? (
              <>
                <div className="recovery-warning">
                  <div className="warning-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div className="warning-content">
                    <strong>Sensitive Information</strong>
                    <p>Your recovery phrase grants full access to your wallet. Never share it with anyone or enter it on untrusted websites.</p>
                  </div>
                </div>
                
                <div className="form-field">
                  <label>Enter your password to continue</label>
                  <input
                    type="password"
                    value={recoveryPassword}
                    onChange={(e) => setRecoveryPassword(e.target.value)}
                    placeholder="Enter wallet password"
                    onKeyDown={(e) => e.key === 'Enter' && handleViewRecoveryPhrase()}
                    autoFocus
                  />
                </div>
                
                {error && <div className="form-error">{error}</div>}
                
                <button 
                  className="wallet-cta primary full-width" 
                  onClick={handleViewRecoveryPhrase}
                  disabled={recoveryLoading || !recoveryPassword}
                >
                  {recoveryLoading ? 'Verifying...' : 'View Recovery Phrase'}
                </button>
              </>
            ) : (
              <>
                <div className="recovery-warning active">
                  <div className="warning-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div className="warning-content">
                    <strong>Keep This Secret!</strong>
                    <p>Write these words down on paper. Store them in a safe place. Never take a screenshot or save digitally.</p>
                  </div>
                </div>
                
                <div className="mnemonic-grid recovery">
                  {recoveryMnemonic.split(' ').map((word, i) => (
                    <div key={i} className="mnemonic-word">
                      <span className="word-num">{i + 1}</span>
                      <span className="word-text">{showRecoveryWords ? word : '•••••'}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="wallet-cta secondary full-width" 
                  onClick={() => setShowRecoveryWords(!showRecoveryWords)}
                >
                  {showRecoveryWords ? '🙈 Hide Words' : '👁️ Reveal Words'}
                </button>
                
                <button 
                  className="wallet-cta primary full-width" 
                  onClick={closeRecoveryModal}
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showBuyModal && (
        <div className="buy-overlay" onClick={closeBuyModal}>
          <div className="buy-panel" onClick={(e) => e.stopPropagation()}>
            <div className="buy-header">
              <h3>Buy Crypto</h3>
              <button className="close-btn" onClick={closeBuyModal}>×</button>
            </div>
            
            <div className="buy-info">
              <div className="buy-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <span>Purchase crypto directly with your card via Stripe</span>
            </div>
            
            <div className="form-field">
              <label>Network</label>
              <select
                value={buyNetwork}
                onChange={(e) => {
                  setBuyNetwork(e.target.value)
                  setBuyCurrency(e.target.value === 'solana' ? 'sol' : 'eth')
                }}
              >
                <option value="solana">Solana</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="base">Base</option>
                <option value="arbitrum">Arbitrum</option>
              </select>
            </div>
            
            <div className="form-field">
              <label>Currency</label>
              <select
                value={buyCurrency}
                onChange={(e) => setBuyCurrency(e.target.value)}
              >
                {buyNetwork === 'solana' ? (
                  <>
                    <option value="sol">SOL</option>
                    <option value="usdc">USDC</option>
                  </>
                ) : (
                  <>
                    <option value="eth">ETH</option>
                    <option value="usdc">USDC</option>
                  </>
                )}
              </select>
            </div>
            
            <div className="form-field">
              <label>Amount (USD)</label>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="Enter amount in USD (optional)"
                min="1"
                step="1"
              />
              <span className="field-hint">Leave empty to choose amount on Stripe</span>
            </div>
            
            <div className="buy-destination">
              <label>Destination Wallet</label>
              <div className="destination-address">
                <span className="destination-network">{CHAIN_INFO[buyNetwork]?.icon}</span>
                <span className="destination-addr">
                  {buyNetwork === 'solana' 
                    ? builtInWallet.addresses?.solana?.slice(0, 8) + '...' + builtInWallet.addresses?.solana?.slice(-6)
                    : builtInWallet.addresses?.ethereum?.slice(0, 8) + '...' + builtInWallet.addresses?.ethereum?.slice(-6)
                  }
                </span>
              </div>
            </div>
            
            {buyError && (
              <div className="form-error buy-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
                <span>{buyError}</span>
              </div>
            )}
            
            <button 
              className="wallet-cta primary full-width stripe-btn" 
              onClick={handleBuyCrypto}
              disabled={buyLoading}
            >
              {buyLoading ? (
                'Connecting to Stripe...'
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Buy with Stripe
                </>
              )}
            </button>
            
            <p className="buy-disclaimer">
              Powered by Stripe. Available for US customers only.
            </p>
          </div>
        </div>
      )}

      {showSwapModal && (
        <div className="swap-overlay" onClick={closeSwapModal}>
          <div className="swap-panel" onClick={(e) => e.stopPropagation()}>
            <div className="swap-header">
              <h3>Swap Tokens</h3>
              <button className="close-btn" onClick={closeSwapModal}>×</button>
            </div>
            
            <div className="swap-info">
              <div className="swap-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <span>Swap tokens on Solana via Jupiter</span>
            </div>
            
            <div className="swap-token-selector">
              <label>From</label>
              <div className="token-select-wrapper">
                <button 
                  className="token-select-btn"
                  onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }}
                >
                  {swapFromToken?.logoURI && <img src={swapFromToken.logoURI} alt="" className="token-logo" />}
                  <span className="token-symbol">{swapFromToken?.symbol || 'Select token'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </button>
                {showFromDropdown && (
                  <div className="token-dropdown">
                    <input
                      type="text"
                      placeholder="Search tokens..."
                      value={swapFromSearch}
                      onChange={(e) => setSwapFromSearch(e.target.value)}
                      className="token-search"
                    />
                    <div className="token-list">
                      {swapTokens
                        .filter(t => t.symbol.toLowerCase().includes(swapFromSearch.toLowerCase()) || t.name.toLowerCase().includes(swapFromSearch.toLowerCase()))
                        .map(token => (
                          <button
                            key={token.address}
                            className={`token-option ${swapFromToken?.address === token.address ? 'selected' : ''}`}
                            onClick={() => { setSwapFromToken(token); setShowFromDropdown(false); setSwapFromSearch(''); }}
                          >
                            {token.logoURI && <img src={token.logoURI} alt="" className="token-logo" />}
                            <div className="token-info">
                              <span className="token-symbol">{token.symbol}</span>
                              <span className="token-name">{token.name}</span>
                            </div>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              <input
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                placeholder="0.0"
                className="swap-amount-input"
              />
            </div>
            
            <div className="swap-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
            </div>
            
            <div className="swap-token-selector">
              <label>To</label>
              <div className="token-select-wrapper">
                <button 
                  className="token-select-btn"
                  onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }}
                >
                  {swapToToken?.logoURI && <img src={swapToToken.logoURI} alt="" className="token-logo" />}
                  <span className="token-symbol">{swapToToken?.symbol || 'Select token'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </button>
                {showToDropdown && (
                  <div className="token-dropdown">
                    <input
                      type="text"
                      placeholder="Search tokens..."
                      value={swapToSearch}
                      onChange={(e) => setSwapToSearch(e.target.value)}
                      className="token-search"
                    />
                    <div className="token-list">
                      {swapTokens
                        .filter(t => t.symbol.toLowerCase().includes(swapToSearch.toLowerCase()) || t.name.toLowerCase().includes(swapToSearch.toLowerCase()))
                        .filter(t => t.address !== swapFromToken?.address)
                        .map(token => (
                          <button
                            key={token.address}
                            className={`token-option ${swapToToken?.address === token.address ? 'selected' : ''}`}
                            onClick={() => { setSwapToToken(token); setShowToDropdown(false); setSwapToSearch(''); }}
                          >
                            {token.logoURI && <img src={token.logoURI} alt="" className="token-logo" />}
                            <div className="token-info">
                              <span className="token-symbol">{token.symbol}</span>
                              <span className="token-name">{token.name}</span>
                            </div>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              {swapQuote && (
                <div className="swap-output-amount">
                  ≈ {(parseFloat(swapQuote.outputAmount) / Math.pow(10, swapToToken?.decimals || 9)).toFixed(6)} {swapToToken?.symbol}
                </div>
              )}
            </div>
            
            <div className="swap-slippage">
              <label>Slippage Tolerance</label>
              <div className="slippage-options">
                <button className={`slippage-btn ${swapSlippage === '50' ? 'active' : ''}`} onClick={() => setSwapSlippage('50')}>0.5%</button>
                <button className={`slippage-btn ${swapSlippage === '100' ? 'active' : ''}`} onClick={() => setSwapSlippage('100')}>1%</button>
                <button className={`slippage-btn ${swapSlippage === '300' ? 'active' : ''}`} onClick={() => setSwapSlippage('300')}>3%</button>
              </div>
            </div>
            
            {swapLoading && (
              <div className="swap-loading">
                <div className="swap-spinner"></div>
                <span>Fetching best route...</span>
              </div>
            )}
            
            {swapQuote && !swapLoading && (
              <div className="swap-quote-details">
                <div className="quote-row">
                  <span>Rate</span>
                  <span>1 {swapFromToken?.symbol} ≈ {(parseFloat(swapQuote.outputAmount) / parseFloat(swapQuote.inputAmount)).toFixed(6)} {swapToToken?.symbol}</span>
                </div>
                <div className="quote-row">
                  <span>Price Impact</span>
                  <span className={parseFloat(swapQuote.priceImpactPct) > 1 ? 'high-impact' : ''}>{swapQuote.priceImpactPct}%</span>
                </div>
              </div>
            )}
            
            {swapQuote && !swapLoading && (
              <div className="form-field">
                <label>Wallet Password</label>
                <input
                  type="password"
                  value={swapPassword}
                  onChange={(e) => setSwapPassword(e.target.value)}
                  placeholder="Enter password to sign"
                />
              </div>
            )}
            
            {swapError && (
              <div className="form-error swap-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
                <span>{swapError}</span>
              </div>
            )}
            
            {swapSuccess && (
              <div className="form-success swap-success">
                <span>{swapSuccess}</span>
              </div>
            )}
            
            <button 
              className="wallet-cta primary full-width swap-execute-btn" 
              onClick={handleSwapExecute}
              disabled={!swapQuote || swapLoading || swapExecuting || !swapPassword}
            >
              {swapExecuting ? (
                <>
                  <div className="swap-spinner small"></div>
                  Swapping...
                </>
              ) : (
                'Execute Swap'
              )}
            </button>
            
            <p className="swap-disclaimer">
              Powered by Jupiter. Swaps are executed on Solana.
            </p>
          </div>
        </div>
      )}
    </div>
  )
  
  return (
    <div className="wallet-manager-v2">
      {view === 'landing' && renderLanding()}
      {view === 'create' && renderCreate()}
      {view === 'backup' && renderBackup()}
      {view === 'import' && renderImport()}
      {view === 'unlock' && renderUnlock()}
      {view === 'main' && renderMain()}

      <style>{`
        .wallet-manager-v2 {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        .wallet-landing-v2 {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 32px;
        }

        .wallet-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .wallet-hero-icon {
          width: 100px;
          height: 100px;
          background: #1a1a1a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #00D4FF;
          box-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
          animation: heroGlow 3s ease-in-out infinite;
        }

        @keyframes heroGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.3); }
          50% { box-shadow: 0 0 60px rgba(0, 212, 255, 0.5); }
        }

        .wallet-hero h1 {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .wallet-hero p {
          color: #888;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wallet-chains-showcase {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }

        .wallet-chain-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #1a1a1a;
          border: 1px solid var(--chain-color);
          border-radius: 24px;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .wallet-chain-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(var(--chain-color), 0.2);
        }

        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(10px); }
        }

        .wallet-chain-card .chain-icon {
          font-size: 18px;
        }

        .wallet-chain-card .chain-name {
          color: #fff;
          font-size: 14px;
          font-weight: 500;
        }

        .wallet-features {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .wallet-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #888;
          font-size: 14px;
        }

        .feature-icon {
          font-size: 18px;
        }

        .wallet-cta-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 320px;
        }

        .wallet-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .wallet-cta.primary {
          background: linear-gradient(135deg, #00D4FF, #0099FF);
          color: #000;
        }

        .wallet-cta.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 212, 255, 0.4);
        }

        .wallet-cta.secondary {
          background: #1a1a1a;
          color: #fff;
          border: 1px solid #333;
        }

        .wallet-cta.secondary:hover {
          border-color: #00D4FF;
        }

        .wallet-cta:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wallet-cta.full-width {
          width: 100%;
        }

        .cta-icon {
          font-size: 20px;
        }

        .wallet-form-v2 {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 400px;
          margin: 0 auto;
        }

        .wallet-back-btn {
          align-self: flex-start;
          background: none;
          border: none;
          color: #888;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
        }

        .wallet-back-btn:hover {
          color: #00D4FF;
        }

        .form-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .form-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          border: 2px solid #00D4FF;
        }

        .form-icon.warning {
          border-color: #FF6B6B;
        }

        .form-header h2 {
          font-size: 24px;
          color: #fff;
          margin: 0;
        }

        .form-header p {
          color: #888;
          font-size: 14px;
          margin: 0;
        }

        .form-header .warning-text {
          color: #FF6B6B;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field label {
          color: #888;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
          padding: 14px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
        }

        .form-field input:focus,
        .form-field textarea:focus,
        .form-field select:focus {
          outline: none;
          border-color: #00D4FF;
        }

        .form-field textarea {
          resize: vertical;
          min-height: 80px;
          font-family: monospace;
        }

        .field-hint {
          font-size: 12px;
          color: #666;
        }

        .form-error {
          padding: 14px;
          background: rgba(255, 107, 107, 0.15);
          border: 1px solid #FF6B6B;
          border-radius: 10px;
          color: #FF6B6B;
          font-size: 14px;
          text-align: center;
        }

        .form-success {
          padding: 14px;
          background: rgba(57, 255, 20, 0.15);
          border: 1px solid #39FF14;
          border-radius: 10px;
          color: #39FF14;
          font-size: 14px;
          text-align: center;
        }

        .mnemonic-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 20px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 16px;
        }

        .mnemonic-word {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #1a1a1a;
          border-radius: 8px;
        }

        .word-num {
          font-size: 11px;
          color: #555;
          min-width: 18px;
        }

        .word-text {
          font-family: monospace;
          font-size: 13px;
          color: #fff;
        }

        .wallet-form-v2.unlock {
          align-items: center;
          text-align: center;
          padding-top: 40px;
        }

        .unlock-icon {
          position: relative;
          margin-bottom: 16px;
        }

        .lock-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%);
          animation: lockPulse 2s ease-in-out infinite;
        }

        @keyframes lockPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .form-field.single {
          width: 100%;
          max-width: 300px;
        }

        .wallet-link {
          background: none;
          border: none;
          color: #555;
          font-size: 13px;
          cursor: pointer;
          margin-top: 16px;
        }

        .wallet-link:hover {
          color: #FF6B6B;
        }

        .wallet-main-v2 {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .wallet-total-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          text-align: center;
        }

        .total-label {
          display: block;
          color: #888;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .total-value {
          display: block;
          font-size: 42px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 20px;
        }

        .total-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #252525;
          border: 1px solid #333;
          border-radius: 8px;
          color: #888;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          border-color: #00D4FF;
          color: #00D4FF;
        }

        .action-btn.lock:hover {
          border-color: #FF6B6B;
          color: #FF6B6B;
        }

        .wallet-chains-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .wallet-chain-v2 {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .wallet-chain-v2:hover {
          border-color: var(--chain-color);
        }

        .wallet-chain-v2.active {
          border-color: var(--chain-color);
          box-shadow: 0 0 20px rgba(var(--chain-color), 0.15);
        }

        .chain-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chain-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chain-icon-lg {
          font-size: 28px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f0f;
          border-radius: 12px;
        }

        .chain-info {
          display: flex;
          flex-direction: column;
        }

        .chain-info .chain-name {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .chain-info .chain-symbol {
          font-size: 13px;
          color: #666;
        }

        .chain-balance {
          text-align: right;
        }

        .balance-crypto {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .balance-usd {
          display: block;
          font-size: 13px;
          color: #888;
        }

        .chain-address {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 10px 12px;
          background: #0f0f0f;
          border-radius: 8px;
          font-family: monospace;
          font-size: 13px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chain-address:hover {
          color: #00D4FF;
        }

        .chain-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .chain-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .chain-action-btn.send {
          background: linear-gradient(135deg, #00D4FF, #0099FF);
          color: #000;
        }

        .chain-action-btn.receive {
          background: #252525;
          color: #fff;
          border: 1px solid #333;
        }

        .chain-action-btn:hover {
          transform: translateY(-2px);
        }

        .send-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .send-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .send-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .send-header h3 {
          font-size: 20px;
          color: #fff;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #666;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .close-btn:hover {
          color: #fff;
        }

        .send-chain-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #0f0f0f;
          border-radius: 10px;
          font-size: 16px;
          color: #fff;
        }

        .gas-estimate {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #0f0f0f;
          border-radius: 10px;
          font-size: 14px;
          color: #888;
        }

        .gas-estimate span:first-child {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Recovery Phrase Modal */
        .recovery-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .recovery-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .recovery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recovery-header h3 {
          font-size: 20px;
          color: #fff;
          margin: 0;
        }

        .recovery-warning {
          display: flex;
          gap: 14px;
          padding: 16px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 12px;
        }

        .recovery-warning.active {
          background: rgba(255, 107, 107, 0.15);
          border-color: rgba(255, 107, 107, 0.5);
        }

        .recovery-warning .warning-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }

        .recovery-warning .warning-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .recovery-warning .warning-content strong {
          color: #FF6B6B;
          font-size: 14px;
        }

        .recovery-warning .warning-content p {
          color: #ccc;
          font-size: 13px;
          margin: 0;
          line-height: 1.4;
        }

        .mnemonic-grid.recovery {
          margin-top: 8px;
        }

        .quick-action-card.backup .quick-action-icon {
          background: linear-gradient(135deg, #FF6B6B, #FF4757);
        }

        .quick-action-icon.backup {
          background: linear-gradient(135deg, #FF6B6B, #FF4757);
        }

        /* Wallet Selector */
        .wallet-selector-bar {
          position: relative;
          margin-bottom: 20px;
        }
        
        .wallet-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .wallet-selector:hover {
          border-color: #00D4FF;
        }
        
        .wallet-selector-icon {
          font-size: 20px;
        }
        
        .wallet-selector-name {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        
        .wallet-selector-arrow {
          color: #666;
          font-size: 10px;
        }
        
        .wallet-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        
        .wallet-dropdown-header {
          padding: 12px 16px;
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          font-weight: 600;
          border-bottom: 1px solid #252525;
        }
        
        .wallet-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #252525;
          transition: background 0.2s ease;
        }
        
        .wallet-dropdown-item:hover {
          background: #252525;
        }
        
        .wallet-dropdown-item.active {
          background: rgba(0, 212, 255, 0.1);
        }
        
        .wallet-item-name {
          flex: 1;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .active-badge {
          font-size: 10px;
          padding: 2px 8px;
          background: rgba(0, 212, 255, 0.2);
          color: #00D4FF;
          border-radius: 10px;
        }
        
        .wallet-item-actions {
          display: flex;
          gap: 4px;
        }
        
        .wallet-item-actions button {
          background: none;
          border: none;
          font-size: 14px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .wallet-item-actions button:hover {
          background: #333;
        }
        
        .wallet-rename-inline {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        
        .wallet-rename-inline input {
          flex: 1;
          padding: 6px 10px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
        }
        
        .wallet-rename-inline button {
          background: none;
          border: none;
          color: #888;
          font-size: 16px;
          cursor: pointer;
          padding: 4px 8px;
        }
        
        .wallet-rename-inline button:hover {
          color: #fff;
        }
        
        .wallet-dropdown-divider {
          height: 1px;
          background: #333;
        }
        
        .wallet-dropdown-add {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          color: #00D4FF;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }
        
        .wallet-dropdown-add:hover {
          background: rgba(0, 212, 255, 0.1);
        }
        
        .wallet-dropdown-add.import {
          color: #9D4EDD;
        }
        
        .wallet-dropdown-add.import:hover {
          background: rgba(157, 78, 221, 0.1);
        }
        
        .wallet-switch-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .wallet-switch-content {
          background: #1a1a1a;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #333;
          width: 90%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .wallet-switch-content h3 {
          margin: 0;
          color: #fff;
          font-size: 20px;
        }
        
        .wallet-switch-content p {
          margin: 0;
          color: #888;
          font-size: 14px;
        }
        
        .wallet-switch-content input {
          padding: 12px 16px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 16px;
        }
        
        .wallet-switch-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        
        .wallet-switch-actions button {
          flex: 1;
        }

        /* Dust Buster Card */
        .dust-buster-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #1a1a1a, #0f0f0f);
          border: 1px solid #333;
          border-radius: 12px;
          margin-top: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dust-buster-card:hover {
          border-color: #00D4FF;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
          transform: translateY(-2px);
        }

        .dust-buster-icon {
          width: 48px;
          height: 48px;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dust-buster-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dust-buster-title {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }

        .dust-buster-subtitle {
          color: #888;
          font-size: 13px;
        }

        /* Dust Buster Overlay */
        .dust-buster-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 20px;
          z-index: 1000;
          overflow-y: auto;
        }

        .dust-buster-panel {
          background: #0f0f0f;
          border-radius: 16px;
          border: 1px solid #333;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .dust-buster-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #333;
          position: sticky;
          top: 0;
          background: #0f0f0f;
          z-index: 10;
        }

        .dust-buster-header h3 {
          margin: 0;
          color: #fff;
          font-size: 20px;
        }

        /* ========== PREMIUM WALLET STYLES ========== */
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes balanceGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3); }
          50% { text-shadow: 0 0 30px rgba(0, 212, 255, 0.7), 0 0 60px rgba(0, 212, 255, 0.4); }
        }
        
        @keyframes floatAgent {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        /* Premium Hero Section */
        .wallet-hero-premium {
          position: relative;
          background: linear-gradient(135deg, #0f0f0f 0%, #141414 50%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .wallet-hero-glow {
          position: absolute;
          top: 50%;
          left: 30%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .wallet-hero-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        
        .wallet-hero-balance {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .hero-balance-label {
          font-size: 14px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .hero-balance-value {
          font-size: 42px;
          font-weight: 700;
          color: #fff;
          animation: balanceGlow 3s ease-in-out infinite;
          line-height: 1.1;
        }
        
        .hero-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        
        .hero-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #252525;
          border: 1px solid #333;
          color: #888;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .hero-action-btn:hover {
          border-color: #00D4FF;
          color: #00D4FF;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
        }
        
        .hero-action-btn.lock:hover {
          border-color: #FF6B6B;
          color: #FF6B6B;
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.3);
        }
        
        .wallet-hero-agent {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .agent-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid #00D4FF;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          animation: floatAgent 4s ease-in-out infinite;
        }
        
        .speech-bubble {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 10px 14px;
          max-width: 140px;
          font-size: 12px;
          color: #ccc;
          margin-bottom: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        
        .speech-bubble-tail {
          position: absolute;
          bottom: -8px;
          right: 30px;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #333;
        }
        
        .speech-bubble-tail::after {
          content: '';
          position: absolute;
          top: -9px;
          left: -7px;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 7px solid #1a1a1a;
        }
        
        /* Section Titles */
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 16px 0;
        }
        
        /* Chain Carousel */
        .chain-carousel-container {
          margin-bottom: 24px;
        }
        
        .chain-carousel {
          border-radius: 16px;
          overflow: visible;
        }
        
        .chain-slide {
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
          padding: 8px;
        }
        
        .no-chains {
          padding: 40px;
          text-align: center;
          color: #666;
        }
        
        /* Premium Chain Card */
        .chain-card-premium {
          position: relative;
          background: #141414;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .chain-card-premium::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: var(--chain-gradient);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .chain-card-premium:hover::before {
          opacity: 1;
        }
        
        .chain-card-premium:hover {
          transform: perspective(1000px) rotateY(3deg) translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px color-mix(in srgb, var(--chain-color) 30%, transparent);
        }
        
        .chain-card-premium.expanded {
          background: #1a1a1a;
        }
        
        .chain-card-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          background-size: 200% 100%;
          animation: shimmer 4s infinite;
          pointer-events: none;
          border-radius: 16px;
        }
        
        .chain-card-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .chain-card-icon {
          font-size: 28px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f0f;
          border-radius: 12px;
          border: 1px solid #333;
        }
        
        .chain-card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .chain-card-name {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        
        .chain-card-symbol {
          font-size: 13px;
          color: #666;
        }
        
        .chain-card-balance {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .chain-balance-crypto {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        
        .chain-balance-usd {
          font-size: 13px;
          color: #888;
        }
        
        /* Accordion Chain Details */
        .accordion-chain-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #333;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .accordion-address {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .accordion-address:hover {
          border-color: #00D4FF;
          color: #00D4FF;
        }
        
        .address-text {
          flex: 1;
          font-family: monospace;
          font-size: 11px;
          color: #888;
          word-break: break-all;
        }
        
        .accordion-actions {
          display: flex;
          gap: 10px;
        }
        
        .accordion-action {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }
        
        .accordion-action.send {
          background: linear-gradient(135deg, #00D4FF, #0099FF);
          color: #000;
        }
        
        .accordion-action.receive {
          background: #252525;
          color: #fff;
          border: 1px solid #333;
        }
        
        .accordion-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .accordion-transactions {
          padding: 12px 14px;
          background: #0f0f0f;
          border-radius: 10px;
          text-align: center;
        }
        
        .transactions-placeholder {
          font-size: 13px;
          color: #555;
        }
        
        /* Quick Actions Hub */
        .quick-actions-hub {
          margin-bottom: 24px;
        }
        
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        
        .quick-action-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px 16px;
          background: #141414;
          border: 1px solid #333;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .quick-action-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, #00D4FF, #0099FF);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .quick-action-card:hover::before {
          opacity: 1;
        }
        
        .quick-action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.2);
        }
        
        .quick-action-card.dust::before {
          background: linear-gradient(135deg, #9945FF, #14F195);
        }
        
        .quick-action-card.dust:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(153, 69, 255, 0.2);
        }
        
        .quick-action-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 14px;
          color: #00D4FF;
          transition: all 0.3s ease;
        }
        
        .quick-action-icon.receive {
          background: rgba(57, 255, 20, 0.1);
          color: #39FF14;
        }
        
        .quick-action-icon.dust {
          background: rgba(153, 69, 255, 0.1);
          color: #9945FF;
        }
        
        .quick-action-icon.buy {
          background: rgba(57, 255, 20, 0.1);
          color: #39FF14;
        }
        
        .quick-action-card.buy::before {
          background: linear-gradient(135deg, #39FF14, #00D4FF);
        }
        
        .quick-action-card.buy:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(57, 255, 20, 0.2);
        }

        /* Buy Crypto Modal */
        .buy-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .buy-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .buy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .buy-header h3 {
          font-size: 20px;
          color: #fff;
          margin: 0;
        }

        .buy-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 12px;
          color: #00D4FF;
          font-size: 13px;
        }

        .buy-info-icon {
          flex-shrink: 0;
        }

        .buy-destination {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .buy-destination label {
          color: #888;
          font-size: 13px;
        }

        .destination-address {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 10px;
        }

        .destination-network {
          font-size: 18px;
        }

        .destination-addr {
          font-family: monospace;
          font-size: 14px;
          color: #888;
        }

        .buy-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .buy-error svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .stripe-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .stripe-btn svg {
          flex-shrink: 0;
        }

        .buy-disclaimer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        /* Swap Modal Styles */
        .swap-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .swap-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .swap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .swap-header h3 {
          font-size: 20px;
          color: #fff;
          margin: 0;
        }

        .swap-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(153, 69, 255, 0.1);
          border: 1px solid rgba(153, 69, 255, 0.3);
          border-radius: 12px;
          color: #9945FF;
          font-size: 13px;
        }

        .swap-info-icon {
          flex-shrink: 0;
        }

        .swap-token-selector {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 12px;
        }

        .swap-token-selector label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .token-select-wrapper {
          position: relative;
        }

        .token-select-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          cursor: pointer;
          width: 100%;
          transition: border-color 0.2s;
        }

        .token-select-btn:hover {
          border-color: #9945FF;
        }

        .token-logo {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .token-symbol {
          flex: 1;
          text-align: left;
          font-weight: 600;
        }

        .token-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          z-index: 10;
          max-height: 280px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .token-search {
          padding: 12px 16px;
          background: #0f0f0f;
          border: none;
          border-bottom: 1px solid #333;
          color: #fff;
          font-size: 14px;
        }

        .token-search:focus {
          outline: none;
        }

        .token-list {
          overflow-y: auto;
          max-height: 220px;
        }

        .token-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          width: 100%;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s;
        }

        .token-option:hover {
          background: rgba(153, 69, 255, 0.1);
        }

        .token-option.selected {
          background: rgba(153, 69, 255, 0.2);
        }

        .token-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .token-info .token-symbol {
          font-weight: 600;
          font-size: 14px;
        }

        .token-info .token-name {
          font-size: 12px;
          color: #888;
        }

        .swap-amount-input {
          padding: 14px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .swap-amount-input:focus {
          outline: none;
          border-color: #9945FF;
        }

        .swap-arrow {
          display: flex;
          justify-content: center;
          color: #9945FF;
          margin: -8px 0;
        }

        .swap-output-amount {
          font-size: 18px;
          font-weight: 600;
          color: #14F195;
          padding: 12px 16px;
          background: rgba(20, 241, 149, 0.1);
          border-radius: 10px;
        }

        .swap-slippage {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .swap-slippage label {
          font-size: 13px;
          color: #888;
        }

        .slippage-options {
          display: flex;
          gap: 8px;
        }

        .slippage-btn {
          flex: 1;
          padding: 10px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #888;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .slippage-btn:hover {
          border-color: #9945FF;
          color: #fff;
        }

        .slippage-btn.active {
          background: rgba(153, 69, 255, 0.2);
          border-color: #9945FF;
          color: #9945FF;
        }

        .swap-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px;
          color: #888;
        }

        .swap-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #333;
          border-top-color: #9945FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .swap-spinner.small {
          width: 18px;
          height: 18px;
          border-width: 2px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .swap-quote-details {
          padding: 16px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quote-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .quote-row span:first-child {
          color: #888;
        }

        .quote-row span:last-child {
          color: #fff;
        }

        .quote-row .high-impact {
          color: #FF6B6B;
        }

        .swap-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .swap-error svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .swap-success {
          word-break: break-all;
        }

        .swap-execute-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .swap-disclaimer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        .quick-action-icon.swap {
          background: rgba(153, 69, 255, 0.1);
          color: #9945FF;
        }

        .quick-action-card.swap::before {
          background: linear-gradient(135deg, #9945FF, #14F195);
        }

        .quick-action-card.swap:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(153, 69, 255, 0.3);
        }
        
        .quick-action-card:hover .quick-action-icon {
          transform: scale(1.1);
        }
        
        .quick-action-label {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        @media (max-width: 480px) {
          .wallet-hero h1 {
            font-size: 26px;
          }

          .mnemonic-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .wallet-features {
            flex-direction: column;
            gap: 12px;
          }

          .total-value {
            font-size: 32px;
          }

          .dust-buster-panel {
            max-width: 100%;
            border-radius: 12px;
          }

          .dust-buster-overlay {
            padding: 20px 12px;
          }
          
          /* Premium Responsive Styles */
          .wallet-hero-premium {
            padding: 20px 16px;
          }
          
          .wallet-hero-content {
            flex-direction: column;
            text-align: center;
          }
          
          .wallet-hero-balance {
            align-items: center;
          }
          
          .hero-balance-value {
            font-size: 36px;
          }
          
          .hero-actions {
            justify-content: center;
          }
          
          .wallet-hero-agent {
            order: -1;
            margin-bottom: 16px;
          }
          
          .agent-image {
            width: 80px;
            height: 80px;
          }
          
          .speech-bubble {
            position: relative;
            bottom: auto;
            right: auto;
            margin-bottom: 10px;
            max-width: 200px;
          }
          
          .speech-bubble-tail {
            left: 50%;
            right: auto;
            transform: translateX(-50%);
          }
          
          .quick-actions-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          
          .quick-action-card {
            padding: 16px 10px;
          }
          
          .quick-action-icon {
            width: 40px;
            height: 40px;
          }
          
          .quick-action-icon svg {
            width: 20px;
            height: 20px;
          }
          
          .quick-action-label {
            font-size: 12px;
          }
          
          .chain-card-premium {
            padding: 14px;
          }
          
          .chain-card-icon {
            width: 40px;
            height: 40px;
            font-size: 22px;
          }
          
          .chain-card-name {
            font-size: 14px;
          }
          
          .chain-balance-crypto {
            font-size: 14px;
          }
          
          .accordion-actions {
            flex-direction: column;
          }
          
          .address-text {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  )
}
