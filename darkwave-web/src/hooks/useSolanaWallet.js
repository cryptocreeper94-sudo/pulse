import { useCallback, useState, useEffect } from 'react'

export function useSolanaWallet() {
  const [wallet, setWallet] = useState(null)
  const [balances, setBalances] = useState([])
  const [balancesLoading, setBalancesLoading] = useState(false)

  const connectPhantom = useCallback(async () => {
    const provider = window.solana
    if (provider && provider.isPhantom) {
      try {
        const resp = await provider.connect()
        const w = {
          publicKey: resp.publicKey.toString(),
          cluster: 'mainnet-beta',
          providerName: 'Phantom',
          connectedAt: new Date().toISOString()
        }
        setWallet(w)
        fetchBalances(w.publicKey)
        return w
      } catch (err) {
        console.error('Phantom connect error', err)
        throw err
      }
    } else {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const currentUrl = window.location.href
      const ref = encodeURIComponent(window.location.origin)
      const encodedUrl = encodeURIComponent(currentUrl)
      
      if (isMobile) {
        window.location.href = `https://phantom.app/ul/browse/${encodedUrl}?ref=${ref}`
      } else {
        window.open('https://phantom.app/', '_blank')
      }
      throw new Error('Phantom not available')
    }
  }, [])

  const disconnect = useCallback(async () => {
    if (window.solana) {
      try {
        await window.solana.disconnect()
      } catch (e) {}
    }
    setWallet(null)
    setBalances([])
  }, [])

  const fetchBalances = useCallback(async (publicKey) => {
    if (!publicKey) return
    setBalancesLoading(true)
    try {
      const endpoint = 'https://api.mainnet-beta.solana.com'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [publicKey],
        }),
      })
      
      const data = await response.json()
      const lamports = data.result?.value || 0
      const solBalance = lamports / (10 ** 9)
      
      setBalances([{
        tokenAddress: null,
        symbol: 'SOL',
        decimals: 9,
        amountRaw: lamports.toString(),
        amount: solBalance.toFixed(6)
      }])
    } catch (err) {
      console.error('Failed to fetch SOL balance:', err)
      setBalances([{ tokenAddress: null, symbol: 'SOL', decimals: 9, amountRaw: '0', amount: '0' }])
    } finally {
      setBalancesLoading(false)
    }
  }, [])

  const signTransaction = useCallback(async (tx) => {
    if (!wallet) throw new Error('Wallet not connected')
    const provider = window.solana
    if (!provider || !provider.isPhantom) throw new Error('Phantom wallet not found')
    
    try {
      if (tx.rawTransaction) {
        const signedTx = await provider.signTransaction(tx.rawTransaction)
        return { ...tx, signature: signedTx.signature?.toString() || 'signed', status: 'confirmed' }
      }
      return { ...tx, signature: 'pending', status: 'pending' }
    } catch (err) {
      console.error('Solana transaction signing failed:', err)
      throw new Error(err.message || 'Failed to sign transaction')
    }
  }, [wallet])

  const signAndSendTransaction = useCallback(async (transaction) => {
    if (!wallet) throw new Error('Wallet not connected')
    const provider = window.solana
    if (!provider || !provider.isPhantom) throw new Error('Phantom wallet not found')
    
    try {
      const { signature } = await provider.signAndSendTransaction(transaction)
      return signature
    } catch (err) {
      console.error('Solana transaction failed:', err)
      throw new Error(err.message || 'Failed to send transaction')
    }
  }, [wallet])

  const signMessage = useCallback(async (message) => {
    if (!wallet) throw new Error('Wallet not connected')
    const provider = window.solana
    if (!provider || !provider.isPhantom) throw new Error('Phantom wallet not found')
    
    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await provider.signMessage(encodedMessage, 'utf8')
      const bytes = new Uint8Array(signedMessage.signature)
      const base64 = btoa(String.fromCharCode(...bytes))
      return base64
    } catch (err) {
      throw new Error(err.message || 'Failed to sign message')
    }
  }, [wallet])

  useEffect(() => {
    const checkConnection = async () => {
      if (window.solana?.isPhantom && window.solana.isConnected) {
        try {
          const resp = await window.solana.connect({ onlyIfTrusted: true })
          if (resp.publicKey) {
            const w = {
              publicKey: resp.publicKey.toString(),
              cluster: 'mainnet-beta',
              providerName: 'Phantom',
              connectedAt: new Date().toISOString()
            }
            setWallet(w)
            fetchBalances(w.publicKey)
          }
        } catch (e) {}
      }
    }
    checkConnection()
  }, [fetchBalances])

  return {
    wallet,
    connectPhantom,
    disconnect,
    balances,
    balancesLoading,
    signTransaction,
    signAndSendTransaction,
    signMessage,
    refreshBalances: () => wallet && fetchBalances(wallet.publicKey),
  }
}

export default useSolanaWallet
