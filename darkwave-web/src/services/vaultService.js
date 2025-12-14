const API_BASE = '/api/vault'

export const vaultService = {
  async getSupportedChains() {
    const res = await fetch(`${API_BASE}/chains`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to fetch chains')
    return data.chains
  },

  async createVault(config) {
    const res = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to create vault')
    return data
  },

  async getVaults(userId) {
    const res = await fetch(`${API_BASE}/list?userId=${userId}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to fetch vaults')
    return data.vaults
  },

  async getVaultDetails(vaultId) {
    const res = await fetch(`${API_BASE}/${vaultId}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to fetch vault details')
    return data.vault
  },

  async prepareDeployment(vaultId, deployerAddress) {
    const res = await fetch(`${API_BASE}/prepare-deployment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vaultId, deployerAddress })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to prepare deployment')
    return data
  },

  async activateVault(vaultId, txHash) {
    const res = await fetch(`${API_BASE}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vaultId, txHash })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to activate vault')
    return data
  },

  validateSolanaAddress(address) {
    if (!address || typeof address !== 'string') return false
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    if (!base58Regex.test(address)) return false
    if (address.length < 32 || address.length > 44) return false
    return true
  },

  validateEVMAddress(address) {
    if (!address || typeof address !== 'string') return false
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false
    const isAllLower = address === address.toLowerCase()
    const isAllUpper = address.slice(2) === address.slice(2).toUpperCase()
    if (!isAllLower && !isAllUpper) {
      try {
        const lowerAddr = address.toLowerCase()
        return true
      } catch {
        return false
      }
    }
    return true
  },

  validateAddress(address, chainId) {
    if (chainId === 'solana') {
      return this.validateSolanaAddress(address)
    }
    return this.validateEVMAddress(address)
  },

  hasDuplicateAddresses(signers, chainId) {
    const normalizedAddresses = signers
      .map(s => s.address?.trim() || '')
      .filter(a => a.length > 0)
      .map(a => chainId === 'solana' ? a : a.toLowerCase())
    const uniqueAddresses = new Set(normalizedAddresses)
    return normalizedAddresses.length !== uniqueAddresses.size
  },

  getAddressErrors(signers, chainId) {
    const errors = []
    const seen = new Set()
    
    signers.forEach((signer, index) => {
      const address = signer.address?.trim() || ''
      if (!address) {
        errors.push({ index, error: 'Address required' })
        return
      }
      
      if (!this.validateAddress(address, chainId)) {
        errors.push({ index, error: chainId === 'solana' ? 'Invalid Solana address' : 'Invalid EVM address' })
        return
      }
      
      const normalized = chainId === 'solana' ? address : address.toLowerCase()
      if (seen.has(normalized)) {
        errors.push({ index, error: 'Duplicate address' })
        return
      }
      seen.add(normalized)
    })
    
    return errors
  }
}

export default vaultService
