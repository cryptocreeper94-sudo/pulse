import { useAvatar } from '../../context/AvatarContext'
import { useWalletState, WalletMultiButton } from '../../context/WalletContext'
import { useTheme } from '../../context/ThemeContext'
import MiniAvatar from '../ui/MiniAvatar'
import VerificationBadge from '../ui/VerificationBadge'
import { useState, useEffect } from 'react'

export default function Header({ onMenuToggle, isMenuOpen, onAvatarClick, activeTab, onBackClick }) {
  const { avatar, isCustomMode } = useAvatar()
  const wallet = useWalletState()
  const { isDarkMode, toggleTheme } = useTheme()
  const showBackButton = activeTab && activeTab !== 'dashboard' && activeTab !== 'markets'
  const [isScreenMobile, setIsScreenMobile] = useState(window.innerWidth < 640)

  useEffect(() => {
    const handleResize = () => setIsScreenMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
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
        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <a
          href="/whitepaper"
          title="View Whitepaper"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isScreenMobile ? '0' : '4px',
            padding: '6px 8px',
            background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(0, 212, 255, 0.15))',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            borderRadius: '6px',
            color: '#39FF14',
            fontSize: '11px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 0 12px rgba(57, 255, 20, 0.4)';
            e.currentTarget.style.borderColor = '#39FF14';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(57, 255, 20, 0.25), rgba(0, 212, 255, 0.25))';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.3)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(0, 212, 255, 0.15))';
          }}
        >
          <span style={{ fontSize: '12px' }}>📄</span>
          {!isScreenMobile && <span>Whitepaper</span>}
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
