import { useState, useEffect, useCallback, useMemo } from 'react'
import vaultService from '../../services/vaultService'

const CHAIN_ICONS = {
  solana: '◎',
  ethereum: 'Ξ',
  base: '⬡',
  polygon: '⬡',
  arbitrum: '⬡',
  bsc: '⬡',
  optimism: '⬡',
  avalanche: '⬡',
  gnosis: '⬡'
}

const CHAIN_GRADIENTS = {
  solana: 'linear-gradient(135deg, #9945FF, #14F195)',
  ethereum: 'linear-gradient(135deg, #627EEA, #454A75)',
  base: 'linear-gradient(135deg, #0052FF, #3B7AFF)',
  polygon: 'linear-gradient(135deg, #8247E5, #A46EFF)',
  arbitrum: 'linear-gradient(135deg, #28A0F0, #1B6CB0)',
  bsc: 'linear-gradient(135deg, #F3BA2F, #E8A914)',
  optimism: 'linear-gradient(135deg, #FF0420, #CC031A)',
  avalanche: 'linear-gradient(135deg, #E84142, #C73032)',
  gnosis: 'linear-gradient(135deg, #04795B, #035F47)'
}

const STEPS = [
  { id: 1, label: 'Select Chain' },
  { id: 2, label: 'Add Signers' },
  { id: 3, label: 'Set Threshold' },
  { id: 4, label: 'Review & Create' }
]

