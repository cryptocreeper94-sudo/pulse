import { useCallback, useState, useEffect } from 'react'

const CHAIN_NAMES = {
  1: 'ethereum',
  8453: 'base',
  42161: 'arbitrum',
  137: 'polygon',
  10: 'optimism',
  56: 'bsc',
  43114: 'avalanche',
}

const CHAIN_SYMBOLS = {
  1: 'ETH',
  8453: 'ETH',
  42161: 'ETH',
  137: 'MATIC',
  10: 'ETH',
  56: 'BNB',
  43114: 'AVAX',
}

export function useEthereumWallet() {
  const [wallet, setWallet] = useState(null)
  const [balances, setBalances] = useState([])
  const [balancesLoading, setBalancesLoading] = useState(false)

  const connectMetaMask = useCallback(async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
        const chainId = parseInt(chainIdHex, 16)
        const address = accounts[0]
        
        const w = {
          address,
          chainId,
          chainName: CHAIN_NAMES[chainId] || 'unknown',
          providerName: 'MetaMask',
          connectedAt: new Date().toISOString()
        }
        setWallet(w)
        fetchBalances(address, chainId)
        return w
      } catch (err) {
        console.error('MetaMask connect error', err)
        throw err
      }
    } else {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const currentUrl = window.location.href.replace('https://', '').replace('http://', '')
      
      if (isMobile) {
        window.location.href = `https://metamask.app.link/dapp/${currentUrl}`
      } else {
        window.open('https://metamask.io/download/', '_blank')
      }
      throw new Error('MetaMask not found')
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet(null)
    setBalances([])
  }, [])

  const switchNetwork = useCallback(async (chainId) => {
    if (!window.ethereum) throw new Error('No ethereum provider')
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainId.toString(16) }]
      })
      
      if (wallet) {
        const updatedWallet = {
          ...wallet,
          chainId,
          chainName: CHAIN_NAMES[chainId] || 'unknown'
        }
        setWallet(updatedWallet)
        fetchBalances(wallet.address, chainId)
      }
    } catch (err) {
      console.warn('Network switch request failed', err)
      throw err
    }
  }, [wallet])

  const fetchBalances = useCallback(async (address, chainId) => {
    if (!address) return
    setBalancesLoading(true)
    try {
      if (!window.ethereum) {
        setBalances([{ tokenAddress: null, symbol: 'ETH', decimals: 18, amountRaw: '0', amount: '0' }])
        return
      }
      
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })
      
      const balanceWei = BigInt(balanceHex)
      const balanceEth = Number(balanceWei) / (10 ** 18)
      const symbol = CHAIN_SYMBOLS[chainId] || 'ETH'
      
      setBalances([{
        tokenAddress: null,
        symbol,
        decimals: 18,
        amountRaw: balanceWei.toString(),
        amount: balanceEth.toFixed(6)
      }])
    } catch (err) {
      console.error('Failed to fetch balance:', err)
      setBalances([{ tokenAddress: null, symbol: 'ETH', decimals: 18, amountRaw: '0', amount: '0' }])
    } finally {
      setBalancesLoading(false)
    }
  }, [])

  const signTransaction = useCallback(async (tx) => {
    if (!wallet) throw new Error('Wallet not connected')
    if (!window.ethereum) throw new Error('No Ethereum provider found')
    
    try {
      const txParams = {
        from: wallet.address,
        to: tx.to,
        value: tx.value ? '0x' + BigInt(tx.value).toString(16) : '0x0',
        data: tx.data || '0x',
      }
      
      if (tx.gasLimit) {
        txParams.gas = '0x' + BigInt(tx.gasLimit).toString(16)
      }
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      })
      
      return { ...tx, signedRaw: txHash, hash: txHash }
    } catch (err) {
      console.error('Transaction signing failed:', err)
      throw new Error(err.message || 'Failed to sign transaction')
    }
  }, [wallet])

  const signMessage = useCallback(async (message) => {
    if (!wallet) throw new Error('Wallet not connected')
    if (!window.ethereum) throw new Error('No Ethereum provider found')
    
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, wallet.address],
      })
      return signature
    } catch (err) {
      throw new Error(err.message || 'Failed to sign message')
    }
  }, [wallet])

  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setWallet(null)
        setBalances([])
      } else if (wallet && accounts[0] !== wallet.address) {
        const updatedWallet = { ...wallet, address: accounts[0] }
        setWallet(updatedWallet)
        fetchBalances(accounts[0], wallet.chainId)
      }
    }

    const handleChainChanged = (chainIdHex) => {
      const chainId = parseInt(chainIdHex, 16)
      if (wallet) {
        const updatedWallet = {
          ...wallet,
          chainId,
          chainName: CHAIN_NAMES[chainId] || 'unknown'
        }
        setWallet(updatedWallet)
        fetchBalances(wallet.address, chainId)
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [wallet, fetchBalances])

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
            const chainId = parseInt(chainIdHex, 16)
            const w = {
              address: accounts[0],
              chainId,
              chainName: CHAIN_NAMES[chainId] || 'unknown',
              providerName: 'MetaMask',
              connectedAt: new Date().toISOString()
            }
            setWallet(w)
            fetchBalances(accounts[0], chainId)
          }
        } catch (e) {}
      }
    }
    checkConnection()
  }, [fetchBalances])

  return {
    wallet,
    connectMetaMask,
    disconnect,
    switchNetwork,
    balances,
    balancesLoading,
    signTransaction,
    signMessage,
    refreshBalances: () => wallet && fetchBalances(wallet.address, wallet.chainId),
  }
}

export default useEthereumWallet
