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
  solana: { name: 'Solana', symbol: 'SOL', color: '#9945FF', icon: '◎' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: 'Ξ' },
  polygon: { name: 'Polygon', symbol: 'MATIC', color: '#8247E5', icon: '⬡' },
  base: { name: 'Base', symbol: 'ETH', color: '#0052FF', icon: '🔵' },
  arbitrum: { name: 'Arbitrum', symbol: 'ETH', color: '#28A0F0', icon: '🔷' },
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
  
  const [sendChain, setSendChain] = useState('solana')
  const [sendTo, setSendTo] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendPassword, setSendPassword] = useState('')
  const [gasEstimate, setGasEstimate] = useState(null)
  
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
      const newMnemonic = await builtInWallet.createWallet(password, 12)
      setMnemonic(newMnemonic)
      setShowMnemonic(true)
      setView('backup')
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
      await builtInWallet.importWallet(importPhrase.trim(), password)
      setView('main')
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
      builtInWallet.deleteWallet()
      setView('landing')
    }
  }
  
  const copyAddress = (address) => {
    navigator.clipboard.writeText(address)
    setSuccess('Address copied!')
    setTimeout(() => setSuccess(''), 2000)
  }
  
  const renderLanding = () => (
    <div className="wallet-landing">
      <div className="wallet-logo">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5">
          <rect x="2" y="6" width="20" height="14" rx="2"/>
          <path d="M22 10h-4a2 2 0 100 4h4"/>
          <circle cx="18" cy="12" r="1" fill="#00D4FF"/>
        </svg>
      </div>
      <h2>Multi-Chain Wallet</h2>
      <p className="wallet-subtitle">
        One wallet for all your crypto
        <InfoTooltip definition={WALLET_DEFINITIONS.hdWallet} />
      </p>
      
      <div className="wallet-chain-icons">
        {Object.entries(CHAIN_INFO).map(([key, chain]) => (
          <div key={key} className="wallet-chain-badge" style={{ borderColor: chain.color }}>
            <span style={{ color: chain.color }}>{chain.icon}</span>
            <span>{chain.name}</span>
          </div>
        ))}
      </div>
      
      <div className="wallet-actions">
        <button className="wallet-btn primary" onClick={() => setView('create')}>
          Create New Wallet
        </button>
        <button className="wallet-btn secondary" onClick={() => setView('import')}>
          Import Existing Wallet
        </button>
      </div>
    </div>
  )
  
  const renderCreate = () => (
    <div className="wallet-form">
      <h2>Create Wallet</h2>
      <p>Set a password to encrypt your wallet on this device.</p>
      
      <div className="wallet-input-group">
        <label>Password (min 8 characters)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>
      
      <div className="wallet-input-group">
        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
        />
      </div>
      
      {error && <div className="wallet-error">{error}</div>}
      
      <div className="wallet-actions">
        <button className="wallet-btn secondary" onClick={() => { setView('landing'); clearMessages(); }}>
          Back
        </button>
        <button className="wallet-btn primary" onClick={handleCreateWallet} disabled={builtInWallet.loading}>
          {builtInWallet.loading ? 'Creating...' : 'Create Wallet'}
        </button>
      </div>
    </div>
  )
  
  const renderBackup = () => (
    <div className="wallet-form">
      <h2>Save Your Recovery Phrase</h2>
      <p className="wallet-warning">
        Write these words down in order. This is the ONLY way to recover your wallet!
        <InfoTooltip definition={WALLET_DEFINITIONS.mnemonic} />
      </p>
      
      <div className="wallet-mnemonic">
        {mnemonic?.split(' ').map((word, i) => (
          <div key={i} className="wallet-word">
            <span className="wallet-word-num">{i + 1}</span>
            <span className="wallet-word-text">{showMnemonic ? word : '•••••'}</span>
          </div>
        ))}
      </div>
      
      <button 
        className="wallet-btn secondary" 
        onClick={() => setShowMnemonic(!showMnemonic)}
        style={{ marginBottom: 16 }}
      >
        {showMnemonic ? 'Hide Words' : 'Show Words'}
      </button>
      
      {success && <div className="wallet-success">{success}</div>}
      
      <div className="wallet-actions">
        <button 
          className="wallet-btn primary" 
          onClick={() => { setMnemonic(''); setView('main'); }}
        >
          I've Saved My Phrase
        </button>
      </div>
    </div>
  )
  
  const renderImport = () => (
    <div className="wallet-form">
      <h2>Import Wallet</h2>
      <p>Enter your 12 or 24 word recovery phrase.</p>
      
      <div className="wallet-input-group">
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
      
      <div className="wallet-input-group">
        <label>New Password (min 8 characters)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>
      
      <div className="wallet-input-group">
        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
        />
      </div>
      
      {error && <div className="wallet-error">{error}</div>}
      
      <div className="wallet-actions">
        <button className="wallet-btn secondary" onClick={() => { setView('landing'); clearMessages(); }}>
          Back
        </button>
        <button className="wallet-btn primary" onClick={handleImportWallet} disabled={builtInWallet.loading}>
          {builtInWallet.loading ? 'Importing...' : 'Import Wallet'}
        </button>
      </div>
    </div>
  )
  
  const renderUnlock = () => (
    <div className="wallet-form">
      <div className="wallet-logo">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <h2>Unlock Wallet</h2>
      
      <div className="wallet-input-group">
        <label>Password</label>
        <input
          type="password"
          value={unlockPassword}
          onChange={(e) => setUnlockPassword(e.target.value)}
          placeholder="Enter your password"
          onKeyDown={(e) => e.key === 'Enter' && handleUnlockWallet()}
        />
      </div>
      
      {error && <div className="wallet-error">{error}</div>}
      
      <div className="wallet-actions">
        <button className="wallet-btn primary" onClick={handleUnlockWallet} disabled={builtInWallet.loading}>
          {builtInWallet.loading ? 'Unlocking...' : 'Unlock'}
        </button>
      </div>
      
      <button 
        className="wallet-link-btn"
        onClick={handleDeleteWallet}
      >
        Remove wallet from this device
      </button>
    </div>
  )
  
  const renderMain = () => (
    <div className="wallet-main">
      <div className="wallet-header-row">
        <h2>Wallet</h2>
        <button className="wallet-icon-btn" onClick={handleLockWallet} title="Lock wallet">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </button>
      </div>
      
      <div className="wallet-total">
        <span className="wallet-total-label">Total Balance</span>
        <span className="wallet-total-value">${builtInWallet.totalUsd.toFixed(2)}</span>
      </div>
      
      {success && <div className="wallet-success">{success}</div>}
      {error && <div className="wallet-error">{error}</div>}
      
      <div className="wallet-accounts">
        {builtInWallet.addresses && Object.entries(builtInWallet.addresses).map(([chainKey, address]) => {
          const chain = CHAIN_INFO[chainKey]
          if (!chain) return null
          const balance = builtInWallet.balances[chainKey]
          
          return (
            <div key={chainKey} className="wallet-account-card" style={{ borderColor: chain?.color }}>
              <div className="wallet-account-header">
                <span className="wallet-account-icon" style={{ color: chain?.color }}>
                  {chain?.icon}
                </span>
                <span className="wallet-account-name">{chain?.name}</span>
                <span className="wallet-account-balance">
                  {balance ? `${balance.balance} ${chain?.symbol}` : '...'}
                </span>
              </div>
              <div className="wallet-account-address" onClick={() => copyAddress(address)}>
                {address.slice(0, 8)}...{address.slice(-6)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </div>
              {balance && (
                <div className="wallet-account-usd">≈ ${balance.usd.toFixed(2)}</div>
              )}
            </div>
          )
        })}
      </div>
      
      <button 
        className="wallet-btn secondary" 
        onClick={builtInWallet.refreshBalances}
        style={{ marginTop: 16 }}
      >
        Refresh Balances
      </button>
      
      <div className="wallet-divider" />
      
      <h3>Send</h3>
      
      <div className="wallet-input-group">
        <label>Chain</label>
        <select value={sendChain} onChange={(e) => setSendChain(e.target.value)}>
          {Object.entries(CHAIN_INFO).map(([key, chain]) => (
            <option key={key} value={key}>{chain.name} ({chain.symbol})</option>
          ))}
        </select>
      </div>
      
      <div className="wallet-input-group">
        <label>Recipient Address</label>
        <input
          type="text"
          value={sendTo}
          onChange={(e) => setSendTo(e.target.value)}
          placeholder="Enter recipient address"
        />
      </div>
      
      <div className="wallet-input-group">
        <label>Amount ({CHAIN_INFO[sendChain]?.symbol})</label>
        <input
          type="number"
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          placeholder="0.0"
          step="0.001"
        />
      </div>
      
      <div className="wallet-input-group">
        <label>Wallet Password (to sign transaction)</label>
        <input
          type="password"
          value={sendPassword}
          onChange={(e) => setSendPassword(e.target.value)}
          placeholder="Enter password to sign"
        />
      </div>
      
      {gasEstimate && (
        <div className="wallet-gas-estimate">
          <span>
            Estimated Fee
            <InfoTooltip definition={WALLET_DEFINITIONS.gasEstimate} />
          </span>
          <span>{gasEstimate.gasFee} {CHAIN_INFO[sendChain]?.symbol} (≈${gasEstimate.gasFeeUsd?.toFixed(4)})</span>
        </div>
      )}
      
      <button 
        className="wallet-btn primary" 
        onClick={handleSendTransaction} 
        disabled={builtInWallet.loading || !sendTo || !sendAmount || !sendPassword}
      >
        {builtInWallet.loading ? 'Sending...' : 'Send Transaction'}
      </button>
    </div>
  )
  
  return (
    <div className="wallet-manager">
      {view === 'landing' && renderLanding()}
      {view === 'create' && renderCreate()}
      {view === 'backup' && renderBackup()}
      {view === 'import' && renderImport()}
      {view === 'unlock' && renderUnlock()}
      {view === 'main' && renderMain()}
    </div>
  )
}
