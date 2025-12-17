import { useAvatar } from '../../context/AvatarContext'
import { useWalletState, WalletMultiButton } from '../../context/WalletContext'
import MiniAvatar from '../ui/MiniAvatar'
import VerificationBadge from '../ui/VerificationBadge'

export default function Header({ onMenuToggle, isMenuOpen, onAvatarClick, activeTab, onBackClick }) {
  const { avatar, isCustomMode } = useAvatar()
  const wallet = useWalletState()
  const showBackButton = activeTab && activeTab !== 'dashboard' && activeTab !== 'markets'
  
  const hallmarkId = '000000000-01'
  const walletAddress = wallet?.publicKey?.toBase58() || null
  
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
        <a
          href="/whitepaper"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(0, 212, 255, 0.15))',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            borderRadius: '8px',
            color: '#39FF14',
            fontSize: '12px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 0 15px rgba(57, 255, 20, 0.3)';
            e.currentTarget.style.borderColor = '#39FF14';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.3)';
          }}
        >
          <span style={{ fontSize: '14px' }}>📄</span>
          Whitepaper
        </a>
        <VerificationBadge 
          hallmarkId={hallmarkId}
          walletAddress={walletAddress}
        />
        <WalletMultiButton />
        <MiniAvatar 
          size={32} 
          onClick={onAvatarClick}
        />
      </div>
    </header>
  )
}
