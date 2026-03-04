import { useState, useEffect, Component } from 'react'
import Layout from './components/layout/Layout'
import { 
  MarketsTab, 
  LearnTab, 
  PortfolioTab, 
  SettingsTab,
  V2DetailsTab,
  DashboardTab,
  SniperBotTab,
  WalletTab,
  PricingTab,
  AnalysisTab,
  MLDashboardTab,
  RiskDashboardTab,
  DevelopersPortalTab,
  AlertsTab,
  CalendarTab,
  DeFiTab,
  OnChainTab,
  ReferralTab,
  SocialTab,
  TaxTab,
  CopyTradingTab,
  ArbitrageTab,
  NFTTab,
  GuardianAITab,
  CommandCenterTab
} from './components/tabs'
import WhitepaperPage from './pages/WhitepaperPage'
import StrikeAgentPublicView from './pages/StrikeAgentPublicView'
import TermsOfServicePage from './pages/TermsOfServicePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import useAnalytics from './hooks/useAnalytics'
import AccuracyDashboard from './components/ml/AccuracyDashboard'
import AutoTradeConfig from './components/ml/AutoTradeConfig'
import { GlossaryPopup } from './components/ui'
import { GlossaryProvider } from './context/GlossaryContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { BuiltInWalletProvider } from './context/BuiltInWalletContext'
import { ThemeProvider } from './context/ThemeContext'
import { SkinsProvider } from './context/SkinsContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import SignUpPrompt from './components/auth/SignUpPrompt'
import CryptoCatPopup from './components/engagement/CryptoCatPopup'
import './styles/components.css'

const PUBLIC_TABS = new Set([
  'dashboard', 'markets', 'learn', 'whitepaper', 'pricing',
  'v2-details', 'ml-dashboard', 'accuracy', 'analysis',
  'dev-portal', 'guardian-ai', 'onchain'
])

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
  // Admin and owner always have access
  const accessLevel = userConfig.accessLevel
  if (accessLevel === 'admin' || accessLevel === 'owner') return true
  
  const tier = userConfig.subscriptionTier
  const paidTiers = ['strike_agent', 'strike_agent_monthly', 'strike_agent_annual', 
                     'complete_bundle', 'complete_bundle_monthly', 'complete_bundle_annual',
                     'founder', 'legacy_founder', 'annual', 'premium']
  return paidTiers.includes(tier)
}

