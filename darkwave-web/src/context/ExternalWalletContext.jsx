import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"

const ExternalWalletContext = createContext(null)

function isMobile() {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function ExternalWalletProvider({ children }) {
  const [state, setState] = useState({
    evmAddress: null,
    solanaAddress: null,
    isConnecting: false,
    isConnected: false,
    chainId: null,
    error: null,
  })
  const [hasMetaMask, setHasMetaMask] = useState(false)
  const [hasPhantom, setHasPhantom] = useState(false)
  const [evmBalances, setEvmBalances] = useState({})
  const [solanaBalance, setSolanaBalance] = useState(null)

  useEffect(() => {
    setHasMetaMask(typeof window !== "undefined" && !!window.ethereum)
    setHasPhantom(typeof window !== "undefined" && !!window.solana?.isPhantom)
    
    const savedEvm = localStorage.getItem("dw_evm_address")
    const savedSolana = localStorage.getItem("dw_solana_address")
    const savedChainId = localStorage.getItem("dw_chain_id")
    
    if (savedEvm || savedSolana) {
      setState(prev => ({
        ...prev,
        evmAddress: savedEvm,
        solanaAddress: savedSolana,
        chainId: savedChainId,
        isConnected: !!(savedEvm || savedSolana),
      }))
      if (savedSolana) fetchSolanaBalance(savedSolana)
      if (savedEvm) fetchEvmBalance(savedEvm, savedChainId)
    }
    
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const handleAccountsChanged = (accounts) => {
    const accs = accounts
    if (accs.length === 0) {
      setState(prev => ({ ...prev, evmAddress: null, isConnected: !!prev.solanaAddress }))
      localStorage.removeItem("dw_evm_address")
      setEvmBalances({})
    } else {
      setState(prev => ({ ...prev, evmAddress: accs[0], isConnected: true }))
      localStorage.setItem("dw_evm_address", accs[0])
      fetchEvmBalance(accs[0], state.chainId)
    }
  }

  const handleChainChanged = (chainId) => {
    setState(prev => ({ ...prev, chainId: chainId }))
    localStorage.setItem("dw_chain_id", chainId)
    if (state.evmAddress) {
      fetchEvmBalance(state.evmAddress, chainId)
    }
  }

  const fetchSolanaBalance = async (address) => {
    try {
      const res = await fetch(`/api/sniper/wallets/balance?address=${address}`)
      if (res.ok) {
        const data = await res.json()
        setSolanaBalance(data.balance || '0')
      }
    } catch (err) {
      console.error('Solana balance fetch error:', err)
    }
  }

  const fetchEvmBalance = async (address, chainId) => {
    try {
      const chain = getChainName(chainId)
      const res = await fetch(`/api/wallet/evm-balance?address=${address}&chain=${chain}`)
      if (res.ok) {
        const data = await res.json()
        setEvmBalances(prev => ({ ...prev, [chain]: data.balance || '0' }))
      }
    } catch (err) {
      console.error('EVM balance fetch error:', err)
    }
  }

  const getChainName = (chainId) => {
    const chains = {
      '0x1': 'ethereum',
      '0x89': 'polygon',
      '0xa86a': 'avalanche',
      '0xa4b1': 'arbitrum',
      '0x2105': 'base',
      '0x38': 'bsc',
      '0xa': 'optimism',
    }
    return chains[chainId] || 'ethereum'
  }

  const connectEVM = useCallback(async () => {
    if (!window.ethereum) {
      const currentUrl = window.location.href.replace('https://', '').replace('http://', '')
      
      if (isMobile()) {
        const metamaskDeepLink = `metamask://dapp/${currentUrl}`
        const fallbackUrl = `https://metamask.app.link/dapp/${currentUrl}`
        
        const timeout = setTimeout(() => {
          window.location.href = fallbackUrl
        }, 2500)
        
        window.location.href = metamaskDeepLink
        window.addEventListener('blur', () => clearTimeout(timeout), { once: true })
      } else {
        window.open('https://metamask.io/download/', '_blank')
      }
      return
    }
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }))
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      
      if (accounts.length > 0) {
        setState(prev => ({
          ...prev,
          evmAddress: accounts[0],
          chainId,
          isConnected: true,
          isConnecting: false,
        }))
        localStorage.setItem("dw_evm_address", accounts[0])
        localStorage.setItem("dw_chain_id", chainId)
        fetchEvmBalance(accounts[0], chainId)
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || "Failed to connect MetaMask",
      }))
    }
  }, [])

  const connectSolana = useCallback(async () => {
    if (!window.solana?.isPhantom) {
      const currentUrl = window.location.href
      const ref = encodeURIComponent(window.location.origin)
      const encodedUrl = encodeURIComponent(currentUrl)
      
      if (isMobile()) {
        const phantomDeepLink = `phantom://browse/${encodedUrl}?ref=${ref}`
        const fallbackUrl = `https://phantom.app/ul/browse/${encodedUrl}?ref=${ref}`
        
        const timeout = setTimeout(() => {
          window.location.href = fallbackUrl
        }, 2500)
        
        window.location.href = phantomDeepLink
        window.addEventListener('blur', () => clearTimeout(timeout), { once: true })
      } else {
        window.open('https://phantom.app/', '_blank')
      }
      return
    }
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }))
    try {
      const response = await window.solana.connect()
      const address = response.publicKey.toString()
      
      setState(prev => ({
        ...prev,
        solanaAddress: address,
        isConnected: true,
        isConnecting: false,
      }))
      localStorage.setItem("dw_solana_address", address)
      fetchSolanaBalance(address)
    } catch (err) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || "Failed to connect Phantom",
      }))
    }
  }, [])

  const switchNetwork = useCallback(async (chainId) => {
    if (!window.ethereum) return
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainId.toString(16) }]
      })
    } catch (err) {
      console.error('Network switch error:', err)
      throw err
    }
  }, [])

  const signEvmTransaction = useCallback(async (txParams) => {
    if (!state.evmAddress) throw new Error('EVM wallet not connected')
    
    const params = {
      from: state.evmAddress,
      to: txParams.to,
      value: txParams.value ? '0x' + BigInt(txParams.value).toString(16) : '0x0',
      data: txParams.data || '0x',
      gas: txParams.gasLimit ? '0x' + BigInt(txParams.gasLimit).toString(16) : undefined,
    }
    
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [params],
    })
    
    return { hash: txHash, status: 'pending' }
  }, [state.evmAddress])

  const signSolanaTransaction = useCallback(async (transaction) => {
    if (!state.solanaAddress) throw new Error('Solana wallet not connected')
    if (!window.solana) throw new Error('Phantom not available')
    
    const signedTx = await window.solana.signTransaction(transaction)
    return signedTx
  }, [state.solanaAddress])

  const signMessage = useCallback(async (message, chain = 'evm') => {
    if (chain === 'solana') {
      if (!window.solana || !state.solanaAddress) throw new Error('Solana wallet not connected')
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8')
      const bytes = new Uint8Array(signedMessage.signature)
      return btoa(String.fromCharCode(...bytes))
    } else {
      if (!window.ethereum || !state.evmAddress) throw new Error('EVM wallet not connected')
      return await window.ethereum.request({
        method: 'personal_sign',
        params: [message, state.evmAddress],
      })
    }
  }, [state.evmAddress, state.solanaAddress])

  const disconnect = useCallback(() => {
    if (window.solana) {
      window.solana.disconnect().catch(() => {})
    }
    setState({
      evmAddress: null,
      solanaAddress: null,
      isConnecting: false,
      isConnected: false,
      chainId: null,
      error: null,
    })
    setEvmBalances({})
    setSolanaBalance(null)
    localStorage.removeItem("dw_evm_address")
    localStorage.removeItem("dw_solana_address")
    localStorage.removeItem("dw_chain_id")
  }, [])

  const refreshBalances = useCallback(() => {
    if (state.solanaAddress) fetchSolanaBalance(state.solanaAddress)
    if (state.evmAddress) fetchEvmBalance(state.evmAddress, state.chainId)
  }, [state.solanaAddress, state.evmAddress, state.chainId])

  const shortenAddress = (address, chars = 4) => {
    if (!address) return ''
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
  }

  const value = useMemo(() => ({
    ...state,
    hasMetaMask,
    hasPhantom,
    evmBalances,
    solanaBalance,
    evmShortAddress: state.evmAddress ? shortenAddress(state.evmAddress) : null,
    solanaShortAddress: state.solanaAddress ? shortenAddress(state.solanaAddress) : null,
    connectEVM,
    connectSolana,
    disconnect,
    switchNetwork,
    signEvmTransaction,
    signSolanaTransaction,
    signMessage,
    refreshBalances,
    getChainName,
  }), [state, hasMetaMask, hasPhantom, evmBalances, solanaBalance, connectEVM, connectSolana, disconnect, switchNetwork, signEvmTransaction, signSolanaTransaction, signMessage, refreshBalances])

  return (
    <ExternalWalletContext.Provider value={value}>
      {children}
    </ExternalWalletContext.Provider>
  )
}

export function useExternalWallet() {
  const context = useContext(ExternalWalletContext)
  if (!context) {
    return {
      evmAddress: null,
      solanaAddress: null,
      isConnecting: false,
      isConnected: false,
      chainId: null,
      error: null,
      hasMetaMask: false,
      hasPhantom: false,
      evmBalances: {},
      solanaBalance: null,
      evmShortAddress: null,
      solanaShortAddress: null,
      connectEVM: async () => {},
      connectSolana: async () => {},
      disconnect: () => {},
      switchNetwork: async () => {},
      signEvmTransaction: async () => null,
      signSolanaTransaction: async () => null,
      signMessage: async () => null,
      refreshBalances: () => {},
      getChainName: () => 'ethereum',
    }
  }
  return context
}

export default ExternalWalletContext
