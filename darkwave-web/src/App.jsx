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
  SniperBotTab
} from './components/tabs'
import { GlossaryPopup } from './components/ui'
import { GlossaryProvider } from './context/GlossaryContext'
import { AvatarProvider } from './context/AvatarContext'
import { FavoritesProvider } from './context/FavoritesContext'
import CryptoCatPopup from './components/engagement/CryptoCatPopup'
import './styles/components.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
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
              if (config.defaultLandingTab) {
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
        return <DashboardTab userId={userId} userConfig={userConfig} />
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
      case 'settings':
        return <SettingsTab userId={userId} userConfig={userConfig} setUserConfig={setUserConfig} />
      case 'v2-details':
        return <V2DetailsTab />
      default:
        return <DashboardTab userId={userId} userConfig={userConfig} />
    }
  }
  
  return (
    <AvatarProvider>
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
    </AvatarProvider>
  )
}

export default App
