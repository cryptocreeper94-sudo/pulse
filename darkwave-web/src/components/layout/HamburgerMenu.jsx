import { useState, useEffect, useRef } from 'react';
import SkinsSelector from './SkinsSelector';

const allMenuItems = [
  { id: 'dashboard', icon: '🏠', label: 'My Dashboard' },
  { id: 'markets', icon: '📊', label: 'Markets' },
  { id: 'wallet', icon: '💼', label: 'Wallet', highlight: true },
  { id: 'sniper', icon: '🎯', label: 'StrikeAgent', highlight: true },
  { id: 'accuracy', icon: '📊', label: 'AI Accuracy', highlight: true },
  { id: 'auto-trade', icon: '🤖', label: 'Auto-Trade', highlight: true },
  { id: 'risk', icon: '🛡️', label: 'Risk Dashboard', highlight: true },
  { id: 'ml-dashboard', icon: '🧠', label: 'ML Dashboard', highlight: true, adminOnly: true },
  { id: 'dev-portal', icon: '🛠️', label: 'Developers Portal', adminOnly: true },
  { id: 'pricing', icon: '💳', label: 'Pricing', highlight: true },
  { id: 'projects', icon: '🚀', label: 'Projects' },
  { id: 'learn', icon: '💡', label: 'Learn' },
  { id: 'portfolio', icon: '📈', label: 'Portfolio' },
  { id: 'staking', icon: '💎', label: 'Staking' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
  { id: 'v2-details', icon: '📅', label: 'V2 Details', highlight: true },
]

const getMenuItems = (accessLevel) => {
  const isAdmin = accessLevel === 'admin' || accessLevel === 'owner'
  return allMenuItems.filter(item => !item.adminOnly || isAdmin)
}

const getQuickActions = (isDarkMode) => [
  { id: 'agent', icon: '👤', label: 'Agent Builder' },
  { id: 'theme', icon: isDarkMode ? '☀️' : '🌙', label: isDarkMode ? 'Light Mode' : 'Dark Mode' },
  { id: 'bug', icon: '🐛', label: 'Report Bug' },
  { id: 'disclaimer', icon: '⚠️', label: 'Disclaimer' },
  { id: 'logout', icon: '🚪', label: 'Logout', danger: true },
]

export default function HamburgerMenu({ isOpen, activeTab, onTabChange, onClose, onAction, isDarkMode = true, userTier, accessLevel }) {
  const quickActions = getQuickActions(isDarkMode)
  const menuItems = getMenuItems(accessLevel)
  const [showSkins, setShowSkins] = useState(false)
  const menuContentRef = useRef(null)
  
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
    } else {
      const scrollY = document.body.style.top
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
    }
  }, [isOpen])
  
  return (
    <>
      <div 
        className={`menu-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div 
          ref={menuContentRef}
          className="menu-content"
        >
          <button
            className="menu-home-btn"
            onClick={() => {
              onTabChange('dashboard')
              onClose()
            }}
          >
            <span className="menu-home-icon">🏠</span>
            <span>Home</span>
          </button>

          <div className="menu-section">
            <div className="menu-section-title">Navigation</div>
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  onTabChange(item.id)
                  onClose()
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="menu-section">
            <div className="menu-section-title">Appearance</div>
            <button
              className="menu-item"
              onClick={() => setShowSkins(!showSkins)}
            >
              <span className="menu-icon">🎨</span>
              Skins
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>
                {showSkins ? '▲' : '▼'}
              </span>
            </button>
            {showSkins && (
              <SkinsSelector userTier={userTier} onClose={onClose} />
            )}
          </div>

          <div className="menu-section">
            <div className="menu-section-title">Quick Actions</div>
            {quickActions.map(item => (
              <button
                key={item.id}
                className={`menu-item ${item.danger ? 'menu-item--danger' : ''}`}
                onClick={() => {
                  onAction(item.id)
                  onClose()
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="menu-footer">
            <div className="menu-footer-text">
              Beta V1 - Founders Launch Feb 14
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
