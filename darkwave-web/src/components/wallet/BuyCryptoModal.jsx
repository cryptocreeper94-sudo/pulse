import { useState, useEffect } from 'react'

const PROVIDERS = [
  { 
    id: 'stripe', 
    name: 'Stripe', 
    description: 'Credit/Debit Card',
    icon: '💳',
    available: false,
    comingSoon: true
  },
  { 
    id: 'moonpay', 
    name: 'MoonPay', 
    description: 'Cards, Bank, Apple Pay',
    icon: '🌙',
    available: false,
    comingSoon: true
  },
  { 
    id: 'transak', 
    name: 'Transak', 
    description: 'Cards, Bank Transfer',
    icon: '⚡',
    available: false,
    comingSoon: true
  }
]

const NETWORKS = [
  { id: 'solana', name: 'Solana', currency: 'SOL' },
  { id: 'ethereum', name: 'Ethereum', currency: 'ETH' },
  { id: 'polygon', name: 'Polygon', currency: 'MATIC' },
  { id: 'base', name: 'Base', currency: 'ETH' },
  { id: 'arbitrum', name: 'Arbitrum', currency: 'ETH' }
]

export default function BuyCryptoModal({ isOpen, onClose, walletAddress, defaultNetwork = 'solana' }) {
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedNetwork, setSelectedNetwork] = useState(defaultNetwork)
  const [amount, setAmount] = useState('100')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [providerConfigs, setProviderConfigs] = useState({})

  useEffect(() => {
    const checkProviders = async () => {
      const configs = {}
      
      try {
        const stripeRes = await fetch('/api/crypto/onramp/supported')
        if (stripeRes.ok) configs.stripe = await stripeRes.json()
      } catch (e) { configs.stripe = { configured: false } }
      
      try {
        const moonpayRes = await fetch('/api/crypto/moonpay/config')
        if (moonpayRes.ok) configs.moonpay = await moonpayRes.json()
      } catch (e) { configs.moonpay = { configured: false } }
      
      try {
        const transakRes = await fetch('/api/crypto/transak/config')
        if (transakRes.ok) configs.transak = await transakRes.json()
      } catch (e) { configs.transak = { configured: false } }
      
      setProviderConfigs(configs)
    }
    
    if (isOpen) checkProviders()
  }, [isOpen])

  const handleBuyCrypto = async () => {
    if (!selectedProvider || !walletAddress) return
    
    setLoading(true)
    setError(null)
    
    try {
      const network = NETWORKS.find(n => n.id === selectedNetwork)
      let response
      
      if (selectedProvider === 'stripe') {
        response = await fetch('/api/crypto/onramp/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            network: selectedNetwork,
            currency: network?.currency?.toLowerCase() || 'sol',
            amount
          })
        })
      } else if (selectedProvider === 'moonpay') {
        response = await fetch('/api/crypto/moonpay/widget-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            network: selectedNetwork,
            currencyCode: network?.currency?.toLowerCase() || 'sol',
            baseCurrencyAmount: amount
          })
        })
      } else if (selectedProvider === 'transak') {
        response = await fetch('/api/crypto/transak/widget-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            network: selectedNetwork,
            cryptoCurrencyCode: network?.currency || 'SOL',
            fiatAmount: amount
          })
        })
      }
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }
      
      const data = await response.json()
      const redirectUrl = data.widgetUrl || data.redirectUrl || data.url
      
      if (redirectUrl) {
        window.open(redirectUrl, '_blank', 'width=500,height=700')
      } else if (data.clientSecret) {
        setError('Stripe widget requires additional setup')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: 20
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 420,
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 20 }}>Buy Crypto</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#666', 
              fontSize: 24, 
              cursor: 'pointer',
              padding: 0
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 8 }}>NETWORK</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {NETWORKS.map(network => (
              <button
                key={network.id}
                onClick={() => setSelectedNetwork(network.id)}
                style={{
                  background: selectedNetwork === network.id ? 'rgba(0, 212, 255, 0.2)' : '#252525',
                  border: selectedNetwork === network.id ? '1px solid #00D4FF' : '1px solid #333',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: selectedNetwork === network.id ? '#00D4FF' : '#888',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                {network.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 8 }}>AMOUNT (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              background: '#252525',
              border: '1px solid #333',
              borderRadius: 8,
              padding: 12,
              color: '#fff',
              fontSize: 16,
              outline: 'none'
            }}
            placeholder="Enter amount"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 8 }}>PAYMENT PROVIDER</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PROVIDERS.map(provider => {
              const isAvailable = provider.available
              
              return (
                <button
                  key={provider.id}
                  onClick={() => isAvailable && setSelectedProvider(provider.id)}
                  disabled={!isAvailable}
                  style={{
                    background: selectedProvider === provider.id ? 'rgba(0, 212, 255, 0.15)' : '#252525',
                    border: selectedProvider === provider.id ? '1px solid #00D4FF' : '1px solid #333',
                    borderRadius: 12,
                    padding: 16,
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: 24 }}>{provider.icon}</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                      {provider.name}
                    </div>
                    <div style={{ color: '#666', fontSize: 11 }}>{provider.description}</div>
                  </div>
                  {provider.comingSoon && (
                    <span style={{ 
                      background: 'linear-gradient(135deg, #00D4FF, #0099CC)', 
                      color: '#000', 
                      fontSize: 9, 
                      fontWeight: 700,
                      padding: '4px 8px', 
                      borderRadius: 4,
                      textTransform: 'uppercase'
                    }}>
                      Coming Soon
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(255, 68, 68, 0.1)', 
            border: '1px solid #ff4444', 
            borderRadius: 8, 
            padding: 12, 
            marginBottom: 16,
            color: '#ff4444',
            fontSize: 12
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleBuyCrypto}
          disabled={!selectedProvider || !amount || loading}
          style={{
            width: '100%',
            background: selectedProvider ? 'linear-gradient(135deg, #00D4FF, #0099CC)' : '#333',
            border: 'none',
            borderRadius: 12,
            padding: 16,
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: selectedProvider && !loading ? 'pointer' : 'not-allowed',
            opacity: selectedProvider && !loading ? 1 : 0.6
          }}
        >
          {loading ? 'Processing...' : `Buy ${NETWORKS.find(n => n.id === selectedNetwork)?.currency || 'Crypto'}`}
        </button>

        <p style={{ 
          color: '#555', 
          fontSize: 10, 
          textAlign: 'center', 
          marginTop: 12,
          marginBottom: 0
        }}>
          Crypto will be sent to your connected wallet
        </p>
      </div>
    </div>
  )
}