function AppContent() {
  const { user, userConfig, setUserConfig, loading, isAuthenticated, isGuest, requireAuth } = useAuth()
  
  const isStrikeAgentDomain = window.location.hostname.includes('strikeagent')
  const isDemoPath = window.location.pathname.startsWith('/demo')
  const isWhitepaperPage = window.location.pathname === '/whitepaper'
  const isTermsPage = window.location.pathname === '/terms' || window.location.pathname === '/terms-of-service' || window.location.pathname === '/tos'
  const isPrivacyPage = window.location.pathname === '/privacy' || window.location.pathname === '/privacy-policy'
  const isStrikeAgentLive = window.location.pathname === '/strikeagent/live' || window.location.pathname === '/live' || isStrikeAgentDomain
  const isDemoMode = isDemoPath
  
  const getInitialTab = () => {
    const pathname = window.location.pathname
    if (pathname.startsWith('/tab/')) {
      return pathname.replace('/tab/', '')
    }
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab')) {
      return params.get('tab')
    }
    return 'dashboard'
  }
  
  const [activeTab, setActiveTab] = useState(getInitialTab)
  const [selectedCoinForAnalysis, setSelectedCoinForAnalysis] = useState(null)

  const FEATURE_NAMES = {
    portfolio: 'Portfolio Tracking',
    sniper: 'StrikeAgent Trading',
    wallet: 'Wallet Management',
    settings: 'Account Settings',
    'auto-trade': 'Auto Trading',
    risk: 'Risk Dashboard',
    alerts: 'Price Alerts',
    calendar: 'Crypto Calendar',
    defi: 'DeFi Dashboard',
    referral: 'Referral Program',
    social: 'Social Trading',
    tax: 'Tax Reports',
    'copy-trading': 'Copy Trading',
    arbitrage: 'Arbitrage Scanner',
    nft: 'NFT Portfolio'
  }

  const handleTabChange = (tab) => {
    if (!PUBLIC_TABS.has(tab) && isGuest) {
      requireAuth(FEATURE_NAMES[tab] || tab)
      return
    }
    setActiveTab(tab)
  }
  
  const userId = user?.email || (isDemoMode ? 'demo-user' : null)
  
  const { trackPageView } = useAnalytics('pulse')
  
  useEffect(() => {
    trackPageView(`/tab/${activeTab}`)
  }, [activeTab, trackPageView])
  
  useEffect(() => {
    if (isDemoMode) {
      console.log('[StrikeAgent] Demo Mode - bypassing login')
      sessionStorage.setItem('dwp_demo_mode', 'true')
      sessionStorage.setItem('dwp_demo_balance', '10000')
      setTimeout(() => setActiveTab('sniper'), 500)
    }
  }, [isDemoMode])

  useEffect(() => {
    if (isGuest && !PUBLIC_TABS.has(activeTab)) {
      setActiveTab('dashboard')
    }
  }, [isGuest, activeTab])
  
  const handleAnalyzeCoin = (coin) => {
    setSelectedCoinForAnalysis(coin)
    handleTabChange('analysis')
  }
  
  const renderTab = () => {
    if (isGuest && !PUBLIC_TABS.has(activeTab)) {
      return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={handleTabChange} onAnalyzeCoin={handleAnalyzeCoin} />
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={handleTabChange} onAnalyzeCoin={handleAnalyzeCoin} />
      case 'markets':
        return <MarketsTab />
      case 'learn':
        return <LearnTab />
      case 'portfolio':
        return <PortfolioTab />
      case 'sniper':
        const canTrade = hasStrikeAgentAccess(userConfig)
        const isAdminUser = userConfig?.accessLevel === 'admin' || userConfig?.accessLevel === 'owner'
        return <SniperBotErrorBoundary><SniperBotTab canTrade={canTrade} onNavigate={handleTabChange} isAdmin={isAdminUser} userId={userId} userConfig={userConfig} /></SniperBotErrorBoundary>
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
      case 'alerts':
        return <AlertsTab userId={userId} />
      case 'calendar':
        return <CalendarTab userId={userId} />
      case 'defi':
        return <DeFiTab userId={userId} />
      case 'onchain':
        return <OnChainTab />
      case 'referral':
        return <ReferralTab userId={userId} />
      case 'social':
        return <SocialTab userId={userId} />
      case 'tax':
        return <TaxTab userId={userId} />
      case 'copy-trading':
        return <CopyTradingTab userId={userId} />
      case 'arbitrage':
        return <ArbitrageTab userId={userId} />
      case 'nft':
        return <NFTTab userId={userId} />
      case 'guardian-ai':
        return <GuardianAITab />
      case 'command-center':
        if (userConfig?.accessLevel !== 'admin' && userConfig?.accessLevel !== 'owner') {
          return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={handleTabChange} onAnalyzeCoin={handleAnalyzeCoin} />
        }
        return <CommandCenterTab onNavigate={handleTabChange} userConfig={userConfig} />
      case 'whitepaper':
        return <WhitepaperPage />
      default:
        return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={handleTabChange} onAnalyzeCoin={handleAnalyzeCoin} />
    }
  }

  if (isWhitepaperPage) {
    return <WhitepaperPage />
  }

  if (isTermsPage) {
    return <TermsOfServicePage />
  }

  if (isPrivacyPage) {
    return <PrivacyPolicyPage />
  }

  if (isStrikeAgentLive) {
    return (
      <StrikeAgentPublicView 
        onSubscribe={() => window.location.href = '/tab/pricing'} 
      />
    )
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0f0f0f',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔄</div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SkinsProvider>
      <BuiltInWalletProvider>
        <FavoritesProvider userId={userId}>
          <GlossaryProvider>
            <Layout activeTab={activeTab} onTabChange={handleTabChange} userTier={userConfig?.subscriptionTier} accessLevel={userConfig?.accessLevel}>
              <div style={{ padding: '0 12px' }}>
                {renderTab()}
              </div>
            </Layout>
            <SignUpPrompt />
            <GlossaryPopup />
          </GlossaryProvider>
        </FavoritesProvider>
      </BuiltInWalletProvider>
    </SkinsProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
