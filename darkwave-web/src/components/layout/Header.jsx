import { useAvatar } from '../../context/AvatarContext'
import { useWalletState, WalletMultiButton } from '../../context/WalletContext'
import MiniAvatar from '../ui/MiniAvatar'

export default function Header({ onMenuToggle, isMenuOpen, onAvatarClick, activeTab, onBackClick }) {
  const { avatar, isCustomMode } = useAvatar()
  const wallet = useWalletState()
  const showBackButton = activeTab && activeTab !== 'dashboard' && activeTab !== 'markets'
  
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {showBackButton ? (
          <button 
            className="header-back-btn"
            onClick={onBackClick}
            aria-label="Back to Dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        ) : (
          <button 
            className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={onMenuToggle}
            aria-label="Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}
      </div>
      
      <h1 className="header-title">PULSE</h1>
      
      <div className="header-right">
        <WalletMultiButton />
        <MiniAvatar 
          size={32} 
          onClick={onAvatarClick}
        />
      </div>
    </header>
  )
}
