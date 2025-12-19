import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { BuiltInWalletProvider } from './context/BuiltInWalletContext'
import SniperBotTab from './components/tabs/SniperBotTab'
import StrikeAgentPublicView from './pages/StrikeAgentPublicView'

const PREMIUM_TIERS = ['strike_agent', 'strike_agent_monthly', 'strike_agent_annual', 
                       'complete_bundle', 'complete_bundle_monthly', 'complete_bundle_annual',
                       'founder', 'legacy_founder', 'annual', 'premium', 'RM', 'FOUNDER']

function StrikeAgentApp() {
  const [userId, setUserId] = useState(null)
  const [userConfig, setUserConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  
  const isAdmin = userConfig?.accessLevel === 'admin' || userConfig?.accessLevel === 'owner'
  const isPremium = PREMIUM_TIERS.includes(userConfig?.subscriptionTier?.toLowerCase?.() || userConfig?.subscriptionTier)
  const hasFullAccess = isAdmin || isPremium
  
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const storedToken = localStorage.getItem('sessionToken')
        const headers = storedToken ? { 'X-Session-Token': storedToken } : {}
        
        const response = await fetch('/api/session', { headers })
        if (response.ok) {
          const data = await response.json()
          if (data.user?.email) {
            setUserId(data.user.email)
            if (data.sessionToken) {
              localStorage.setItem('sessionToken', data.sessionToken)
            }
            const configRes = await fetch(`/api/users/${data.user.email}/dashboard`)
            if (configRes.ok) {
              const config = await configRes.json()
              setUserConfig({ ...config, sessionToken: data.sessionToken })
            }
          }
        }
      } catch (err) {
        console.error('Session fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSession()
  }, [])
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        color: '#fff',
      }}>
        <img 
          src="/strikeagent-icon.png" 
          alt="StrikeAgent" 
          style={{ width: 80, height: 80, borderRadius: 16 }} 
        />
        <div style={{ fontSize: 14, color: '#888' }}>Loading StrikeAgent...</div>
      </div>
    )
  }
  
  if (!userId) {
    return (
      <ThemeProvider>
        <StrikeAgentPublicView 
          onSubscribe={() => {
            window.location.href = 'https://darkwavepulse.com/app?tab=pricing'
          }} 
        />
      </ThemeProvider>
    )
  }
  
  return (
    <ThemeProvider>
      <BuiltInWalletProvider>
        <div style={{ 
          minHeight: '100vh', 
          background: '#0a0a0a',
          paddingBottom: hasFullAccess ? 0 : 80,
        }}>
          <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img 
                src="/strikeagent-icon.png" 
                alt="StrikeAgent" 
                style={{ width: 32, height: 32, borderRadius: 8 }} 
              />
              <span style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: '#fff',
                fontFamily: 'Orbitron, sans-serif',
              }}>
                StrikeAgent
              </span>
              {isAdmin && (
                <span style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: 4,
                  color: '#8B5CF6',
                  fontWeight: 600,
                }}>
                  ADMIN
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {hasFullAccess && (
                <span style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: 'rgba(57, 255, 20, 0.15)',
                  border: '1px solid rgba(57, 255, 20, 0.3)',
                  borderRadius: 12,
                  color: '#39FF14',
                  fontWeight: 600,
                }}>
                  PRO
                </span>
              )}
            </div>
          </header>
          
          <div style={{ padding: '0 12px' }}>
            <SniperBotTab 
              userId={userId}
              userConfig={userConfig}
              isViewOnly={!hasFullAccess}
              isAdmin={isAdmin}
            />
          </div>
          
          {!hasFullAccess && (
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px 16px',
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
              background: 'linear-gradient(180deg, transparent 0%, #0a0a0a 20%)',
              borderTop: '1px solid rgba(0, 212, 255, 0.2)',
            }}>
              <button
                onClick={() => window.location.href = 'https://darkwavepulse.com/app?tab=pricing'}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                }}
              >
                <span>🚀</span>
                <span>Unlock Full Trading Power</span>
              </button>
            </div>
          )}
        </div>
      </BuiltInWalletProvider>
    </ThemeProvider>
  )
}

export default StrikeAgentApp
