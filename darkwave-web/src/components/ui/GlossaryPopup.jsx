import { useEffect, useRef } from 'react'
import { useGlossary } from '../../context/GlossaryContext'

export default function GlossaryPopup() {
  const { activeTerm, position, sassMode, hideDefinition, toggleSassMode } = useGlossary()
  const popupRef = useRef(null)
  
  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        hideDefinition()
      }
    }
    
    if (activeTerm) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [activeTerm, hideDefinition])
  
  if (!activeTerm) return null
  
  const definition = sassMode ? activeTerm.smartass : activeTerm.plain
  
  const categoryColors = {
    'Crypto': '#00D4FF',
    'Finance': '#39FF14',
    'DeFi': '#9D4EDD',
    'Technical Analysis': '#FFD700',
    'Crypto Slang': '#FF006E',
    'Regulation': '#FF6B35'
  }
  
  const categoryColor = categoryColors[activeTerm.category] || '#00D4FF'
  
  return (
    <div 
      ref={popupRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 280,
        maxWidth: 'calc(100vw - 40px)',
        background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
        border: `1px solid ${categoryColor}40`,
        borderRadius: 12,
        padding: 16,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${categoryColor}20`,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 700, 
            color: '#fff',
            marginBottom: 4
          }}>
            {activeTerm.term}
          </div>
          <div style={{ 
            fontSize: 10, 
            color: categoryColor,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            {activeTerm.category}
          </div>
        </div>
        <button
          onClick={hideDefinition}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: 18,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ 
        fontSize: 13, 
        color: '#ccc',
        lineHeight: 1.5,
        marginBottom: 12
      }}>
        {definition}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={toggleSassMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            background: sassMode ? 'rgba(255, 0, 110, 0.2)' : 'rgba(0, 212, 255, 0.2)',
            border: `1px solid ${sassMode ? 'rgba(255, 0, 110, 0.4)' : 'rgba(0, 212, 255, 0.4)'}`,
            borderRadius: 12,
            color: sassMode ? '#FF006E' : '#00D4FF',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <span>{sassMode ? '😾' : '📚'}</span>
          <span>{sassMode ? 'Sass Mode' : 'Plain'}</span>
        </button>
        
        <div style={{ fontSize: 10, color: '#666' }}>
          Tap to switch style
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
