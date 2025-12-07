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
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div style={{ padding: '0 12px' }}>
        {renderTab()}
      </div>
    </Layout>
  )
}

export default App
