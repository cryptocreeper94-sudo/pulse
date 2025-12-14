import { useState } from 'react'
import Header from './Header'
import HamburgerMenu from './HamburgerMenu'
import BugReportModal from '../modals/BugReportModal'
import DisclaimerModal from '../modals/DisclaimerModal'
import AvatarCreator from '../ui/AvatarCreator'
import { useTheme } from '../../context/ThemeContext'

export default function Layout({ children, activeTab, onTabChange, userTier, accessLevel }) {
  const { isDarkMode, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)
  const [isAvatarCreatorOpen, setIsAvatarCreatorOpen] = useState(false)
  
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  
  const handleClose = () => {
    setIsMenuOpen(false)
  }
  
  const handleAction = (actionId) => {
    switch (actionId) {
      case 'agent':
        console.log('Opening Agent Builder')
        alert('Agent Builder coming soon!')
        break
      case 'theme':
        toggleTheme()
        break
      case 'bug':
        setIsBugModalOpen(true)
        break
      case 'disclaimer':
        setIsDisclaimerOpen(true)
        break
      case 'logout':
        window.location.href = '/lockscreen.html'
        break
      default:
        break
    }
  }

  const handleHomeClick = () => {
    onTabChange('dashboard')
  }
  
  return (
    <div className="app-layout">
      <Header 
        onMenuToggle={handleMenuToggle}
        isMenuOpen={isMenuOpen}
        onAvatarClick={() => setIsAvatarCreatorOpen(true)}
        activeTab={activeTab}
        onBackClick={handleHomeClick}
      />
      
      <HamburgerMenu
        isOpen={isMenuOpen}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onClose={handleClose}
        onAction={handleAction}
        isDarkMode={isDarkMode}
        userTier={userTier}
        accessLevel={accessLevel}
      />
      
      <main className="app-content">
        {children}
      </main>

      <BugReportModal 
        isOpen={isBugModalOpen} 
        onClose={() => setIsBugModalOpen(false)} 
      />
      
      <DisclaimerModal 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)} 
      />
      
      <AvatarCreator 
        isOpen={isAvatarCreatorOpen}
        onClose={() => setIsAvatarCreatorOpen(false)}
      />
    </div>
  )
}