export default function VaultCreationWizard({ userId, userAddress, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [chains, setChains] = useState([])
  const [loadingChains, setLoadingChains] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [creationResult, setCreationResult] = useState(null)

  const [selectedChain, setSelectedChain] = useState(null)
  const [signers, setSigners] = useState([
    { address: '', nickname: '' },
    { address: '', nickname: '' }
  ])
  const [threshold, setThreshold] = useState(2)
  const [vaultName, setVaultName] = useState('')
  const [vaultDescription, setVaultDescription] = useState('')
  const [createKeyPublicKey, setCreateKeyPublicKey] = useState('')

  useEffect(() => {
    fetchChains()
  }, [])

  useEffect(() => {
    if (userAddress && signers[0].address === '') {
      setSigners(prev => {
        const newSigners = [...prev]
        newSigners[0] = { ...newSigners[0], address: userAddress }
        return newSigners
      })
    }
  }, [userAddress])

  const fetchChains = async () => {
    setLoadingChains(true)
    try {
      const chainList = await vaultService.getSupportedChains()
      setChains(chainList)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingChains(false)
    }
  }

  const addressErrors = useMemo(() => {
    if (!selectedChain) return []
    return vaultService.getAddressErrors(signers, selectedChain.id)
  }, [signers, selectedChain])

  const validSigners = useMemo(() => {
    return signers.filter((s, index) => {
      if (!s.address.trim()) return false
      if (addressErrors.some(e => e.index === index)) return false
      return vaultService.validateAddress(s.address.trim(), selectedChain?.id)
    })
  }, [signers, selectedChain, addressErrors])

  const createKeyError = useMemo(() => {
    if (selectedChain?.id !== 'solana') return null
    const key = createKeyPublicKey.trim()
    if (!key) return null
    if (!vaultService.validateSolanaAddress(key)) {
      return 'Invalid Solana public key'
    }
    return null
  }, [createKeyPublicKey, selectedChain])

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return selectedChain !== null
      case 2:
        return validSigners.length >= 2 && addressErrors.length === 0
      case 3:
        return threshold >= 1 && threshold <= validSigners.length
      case 4:
        if (!vaultName.trim()) return false
        if (selectedChain?.id === 'solana') {
          if (!createKeyPublicKey.trim()) return false
          if (createKeyError) return false
        }
        return true
      default:
        return false
    }
  }, [currentStep, selectedChain, validSigners, threshold, vaultName, createKeyPublicKey, addressErrors, createKeyError])

  const handleNext = () => {
    setError('')
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setError('')
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addSigner = () => {
    setSigners([...signers, { address: '', nickname: '' }])
  }

  const removeSigner = (index) => {
    if (signers.length <= 2) return
    setSigners(signers.filter((_, i) => i !== index))
    if (threshold > signers.length - 1) {
      setThreshold(signers.length - 1)
    }
  }

  const updateSigner = (index, field, value) => {
    const newSigners = [...signers]
    newSigners[index] = { ...newSigners[index], [field]: value }
    setSigners(newSigners)
  }

  const handleCreate = async () => {
    setError('')
    setCreating(true)

    try {
      const config = {
        name: vaultName.trim(),
        description: vaultDescription.trim() || undefined,
        chainId: selectedChain.id,
        threshold,
        signers: validSigners.map(s => ({
          address: s.address.trim(),
          nickname: s.nickname.trim() || undefined
        })),
        userId
      }

      if (selectedChain.id === 'solana') {
        config.createKeyPublicKey = createKeyPublicKey.trim()
      }

      const result = await vaultService.createVault(config)
      setCreationResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const getAddressError = (address, index) => {
    if (!address.trim()) return null
    const isValid = vaultService.validateAddress(address.trim(), selectedChain?.id)
    if (!isValid) {
      return selectedChain?.id === 'solana' 
        ? 'Invalid Solana address (base58)' 
        : 'Invalid EVM address (0x...)'
    }
    const normalizedAddr = selectedChain?.id === 'solana' ? address.trim() : address.trim().toLowerCase()
    const duplicate = signers.findIndex((s, i) => {
      if (i === index) return false
      const otherAddr = selectedChain?.id === 'solana' ? s.address.trim() : s.address.trim().toLowerCase()
      return otherAddr === normalizedAddr
    })
    if (duplicate !== -1) return 'Duplicate address'
    return null
  }

  const getRecommendedThreshold = () => {
    const count = validSigners.length
    if (count <= 2) return count
    return Math.ceil(count / 2) + (count % 2 === 0 ? 0 : 0)
  }

  if (creationResult) {
    return (
      <div className="wizard-container">
        <div className="wizard-success">
          <div className="success-icon">✓</div>
          <h2>Vault Created!</h2>
          <p className="success-message">
            Your {selectedChain.protocol} vault has been configured.
          </p>
          
          <div className="vault-summary-card">
            <div className="summary-row">
              <span>Name</span>
              <span>{vaultName}</span>
            </div>
            <div className="summary-row">
              <span>Chain</span>
              <span>{selectedChain.name}</span>
            </div>
            <div className="summary-row">
              <span>Threshold</span>
              <span>{threshold} of {validSigners.length}</span>
            </div>
            <div className="summary-row">
              <span>Status</span>
              <span className="status-pending">Pending Deployment</span>
            </div>
          </div>

          {selectedChain.id === 'solana' ? (
            <div className="deployment-instructions">
              <h3>Next Steps (Solana)</h3>
              <p>Sign the multisig creation transaction using your wallet. The createKey you provided will be used to derive the multisig PDA.</p>
              <div className="instruction-code">
                <span>Vault Address:</span>
                <code>{creationResult.vault?.vaultAddress}</code>
              </div>
            </div>
          ) : (
            <div className="deployment-instructions">
              <h3>Next Steps (EVM)</h3>
              <p>Deploy your Safe contract by signing the deployment transaction from any owner wallet.</p>
              {creationResult.vault?.deploymentTransaction && (
                <div className="instruction-code">
                  <span>Predicted Address:</span>
                  <code>{creationResult.vault?.vaultAddress}</code>
                </div>
              )}
            </div>
          )}

          <div className="wizard-actions">
            <button className="wizard-btn primary" onClick={() => onSuccess?.(creationResult.vault)}>
              Done
            </button>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    )
  }

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h2>Create Multi-Sig Vault</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="stepper">
        {STEPS.map((step, index) => (
          <div 
            key={step.id} 
            className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
          >
            <div className="step-indicator">
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <span className="step-label">{step.label}</span>
            {index < STEPS.length - 1 && <div className="step-connector" />}
          </div>
        ))}
      </div>

      <div className="wizard-content">
        {currentStep === 1 && (
          <div className="step-content">
            <h3>Select Blockchain</h3>
            <p className="step-description">Choose the chain for your multi-signature vault</p>
            
            {loadingChains ? (
              <div className="loading-state">
                <div className="spinner" />
                <span>Loading chains...</span>
              </div>
            ) : (
              <div className="chain-grid">
                {chains.map(chain => (
                  <button
                    key={chain.id}
                    className={`chain-card ${selectedChain?.id === chain.id ? 'selected' : ''}`}
                    onClick={() => setSelectedChain(chain)}
                    style={{ '--chain-gradient': CHAIN_GRADIENTS[chain.id] || CHAIN_GRADIENTS.ethereum }}
                  >
                    <div className="chain-icon" style={{ background: CHAIN_GRADIENTS[chain.id] }}>
                      {CHAIN_ICONS[chain.id] || '⬡'}
                    </div>
                    <div className="chain-info">
                      <span className="chain-name">{chain.name}</span>
                      <span className="chain-protocol">{chain.protocol}</span>
                    </div>
                    {selectedChain?.id === chain.id && (
                      <div className="selected-check">✓</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h3>Add Signers</h3>
            <p className="step-description">
              Add wallet addresses that will control this vault. Minimum 2 signers required.
            </p>
            
            <div className="signers-list">
              {signers.map((signer, index) => {
                const addressError = getAddressError(signer.address, index)
                return (
                  <div key={index} className="signer-row">
                    <div className="signer-number">{index + 1}</div>
                    <div className="signer-inputs">
                      <div className="input-group">
                        <input
                          type="text"
                          className={`signer-address ${addressError ? 'error' : ''}`}
                          placeholder={selectedChain?.id === 'solana' ? 'Solana address...' : '0x...'}
                          value={signer.address}
                          onChange={(e) => updateSigner(index, 'address', e.target.value)}
                        />
                        {addressError && <span className="input-error">{addressError}</span>}
                      </div>
                      <input
                        type="text"
                        className="signer-nickname"
                        placeholder="Nickname (optional)"
                        value={signer.nickname}
                        onChange={(e) => updateSigner(index, 'nickname', e.target.value)}
                      />
                    </div>
                    {signers.length > 2 && (
                      <button className="remove-signer-btn" onClick={() => removeSigner(index)}>
                        ×
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <button className="add-signer-btn" onClick={addSigner}>
              <span>+</span> Add Signer
            </button>

            <div className="signers-summary">
              <span className="valid-count">{validSigners.length}</span> valid signer{validSigners.length !== 1 ? 's' : ''} added
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h3>Set Approval Threshold</h3>
            <p className="step-description">
              How many signatures are required to approve transactions?
            </p>

            <div className="threshold-display">
              <span className="threshold-value">{threshold}</span>
              <span className="threshold-of">of</span>
              <span className="threshold-total">{validSigners.length}</span>
            </div>

            <div className="threshold-slider-container">
              <input
                type="range"
                className="threshold-slider"
                min={1}
                max={validSigners.length}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
              />
              <div className="slider-labels">
                <span>1</span>
                <span>{validSigners.length}</span>
              </div>
            </div>

            <div className="threshold-recommendation">
              <span className="rec-label">Recommended:</span>
              <button 
                className={`rec-btn ${threshold === getRecommendedThreshold() ? 'active' : ''}`}
                onClick={() => setThreshold(getRecommendedThreshold())}
              >
                Majority ({getRecommendedThreshold()} of {validSigners.length})
              </button>
            </div>

            {threshold === 1 && (
              <div className="threshold-warning">
                <span className="warning-icon">⚠️</span>
                <span>A threshold of 1 means any single signer can execute transactions.</span>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content">
            <h3>Review & Create</h3>
            <p className="step-description">
              Review your vault configuration and provide a name.
            </p>

            <div className="form-group">
              <label>Vault Name *</label>
              <input
                type="text"
                className="vault-name-input"
                placeholder="My Team Vault"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                className="vault-description-input"
                placeholder="Describe the purpose of this vault..."
                value={vaultDescription}
                onChange={(e) => setVaultDescription(e.target.value)}
                rows={3}
              />
            </div>

            {selectedChain?.id === 'solana' && (
              <div className="form-group">
                <label>CreateKey Public Key *</label>
                <input
                  type="text"
                  className="createkey-input"
                  placeholder="Generate a keypair and paste the public key..."
                  value={createKeyPublicKey}
                  onChange={(e) => setCreateKeyPublicKey(e.target.value)}
                />
                <p className="input-hint">
                  For Solana Squads: Generate a new keypair locally. The public key will be used to derive your multisig address.
                </p>
              </div>
            )}

            <div className="review-summary">
              <h4>Configuration Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Chain</span>
                  <span className="summary-value">
                    <span className="chain-badge" style={{ background: CHAIN_GRADIENTS[selectedChain?.id] }}>
                      {CHAIN_ICONS[selectedChain?.id]} {selectedChain?.name}
                    </span>
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Protocol</span>
                  <span className="summary-value">{selectedChain?.protocol}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Threshold</span>
                  <span className="summary-value">{threshold} of {validSigners.length}</span>
                </div>
                <div className="summary-item full-width">
                  <span className="summary-label">Signers</span>
                  <div className="signers-preview">
                    {validSigners.map((s, i) => (
                      <div key={i} className="signer-preview">
                        <span className="signer-addr">
                          {s.address.slice(0, 6)}...{s.address.slice(-4)}
                        </span>
                        {s.nickname && <span className="signer-nick">({s.nickname})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="wizard-error">
          <span className="error-icon">!</span>
          {error}
        </div>
      )}

      <div className="wizard-footer">
        <button 
          className="wizard-btn secondary" 
          onClick={currentStep === 1 ? onClose : handleBack}
        >
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>
        
        {currentStep < 4 ? (
          <button 
            className="wizard-btn primary" 
            onClick={handleNext}
            disabled={!canProceed}
          >
            Continue
          </button>
        ) : (
          <button 
            className="wizard-btn primary create" 
            onClick={handleCreate}
            disabled={!canProceed || creating}
          >
            {creating ? (
              <>
                <span className="btn-spinner" />
                Creating...
              </>
            ) : (
              'Create Vault'
            )}
          </button>
        )}
      </div>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .wizard-container {
    background: #0f0f0f;
    border-radius: 16px;
    padding: 24px;
    max-width: 640px;
    margin: 0 auto;
  }

  .wizard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .wizard-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, #00D4FF, #9945FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .close-btn {
    background: none;
    border: none;
    color: #666;
    font-size: 28px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: #fff;
  }

  .stepper {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
    position: relative;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
  }

  .step-indicator {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 2px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #666;
    position: relative;
    z-index: 1;
    transition: all 0.3s;
  }

  .step.active .step-indicator {
    background: linear-gradient(135deg, #00D4FF, #9945FF);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
  }

  .step.completed .step-indicator {
    background: #00D4FF;
    border-color: transparent;
    color: #0f0f0f;
  }

  .step-label {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
    text-align: center;
  }

  .step.active .step-label,
  .step.completed .step-label {
    color: #fff;
  }

  .step-connector {
    position: absolute;
    top: 18px;
    left: calc(50% + 24px);
    width: calc(100% - 48px);
    height: 2px;
    background: #333;
  }

  .step.completed .step-connector {
    background: #00D4FF;
  }

  .wizard-content {
    min-height: 320px;
  }

  .step-content h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: #fff;
  }

  .step-description {
    color: #888;
    margin: 0 0 24px 0;
    font-size: 14px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    gap: 16px;
    color: #888;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #333;
    border-top-color: #00D4FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .chain-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .chain-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #1a1a1a;
    border: 2px solid #333;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .chain-card:hover {
    border-color: #444;
    transform: translateY(-2px);
  }

  .chain-card.selected {
    border-color: #00D4FF;
    background: #141414;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
  }

  .chain-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;
    flex-shrink: 0;
  }

  .chain-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .chain-name {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }

  .chain-protocol {
    font-size: 12px;
    color: #888;
  }

  .selected-check {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: #00D4FF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #0f0f0f;
    font-weight: 700;
  }

  .signers-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .signer-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .signer-number {
    width: 28px;
    height: 28px;
    background: #1a1a1a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #888;
    flex-shrink: 0;
    margin-top: 10px;
  }

  .signer-inputs {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
  }

  .signer-address,
  .signer-nickname {
    width: 100%;
    padding: 12px 16px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 10px;
    color: #fff;
    font-size: 14px;
    font-family: monospace;
  }

  .signer-nickname {
    font-family: inherit;
  }

  .signer-address:focus,
  .signer-nickname:focus {
    outline: none;
    border-color: #00D4FF;
  }

  .signer-address.error {
    border-color: #FF6B6B;
  }

  .input-error {
    color: #FF6B6B;
    font-size: 11px;
    margin-top: 4px;
  }

  .remove-signer-btn {
    width: 32px;
    height: 32px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    color: #666;
    font-size: 20px;
    cursor: pointer;
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .remove-signer-btn:hover {
    border-color: #FF6B6B;
    color: #FF6B6B;
  }

  .add-signer-btn {
    width: 100%;
    padding: 12px;
    background: #141414;
    border: 2px dashed #333;
    border-radius: 10px;
    color: #888;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .add-signer-btn:hover {
    border-color: #00D4FF;
    color: #00D4FF;
  }

  .signers-summary {
    margin-top: 16px;
    padding: 12px 16px;
    background: #141414;
    border-radius: 8px;
    font-size: 14px;
    color: #888;
  }

  .valid-count {
    color: #00D4FF;
    font-weight: 600;
  }

  .threshold-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 32px;
    background: #1a1a1a;
    border-radius: 16px;
    margin-bottom: 24px;
  }

  .threshold-value {
    font-size: 64px;
    font-weight: 700;
    background: linear-gradient(135deg, #00D4FF, #9945FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .threshold-of {
    font-size: 24px;
    color: #666;
  }

  .threshold-total {
    font-size: 48px;
    font-weight: 600;
    color: #fff;
  }

  .threshold-slider-container {
    padding: 0 8px;
    margin-bottom: 24px;
  }

  .threshold-slider {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: #333;
    appearance: none;
    cursor: pointer;
  }

  .threshold-slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00D4FF, #9945FF);
    cursor: pointer;
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.5);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 12px;
    color: #666;
  }

  .threshold-recommendation {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #141414;
    border-radius: 10px;
  }

  .rec-label {
    color: #888;
    font-size: 14px;
  }

  .rec-btn {
    padding: 8px 16px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .rec-btn:hover {
    border-color: #00D4FF;
  }

  .rec-btn.active {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00D4FF;
    color: #00D4FF;
  }

  .threshold-warning {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    padding: 12px 16px;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 10px;
    color: #FF6B6B;
    font-size: 13px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #888;
  }

  .vault-name-input,
  .vault-description-input,
  .createkey-input {
    width: 100%;
    padding: 14px 16px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 10px;
    color: #fff;
    font-size: 15px;
    resize: none;
  }

  .vault-name-input:focus,
  .vault-description-input:focus,
  .createkey-input:focus {
    outline: none;
    border-color: #00D4FF;
  }

  .input-hint {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
  }

  .review-summary {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 20px;
  }

  .review-summary h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #fff;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .summary-item.full-width {
    grid-column: 1 / -1;
  }

  .summary-label {
    font-size: 12px;
    color: #666;
  }

  .summary-value {
    font-size: 15px;
    color: #fff;
  }

  .chain-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 13px;
  }

  .signers-preview {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .signer-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #141414;
    border-radius: 8px;
    font-size: 13px;
  }

  .signer-addr {
    font-family: monospace;
    color: #fff;
  }

  .signer-nick {
    color: #888;
  }

  .wizard-error {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 10px;
    color: #FF6B6B;
    font-size: 14px;
    margin-top: 16px;
  }

  .error-icon {
    width: 20px;
    height: 20px;
    background: #FF6B6B;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f0f0f;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .wizard-footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #222;
  }

  .wizard-btn {
    padding: 14px 28px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .wizard-btn.secondary {
    background: #1a1a1a;
    border: 1px solid #333;
    color: #888;
  }

  .wizard-btn.secondary:hover {
    border-color: #444;
    color: #fff;
  }

  .wizard-btn.primary {
    background: linear-gradient(135deg, #00D4FF, #9945FF);
    border: none;
    color: #fff;
    flex: 1;
  }

  .wizard-btn.primary:hover:not(:disabled) {
    box-shadow: 0 0 24px rgba(0, 212, 255, 0.4);
    transform: translateY(-1px);
  }

  .wizard-btn.primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .wizard-btn.create {
    background: linear-gradient(135deg, #00D4FF, #14F195);
  }

  .btn-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .wizard-success {
    text-align: center;
    padding: 24px 0;
  }

  .success-icon {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, #00D4FF, #14F195);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    color: #0f0f0f;
    margin: 0 auto 24px;
    box-shadow: 0 0 40px rgba(0, 212, 255, 0.4);
  }

  .wizard-success h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    color: #fff;
  }

  .success-message {
    color: #888;
    margin: 0 0 24px 0;
  }

  .vault-summary-card {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 20px;
    text-align: left;
    margin-bottom: 24px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #222;
  }

  .summary-row:last-child {
    border-bottom: none;
  }

  .summary-row span:first-child {
    color: #888;
  }

  .summary-row span:last-child {
    color: #fff;
    font-weight: 500;
  }

  .status-pending {
    color: #F3BA2F !important;
  }

  .deployment-instructions {
    background: #141414;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 20px;
    text-align: left;
    margin-bottom: 24px;
  }

  .deployment-instructions h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #00D4FF;
  }

  .deployment-instructions p {
    color: #888;
    font-size: 14px;
    margin: 0 0 16px 0;
  }

  .instruction-code {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    background: #0f0f0f;
    border-radius: 8px;
  }

  .instruction-code span {
    font-size: 12px;
    color: #666;
  }

  .instruction-code code {
    font-size: 13px;
    color: #fff;
    word-break: break-all;
  }

  .wizard-actions {
    display: flex;
    justify-content: center;
  }

  @media (max-width: 480px) {
    .wizard-container {
      padding: 16px;
    }

    .chain-grid {
      grid-template-columns: 1fr;
    }

    .stepper {
      flex-wrap: wrap;
      gap: 8px;
    }

    .step {
      flex: 0 0 auto;
    }

    .step-connector {
      display: none;
    }

    .threshold-display {
      padding: 24px;
    }

    .threshold-value {
      font-size: 48px;
    }

    .threshold-total {
      font-size: 36px;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }
  }
`
