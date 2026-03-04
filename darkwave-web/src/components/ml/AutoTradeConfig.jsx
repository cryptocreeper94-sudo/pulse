import { useState, useEffect, useCallback } from 'react'

const modeDescriptions = {
  'observer': 'Watch only - log recommendations without executing trades',
  'approval': 'Requires your approval before each trade is executed',
  'semi-auto': 'Execute small positions automatically, notify on all trades',
  'full-auto': 'Execute trades within limits, log everything'
}

const ModeCard = ({ mode, selected, onClick, disabled }) => {
  const modeIcons = {
    'observer': '👁️',
    'approval': '✅',
    'semi-auto': '⚡',
    'full-auto': '🤖'
  }
  
  const modeLabels = {
    'observer': 'Observer',
    'approval': 'Approval',
    'semi-auto': 'Semi-Auto',
    'full-auto': 'Full Auto'
  }
  
  return (
    <button
      onClick={() => !disabled && onClick(mode)}
      disabled={disabled}
      style={{
        flex: 1,
        minWidth: '140px',
        padding: '16px',
        background: selected ? '#1a1a1a' : '#141414',
        border: selected ? '2px solid #00D4FF' : '2px solid transparent',
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{modeIcons[mode]}</div>
      <div style={{ 
        color: selected ? '#00D4FF' : '#fff', 
        fontWeight: 600, 
        fontSize: '14px',
        marginBottom: '4px'
      }}>
        {modeLabels[mode]}
      </div>
      <div style={{ color: '#666', fontSize: '11px', lineHeight: 1.4 }}>
        {modeDescriptions[mode]}
      </div>
    </button>
  )
}

const SliderInput = ({ label, value, onChange, min, max, step = 1, suffix = '', disabled }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginBottom: '8px' 
    }}>
      <span style={{ color: '#888', fontSize: '13px' }}>{label}</span>
      <span style={{ color: '#00D4FF', fontWeight: 600, fontSize: '14px' }}>
        {value}{suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      disabled={disabled}
      style={{
        width: '100%',
        height: '6px',
        borderRadius: '3px',
        background: '#0f0f0f',
        appearance: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    />
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      color: '#555',
      fontSize: '10px',
      marginTop: '4px'
    }}>
      <span>{min}{suffix}</span>
      <span>{max}{suffix}</span>
    </div>
  </div>
)

const ToggleSwitch = ({ label, checked, onChange, disabled }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #1a1a1a'
  }}>
    <span style={{ color: '#ccc', fontSize: '14px' }}>{label}</span>
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '13px',
        border: 'none',
        background: checked ? '#14F195' : '#333',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'background 0.2s'
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: '3px',
        left: checked ? '25px' : '3px',
        transition: 'left 0.2s'
      }} />
    </button>
  </div>
)

