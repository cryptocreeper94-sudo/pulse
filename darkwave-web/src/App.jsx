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
  RiskDashboardTab,
  DevelopersPortalTab
} from './components/tabs'
import useAnalytics from './hooks/useAnalytics'
import AccuracyDashboard from './components/ml/AccuracyDashboard'
import AutoTradeConfig from './components/ml/AutoTradeConfig'
import { GlossaryPopup } from './components/ui'
import { GlossaryProvider } from './context/GlossaryContext'
import { AvatarProvider } from './context/AvatarContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { BuiltInWalletProvider } from './context/BuiltInWalletContext'
import { ThemeProvider } from './context/ThemeContext'
import { SkinsProvider } from './context/SkinsContext'
import CryptoCatPopup from './components/engagement/CryptoCatPopup'
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

function StrikeAgentUpgradeCTA({ onNavigate }) {
  return (
    <div style={{ 
      padding: '60px 20px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1))',
      borderRadius: '16px',
      margin: '20px 0'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
      <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '12px' }}>
        Unlock StrikeAgent Elite
      </h2>
      <p style={{ color: '#9ca3af', fontSize: '16px', maxWidth: '500px', margin: '0 auto 24px' }}>
        Get access to our AI-powered sniper bot with real-time safety checks, 
        multi-chain support, and automated trading capabilities.
      </p>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '16px', 
        flexWrap: 'wrap',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00D4FF' }}>
          <span>✓</span> AI-Powered Sniping
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00D4FF' }}>
          <span>✓</span> Honeypot Detection
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00D4FF' }}>
          <span>✓</span> Anti-MEV Protection
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00D4FF' }}>
          <span>✓</span> 23+ Chains Supported
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => onNavigate('pricing')}
          style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '16px'
          }}
        >
          View Plans - Starting at $30/mo
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          style={{
            padding: '14px 32px',
            background: 'transparent',
            color: '#9ca3af',
            border: '1px solid #374151',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Back to Dashboard
        </button>
      </div>
      <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '20px' }}>
        2-day free trial included • 3-day refund policy • Cancel anytime
      </p>
    </div>
  )
}

const hasStrikeAgentAccess = (userConfig) => {
  if (!userConfig) return false
  const tier = userConfig.subscriptionTier
  const paidTiers = ['strike_agent', 'strike_agent_monthly', 'strike_agent_annual', 
                     'complete_bundle', 'complete_bundle_monthly', 'complete_bundle_annual',
                     'founder', 'legacy_founder', 'annual', 'premium']
  return paidTiers.includes(tier)
}

function App() {
  const isStrikeAgentDomain = window.location.hostname.includes('strikeagent')
  const isDemoPath = window.location.pathname.startsWith('/demo')
  const isDemoMode = isStrikeAgentDomain || isDemoPath
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userId, setUserId] = useState(isDemoMode ? 'demo-user' : null)
  const [userConfig, setUserConfig] = useState(isDemoMode ? { isDemoMode: true, demoBalance: 10000 } : null)
  const [selectedCoinForAnalysis, setSelectedCoinForAnalysis] = useState(null)
  
  const { trackPageView } = useAnalytics('pulse')
  
  useEffect(() => {
    trackPageView(`/tab/${activeTab}`)
  }, [activeTab, trackPageView])
  
  useEffect(() => {
    if (!isDemoMode) {
      const existingUser = localStorage.getItem('dwp_user')
      if (existingUser) {
        try {
          const parsed = JSON.parse(existingUser)
          if (parsed.isDemoMode || parsed.accessLevel === 'demo') {
            console.log('🧹 Clearing stale demo session')
            localStorage.removeItem('dwp_user')
            localStorage.removeItem('dwp_demo_mode')
          } else if (parsed.accessLevel) {
            // Restore user session from localStorage
            console.log('🔐 Restoring session from localStorage:', parsed.accessLevel)
            setUserId(parsed.email || parsed.id || 'user')
            setUserConfig(prev => ({ ...prev, accessLevel: parsed.accessLevel, ...parsed }))
          }
        } catch (e) {}
      }
    }
    
    if (isDemoMode) {
      console.log('🎯 StrikeAgent Demo Mode - bypassing login')
      sessionStorage.setItem('dwp_demo_mode', 'true')
      sessionStorage.setItem('dwp_demo_balance', '10000')
      
      setTimeout(() => setActiveTab('sniper'), 500)
      return
    }
    
    const fetchUserSession = async () => {
      try {
        const storedToken = localStorage.getItem('sessionToken')
        const headers = storedToken ? { 'X-Session-Token': storedToken } : {}
        
        const response = await fetch('/api/session', { headers })
        if (response.ok) {
          const wasRotated = response.headers.get('X-Session-Token-Rotated') === 'true'
          const data = await response.json()
          if (data.user?.email) {
            setUserId(data.user.email)
            if (data.sessionToken) {
              localStorage.setItem('sessionToken', data.sessionToken)
              if (wasRotated) {
                console.log('🔄 Session token rotated for security')
              }
            }
            const configRes = await fetch(`/api/users/${data.user.email}/dashboard`)
            if (configRes.ok) {
              const config = await configRes.json()
              setUserConfig(prev => ({ ...prev, ...config, sessionToken: data.sessionToken }))
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
        if (isDemoMode) {
          // Demo mode from strikeagent.io - show upgrade CTA, not full access
          return <StrikeAgentUpgradeCTA onNavigate={setActiveTab} />
        }
        if (!hasStrikeAgentAccess(userConfig)) {
          return <StrikeAgentUpgradeCTA onNavigate={setActiveTab} />
        }
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
      case 'accuracy':
        return <AccuracyDashboard />
      case 'auto-trade':
        return <AutoTradeConfig userId={userId} />
      case 'risk':
        return <RiskDashboardTab userId={userId} />
      case 'dev-portal':
        return <DevelopersPortalTab />
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
              </GlossaryProvider>
            </FavoritesProvider>
          </BuiltInWalletProvider>
        </AvatarProvider>
      </SkinsProvider>
    </ThemeProvider>
  )
}

export default App
