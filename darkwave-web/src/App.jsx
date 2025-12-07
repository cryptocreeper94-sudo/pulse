import { useState } from 'react'
import Layout from './components/layout/Layout'
import { 
  MarketsTab, 
  ProjectsTab, 
  LearnTab, 
  PortfolioTab, 
  StakingTab, 
  SettingsTab,
  V2DetailsTab
} from './components/tabs'
import { GlossaryPopup } from './components/ui'
import { GlossaryProvider } from './context/GlossaryContext'
import { AvatarProvider } from './context/AvatarContext'
import CryptoCatPopup from './components/engagement/CryptoCatPopup'
import './styles/components.css'

function App() {
  const [activeTab, setActiveTab] = useState('markets')
  
  const renderTab = () => {
    switch (activeTab) {
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
      case 'settings':
        return <SettingsTab />
      case 'v2-details':
        return <V2DetailsTab />
      default:
        return <MarketsTab />
    }
  }
  
  return (
    <AvatarProvider>
      <GlossaryProvider>
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          <div style={{ padding: '0 12px' }}>
            {renderTab()}
          </div>
        </Layout>
        <GlossaryPopup />
        <CryptoCatPopup enabled={true} interval={90000} />
      </GlossaryProvider>
    </AvatarProvider>
  )
}

export default App
