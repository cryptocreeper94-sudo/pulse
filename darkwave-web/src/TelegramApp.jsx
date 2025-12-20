import { useState, useEffect, Component } from 'react'
import { 
  SniperBotTab,
  WalletTab,
  PricingTab,
  SettingsTab
} from './components/tabs'
import SubscriptionGate from './components/ui/SubscriptionGate'
import { BuiltInWalletProvider } from './context/BuiltInWalletContext'
import { ThemeProvider } from './context/ThemeContext'
import { TelegramProvider, useTelegram } from './context/TelegramContext'
import './styles/components.css'

class TelegramErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('TelegramApp error:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center',
          background: '#0f0f0f',
          minHeight: '100vh',
          color: '#fff'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #00D4FF, #00A0CC)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const NAV_ITEMS = [
  { id: 'sniper', label: 'StrikeAgent', icon: '🎯' },
  { id: 'wallet', label: 'Wallet', icon: '💳' },
  { id: 'pricing', label: 'Upgrade', icon: '⚡' },
]

function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#0f0f0f',
      borderTop: '1px solid rgba(0, 212, 255, 0.15)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 1000,
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer',
              color: isActive ? '#00d4ff' : '#666',
              transition: 'color 0.2s ease',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? '600' : '400',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {item.label}
            </span>
            {isActive && (
              <span style={{
                position: 'absolute',
                bottom: '4px',
                width: '24px',
                height: '2px',
                background: '#00d4ff',
                borderRadius: '1px',
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}

function TelegramAppContent() {
  const { telegramUser, isReady, webApp } = useTelegram()
  const [activeTab, setActiveTab] = useState('sniper')
  const [userId, setUserId] = useState(null)
  const [userConfig, setUserConfig] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  
  useEffect(() => {
    if (telegramUser?.id) {
      setUserId(`telegram_${telegramUser.id}`)
    }
  }, [telegramUser])
  
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await fetch('/api/session')
        if (response.ok) {
          const data = await response.json()
          if (data.user?.email) {
            setUserId(data.user.email)
            const configRes = await fetch(`/api/users/${data.user.email}/dashboard`)
            if (configRes.ok) {
              const config = await configRes.json()
              setUserConfig(config)
            }
          }
        }
      } catch (err) {
        console.log('Session check failed, using defaults')
      }
    }
    fetchUserSession()
  }, [])
  
  useEffect(() => {
    if (webApp && isReady) {
      webApp.setHeaderColor?.('#0f0f0f')
      webApp.setBackgroundColor?.('#0f0f0f')
    }
  }, [webApp, isReady])
  
  const triggerHapticFeedback = (type = 'impact') => {
    if (webApp?.HapticFeedback) {
      switch (type) {
        case 'impact':
          webApp.HapticFeedback.impactOccurred('medium')
          break
        case 'notification':
          webApp.HapticFeedback.notificationOccurred('success')
          break
        case 'selection':
          webApp.HapticFeedback.selectionChanged()
          break
      }
    }
  }
  
  const handleTabChange = (tab) => {
    triggerHapticFeedback('selection')
    if (tab === 'settings') {
      setShowSettings(true)
    } else {
      setShowSettings(false)
      setActiveTab(tab)
    }
  }
  
  const renderTab = () => {
    if (showSettings) {
      return (
        <SettingsTab 
          userId={userId} 
          userConfig={userConfig} 
          setUserConfig={setUserConfig} 
          isTelegram={true}
        />
      )
    }
    
    switch (activeTab) {
      case 'sniper':
        return (
          <SubscriptionGate 
            requiredTier="rm-plus" 
            featureName="StrikeAgent AI Trading" 
            mode="overlay" 
            currentTier={userConfig?.subscriptionTier}
          >
            <SniperBotTab isTelegram={true} />
          </SubscriptionGate>
        )
      case 'wallet':
        return (
          <SubscriptionGate 
            requiredTier="rm-plus" 
            featureName="Wallet Transactions" 
            mode="overlay" 
            currentTier={userConfig?.subscriptionTier}
          >
            <WalletTab userId={userId} isTelegram={true} />
          </SubscriptionGate>
        )
      case 'pricing':
        return (
          <PricingTab 
            userId={userId} 
            currentTier={userConfig?.subscriptionTier} 
            isTelegram={true} 
          />
        )
      default:
        return (
          <SubscriptionGate 
            requiredTier="rm-plus" 
            featureName="StrikeAgent AI Trading" 
            mode="overlay" 
            currentTier={userConfig?.subscriptionTier}
          >
            <SniperBotTab isTelegram={true} />
          </SubscriptionGate>
        )
    }
  }
  
  if (!isReady) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#0f0f0f',
        color: '#00d4ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 50, 
            height: 50, 
            border: '3px solid #00d4ff',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ margin: 0, fontSize: '14px' }}>Loading StrikeAgent...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
  
  return (
    <BuiltInWalletProvider>
      <div style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#fff',
        paddingBottom: '80px',
      }}>
        <header style={{
          position: 'sticky',
          top: 0,
          background: '#0f0f0f',
          borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🎯</span>
            <span style={{ 
              fontWeight: '700', 
              fontSize: '18px',
              background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              StrikeAgent
            </span>
          </div>
          <button
            onClick={() => handleTabChange('settings')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              opacity: showSettings ? 1 : 0.6,
            }}
          >
            ⚙️
          </button>
        </header>
        
        <main style={{ padding: '0 12px' }}>
          {renderTab()}
        </main>
        
        {!showSettings && (
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        )}
      </div>
    </BuiltInWalletProvider>
  )
}

function TelegramApp() {
  return (
    <TelegramErrorBoundary>
      <ThemeProvider>
        <TelegramProvider>
          <TelegramAppContent />
        </TelegramProvider>
      </ThemeProvider>
    </TelegramErrorBoundary>
  )
}

export default TelegramApp
