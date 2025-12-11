import { useState, useEffect } from 'react'
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
  AnalysisTab
} from './components/tabs'
import { GlossaryPopup } from './components/ui'
import SubscriptionGate from './components/ui/SubscriptionGate'
import { GlossaryProvider } from './context/GlossaryContext'
import { AvatarProvider } from './context/AvatarContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { BuiltInWalletProvider } from './context/BuiltInWalletContext'
import { ThemeProvider } from './context/ThemeContext'
import { SkinsProvider } from './context/SkinsContext'
import { TelegramProvider, useTelegram } from './context/TelegramContext'
import CryptoCatPopup from './components/engagement/CryptoCatPopup'
import './styles/components.css'

function TelegramAppContent() {
  const { isTelegram, telegramUser, isReady, webApp } = useTelegram()
  const isStrikeAgentDomain = window.location.hostname.includes('strikeagent')
  const [activeTab, setActiveTab] = useState(isStrikeAgentDomain ? 'sniper' : 'dashboard')
  const [userId, setUserId] = useState(null)
  const [userConfig, setUserConfig] = useState(null)
  const [selectedCoinForAnalysis, setSelectedCoinForAnalysis] = useState(null)
  
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
  }, [])
  
  useEffect(() => {
    if (webApp && isReady) {
      webApp.setHeaderColor?.('#1a1a2e')
      webApp.setBackgroundColor?.('#1a1a2e')
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
    setActiveTab(tab)
  }
  
  const handleAnalyzeCoin = (coin) => {
    triggerHapticFeedback('impact')
    setSelectedCoinForAnalysis(coin)
    setActiveTab('analysis')
  }
  
  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={handleTabChange} onAnalyzeCoin={handleAnalyzeCoin} isTelegram={true} />
      case 'markets':
        return <MarketsTab isTelegram={true} />
      case 'projects':
        return <ProjectsTab isTelegram={true} />
      case 'learn':
        return <LearnTab isTelegram={true} />
      case 'portfolio':
        return <PortfolioTab isTelegram={true} />
      case 'staking':
        return (
          <SubscriptionGate requiredTier="rm-plus" featureName="Staking" mode="overlay" currentTier={userConfig?.subscriptionTier}>
            <StakingTab isTelegram={true} />
          </SubscriptionGate>
        )
      case 'sniper':
        return (
          <SubscriptionGate requiredTier="rm-plus" featureName="StrikeAgent AI Trading" mode="overlay" currentTier={userConfig?.subscriptionTier}>
            <SniperBotTab isTelegram={true} />
          </SubscriptionGate>
        )
      case 'wallet':
        return (
          <SubscriptionGate requiredTier="rm-plus" featureName="Wallet Transactions" mode="overlay" currentTier={userConfig?.subscriptionTier}>
            <WalletTab userId={userId} isTelegram={true} />
          </SubscriptionGate>
        )
      case 'settings':
        return <SettingsTab userId={userId} userConfig={userConfig} setUserConfig={setUserConfig} isTelegram={true} />
      case 'v2-details':
        return <V2DetailsTab isTelegram={true} />
      case 'pricing':
        return <PricingTab userId={userId} currentTier={userConfig?.subscriptionTier} isTelegram={true} />
      case 'analysis':
        return <AnalysisTab coin={selectedCoinForAnalysis} onBack={() => handleTabChange('dashboard')} isTelegram={true} />
      default:
        return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={handleTabChange} onAnalyzeCoin={handleAnalyzeCoin} isTelegram={true} />
    }
  }
  
  if (!isReady) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#1a1a2e',
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
          <p>Loading Pulse...</p>
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
    <AvatarProvider>
      <BuiltInWalletProvider>
        <FavoritesProvider userId={userId}>
          <GlossaryProvider>
            <Layout activeTab={activeTab} onTabChange={handleTabChange} userTier={userConfig?.subscriptionTier} isTelegram={true}>
              <div style={{ padding: '0 12px' }}>
                {renderTab()}
              </div>
            </Layout>
            <GlossaryPopup />
            <CryptoCatPopup enabled={true} interval={90000} />
          </GlossaryProvider>
        </FavoritesProvider>
      </BuiltInWalletProvider>
    </AvatarProvider>
  )
}

function TelegramApp() {
  return (
    <ThemeProvider>
      <SkinsProvider>
        <TelegramProvider>
          <TelegramAppContent />
        </TelegramProvider>
      </SkinsProvider>
    </ThemeProvider>
  )
}

export default TelegramApp