const ChipSelector = ({ label, options, selected, onChange, disabled }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>{label}</div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const isSelected = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => {
              if (disabled) return
              if (isSelected) {
                onChange(selected.filter(s => s !== opt.value))
              } else {
                onChange([...selected, opt.value])
              }
            }}
            disabled={disabled}
            style={{
              padding: '8px 16px',
              background: isSelected ? '#00D4FF20' : '#141414',
              border: isSelected ? '1px solid #00D4FF' : '1px solid #333',
              borderRadius: '20px',
              color: isSelected ? '#00D4FF' : '#888',
              fontSize: '13px',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  </div>
)

const defaultConfig = {
  enabled: false,
  mode: 'observer',
  confidenceThreshold: '0.70',
  accuracyThreshold: '0.55',
  maxPerTrade: '10.00',
  maxPerDay: '50.00',
  maxOpenPositions: 3,
  stopAfterLosses: 3,
  isPaused: false,
  pauseReason: null,
  allowedSignals: '["BUY", "STRONG_BUY"]',
  allowedHorizons: '["1h", "4h"]',
  notifyOnTrade: true,
  notifyOnRecommendation: true,
  notifyChannel: 'email',
  customRpcUrl: '',
  smsPhoneNumber: '',
  smsOptIn: false,
  totalTradesExecuted: 0,
  winningTrades: 0,
  losingTrades: 0,
  totalProfitLoss: '0',
  consecutiveLosses: 0
}

export default function AutoTradeConfig({ userId }) {
  const [config, setConfig] = useState(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  const fetchConfig = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/auto-trade/config?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config ? { ...defaultConfig, ...data.config } : defaultConfig)
      } else {
        setConfig(defaultConfig)
      }
    } catch (err) {
      console.error('Failed to fetch auto-trade config:', err)
      setError('Failed to load configuration')
      setConfig(defaultConfig)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...(prev || defaultConfig), [key]: value }))
    setHasChanges(true)
  }

  const saveConfig = async () => {
    if (!userId || !hasChanges) return
    setSaving(true)
    setError(null)
    
    try {
      const res = await fetch('/api/auto-trade/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...config })
      })
      
      if (res.ok) {
        setHasChanges(false)
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
      setError('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async () => {
    if (!userId) return
    setSaving(true)
    
    try {
      const res = await fetch('/api/auto-trade/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled: !config.enabled })
      })
      
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config)
      }
    } catch (err) {
      setError('Failed to toggle auto-trading')
    } finally {
      setSaving(false)
    }
  }

  const handlePauseResume = async () => {
    if (!userId) return
    setSaving(true)
    
    try {
      const endpoint = config.isPaused ? '/api/auto-trade/resume' : '/api/auto-trade/pause'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: 'Manual pause' })
      })
      
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config)
      }
    } catch (err) {
      setError('Failed to pause/resume trading')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '60px', 
        textAlign: 'center',
        background: '#0f0f0f',
        minHeight: '100vh'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
        <div style={{ color: '#888' }}>Loading Auto-Trade Settings...</div>
      </div>
    )
  }

  const allowedSignals = JSON.parse(config?.allowedSignals || '["BUY", "STRONG_BUY"]')
  const allowedHorizons = JSON.parse(config?.allowedHorizons || '["1h", "4h"]')

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '900px', 
      margin: '0 auto',
      background: '#0f0f0f',
      minHeight: '100vh'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ 
            color: '#fff', 
            fontSize: '24px', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span>🤖</span>
            Auto-Trade Settings
          </h1>
          <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0 0' }}>
            Configure AI-powered autonomous trading behavior
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {hasChanges && (
            <button
              onClick={saveConfig}
              disabled={saving}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(90deg, #00D4FF, #9945FF)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          background: '#FF6B6B20',
          border: '1px solid #FF6B6B',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#FF6B6B',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>
              Auto-Trading
            </h2>
            <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 0 0' }}>
              {config?.enabled ? 'AI trading is active' : 'AI trading is disabled'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {config?.enabled && (
              <button
                onClick={handlePauseResume}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  background: config?.isPaused ? '#14F19520' : '#FF6B6B20',
                  border: `1px solid ${config?.isPaused ? '#14F195' : '#FF6B6B'}`,
                  borderRadius: '8px',
                  color: config?.isPaused ? '#14F195' : '#FF6B6B',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {config?.isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
            )}
            <button
              onClick={toggleEnabled}
              disabled={saving}
              style={{
                padding: '10px 24px',
                background: config?.enabled ? '#FF6B6B' : '#14F195',
                border: 'none',
                borderRadius: '8px',
                color: '#0f0f0f',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {config?.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {config?.isPaused && config?.pauseReason && (
          <div style={{
            background: '#F3BA2F20',
            border: '1px solid #F3BA2F',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#F3BA2F',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>Paused: {config.pauseReason}</span>
          </div>
        )}
      </div>

      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '18px', 
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🎮</span>
          Trading Mode
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap' 
        }}>
          {['observer', 'approval', 'semi-auto', 'full-auto'].map(mode => (
            <ModeCard
              key={mode}
              mode={mode}
              selected={config?.mode === mode}
              onClick={(m) => updateConfig('mode', m)}
              disabled={!config?.enabled}
            />
          ))}
        </div>
      </div>

      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '18px', 
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🎯</span>
          Thresholds
        </h2>
        
        <SliderInput
          label="Confidence Threshold"
          value={Math.round(parseFloat(config?.confidenceThreshold || 0.7) * 100)}
          onChange={(v) => updateConfig('confidenceThreshold', (v / 100).toFixed(2))}
          min={50}
          max={95}
          step={5}
          suffix="%"
          disabled={!config?.enabled}
        />
        
        <SliderInput
          label="Accuracy Threshold"
          value={Math.round(parseFloat(config?.accuracyThreshold || 0.55) * 100)}
          onChange={(v) => updateConfig('accuracyThreshold', (v / 100).toFixed(2))}
          min={50}
          max={80}
          step={5}
          suffix="%"
          disabled={!config?.enabled}
        />
      </div>

      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '18px', 
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>💰</span>
          Position Limits
        </h2>
        
        <SliderInput
          label="Max Per Trade"
          value={parseFloat(config?.maxPerTrade || 10)}
          onChange={(v) => updateConfig('maxPerTrade', v.toFixed(2))}
          min={5}
          max={100}
          step={5}
          suffix=" USD"
          disabled={!config?.enabled}
        />
        
        <SliderInput
          label="Max Per Day"
          value={parseFloat(config?.maxPerDay || 50)}
          onChange={(v) => updateConfig('maxPerDay', v.toFixed(2))}
          min={10}
          max={500}
          step={10}
          suffix=" USD"
          disabled={!config?.enabled}
        />
        
        <SliderInput
          label="Max Open Positions"
          value={config?.maxOpenPositions || 3}
          onChange={(v) => updateConfig('maxOpenPositions', Math.round(v))}
          min={1}
          max={10}
          step={1}
          suffix=""
          disabled={!config?.enabled}
        />
        
        <SliderInput
          label="Stop After Consecutive Losses"
          value={config?.stopAfterLosses || 3}
          onChange={(v) => updateConfig('stopAfterLosses', Math.round(v))}
          min={2}
          max={10}
          step={1}
          suffix=""
          disabled={!config?.enabled}
        />
      </div>

      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '18px', 
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>📡</span>
          Signal Filters
        </h2>
        
        <ChipSelector
          label="Allowed Signals"
          options={[
            { value: 'BUY', label: 'BUY' },
            { value: 'STRONG_BUY', label: 'STRONG BUY' },
            { value: 'SELL', label: 'SELL' },
            { value: 'STRONG_SELL', label: 'STRONG SELL' }
          ]}
          selected={allowedSignals}
          onChange={(v) => updateConfig('allowedSignals', JSON.stringify(v))}
          disabled={!config?.enabled}
        />
        
        <ChipSelector
          label="Allowed Horizons"
          options={[
            { value: '1h', label: '1 Hour' },
            { value: '4h', label: '4 Hours' },
            { value: '24h', label: '24 Hours' },
            { value: '7d', label: '7 Days' }
          ]}
          selected={allowedHorizons}
          onChange={(v) => updateConfig('allowedHorizons', JSON.stringify(v))}
          disabled={!config?.enabled}
        />
      </div>

      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '18px', 
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🔔</span>
          Notifications
        </h2>
        
        <ToggleSwitch
          label="Notify on trade execution"
          checked={config?.notifyOnTrade ?? true}
          onChange={(v) => updateConfig('notifyOnTrade', v)}
          disabled={!config?.enabled}
        />
        
        <ToggleSwitch
          label="Notify on recommendations"
          checked={config?.notifyOnRecommendation ?? true}
          onChange={(v) => updateConfig('notifyOnRecommendation', v)}
          disabled={!config?.enabled}
        />

        <div style={{ marginTop: '12px', color: '#555', fontSize: '12px' }}>
          Email notifications sent when enabled
        </div>

        <div style={{ 
          marginTop: '20px', 
          paddingTop: '20px', 
          borderTop: '1px solid #333' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            marginBottom: '12px' 
          }}>
            <span style={{ fontSize: '18px' }}>📱</span>
            <span style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>SMS Notifications</span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Phone Number</div>
            <input
              type="tel"
              value={config?.smsPhoneNumber || ''}
              onChange={(e) => updateConfig('smsPhoneNumber', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={!config?.enabled}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#141414',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: !config?.enabled ? 'not-allowed' : 'text',
                opacity: !config?.enabled ? 0.5 : 1
              }}
            />
          </div>

          <div 
            onClick={() => {
              if (!config?.enabled) return
              if (!config?.smsPhoneNumber && !config?.smsOptIn) return
              updateConfig('smsOptIn', !config?.smsOptIn)
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '10px',
              padding: '12px',
              background: config?.smsOptIn ? '#14F19510' : '#141414',
              border: config?.smsOptIn ? '1px solid #14F19540' : '1px solid #333',
              borderRadius: '10px',
              cursor: (!config?.enabled || (!config?.smsPhoneNumber && !config?.smsOptIn)) ? 'not-allowed' : 'pointer',
              opacity: !config?.enabled ? 0.5 : 1
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              border: config?.smsOptIn ? '2px solid #14F195' : '2px solid #555',
              background: config?.smsOptIn ? '#14F195' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              {config?.smsOptIn && (
                <span style={{ color: '#0f0f0f', fontSize: '12px', fontWeight: 700 }}>✓</span>
              )}
            </div>
            <div>
              <div style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.5 }}>
                I agree to receive trade notification text messages from Pulse. Message and data rates may apply. You can opt out at any time by unchecking this box.
              </div>
            </div>
          </div>

          {config?.smsOptIn && config?.smsPhoneNumber && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '10px',
              color: '#14F195',
              fontSize: '12px' 
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#14F195',
                display: 'inline-block'
              }} />
              SMS notifications active
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '18px', 
          margin: '0 0 6px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🌐</span>
          Solana RPC
        </h2>
        <p style={{ color: '#666', fontSize: '12px', margin: '0 0 20px 0' }}>
          Use your own Solana RPC endpoint for trade execution. Leave empty to use the default.
        </p>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={config?.customRpcUrl || ''}
            onChange={(e) => updateConfig('customRpcUrl', e.target.value)}
            placeholder="https://your-rpc-endpoint.com"
            disabled={!config?.enabled}
            style={{
              width: '100%',
              padding: '12px 16px',
              paddingRight: config?.customRpcUrl ? '80px' : '16px',
              background: '#141414',
              border: '1px solid #333',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: !config?.enabled ? 'not-allowed' : 'text',
              opacity: !config?.enabled ? 0.5 : 1
            }}
          />
          {config?.customRpcUrl && (
            <button
              onClick={() => updateConfig('customRpcUrl', '')}
              disabled={!config?.enabled}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '4px 12px',
                background: '#FF6B6B20',
                border: '1px solid #FF6B6B',
                borderRadius: '6px',
                color: '#FF6B6B',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginTop: '12px',
          color: config?.customRpcUrl ? '#00D4FF' : '#555',
          fontSize: '12px' 
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: config?.customRpcUrl ? '#00D4FF' : '#555',
            display: 'inline-block'
          }} />
          {config?.customRpcUrl ? 'Using custom RPC endpoint' : 'Using default RPC endpoint'}
        </div>
      </div>

      <div style={{
        background: '#141414',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ color: '#666', fontSize: '11px', marginBottom: '4px' }}>
            Total Trades
          </div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>
            {config?.totalTradesExecuted || 0}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ color: '#666', fontSize: '11px', marginBottom: '4px' }}>
            Win Rate
          </div>
          <div style={{ 
            color: (config?.winningTrades || 0) >= (config?.losingTrades || 0) ? '#14F195' : '#FF6B6B', 
            fontSize: '24px', 
            fontWeight: 700 
          }}>
            {config?.totalTradesExecuted > 0 
              ? ((config.winningTrades / config.totalTradesExecuted) * 100).toFixed(1) 
              : 0}%
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ color: '#666', fontSize: '11px', marginBottom: '4px' }}>
            Total P/L
          </div>
          <div style={{ 
            color: parseFloat(config?.totalProfitLoss || 0) >= 0 ? '#14F195' : '#FF6B6B', 
            fontSize: '24px', 
            fontWeight: 700 
          }}>
            ${parseFloat(config?.totalProfitLoss || 0).toFixed(2)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ color: '#666', fontSize: '11px', marginBottom: '4px' }}>
            Consecutive Losses
          </div>
          <div style={{ 
            color: (config?.consecutiveLosses || 0) >= (config?.stopAfterLosses || 3) ? '#FF6B6B' : '#fff', 
            fontSize: '24px', 
            fontWeight: 700 
          }}>
            {config?.consecutiveLosses || 0}
          </div>
        </div>
      </div>
    </div>
  )
}
