import { useMemo, createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

const SOLANA_MAINNET_RPC = clusterApiUrl('mainnet-beta')

const WalletStateContext = createContext(null)

function isMobile() {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function isPhantomInstalled() {
  if (typeof window === 'undefined') return false
  return window.phantom?.solana?.isPhantom || window.solana?.isPhantom
}

function isSolflareInstalled() {
  if (typeof window === 'undefined') return false
  return window.solflare?.isSolflare
}

function SimpleWalletButton() {
  const { publicKey, connected, connecting, disconnect, select, wallets, connect } = useWallet()
  const { setVisible } = useWalletModal()
  const walletState = useContext(WalletStateContext)
  const [error, setError] = useState(null)

  const handleClick = useCallback(async () => {
    setError(null)
    
    if (connected) {
      try {
        await disconnect()
      } catch (err) {
        console.error('Disconnect error:', err)
      }
      return
    }

    try {
      if (isPhantomInstalled()) {
        const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom')
        if (phantomWallet) {
          select(phantomWallet.adapter.name)
          await new Promise(resolve => setTimeout(resolve, 100))
          try {
            await connect()
          } catch (e) {
            console.log('Auto-connect attempted')
          }
        }
      } else if (isSolflareInstalled()) {
        const solflareWallet = wallets.find(w => w.adapter.name === 'Solflare')
        if (solflareWallet) {
          select(solflareWallet.adapter.name)
          await new Promise(resolve => setTimeout(resolve, 100))
          try {
            await connect()
          } catch (e) {
            console.log('Auto-connect attempted')
          }
        }
      } else if (isMobile()) {
        const currentUrl = encodeURIComponent(window.location.href)
        window.location.href = `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`
      } else {
        setVisible(true)
      }
    } catch (err) {
      console.error('Wallet connection error:', err)
      setError('Connection failed')
      setVisible(true)
    }
  }, [connected, disconnect, wallets, select, connect, setVisible])

  const buttonStyle = {
    background: connected 
      ? 'linear-gradient(145deg, rgba(57, 255, 20, 0.2), rgba(57, 255, 20, 0.1))'
      : 'linear-gradient(145deg, #512da8, #7c4dff)',
    border: connected ? '1px solid #39FF14' : 'none',
    borderRadius: '12px',
    color: connected ? '#39FF14' : '#fff',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: connecting ? 'wait' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '120px',
    justifyContent: 'center',
    marginRight: '6px',
  }

  return (
    <button 
      className="wallet-connect-btn"
      onClick={handleClick}
      disabled={connecting}
      style={buttonStyle}
    >
      {connecting ? (
        <span>Connecting...</span>
      ) : connected ? (
        <>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#39FF14',
            boxShadow: '0 0 8px #39FF14',
          }}></span>
          <span>{walletState?.shortAddress || 'Connected'}</span>
          {walletState?.balance && (
            <span style={{ color: '#888', fontSize: '11px' }}>
              ({walletState.balance} SOL)
            </span>
          )}
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M16 12h4"/>
          </svg>
          <span>{error || 'Connect Wallet'}</span>
        </>
      )}
    </button>
  )
}

function WalletStateProvider({ children }) {
  const { publicKey, connected, connecting, disconnecting, wallet } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetchBalance = async () => {
      if (!publicKey || !connected) {
        setBalance(null)
        return
      }

      setBalanceLoading(true)
      try {
        const address = publicKey.toBase58()
        const response = await fetch(`/api/sniper/wallets/balance?address=${address}`)
        
        if (response.ok) {
          const data = await response.json()
          if (mounted && data.balance) {
            setBalance(data.balance)
          }
        }
      } catch (err) {
        console.error('Balance fetch failed:', err)
      } finally {
        if (mounted) setBalanceLoading(false)
      }
    }

    if (connected && publicKey) {
      fetchBalance()
      const interval = setInterval(fetchBalance, 15000)
      return () => {
        mounted = false
        clearInterval(interval)
      }
    }

    return () => { mounted = false }
  }, [publicKey, connected])

  const value = useMemo(() => ({
    publicKey,
    address: publicKey?.toBase58() || null,
    shortAddress: publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : null,
    connected,
    connecting,
    disconnecting,
    wallet,
    walletName: wallet?.adapter?.name || null,
    balance,
    balanceLoading,
    connection,
  }), [publicKey, connected, connecting, disconnecting, wallet, balance, balanceLoading, connection])

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  )
}

function WalletErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (event) => {
      if (event.message?.includes('wallet') || event.message?.includes('Wallet')) {
        console.error('Wallet error caught:', event)
        setHasError(true)
      }
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#ff6b6b' }}>Wallet connection error</p>
        <button 
          onClick={() => { setHasError(false); window.location.reload() }}
          style={{ marginTop: '10px', padding: '8px 16px', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  }

  return children
}

export function WalletProvider({ children }) {
  const endpoint = useMemo(() => SOLANA_MAINNET_RPC, [])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  )

  return (
    <WalletErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <WalletStateProvider>
              {children}
            </WalletStateProvider>
          </WalletModalProvider>
        </SolanaWalletProvider>
      </ConnectionProvider>
    </WalletErrorBoundary>
  )
}

export function useWalletState() {
  const context = useContext(WalletStateContext)
  if (!context) {
    return {
      publicKey: null,
      address: null,
      shortAddress: null,
      connected: false,
      connecting: false,
      disconnecting: false,
      wallet: null,
      walletName: null,
      balance: null,
      balanceLoading: false,
      connection: null,
    }
  }
  return context
}

export { SimpleWalletButton as WalletMultiButton }
