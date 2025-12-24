import { useState, useEffect, useRef } from 'react';
import SkinsSelector from './SkinsSelector';

const allMenuItems = [
  { id: 'dashboard', icon: '🏠', label: 'My Dashboard' },
  { id: 'wallet', icon: '💼', label: 'Wallet', highlight: true },
  { id: 'dust-buster', icon: '🧹', label: 'Dust Buster', highlight: true, badge: '12.5% Fee' },
  { id: 'sniper', icon: '🎯', label: 'StrikeAgent', highlight: true },
  { id: 'accuracy', icon: '📊', label: 'AI Accuracy', highlight: true },
  { id: 'auto-trade', icon: '🤖', label: 'Auto-Trade', highlight: true },
  { id: 'risk', icon: '🛡️', label: 'Risk Dashboard', highlight: true },
  { id: 'ml-dashboard', icon: '🧠', label: 'ML Dashboard', highlight: true, adminOnly: true },
  { id: 'dev-portal', icon: '🛠️', label: 'Developers Portal', adminOnly: true },
  { id: 'pricing', icon: '💳', label: 'Pricing', highlight: true },
  { id: 'learn', icon: '💡', label: 'Learn' },
  { id: 'portfolio', icon: '📈', label: 'Portfolio' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
  { id: 'v2-details', icon: '📅', label: 'V2 Details', highlight: true },
]

const getMenuItems = (accessLevel) => {
  const isAdmin = accessLevel === 'admin' || accessLevel === 'owner'
  return allMenuItems.filter(item => !item.adminOnly || isAdmin)
}

const getQuickActions = () => [
  { id: 'agent', icon: '👤', label: 'Agent Builder' },
  { id: 'bug', icon: '🐛', label: 'Report Bug' },
  { id: 'disclaimer', icon: '⚠️', label: 'Disclaimer' },
  { id: 'logout', icon: '🚪', label: 'Logout', danger: true },
]

export default function HamburgerMenu({ isOpen, activeTab, onTabChange, onClose, onAction, userTier, accessLevel }) {
  const quickActions = getQuickActions()
  const menuItems = getMenuItems(accessLevel)
  const [showSkins, setShowSkins] = useState(false)
  const menuContentRef = useRef(null)
  
  // No body scroll lock needed - menu has its own scroll
  
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
          
          <div className="menu-section">
            <div className="menu-section-title">Official Documents</div>
            <a
              href="/docs/DWT_WHITEPAPER.md"
              target="_blank"
              rel="noopener noreferrer"
              className="menu-item"
              onClick={onClose}
            >
              <span className="menu-icon">📄</span>
              Whitepaper
            </a>
            <a
              href="/business-docs/DARKWAVE_ROADMAP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="menu-item"
              onClick={onClose}
            >
              <span className="menu-icon">🗺️</span>
              Roadmap
            </a>
            <a
              href="/docs/DWT_TOKEN_INFO.md"
              target="_blank"
              rel="noopener noreferrer"
              className="menu-item"
              onClick={onClose}
            >
              <span className="menu-icon">🪙</span>
              Token Info
            </a>
            <button
              className="menu-item"
              onClick={() => {
                onAction('disclaimer')
                onClose()
              }}
            >
              <span className="menu-icon">⚠️</span>
              Legal Disclaimer
            </button>
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
