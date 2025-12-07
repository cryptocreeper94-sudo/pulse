import { useState } from 'react'
import { useAvatar } from '../../context/AvatarContext'
import MiniAvatar from '../ui/MiniAvatar'

export default function Header({ onMenuToggle, isMenuOpen, onAvatarClick }) {
  const { avatar, isCustomMode } = useAvatar()
  
  return (
    <header className="header">
      <button 
        className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
        onClick={onMenuToggle}
        aria-label="Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
      
      <h1 className="header-title">PULSE</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="header-version">v2.0</span>
        <MiniAvatar 
          size={32} 
          onClick={onAvatarClick}
        />
      </div>
    </header>
  )
}
