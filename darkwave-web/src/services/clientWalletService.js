import * as bip39 from 'bip39'
import { Buffer } from 'buffer'

const WALLETS_STORAGE_KEY = 'dw_wallets'
const ACTIVE_WALLET_KEY = 'dw_active_wallet'

const SUPPORTED_CHAINS = {
  solana: { name: 'Solana', symbol: 'SOL', isEvm: false },
  ethereum: { name: 'Ethereum', symbol: 'ETH', isEvm: true },
  base: { name: 'Base', symbol: 'ETH', isEvm: true },
  polygon: { name: 'Polygon', symbol: 'MATIC', isEvm: true },
  arbitrum: { name: 'Arbitrum', symbol: 'ETH', isEvm: true },
  bsc: { name: 'BSC', symbol: 'BNB', isEvm: true },
  avalanche: { name: 'Avalanche', symbol: 'AVAX', isEvm: true },
  fantom: { name: 'Fantom', symbol: 'FTM', isEvm: true },
  optimism: { name: 'Optimism', symbol: 'ETH', isEvm: true },
  cronos: { name: 'Cronos', symbol: 'CRO', isEvm: true },
  gnosis: { name: 'Gnosis', symbol: 'xDAI', isEvm: true },
  celo: { name: 'Celo', symbol: 'CELO', isEvm: true },
  moonbeam: { name: 'Moonbeam', symbol: 'GLMR', isEvm: true },
  moonriver: { name: 'Moonriver', symbol: 'MOVR', isEvm: true },
  harmony: { name: 'Harmony', symbol: 'ONE', isEvm: true },
  metis: { name: 'Metis', symbol: 'METIS', isEvm: true },
  aurora: { name: 'Aurora', symbol: 'ETH', isEvm: true },
  zksync: { name: 'zkSync Era', symbol: 'ETH', isEvm: true },
  linea: { name: 'Linea', symbol: 'ETH', isEvm: true },
  scroll: { name: 'Scroll', symbol: 'ETH', isEvm: true },
  mantle: { name: 'Mantle', symbol: 'MNT', isEvm: true },
  blast: { name: 'Blast', symbol: 'ETH', isEvm: true },
}

async function deriveKey(password, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptMnemonic(mnemonic, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const encoder = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(mnemonic)
  )
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)
  return Buffer.from(combined).toString('base64')
}

async function decryptMnemonic(encryptedData, password) {
  const data = Buffer.from(encryptedData, 'base64')
  const salt = data.slice(0, 16)
  const iv = data.slice(16, 28)
  const encrypted = data.slice(28)
  const key = await deriveKey(password, salt)
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    throw new Error('Invalid password')
  }
}

async function deriveEVMAddress(mnemonic, chainId) {
  const { ethers } = await import('ethers')
  const wallet = ethers.Wallet.fromPhrase(mnemonic)
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  }
}

async function deriveSolanaAddress(mnemonic) {
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const path = "m/44'/501'/0'/0'"
  const { derivePath } = await import('ed25519-hd-key')
  const { key } = derivePath(path, Buffer.from(seed).toString('hex'))
  const nacl = await import('tweetnacl')
  const { Keypair } = await import('@solana/web3.js')
  const keypair = Keypair.fromSeed(Uint8Array.from(key.slice(0, 32)))
  const { default: bs58 } = await import('bs58')
  return {
    address: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey)
  }
}

