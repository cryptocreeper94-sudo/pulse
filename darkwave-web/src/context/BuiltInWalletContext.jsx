import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import clientWalletService from '../services/clientWalletService'

const BuiltInWalletContext = createContext(null)

export function BuiltInWalletProvider({ children }) {
  const [wallets, setWallets] = useState([])
  const [activeWalletId, setActiveWalletId] = useState(null)
  const [hasWallet, setHasWallet] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [addresses, setAddresses] = useState(null)
  const [balances, setBalances] = useState({})
  const [totalUsd, setTotalUsd] = useState(0)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const loadedWallets = clientWalletService.getWallets()
    setWallets(loadedWallets)
    setHasWallet(loadedWallets.length > 0)
    const active = loadedWallets.find(w => w.isActive)
    if (active) setActiveWalletId(active.id)
  }, [])
  
  const refreshWalletList = useCallback(() => {
    const loadedWallets = clientWalletService.getWallets()
    setWallets(loadedWallets)
    setHasWallet(loadedWallets.length > 0)
  }, [])
  
  const createWallet = useCallback(async (password, name, wordCount = 12) => {
    setLoading(true)
    try {
      const result = await clientWalletService.createWallet(password, name, wordCount)
      setHasWallet(true)
      setAddresses(result.addresses)
      setActiveWalletId(result.walletId)
      setIsUnlocked(true)
      refreshWalletList()
      fetchBalances(result.addresses)
      return result.mnemonic
    } finally {
      setLoading(false)
    }
  }, [refreshWalletList])
  
  const importWallet = useCallback(async (mnemonic, password, name) => {
    setLoading(true)
    try {
      const result = await clientWalletService.importWallet(mnemonic, password, name)
      setHasWallet(true)
      setAddresses(result.addresses)
      setActiveWalletId(result.walletId)
      setIsUnlocked(true)
      refreshWalletList()
      fetchBalances(result.addresses)
      return true
    } finally {
      setLoading(false)
    }
  }, [refreshWalletList])
  
  const unlock = useCallback(async (password, walletId = null) => {
    setLoading(true)
    try {
      const result = await clientWalletService.unlock(password, walletId)
      setAddresses(result.addresses)
      setActiveWalletId(result.walletId)
      setIsUnlocked(true)
      fetchBalances(result.addresses)
      return true
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  const switchWallet = useCallback(async (walletId, password) => {
    setLoading(true)
    try {
      clientWalletService.switchWallet(walletId)
      const result = await clientWalletService.unlock(password, walletId)
      setAddresses(result.addresses)
      setActiveWalletId(walletId)
      setIsUnlocked(true)
      refreshWalletList()
      fetchBalances(result.addresses)
      return true
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }, [refreshWalletList])
  
  const renameWallet = useCallback((walletId, newName) => {
    clientWalletService.renameWallet(walletId, newName)
    refreshWalletList()
  }, [refreshWalletList])
  
  const deleteWallet = useCallback((walletId) => {
    const remainingCount = clientWalletService.deleteWallet(walletId)
    refreshWalletList()
    if (remainingCount === 0) {
      setHasWallet(false)
      setIsUnlocked(false)
      setAddresses(null)
      setBalances({})
      setTotalUsd(0)
    }
  }, [refreshWalletList])
  
  const lock = useCallback(() => {
    setAddresses(null)
    setBalances({})
    setTotalUsd(0)
    setIsUnlocked(false)
  }, [])
  
  const deleteAllWallets = useCallback(() => {
    clientWalletService.deleteAllWallets()
    setWallets([])
    setHasWallet(false)
    lock()
  }, [lock])
  
  const fetchBalances = useCallback(async (addrs) => {
    if (!addrs) return
    const accounts = Object.entries(addrs).map(([chain, address]) => ({ chain, address }))
    try {
      const res = await fetch('/api/wallet/balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts }),
      })
      const data = await res.json()
      if (data.success) {
        setBalances(data.balances)
        setTotalUsd(data.totalUsd)
      }
    } catch (err) {
      console.error('Balance fetch error:', err)
    }
  }, [])
  
  const refreshBalances = useCallback(() => {
    if (addresses) {
      fetchBalances(addresses)
    }
  }, [addresses, fetchBalances])
  
  const getSolanaAddress = useCallback(() => {
    return addresses?.solana || null
  }, [addresses])
  
  const getEvmAddress = useCallback(() => {
    return addresses?.ethereum || null
  }, [addresses])
  
  const getSolanaBalance = useCallback(() => {
    return balances.solana?.balance || 0
  }, [balances])
  
  const signAndSend = useCallback(async (password, chain, to, amount) => {
    if (!isUnlocked) throw new Error('Wallet not unlocked')
    const privateKey = await clientWalletService.getPrivateKey(password, chain)
    const res = await fetch('/api/wallet/send-signed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chain,
        privateKey,
        to,
        amount,
      }),
    })
    const data = await res.json()
    if (data.success) {
      refreshBalances()
    }
    return data
  }, [isUnlocked, refreshBalances])
  
  const signAndSendSolana = useCallback(async (password, to, amount) => {
    return signAndSend(password, 'solana', to, amount)
  }, [signAndSend])
  
  const value = {
    wallets,
    activeWalletId,
    hasWallet,
    isUnlocked,
    loading,
    addresses,
    balances,
    totalUsd,
    supportedChains: clientWalletService.SUPPORTED_CHAINS,
    createWallet,
    importWallet,
    unlock,
    switchWallet,
    renameWallet,
    deleteWallet,
    deleteAllWallets,
    lock,
    refreshBalances,
    refreshWalletList,
    getSolanaAddress,
    getEvmAddress,
    getSolanaBalance,
    signAndSend,
    signAndSendSolana,
    solanaAddress: addresses?.solana || null,
    solanaBalance: getSolanaBalance(),
  }
  
  return (
    <BuiltInWalletContext.Provider value={value}>
      {children}
    </BuiltInWalletContext.Provider>
  )
}

export function useBuiltInWallet() {
  const context = useContext(BuiltInWalletContext)
  if (!context) {
    return {
      wallets: [],
      activeWalletId: null,
      hasWallet: false,
      isUnlocked: false,
      addresses: null,
      balances: {},
      totalUsd: 0,
      loading: false,
      supportedChains: {},
      solanaAddress: null,
      solanaBalance: 0,
      createWallet: async () => {},
      importWallet: async () => {},
      unlock: async () => {},
      switchWallet: async () => {},
      renameWallet: () => {},
      deleteWallet: () => {},
      deleteAllWallets: () => {},
      lock: () => {},
      refreshBalances: async () => {},
      refreshWalletList: () => {},
      signSolanaTransaction: async () => null,
      signEvmTransaction: async () => null,
    }
  }
  return context
}

export default BuiltInWalletContext
