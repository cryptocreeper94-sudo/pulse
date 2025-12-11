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
  PricingTab
} from './components/tabs'
import { GlossaryPopup } from './components/ui'
import { GlossaryProvider } from './context/GlossaryContext'
import { AvatarProvider } from './context/AvatarContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { BuiltInWalletProvider } from './context/BuiltInWalletContext'
import CryptoCatPopup from './components/engagement/CryptoCatPopup'
import './styles/components.css'

function App() {
  const isStrikeAgentDomain = window.location.hostname.includes('strikeagent')
  const [activeTab, setActiveTab] = useState(isStrikeAgentDomain ? 'sniper' : 'dashboard')
  const [userId, setUserId] = useState(null)
  const [userConfig, setUserConfig] = useState(null)
  
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
  
  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={setActiveTab} />
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
        return <SniperBotTab />
      case 'wallet':
        return <WalletTab userId={userId} />
      case 'settings':
        return <SettingsTab userId={userId} userConfig={userConfig} setUserConfig={setUserConfig} />
      case 'v2-details':
        return <V2DetailsTab />
      case 'pricing':
        return <PricingTab userId={userId} currentTier={userConfig?.subscriptionTier} />
      default:
        return <DashboardTab userId={userId} userConfig={userConfig} onNavigate={setActiveTab} />
    }
  }
  
  return (
    <AvatarProvider>
      <BuiltInWalletProvider>
        <FavoritesProvider userId={userId}>
          <GlossaryProvider>
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
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

export default App
