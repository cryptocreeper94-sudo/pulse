import { useMemo, createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

const SOLANA_MAINNET_RPC = clusterApiUrl('mainnet-beta')

const WalletStateContext = createContext(null)

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function isPhantomInstalled() {
  return typeof window !== 'undefined' && window.solana?.isPhantom
}

function isSolflareInstalled() {
  return typeof window !== 'undefined' && window.solflare?.isSolflare
}

function MobileWalletButton({ walletName = 'phantom' }) {
  const handleConnect = useCallback(() => {
    const currentUrl = window.location.href
    const encodedUrl = encodeURIComponent(currentUrl)
    
    if (walletName === 'phantom') {
      const phantomUrl = `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedUrl}`
      window.location.href = phantomUrl
    } else if (walletName === 'solflare') {
      const solflareUrl = `https://solflare.com/ul/v1/browse/${encodedUrl}?ref=${encodedUrl}`
      window.location.href = solflareUrl
    }
  }, [walletName])

  return (
    <button 
      className="mobile-wallet-btn"
      onClick={handleConnect}
      style={{
        background: 'linear-gradient(145deg, #512da8, #7c4dff)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>Open in {walletName === 'phantom' ? 'Phantom' : 'Solflare'}</span>
    </button>
  )
}

function CustomWalletButton() {
  const { publicKey, connected, connecting, disconnect, select, wallets } = useWallet()
  const { setVisible } = useWalletModal()
  const [showMobileOptions, setShowMobileOptions] = useState(false)
  const walletState = useContext(WalletStateContext)

  const handleClick = useCallback(() => {
    if (connected) {
      disconnect()
    } else if (isMobile() && !isPhantomInstalled() && !isSolflareInstalled()) {
      setShowMobileOptions(true)
    } else {
      setVisible(true)
    }
  }, [connected, disconnect, setVisible])

  if (showMobileOptions) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
          Open app to connect:
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <MobileWalletButton walletName="phantom" />
          <MobileWalletButton walletName="solflare" />
        </div>
        <button 
          onClick={() => setShowMobileOptions(false)}
          style={{
            background: 'transparent',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#888',
            padding: '8px 16px',
            fontSize: '12px',
            cursor: 'pointer',
            marginTop: '4px',
          }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button 
      className="custom-wallet-btn"
      onClick={handleClick}
      disabled={connecting}
      style={{
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
        minWidth: '140px',
        justifyContent: 'center',
      }}
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
          {walletState?.balance !== null && (
            <span style={{ color: '#888', fontSize: '11px' }}>
              ({walletState.balance.toFixed(2)} SOL)
            </span>
          )}
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1"/>
            <polyline points="15 10 20 10 20 14 15 14"/>
            <line x1="20" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Connect Wallet</span>
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
        const bal = await connection.getBalance(publicKey)
        if (mounted) {
          setBalance(bal / LAMPORTS_PER_SOL)
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err)
        if (mounted) setBalance(null)
      } finally {
        if (mounted) setBalanceLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [publicKey, connected, connection])

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
    isMobile: isMobile(),
    isPhantomInstalled: isPhantomInstalled(),
    isSolflareInstalled: isSolflareInstalled(),
  }), [publicKey, connected, connecting, disconnecting, wallet, balance, balanceLoading, connection])

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  )
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
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletStateProvider>
            {children}
          </WalletStateProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

export function useWalletState() {
  const context = useContext(WalletStateContext)
  if (!context) {
    throw new Error('useWalletState must be used within a WalletProvider')
  }
  return context
}

export { CustomWalletButton as WalletMultiButton }