function generateWalletId() {
  return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getWalletsFromStorage() {
  try {
    const data = localStorage.getItem(WALLETS_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveWalletsToStorage(wallets) {
  localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets))
}

function getActiveWalletId() {
  return localStorage.getItem(ACTIVE_WALLET_KEY)
}

function setActiveWalletId(walletId) {
  localStorage.setItem(ACTIVE_WALLET_KEY, walletId)
}

export const clientWalletService = {
  SUPPORTED_CHAINS,
  
  getWallets() {
    return getWalletsFromStorage().map(w => ({
      id: w.id,
      name: w.name,
      createdAt: w.createdAt,
      isActive: w.id === getActiveWalletId()
    }))
  },
  
  getActiveWallet() {
    const wallets = getWalletsFromStorage()
    const activeId = getActiveWalletId()
    return wallets.find(w => w.id === activeId) || wallets[0] || null
  },
  
  hasWallet() {
    return getWalletsFromStorage().length > 0
  },
  
  hasLegacyWallet() {
    return !!localStorage.getItem('dw_wallet_encrypted')
  },
  
  async migrateLegacyWallet(password) {
    const legacyEncrypted = localStorage.getItem('dw_wallet_encrypted')
    if (!legacyEncrypted) return false
    
    try {
      const mnemonic = await decryptMnemonic(legacyEncrypted, password)
      const walletId = generateWalletId()
      const addresses = await this.deriveAllAddresses(mnemonic)
      
      const newWallet = {
        id: walletId,
        name: 'My Wallet',
        encrypted: legacyEncrypted,
        createdAt: new Date().toISOString()
      }
      
      saveWalletsToStorage([newWallet])
      setActiveWalletId(walletId)
      localStorage.removeItem('dw_wallet_encrypted')
      
      return { addresses, walletId }
    } catch (err) {
      throw err
    }
  },

  async createWallet(password, name = 'Wallet', wordCount = 12) {
    const strength = wordCount === 24 ? 256 : 128
    const mnemonic = bip39.generateMnemonic(strength)
    const encrypted = await encryptMnemonic(mnemonic, password)
    const walletId = generateWalletId()
    
    const wallets = getWalletsFromStorage()
    const walletCount = wallets.length
    const walletName = name || `Wallet ${walletCount + 1}`
    
    const newWallet = {
      id: walletId,
      name: walletName,
      encrypted,
      createdAt: new Date().toISOString()
    }
    
    wallets.push(newWallet)
    saveWalletsToStorage(wallets)
    setActiveWalletId(walletId)
    
    const addresses = await this.deriveAllAddresses(mnemonic)
    return { mnemonic, addresses, walletId }
  },

  async importWallet(mnemonic, password, name = 'Imported Wallet') {
    if (!bip39.validateMnemonic(mnemonic.trim())) {
      throw new Error('Invalid recovery phrase')
    }
    const encrypted = await encryptMnemonic(mnemonic.trim(), password)
    const walletId = generateWalletId()
    
    const wallets = getWalletsFromStorage()
    const newWallet = {
      id: walletId,
      name,
      encrypted,
      createdAt: new Date().toISOString()
    }
    
    wallets.push(newWallet)
    saveWalletsToStorage(wallets)
    setActiveWalletId(walletId)
    
    const addresses = await this.deriveAllAddresses(mnemonic.trim())
    return { addresses, walletId }
  },
  
  switchWallet(walletId) {
    const wallets = getWalletsFromStorage()
    const wallet = wallets.find(w => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')
    setActiveWalletId(walletId)
    return wallet
  },
  
  renameWallet(walletId, newName) {
    const wallets = getWalletsFromStorage()
    const wallet = wallets.find(w => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')
    wallet.name = newName
    saveWalletsToStorage(wallets)
    return wallet
  },

  async unlock(password, walletId = null) {
    const wallets = getWalletsFromStorage()
    const targetId = walletId || getActiveWalletId()
    const wallet = wallets.find(w => w.id === targetId) || wallets[0]
    
    if (!wallet) throw new Error('No wallet found')
    
    const mnemonic = await decryptMnemonic(wallet.encrypted, password)
    const addresses = await this.deriveAllAddresses(mnemonic)
    setActiveWalletId(wallet.id)
    return { mnemonic, addresses, walletId: wallet.id, walletName: wallet.name }
  },

  async deriveAllAddresses(mnemonic) {
    const [evm, solana] = await Promise.all([
      deriveEVMAddress(mnemonic),
      deriveSolanaAddress(mnemonic)
    ])
    
    const addresses = {
      solana: solana.address,
    }
    
    Object.keys(SUPPORTED_CHAINS).forEach(chainId => {
      if (SUPPORTED_CHAINS[chainId].isEvm) {
        addresses[chainId] = evm.address
      }
    })
    
    return addresses
  },

  async getPrivateKey(password, chain, walletId = null) {
    const wallets = getWalletsFromStorage()
    const targetId = walletId || getActiveWalletId()
    const wallet = wallets.find(w => w.id === targetId)
    
    if (!wallet) throw new Error('No wallet found')
    
    const mnemonic = await decryptMnemonic(wallet.encrypted, password)
    if (chain === 'solana') {
      const result = await deriveSolanaAddress(mnemonic)
      return result.privateKey
    } else {
      const result = await deriveEVMAddress(mnemonic, chain)
      return result.privateKey
    }
  },

  deleteWallet(walletId) {
    let wallets = getWalletsFromStorage()
    wallets = wallets.filter(w => w.id !== walletId)
    saveWalletsToStorage(wallets)
    
    if (getActiveWalletId() === walletId) {
      if (wallets.length > 0) {
        setActiveWalletId(wallets[0].id)
      } else {
        localStorage.removeItem(ACTIVE_WALLET_KEY)
      }
    }
    
    return wallets.length
  },
  
  deleteAllWallets() {
    localStorage.removeItem(WALLETS_STORAGE_KEY)
    localStorage.removeItem(ACTIVE_WALLET_KEY)
  }
}

export default clientWalletService
