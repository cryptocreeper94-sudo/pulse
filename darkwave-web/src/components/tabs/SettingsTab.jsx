import { useState, useEffect, useRef, useCallback } from 'react'
import { Accordion, AccordionItem } from '../ui'
import { useAvatar } from '../../context/AvatarContext'
import MiniAvatar from '../ui/MiniAvatar'
import AvatarCreator from '../ui/AvatarCreator'

const base64UrlEncode = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const base64UrlDecode = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export default function SettingsTab({ userId, userConfig, setUserConfig }) {
  const { avatar, mode, isCustomMode, toggleMode, setAvatarMode } = useAvatar()
  const [showAvatarCreator, setShowAvatarCreator] = useState(false)
  const [landingTab, setLandingTab] = useState(userConfig?.defaultLandingTab || 'dashboard')
  const [saving, setSaving] = useState(false)
  const debounceTimerRef = useRef(null)
  
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricCredentials, setBiometricCredentials] = useState([])
  const [biometricSettings, setBiometricSettings] = useState({ biometric2faEnabled: false, biometricWalletEnabled: false })
  const [biometricLoading, setBiometricLoading] = useState(true)
  const [biometricEnrolling, setBiometricEnrolling] = useState(false)
  const [biometricError, setBiometricError] = useState(null)
  const [biometricSuccess, setBiometricSuccess] = useState(null)
  
  const [autoTradeConfig, setAutoTradeConfig] = useState({
    enabled: false,
    mode: 'observer',
    confidenceThreshold: 70,
    accuracyThreshold: 55,
    maxPerTrade: 100,
    maxPerDay: 500,
    maxOpenPositions: 3,
    stopAfterLosses: 3,
    isPaused: false,
    pauseReason: null
  })
  const [autoTradeStats, setAutoTradeStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalPnl: 0
  })
  const [autoTradeLoading, setAutoTradeLoading] = useState(true)
  const [autoTradeSaving, setAutoTradeSaving] = useState(false)

  useEffect(() => {
    if (userId) {
      loadAutoTradeConfig()
      loadAutoTradeStats()
    }
  }, [userId])

  useEffect(() => {
    checkBiometricSupport()
    if (userConfig?.sessionToken) {
      loadBiometricCredentials()
    }
  }, [userConfig?.sessionToken])

  const checkBiometricSupport = async () => {
    try {
      if (window.PublicKeyCredential && 
          typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricSupported(available)
      }
    } catch (err) {
      console.error('Biometric check failed:', err)
      setBiometricSupported(false)
    }
  }

  const loadBiometricCredentials = async () => {
    if (!userConfig?.sessionToken) return
    setBiometricLoading(true)
    try {
      const response = await fetch('/api/webauthn/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: userConfig.sessionToken })
      })
      if (response.ok) {
        const data = await response.json()
        setBiometricCredentials(data.credentials || [])
        setBiometricSettings(data.settings || { biometric2faEnabled: false, biometricWalletEnabled: false })
      }
    } catch (err) {
      console.error('Failed to load biometric credentials:', err)
    } finally {
      setBiometricLoading(false)
    }
  }

  const enrollBiometric = async (usedFor) => {
    if (!userConfig?.sessionToken || !biometricSupported) return
    setBiometricEnrolling(true)
    setBiometricError(null)
    setBiometricSuccess(null)
    
    try {
      const startRes = await fetch('/api/webauthn/registration/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionToken: userConfig.sessionToken, 
          deviceName: navigator.userAgent.includes('Mac') ? 'Touch ID' : 
                      navigator.userAgent.includes('Windows') ? 'Windows Hello' : 'Biometric Device',
          usedFor 
        })
      })
      
      if (!startRes.ok) {
        const err = await startRes.json()
        throw new Error(err.error || 'Failed to start registration')
      }
      
      const { challengeId, options } = await startRes.json()
      
      const publicKeyOptions = {
        ...options,
        challenge: base64UrlDecode(options.challenge),
        user: {
          ...options.user,
          id: base64UrlDecode(options.user.id)
        }
      }
      
      const credential = await navigator.credentials.create({ publicKey: publicKeyOptions })
      
      const credentialForServer = {
        id: credential.id,
        rawId: base64UrlEncode(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: base64UrlEncode(credential.response.clientDataJSON),
          attestationObject: base64UrlEncode(credential.response.attestationObject),
          transports: credential.response.getTransports ? credential.response.getTransports() : ['internal']
        }
      }
      
      const completeRes = await fetch('/api/webauthn/registration/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: userConfig.sessionToken,
          challengeId,
          credential: credentialForServer,
          deviceName: navigator.userAgent.includes('Mac') ? 'Touch ID' : 
                      navigator.userAgent.includes('Windows') ? 'Windows Hello' : 'Biometric Device',
          usedFor
        })
      })
      
      if (!completeRes.ok) {
        const err = await completeRes.json()
        throw new Error(err.error || 'Failed to complete registration')
      }
      
      setBiometricSuccess(usedFor === '2fa' ? 'Biometric login enabled!' : 'Biometric wallet confirmation enabled!')
      loadBiometricCredentials()
    } catch (err) {
      console.error('Biometric enrollment failed:', err)
      setBiometricError(err.message || 'Enrollment failed. Please try again.')
    } finally {
      setBiometricEnrolling(false)
    }
  }

  const removeBiometricCredential = async (credentialId) => {
    if (!userConfig?.sessionToken) return
    try {
      const response = await fetch('/api/webauthn/credentials/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: userConfig.sessionToken, credentialId })
      })
      if (response.ok) {
        loadBiometricCredentials()
        setBiometricSuccess('Biometric credential removed')
      }
    } catch (err) {
      console.error('Failed to remove credential:', err)
      setBiometricError('Failed to remove credential')
    }
  }

  const loadAutoTradeConfig = async () => {
    if (!userId) return
    try {
      const response = await fetch(`/api/auto-trade/config?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setAutoTradeConfig(prev => ({ ...prev, ...data.config }))
        }
      }
    } catch (err) {
      console.error('Failed to load auto-trade config:', err)
    } finally {
      setAutoTradeLoading(false)
    }
  }

  const loadAutoTradeStats = async () => {
    if (!userId) return
    try {
      const response = await fetch(`/api/auto-trade/stats?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAutoTradeStats({
            totalTrades: data.config?.totalTradesExecuted || 0,
            winRate: data.winRate || 0,
            totalPnl: parseFloat(data.config?.totalProfitLoss) || 0
          })
        }
      }
    } catch (err) {
      console.error('Failed to load auto-trade stats:', err)
    }
  }

  const handleAutoTradeToggle = async () => {
    if (!userId) return
    const newEnabled = !autoTradeConfig.enabled
    setAutoTradeConfig(prev => ({ ...prev, enabled: newEnabled }))
    
    try {
      const response = await fetch('/api/auto-trade/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled: newEnabled })
      })
      if (!response.ok) {
        setAutoTradeConfig(prev => ({ ...prev, enabled: !newEnabled }))
        console.error('Failed to toggle auto-trade')
      }
    } catch (err) {
      setAutoTradeConfig(prev => ({ ...prev, enabled: !newEnabled }))
      console.error('Failed to toggle auto-trade:', err)
    }
  }

  const handleModeChange = async (newMode) => {
    if (!userId) return
    setAutoTradeConfig(prev => ({ ...prev, mode: newMode }))
    await saveAutoTradeConfig({ mode: newMode })
  }

  const handleConfigChange = (key, value) => {
    setAutoTradeConfig(prev => ({ ...prev, [key]: value }))
  }

  const debouncedSaveAutoTradeConfig = useCallback((updates) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      saveAutoTradeConfig(updates)
    }, 500)
  }, [userId])

  const saveAutoTradeConfig = async (updates = {}) => {
    if (!userId) return
    setAutoTradeSaving(true)
    try {
      const response = await fetch('/api/auto-trade/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...autoTradeConfig, ...updates })
      })
      if (!response.ok) {
        console.error('Failed to save auto-trade config')
      }
    } catch (err) {
      console.error('Failed to save auto-trade config:', err)
    } finally {
      setAutoTradeSaving(false)
    }
  }

  const handlePauseResume = async () => {
    if (!userId) return
    const endpoint = autoTradeConfig.isPaused ? '/api/auto-trade/resume' : '/api/auto-trade/pause'
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (response.ok) {
        setAutoTradeConfig(prev => ({ 
          ...prev, 
          isPaused: !prev.isPaused,
          pauseReason: prev.isPaused ? null : prev.pauseReason
        }))
      }
    } catch (err) {
      console.error('Failed to pause/resume auto-trade:', err)
    }
  }
  
  const handleLandingTabChange = async (newTab) => {
    setLandingTab(newTab)
    if (!userId) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/users/${userId}/dashboard`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultLandingTab: newTab })
      })
      if (response.ok) {
        const data = await response.json()
        if (setUserConfig) {
          setUserConfig(prev => ({ ...prev, defaultLandingTab: newTab }))
        }
      }
    } catch (err) {
      console.error('Failed to save landing tab:', err)
    } finally {
      setSaving(false)
    }
  }

  const tradingModes = [
    { id: 'observer', icon: '🔍', label: 'Observer', desc: 'Watch AI recommendations only' },
    { id: 'approval', icon: '✋', label: 'Approval', desc: 'Confirm each trade manually' },
    { id: 'semi-auto', icon: '🔄', label: 'Semi-Auto', desc: 'Small trades with notifications' },
    { id: 'full-auto', icon: '⚡', label: 'Full Auto', desc: 'Fully autonomous trading' }
  ]
  
  return (
    <div className="settings-tab">
      <div className="section-box mb-md">
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <MiniAvatar size={60} onClick={() => setShowAvatarCreator(true)} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {isCustomMode ? avatar.name || 'My Avatar' : 'Founder Account'}
            </div>
            {userConfig?.hallmarkId && (
              <div style={{ fontSize: 11, color: '#00D4FF', marginBottom: 2 }}>
                {userConfig.hallmarkId}
              </div>
            )}
            <div style={{ fontSize: 12, color: '#39FF14' }}>✓ Beta V1 Access</div>
            <div style={{ fontSize: 11, color: '#888' }}>Member since 2025</div>
          </div>
        </div>
      </div>
      
      <Accordion singleOpen={false}>
        <AccordionItem title="Avatar Settings" icon="🎭" defaultOpen={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              padding: 16,
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 12
            }}>
              <MiniAvatar size={80} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Avatar Mode</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {isCustomMode ? 'Using custom avatar' : 'Using AI agent (CryptoCat)'}
                </div>
              </div>
              <button
                onClick={toggleMode}
                style={{ 
                  width: 52, 
                  height: 28, 
                  background: isCustomMode ? '#00D4FF' : '#FFA500', 
                  borderRadius: 14,
                  position: 'relative',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background 0.3s ease'
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: isCustomMode ? 26 : 4,
                  top: 4,
                  width: 20,
                  height: 20,
                  background: '#fff',
                  borderRadius: '50%',
                  transition: 'left 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12
                }}>
                  {isCustomMode ? '👤' : '🐱'}
                </span>
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: 8 
            }}>
              <button 
                onClick={() => setAvatarMode('custom')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: isCustomMode ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isCustomMode ? '1px solid #00D4FF' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  color: isCustomMode ? '#00D4FF' : '#888',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                👤 Custom Avatar
              </button>
              <button 
                onClick={() => setAvatarMode('agent')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: !isCustomMode ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: !isCustomMode ? '1px solid #FFA500' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  color: !isCustomMode ? '#FFA500' : '#888',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                🐱 AI Agents
              </button>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => setShowAvatarCreator(true)}
              style={{ width: '100%' }}
            >
              ✏️ Edit Avatar
            </button>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Account Settings" icon="👤">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Email Notifications</span>
              <label style={{ 
                width: 44, 
                height: 24, 
                background: '#39FF14', 
                borderRadius: 12,
                position: 'relative',
                cursor: 'pointer'
              }}>
                <span style={{
                  position: 'absolute',
                  right: 4,
                  top: 4,
                  width: 16,
                  height: 16,
                  background: '#fff',
                  borderRadius: '50%'
                }} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Push Notifications</span>
              <label style={{ 
                width: 44, 
                height: 24, 
                background: '#333', 
                borderRadius: 12,
                position: 'relative',
                cursor: 'pointer'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 4,
                  top: 4,
                  width: 16,
                  height: 16,
                  background: '#888',
                  borderRadius: '50%'
                }} />
              </label>
            </div>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Dashboard Settings" icon="🏠" defaultOpen={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Default Landing Page</div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>
                Choose which page to show when you open the app
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { id: 'dashboard', icon: '🏠', label: 'My Dashboard' },
                  { id: 'markets', icon: '📊', label: 'Crypto Markets' },
                  { id: 'portfolio', icon: '💼', label: 'Portfolio' },
                  { id: 'projects', icon: '🚀', label: 'Projects' },
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleLandingTabChange(option.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      background: landingTab === option.id ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: landingTab === option.id ? '1px solid #00D4FF' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      color: landingTab === option.id ? '#00D4FF' : '#ccc',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: landingTab === option.id ? 600 : 400,
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{option.icon}</span>
                    <span>{option.label}</span>
                    {landingTab === option.id && (
                      <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              {saving && (
                <div style={{ fontSize: 11, color: '#00D4FF', marginTop: 8 }}>
                  Saving...
                </div>
              )}
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title="AI Trading" icon="🤖">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {autoTradeLoading ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#888' }}>
                Loading AI Trading settings...
              </div>
            ) : (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: 16,
                  background: '#0f0f0f',
                  borderRadius: 12,
                  border: autoTradeConfig.enabled ? '1px solid #39FF14' : '1px solid #333'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: autoTradeConfig.enabled ? '#39FF14' : '#fff' }}>
                      Auto-Trading {autoTradeConfig.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {autoTradeConfig.enabled ? 'AI is actively monitoring markets' : 'Enable to start autonomous trading'}
                    </div>
                  </div>
                  <button
                    onClick={handleAutoTradeToggle}
                    style={{ 
                      width: 52, 
                      height: 28, 
                      background: autoTradeConfig.enabled ? '#39FF14' : '#333', 
                      borderRadius: 14,
                      position: 'relative',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'background 0.3s ease',
                      boxShadow: autoTradeConfig.enabled ? '0 0 12px rgba(57, 255, 20, 0.4)' : 'none'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      left: autoTradeConfig.enabled ? 26 : 4,
                      top: 4,
                      width: 20,
                      height: 20,
                      background: '#fff',
                      borderRadius: '50%',
                      transition: 'left 0.3s ease'
                    }} />
                  </button>
                </div>

                <div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Trading Mode</div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>
                    Choose how the AI should handle trades
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tradingModes.map(modeOption => (
                      <button
                        key={modeOption.id}
                        onClick={() => handleModeChange(modeOption.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '14px 16px',
                          background: autoTradeConfig.mode === modeOption.id ? '#1a1a1a' : '#0f0f0f',
                          border: autoTradeConfig.mode === modeOption.id ? '1px solid #00D4FF' : '1px solid #333',
                          borderRadius: 10,
                          color: autoTradeConfig.mode === modeOption.id ? '#00D4FF' : '#ccc',
                          cursor: 'pointer',
                          textAlign: 'left',
                          boxShadow: autoTradeConfig.mode === modeOption.id ? '0 0 12px rgba(0, 212, 255, 0.2)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{modeOption.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{modeOption.label}</div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{modeOption.desc}</div>
                        </div>
                        {autoTradeConfig.mode === modeOption.id && (
                          <span style={{ color: '#00D4FF', fontSize: 16 }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  padding: 16, 
                  background: '#0f0f0f', 
                  borderRadius: 12,
                  border: '1px solid #333'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>Thresholds</div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13 }}>Confidence Threshold</span>
                      <span style={{ color: '#00D4FF', fontWeight: 600 }}>{autoTradeConfig.confidenceThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="90"
                      value={autoTradeConfig.confidenceThreshold}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value)
                        handleConfigChange('confidenceThreshold', newValue)
                        debouncedSaveAutoTradeConfig({ confidenceThreshold: newValue })
                      }}
                      style={{
                        width: '100%',
                        height: 6,
                        borderRadius: 3,
                        background: `linear-gradient(to right, #00D4FF 0%, #00D4FF ${((autoTradeConfig.confidenceThreshold - 60) / 30) * 100}%, #333 ${((autoTradeConfig.confidenceThreshold - 60) / 30) * 100}%, #333 100%)`,
                        appearance: 'none',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', marginTop: 4 }}>
                      <span>60%</span>
                      <span>90%</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13 }}>Accuracy Threshold</span>
                      <span style={{ color: '#00D4FF', fontWeight: 600 }}>{autoTradeConfig.accuracyThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="55"
                      max="75"
                      value={autoTradeConfig.accuracyThreshold}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value)
                        handleConfigChange('accuracyThreshold', newValue)
                        debouncedSaveAutoTradeConfig({ accuracyThreshold: newValue })
                      }}
                      style={{
                        width: '100%',
                        height: 6,
                        borderRadius: 3,
                        background: `linear-gradient(to right, #00D4FF 0%, #00D4FF ${((autoTradeConfig.accuracyThreshold - 55) / 20) * 100}%, #333 ${((autoTradeConfig.accuracyThreshold - 55) / 20) * 100}%, #333 100%)`,
                        appearance: 'none',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', marginTop: 4 }}>
                      <span>55%</span>
                      <span>75%</span>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  padding: 16, 
                  background: '#0f0f0f', 
                  borderRadius: 12,
                  border: '1px solid #333'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>Position Limits</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>
                        Max per trade (USD)
                      </label>
                      <input
                        type="number"
                        value={autoTradeConfig.maxPerTrade}
                        onChange={(e) => handleConfigChange('maxPerTrade', parseInt(e.target.value) || 0)}
                        onBlur={(e) => saveAutoTradeConfig({ maxPerTrade: parseInt(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: 8,
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 600
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>
                        Max per day (USD)
                      </label>
                      <input
                        type="number"
                        value={autoTradeConfig.maxPerDay}
                        onChange={(e) => handleConfigChange('maxPerDay', parseInt(e.target.value) || 0)}
                        onBlur={(e) => saveAutoTradeConfig({ maxPerDay: parseInt(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: 8,
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 600
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>
                        Max open positions
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[1, 2, 3, 5, 10].map(num => (
                          <button
                            key={num}
                            onClick={() => {
                              handleConfigChange('maxOpenPositions', num)
                              saveAutoTradeConfig({ maxOpenPositions: num })
                            }}
                            style={{
                              flex: 1,
                              padding: '10px 0',
                              background: autoTradeConfig.maxOpenPositions === num ? '#1a1a1a' : '#0f0f0f',
                              border: autoTradeConfig.maxOpenPositions === num ? '1px solid #00D4FF' : '1px solid #333',
                              borderRadius: 8,
                              color: autoTradeConfig.maxOpenPositions === num ? '#00D4FF' : '#888',
                              cursor: 'pointer',
                              fontSize: 14,
                              fontWeight: 600
                            }}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  padding: 16, 
                  background: '#0f0f0f', 
                  borderRadius: 12,
                  border: '1px solid #333'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>Safety Controls</div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>
                      Stop after consecutive losses
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[2, 3, 5, 7, 10].map(num => (
                        <button
                          key={num}
                          onClick={() => {
                            handleConfigChange('stopAfterLosses', num)
                            saveAutoTradeConfig({ stopAfterLosses: num })
                          }}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            background: autoTradeConfig.stopAfterLosses === num ? '#1a1a1a' : '#0f0f0f',
                            border: autoTradeConfig.stopAfterLosses === num ? '1px solid #ff4444' : '1px solid #333',
                            borderRadius: 8,
                            color: autoTradeConfig.stopAfterLosses === num ? '#ff4444' : '#888',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePauseResume}
                    className={autoTradeConfig.isPaused ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ 
                      width: '100%',
                      background: autoTradeConfig.isPaused ? '#39FF14' : '#ff4444',
                      border: 'none',
                      color: autoTradeConfig.isPaused ? '#000' : '#fff',
                      fontWeight: 600
                    }}
                  >
                    {autoTradeConfig.isPaused ? '▶️ Resume Trading' : '⏸️ Pause Trading'}
                  </button>
                  
                  {autoTradeConfig.isPaused && autoTradeConfig.pauseReason && (
                    <div style={{ 
                      marginTop: 12, 
                      padding: 12, 
                      background: 'rgba(255, 68, 68, 0.1)', 
                      borderRadius: 8,
                      border: '1px solid rgba(255, 68, 68, 0.3)'
                    }}>
                      <div style={{ fontSize: 11, color: '#ff4444', fontWeight: 600, marginBottom: 4 }}>
                        Pause Reason:
                      </div>
                      <div style={{ fontSize: 12, color: '#ccc' }}>
                        {autoTradeConfig.pauseReason}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ 
                  padding: 16, 
                  background: '#0f0f0f', 
                  borderRadius: 12,
                  border: '1px solid #333'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>Trading Stats</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div style={{ 
                      padding: 12, 
                      background: '#1a1a1a', 
                      borderRadius: 8, 
                      textAlign: 'center' 
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#00D4FF' }}>
                        {autoTradeStats.totalTrades}
                      </div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>Total Trades</div>
                    </div>
                    
                    <div style={{ 
                      padding: 12, 
                      background: '#1a1a1a', 
                      borderRadius: 8, 
                      textAlign: 'center' 
                    }}>
                      <div style={{ 
                        fontSize: 20, 
                        fontWeight: 700, 
                        color: autoTradeStats.winRate >= 50 ? '#39FF14' : '#ff4444' 
                      }}>
                        {autoTradeStats.winRate.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>Win Rate</div>
                    </div>
                    
                    <div style={{ 
                      padding: 12, 
                      background: '#1a1a1a', 
                      borderRadius: 8, 
                      textAlign: 'center' 
                    }}>
                      <div style={{ 
                        fontSize: 20, 
                        fontWeight: 700, 
                        color: autoTradeStats.totalPnl >= 0 ? '#39FF14' : '#ff4444' 
                      }}>
                        {autoTradeStats.totalPnl >= 0 ? '+' : ''}{autoTradeStats.totalPnl.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>Total P&L</div>
                    </div>
                  </div>
                </div>

                {autoTradeSaving && (
                  <div style={{ fontSize: 11, color: '#00D4FF', textAlign: 'center' }}>
                    Saving...
                  </div>
                )}
              </>
            )}
          </div>
        </AccordionItem>
        
        <AccordionItem title="Display Settings" icon="🎨">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🌙 Dark Theme (Active)
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🐱 Crypto Cat Mode
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              👔 Business Mode
            </button>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Subscription" icon="💎">
          <div style={{ 
            padding: 16, 
            background: 'rgba(57, 255, 20, 0.1)', 
            border: '1px solid rgba(57, 255, 20, 0.3)',
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ color: '#39FF14', fontWeight: 700, marginBottom: 4 }}>
              ✓ Legacy Founder
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>$4/month</div>
            <div style={{ fontSize: 11, color: '#888' }}>Locked in forever</div>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Security" icon="🔒">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {biometricError && (
              <div style={{ padding: 12, background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: 8, color: '#ff4444', fontSize: 12 }}>
                {biometricError}
              </div>
            )}
            {biometricSuccess && (
              <div style={{ padding: 12, background: 'rgba(57, 255, 20, 0.1)', border: '1px solid rgba(57, 255, 20, 0.3)', borderRadius: 8, color: '#39FF14', fontSize: 12 }}>
                {biometricSuccess}
              </div>
            )}
            
            <div style={{ padding: 16, background: '#0f0f0f', borderRadius: 12, border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>👆</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Biometric Authentication</div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    {biometricSupported ? 'Use fingerprint or face recognition' : 'Not supported on this device'}
                  </div>
                </div>
              </div>
              
              {biometricLoading ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#888' }}>Loading...</div>
              ) : !biometricSupported ? (
                <div style={{ padding: 12, background: '#1a1a1a', borderRadius: 8, fontSize: 12, color: '#888' }}>
                  Your browser or device doesn't support biometric authentication. Try using Chrome on a device with Touch ID, Face ID, or Windows Hello.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ 
                    padding: 12, 
                    background: biometricSettings.biometric2faEnabled ? 'rgba(57, 255, 20, 0.1)' : '#1a1a1a', 
                    borderRadius: 8,
                    border: biometricSettings.biometric2faEnabled ? '1px solid rgba(57, 255, 20, 0.3)' : '1px solid #333'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>Login 2FA</div>
                        <div style={{ fontSize: 11, color: '#888' }}>Require biometric after password</div>
                      </div>
                      {biometricSettings.biometric2faEnabled ? (
                        <span style={{ color: '#39FF14', fontSize: 12, fontWeight: 600 }}>✓ Enabled</span>
                      ) : (
                        <button 
                          onClick={() => enrollBiometric('2fa')}
                          disabled={biometricEnrolling}
                          style={{ 
                            background: 'linear-gradient(135deg, #00D4FF, #0099CC)', 
                            border: 'none', 
                            borderRadius: 6, 
                            padding: '8px 16px', 
                            color: '#000', 
                            fontWeight: 600, 
                            fontSize: 12,
                            cursor: biometricEnrolling ? 'wait' : 'pointer',
                            opacity: biometricEnrolling ? 0.6 : 1
                          }}
                        >
                          {biometricEnrolling ? 'Setting up...' : 'Enable'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: 12, 
                    background: biometricSettings.biometricWalletEnabled ? 'rgba(57, 255, 20, 0.1)' : '#1a1a1a', 
                    borderRadius: 8,
                    border: biometricSettings.biometricWalletEnabled ? '1px solid rgba(57, 255, 20, 0.3)' : '1px solid #333'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>Wallet Transactions</div>
                        <div style={{ fontSize: 11, color: '#888' }}>Confirm sends with biometric</div>
                      </div>
                      {biometricSettings.biometricWalletEnabled ? (
                        <span style={{ color: '#39FF14', fontSize: 12, fontWeight: 600 }}>✓ Enabled</span>
                      ) : (
                        <button 
                          onClick={() => enrollBiometric('wallet')}
                          disabled={biometricEnrolling}
                          style={{ 
                            background: 'linear-gradient(135deg, #00D4FF, #0099CC)', 
                            border: 'none', 
                            borderRadius: 6, 
                            padding: '8px 16px', 
                            color: '#000', 
                            fontWeight: 600, 
                            fontSize: 12,
                            cursor: biometricEnrolling ? 'wait' : 'pointer',
                            opacity: biometricEnrolling ? 0.6 : 1
                          }}
                        >
                          {biometricEnrolling ? 'Setting up...' : 'Enable'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {biometricCredentials.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Registered Devices:</div>
                      {biometricCredentials.map(cred => (
                        <div key={cred.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: 8, 
                          background: '#1a1a1a', 
                          borderRadius: 6,
                          marginBottom: 4
                        }}>
                          <div>
                            <span style={{ fontSize: 12 }}>{cred.deviceName || 'Biometric Device'}</span>
                            <span style={{ fontSize: 10, color: '#888', marginLeft: 8 }}>
                              ({cred.usedFor === '2fa' ? 'Login' : 'Wallet'})
                            </span>
                          </div>
                          <button 
                            onClick={() => removeBiometricCredential(cred.id)}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              color: '#ff4444', 
                              fontSize: 11,
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🔑 Change Password
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              📜 View Login History
            </button>
          </div>
        </AccordionItem>
        
        <AccordionItem title="About" icon="ℹ️">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>
              <span style={{ color: '#00D4FF' }}>PULSE</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Version 2.0.6</div>
            <div style={{ fontSize: 11, color: '#666' }}>
              Powered by DarkWave Studios, LLC © 2025
            </div>
          </div>
        </AccordionItem>
      </Accordion>
      
      {showAvatarCreator && (
        <AvatarCreator 
          isOpen={showAvatarCreator}
          onClose={() => setShowAvatarCreator(false)}
        />
      )}
    </div>
  )
}
