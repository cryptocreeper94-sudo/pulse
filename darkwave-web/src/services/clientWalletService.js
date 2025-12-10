import * as bip39 from 'bip39'
import { Buffer } from 'buffer'

const STORAGE_KEY = 'dw_wallet_encrypted'

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

export const clientWalletService = {
  hasWallet() {
    return !!localStorage.getItem(STORAGE_KEY)
  },

  async createWallet(password, wordCount = 12) {
    const strength = wordCount === 24 ? 256 : 128
    const mnemonic = bip39.generateMnemonic(strength)
    const encrypted = await encryptMnemonic(mnemonic, password)
    localStorage.setItem(STORAGE_KEY, encrypted)
    const addresses = await this.deriveAllAddresses(mnemonic)
    return { mnemonic, addresses }
  },

  async importWallet(mnemonic, password) {
    if (!bip39.validateMnemonic(mnemonic.trim())) {
      throw new Error('Invalid recovery phrase')
    }
    const encrypted = await encryptMnemonic(mnemonic.trim(), password)
    localStorage.setItem(STORAGE_KEY, encrypted)
    const addresses = await this.deriveAllAddresses(mnemonic.trim())
    return { addresses }
  },

  async unlock(password) {
    const encrypted = localStorage.getItem(STORAGE_KEY)
    if (!encrypted) throw new Error('No wallet found')
    const mnemonic = await decryptMnemonic(encrypted, password)
    const addresses = await this.deriveAllAddresses(mnemonic)
    return { mnemonic, addresses }
  },

  async deriveAllAddresses(mnemonic) {
    const [evm, solana] = await Promise.all([
      deriveEVMAddress(mnemonic),
      deriveSolanaAddress(mnemonic)
    ])
    return {
      solana: solana.address,
      ethereum: evm.address,
      polygon: evm.address,
      base: evm.address,
      arbitrum: evm.address,
      bsc: evm.address
    }
  },

  async getPrivateKey(password, chain) {
    const encrypted = localStorage.getItem(STORAGE_KEY)
    if (!encrypted) throw new Error('No wallet found')
    const mnemonic = await decryptMnemonic(encrypted, password)
    if (chain === 'solana') {
      const result = await deriveSolanaAddress(mnemonic)
      return result.privateKey
    } else {
      const result = await deriveEVMAddress(mnemonic, chain)
      return result.privateKey
    }
  },

  deleteWallet() {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export default clientWalletService
