import { useState, useEffect, useCallback } from 'react'
import VaultCreationWizard from './VaultCreationWizard'
import { useBuiltInWallet } from '../../context/BuiltInWalletContext'
import vaultService from '../../services/vaultService'

export default function VaultManager({ userId }) {
  const { solanaAddress, addresses, isUnlocked } = useBuiltInWallet()
  
  const [view, setView] = useState('list')
  const [vaults, setVaults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchVaults = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const vaultList = await vaultService.getVaults(userId)
      setVaults(vaultList || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId && view === 'list') {
      fetchVaults()
    }
  }, [userId, view, fetchVaults])

  const handleCreateSuccess = (vault) => {
    setView('list')
    fetchVaults()
  }

  const getUserAddress = () => {
    return solanaAddress || addresses?.ethereum || ''
  }

  if (view === 'create') {
    return (
      <div className="vault-manager">
        <VaultCreationWizard
          userId={userId}
          userAddress={getUserAddress()}
          onClose={() => setView('list')}
          onSuccess={handleCreateSuccess}
        />
        <style>{styles}</style>
      </div>
    )
  }

  return (
    <div className="vault-manager">
      <div className="vault-header">
        <div className="vault-header-content">
          <div className="vault-header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#vault-gradient)" strokeWidth="2">
              <defs>
                <linearGradient id="vault-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D4FF" />
                  <stop offset="100%" stopColor="#9945FF" />
                </linearGradient>
              </defs>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
              <circle cx="12" cy="16" r="1" fill="url(#vault-gradient)" />
            </svg>
          </div>
          <div className="vault-header-text">
            <h1>Multi-Sig Vaults</h1>
            <p>Secure treasury management with multi-signature approval</p>
          </div>
        </div>
        <button className="create-vault-btn" onClick={() => setView('create')}>
          <span className="btn-icon">+</span>
          Create Vault
        </button>
      </div>

      <div className="vault-features">
        <div className="feature-card">
          <div className="feature-icon solana">◎</div>
          <div className="feature-text">
            <span className="feature-title">Solana Squads</span>
            <span className="feature-desc">Multisig via Squads Protocol</span>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon evm">⬡</div>
          <div className="feature-text">
            <span className="feature-title">EVM Safe</span>
            <span className="feature-desc">Gnosis Safe on all EVM chains</span>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon security">🔐</div>
          <div className="feature-text">
            <span className="feature-title">M of N Security</span>
            <span className="feature-desc">Customizable approval threshold</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="vault-error">
          <span className="error-icon">!</span>
          {error}
          <button className="retry-btn" onClick={fetchVaults}>Retry</button>
        </div>
      )}

      <div className="vault-list-section">
        <h2>Your Vaults</h2>
        
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading vaults...</span>
          </div>
        ) : vaults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏦</div>
            <h3>No vaults yet</h3>
            <p>Create your first multi-signature vault to get started with secure team treasury management.</p>
            <button className="create-empty-btn" onClick={() => setView('create')}>
              Create Your First Vault
            </button>
          </div>
        ) : (
          <div className="vault-grid">
            {vaults.map(vault => (
              <div key={vault.id} className="vault-card">
                <div className="vault-card-header">
                  <div 
                    className="vault-chain-icon"
                    style={{ 
                      background: vault.chainType === 'solana' 
                        ? 'linear-gradient(135deg, #9945FF, #14F195)' 
                        : 'linear-gradient(135deg, #627EEA, #454A75)'
                    }}
                  >
                    {vault.chainType === 'solana' ? '◎' : 'Ξ'}
                  </div>
                  <div className="vault-info">
                    <span className="vault-name">{vault.name}</span>
                    <span className="vault-chain">{vault.chainId}</span>
                  </div>
                  <div className={`vault-status ${vault.status}`}>
                    {vault.status}
                  </div>
                </div>
                <div className="vault-card-body">
                  <div className="vault-stat">
                    <span className="stat-label">Threshold</span>
                    <span className="stat-value">{vault.threshold} of {vault.signersCount || '?'}</span>
                  </div>
                  <div className="vault-stat">
                    <span className="stat-label">Protocol</span>
                    <span className="stat-value">{vault.chainType === 'solana' ? 'Squads' : 'Safe'}</span>
                  </div>
                </div>
                <div className="vault-card-footer">
                  <span className="vault-address">
                    {vault.vaultAddress?.slice(0, 8)}...{vault.vaultAddress?.slice(-6)}
                  </span>
                  <button className="view-vault-btn">View</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .vault-manager {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .vault-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .vault-header-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .vault-header-icon {
    width: 56px;
    height: 56px;
    background: #1a1a1a;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .vault-header-text h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #00D4FF, #9945FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .vault-header-text p {
    margin: 4px 0 0 0;
    color: #888;
    font-size: 14px;
  }

  .create-vault-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 24px;
    background: linear-gradient(135deg, #00D4FF, #9945FF);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .create-vault-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 212, 255, 0.3);
  }

  .btn-icon {
    font-size: 20px;
    line-height: 1;
  }

  .vault-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .feature-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 14px;
    transition: all 0.2s;
  }

  .feature-card:hover {
    border-color: #444;
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  .feature-icon.solana {
    background: linear-gradient(135deg, #9945FF, #14F195);
    color: #fff;
  }

  .feature-icon.evm {
    background: linear-gradient(135deg, #627EEA, #454A75);
    color: #fff;
  }

  .feature-icon.security {
    background: linear-gradient(135deg, #00D4FF, #0099CC);
    font-size: 22px;
  }

  .feature-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .feature-title {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }

  .feature-desc {
    font-size: 12px;
    color: #888;
  }

  .vault-error {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 12px;
    color: #FF6B6B;
    margin-bottom: 24px;
  }

  .error-icon {
    width: 24px;
    height: 24px;
    background: #FF6B6B;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f0f0f;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .retry-btn {
    margin-left: auto;
    padding: 8px 16px;
    background: rgba(255, 107, 107, 0.2);
    border: 1px solid rgba(255, 107, 107, 0.4);
    border-radius: 8px;
    color: #FF6B6B;
    font-size: 13px;
    cursor: pointer;
  }

  .retry-btn:hover {
    background: rgba(255, 107, 107, 0.3);
  }

  .vault-list-section h2 {
    margin: 0 0 20px 0;
    font-size: 20px;
    color: #fff;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px;
    gap: 16px;
    color: #888;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #333;
    border-top-color: #00D4FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 64px 24px;
    background: #141414;
    border: 2px dashed #333;
    border-radius: 16px;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    font-size: 22px;
    color: #fff;
  }

  .empty-state p {
    margin: 0 0 24px 0;
    color: #888;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .create-empty-btn {
    padding: 14px 28px;
    background: linear-gradient(135deg, #00D4FF, #9945FF);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .create-empty-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 212, 255, 0.3);
  }

  .vault-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .vault-card {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .vault-card:hover {
    border-color: #444;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .vault-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #222;
  }

  .vault-chain-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #fff;
    flex-shrink: 0;
  }

  .vault-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .vault-name {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .vault-chain {
    font-size: 12px;
    color: #888;
    text-transform: capitalize;
  }

  .vault-status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .vault-status.active {
    background: rgba(20, 241, 149, 0.15);
    color: #14F195;
  }

  .vault-status.pending {
    background: rgba(243, 186, 47, 0.15);
    color: #F3BA2F;
  }

  .vault-status.deploying {
    background: rgba(0, 212, 255, 0.15);
    color: #00D4FF;
  }

  .vault-card-body {
    display: flex;
    gap: 24px;
    padding: 16px 20px;
  }

  .vault-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    font-size: 11px;
    color: #666;
    text-transform: uppercase;
  }

  .stat-value {
    font-size: 15px;
    color: #fff;
    font-weight: 500;
  }

  .vault-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #141414;
    border-top: 1px solid #222;
  }

  .vault-address {
    font-family: monospace;
    font-size: 12px;
    color: #888;
  }

  .view-vault-btn {
    padding: 8px 16px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .view-vault-btn:hover {
    border-color: #00D4FF;
    color: #00D4FF;
  }

  @media (max-width: 640px) {
    .vault-manager {
      padding: 16px;
    }

    .vault-header {
      flex-direction: column;
      align-items: stretch;
    }

    .vault-header-content {
      justify-content: center;
      text-align: center;
      flex-direction: column;
    }

    .create-vault-btn {
      width: 100%;
      justify-content: center;
    }

    .vault-grid {
      grid-template-columns: 1fr;
    }

    .feature-card {
      flex-direction: column;
      text-align: center;
    }
  }
`
