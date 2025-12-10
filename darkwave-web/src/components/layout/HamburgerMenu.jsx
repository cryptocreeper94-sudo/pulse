const menuItems = [
  { id: 'dashboard', icon: '🏠', label: 'My Dashboard' },
  { id: 'markets', icon: '📊', label: 'Markets' },
  { id: 'wallet', icon: '💼', label: 'Wallet', highlight: true },
  { id: 'sniper', icon: '🎯', label: 'Sniper Bot', highlight: true },
  { id: 'projects', icon: '🚀', label: 'Projects' },
  { id: 'learn', icon: '💡', label: 'Learn' },
  { id: 'portfolio', icon: '📈', label: 'Portfolio' },
  { id: 'staking', icon: '💎', label: 'Staking' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
  { id: 'v2-details', icon: '📅', label: 'V2 Details', highlight: true },
]

const quickActions = [
  { id: 'agent', icon: '👤', label: 'Agent Builder' },
  { id: 'theme', icon: '🎨', label: 'Change Theme' },
  { id: 'bug', icon: '🐛', label: 'Report Bug' },
  { id: 'disclaimer', icon: '⚠️', label: 'Disclaimer' },
  { id: 'logout', icon: '🚪', label: 'Logout', danger: true },
]

export default function HamburgerMenu({ isOpen, activeTab, onTabChange, onClose, onAction }) {
  return (
    <>
      <div 
        className={`menu-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-content">
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
