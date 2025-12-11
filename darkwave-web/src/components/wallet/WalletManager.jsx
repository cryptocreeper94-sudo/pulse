import { useState, useEffect, useCallback } from 'react'
import InfoTooltip from '../ui/InfoTooltip'
import { useBuiltInWallet } from '../../context/BuiltInWalletContext'

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
  base: { name: 'Base', symbol: 'ETH', color: '#0052FF', gradient: 'linear-gradient(135deg, #0052FF, #3B7AFF)', icon: '🔵' },
  arbitrum: { name: 'Arbitrum', symbol: 'ETH', color: '#28A0F0', gradient: 'linear-gradient(135deg, #28A0F0, #1B6CB0)', icon: '🔷' },
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
      
      <div className="wallet-main-header">
        <div className="wallet-total-card">
          <span className="total-label">Total Balance</span>
          <span className="total-value">${builtInWallet.totalUsd.toFixed(2)}</span>
          <div className="total-actions">
            <button className="action-btn" onClick={builtInWallet.refreshBalances}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Refresh
            </button>
            <button className="action-btn lock" onClick={handleLockWallet}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Lock
            </button>
          </div>
        </div>
      </div>
      
      {success && <div className="form-success">{success}</div>}
      {error && <div className="form-error">{error}</div>}
      
      <div className="wallet-chains-grid">
        {builtInWallet.addresses && Object.entries(builtInWallet.addresses).map(([chainKey, address]) => {
          const chain = CHAIN_INFO[chainKey]
          if (!chain) return null
          const balance = builtInWallet.balances[chainKey]
          const isActive = activeChain === chainKey
          
          return (
            <div 
              key={chainKey} 
              className={`wallet-chain-v2 ${isActive ? 'active' : ''}`}
              style={{ '--chain-color': chain.color, '--chain-gradient': chain.gradient }}
              onClick={() => setActiveChain(isActive ? null : chainKey)}
            >
              <div className="chain-header">
                <div className="chain-identity">
                  <span className="chain-icon-lg">{chain.icon}</span>
                  <div className="chain-info">
                    <span className="chain-name">{chain.name}</span>
                    <span className="chain-symbol">{chain.symbol}</span>
                  </div>
                </div>
                <div className="chain-balance">
                  <span className="balance-crypto">{balance ? balance.balance : '...'}</span>
                  <span className="balance-usd">${balance ? balance.usd.toFixed(2) : '0.00'}</span>
                </div>
              </div>
              
              <div className="chain-address" onClick={(e) => { e.stopPropagation(); copyAddress(address); }}>
                <span>{address.slice(0, 10)}...{address.slice(-8)}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </div>
              
              {isActive && (
                <div className="chain-actions">
                  <button className="chain-action-btn send" onClick={(e) => { e.stopPropagation(); openSendPanel(chainKey); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22,2 15,22 11,13 2,9"/>
                    </svg>
                    Send
                  </button>
                  <button className="chain-action-btn receive" onClick={(e) => { e.stopPropagation(); copyAddress(address); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Receive
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

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
        }
      `}</style>
    </div>
  )
}
