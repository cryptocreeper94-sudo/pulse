import { useState, useEffect, Component } from 'react'
import Layout from './components/layout/Layout'
import { 
  MarketsTab, 
  ProjectsTab, 
  LearnTab, 
  PortfolioTab, 
  StakingTab, 
  SettingsTab,
  V2DetailsTab,
  DashboardTab,
  SniperBotTab,
  WalletTab,
  PricingTab,
  AnalysisTab,
  MLDashboardTab,
  RiskDashboardTab
} from './components/tabs'
import { GlossaryPopup, AIChatButton } from './components/ui'
import { GlossaryProvider } from './context/GlossaryContext'
import { AvatarProvider } from './context/AvatarContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { BuiltInWalletProvider } from './context/BuiltInWalletContext'
import { ThemeProvider } from './context/ThemeContext'
import { SkinsProvider } from './context/SkinsContext'
import CryptoCatPopup from './components/engagement/CryptoCatPopup'
import AgentPopup from './components/engagement/AgentPopup'
import './styles/components.css'

class SniperBotErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('SniperBotTab error:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#fff', marginBottom: '12px' }}>StrikeAgent Loading Error</h2>
          <p style={{ color: '#888', marginBottom: '24px' }}>
            There was an issue loading StrikeAgent. Please try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #00D4FF, #00A0CC)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              marginRight: '12px'
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const isStrikeAgentDomain = window.location.hostname.includes('strikeagent')
  const isDemoPath = window.location.pathname.startsWith('/demo')
  const isDemoMode = isStrikeAgentDomain || isDemoPath
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userId, setUserId] = useState(isDemoMode ? 'demo-user' : null)
  const [userConfig, setUserConfig] = useState(isDemoMode ? { isDemoMode: true, demoBalance: 10000 } : null)
  const [selectedCoinForAnalysis, setSelectedCoinForAnalysis] = useState(null)
  
  useEffect(() => {
    // Clear stale demo sessions when NOT in demo mode
    if (!isDemoMode) {
      const existingUser = localStorage.getItem('dwp_user')
      if (existingUser) {
        try {
          const parsed = JSON.parse(existingUser)
          if (parsed.isDemoMode || parsed.accessLevel === 'demo') {
            console.log('🧹 Clearing stale demo session')
            localStorage.removeItem('dwp_user')
            localStorage.removeItem('dwp_demo_mode')
          }
        } catch (e) {}
      }
    }
    
    // Skip session fetch for demo mode - use sessionStorage (doesn't persist)
    if (isDemoMode) {
      console.log('🎯 StrikeAgent Demo Mode - bypassing login')
      sessionStorage.setItem('dwp_demo_mode', 'true')
      sessionStorage.setItem('dwp_demo_balance', '10000')
      
      // Switch to sniper tab after a delay to allow wallet contexts to initialize
      setTimeout(() => setActiveTab('sniper'), 500)
      return
    }
    
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
              if (config.defaultLandingTab && !isStrikeAgentDomain) {
                setActiveTab(config.defaultLandingTab)
              }
            }
          }
        }
      } catch (err) {
        console.log('Session check failed, using defaults')
      }
    }
    fetchUserSession()
  }, [isDemoMode])
  
  const handleAnalyzeCoin = (coin) => {
    setSelectedCoinForAnalysis(coin)
    setActiveTab('analysis')
  }
  
  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={setActiveTab} onAnalyzeCoin={handleAnalyzeCoin} />
      case 'markets':
        return <MarketsTab />
      case 'projects':
        return <ProjectsTab />
      case 'learn':
        return <LearnTab />
      case 'portfolio':
        return <PortfolioTab />
      case 'staking':
        return <StakingTab />
      case 'sniper':
        return <SniperBotErrorBoundary><SniperBotTab /></SniperBotErrorBoundary>
      case 'wallet':
        return <WalletTab userId={userId} />
      case 'settings':
        return <SettingsTab userId={userId} userConfig={userConfig} setUserConfig={setUserConfig} />
      case 'v2-details':
        return <V2DetailsTab />
      case 'pricing':
        return <PricingTab userId={userId} currentTier={userConfig?.subscriptionTier} />
      case 'analysis':
        return <AnalysisTab coin={selectedCoinForAnalysis} onBack={() => setActiveTab('dashboard')} />
      case 'ml-dashboard':
        return <MLDashboardTab />
      case 'risk':
        return <RiskDashboardTab userId={userId} />
      default:
        return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={setActiveTab} onAnalyzeCoin={handleAnalyzeCoin} />
    }
  }
  
  return (
    <ThemeProvider>
      <SkinsProvider>
        <AvatarProvider>
          <BuiltInWalletProvider>
            <FavoritesProvider userId={userId}>
              <GlossaryProvider>
                <Layout activeTab={activeTab} onTabChange={setActiveTab} userTier={userConfig?.subscriptionTier} accessLevel={userConfig?.accessLevel}>
                  <div style={{ padding: '0 12px' }}>
                    {renderTab()}
                  </div>
                </Layout>
                <GlossaryPopup />
                <AgentPopup enabled={true} interval={90000} selectedAgentId={userConfig?.selectedAgentId || 1} />
                <AIChatButton 
                  isSubscribed={userConfig?.subscriptionTier && userConfig.subscriptionTier !== 'free'} 
                  selectedAgentId={userConfig?.selectedAgentId || 1}
                />
              </GlossaryProvider>
            </FavoritesProvider>
          </BuiltInWalletProvider>
        </AvatarProvider>
      </SkinsProvider>
    </ThemeProvider>
  )
}

export default App
