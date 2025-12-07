import { useState } from 'react'
import Header from './Header'
import HamburgerMenu from './HamburgerMenu'
import BugReportModal from '../modals/BugReportModal'
import DisclaimerModal from '../modals/DisclaimerModal'
import AvatarCreator from '../ui/AvatarCreator'

export default function Layout({ children, activeTab, onTabChange }) {
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
        console.log('Opening Theme Selector')
        document.body.classList.toggle('theme-light')
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
      />
      
      <HamburgerMenu
        isOpen={isMenuOpen}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onClose={handleClose}
        onAction={handleAction}
      />
      
      <main className="app-content">
        {children}
      </main>

      {activeTab !== 'dashboard' && (
        <button 
          className="floating-home-btn"
          onClick={handleHomeClick}
          title="Back to Markets"
        >
          🏠
        </button>
      )}

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
