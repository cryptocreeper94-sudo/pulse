import { useState, useEffect, useCallback, useRef } from 'react'
import { useGlossary } from '../../context/GlossaryContext'
import { useAvatar } from '../../context/AvatarContext'
import MiniAvatar from '../ui/MiniAvatar'

const SASS_MODE_KEY = 'pulse-sass-mode'

const catResponses = {
  greetings: [
    { sass: "Hey there, trader! Ready to lose some money today?", plain: "Welcome! Let's analyze some charts together." },
    { sass: "Welcome back! The market didn't miss you, but I did.", plain: "Good to see you! Markets are moving." },
    { sass: "Oh, you're still here? Bold.", plain: "Ready for market insights?" },
  ],
  tips: [
    { sass: "Pro tip: Buy high, sell low. Wait, that's not right...", plain: "Watch RSI and MACD for momentum signals." },
    { sass: "Remember: Every time you FOMO, a whale takes profits.", plain: "Always set stop losses to manage risk." },
    { sass: "RSI is oversold? Cool. So was your last 5 buys.", plain: "Oversold RSI can signal potential reversals." },
  ],
  termResponses: {
    'ATH': { sass: "All-Time High. That price you bought at before it crashed!", plain: "The highest price ever reached by an asset." },
    'FOMO': { sass: "Fear Of Missing Out. The reason you bought at the top.", plain: "Anxiety about missing profitable opportunities." },
    'HODL': { sass: "Hold On for Dear Life... or just can't spell 'hold'. Both valid!", plain: "Long-term holding strategy regardless of volatility." },
    'RSI': { sass: "Relative Strength Index. 0-100 scale of market emotions.", plain: "A momentum oscillator measuring overbought/oversold conditions." },
    'DeFi': { sass: "Finance without suits. Same greed, fewer middlemen.", plain: "Decentralized Finance - financial services on blockchain." },
  }
}

const catPoses = {
  neutral: '/trading-cards-cutouts/Grumpy_orange_Crypto_Cat_ac1ff7e8.png',
  sideeye: '/trading-cards-cutouts/Grumpy_cat_sideeye_pose_5e52df88.png',
}

export default function CryptoCatPopup({ enabled = true, interval = 120000 }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState(null)
  const { sassMode, onTermShow } = useGlossary()
  const { avatar, isCustomMode } = useAvatar()
  
  const timerRef = useRef(null)
  const intervalRef = useRef(null)
  const hideTimerRef = useRef(null)
  
  const showPopup = useCallback((text, pose = 'neutral') => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }
    
    setMessage({ text, pose })
    setVisible(true)
    
    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
    }, 8000)
  }, [])
  
  const showRandomPopup = useCallback(() => {
    if (!enabled) return
    
    const categories = ['greetings', 'tips']
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const messages = catResponses[randomCategory]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    
    const text = sassMode ? randomMessage.sass : randomMessage.plain
    const pose = sassMode ? 'sideeye' : 'neutral'
    
    showPopup(text, pose)
  }, [enabled, sassMode, showPopup])
  
  useEffect(() => {
    if (!enabled) return
    
    timerRef.current = setTimeout(() => {
      showRandomPopup()
    }, 15000 + Math.random() * 15000)
    
    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.7) {
        showRandomPopup()
      }
    }, interval)
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [enabled, interval, showRandomPopup])
  
  useEffect(() => {
    if (!onTermShow) return
    
    const handleTermShow = (term) => {
      const termKey = term.term.toUpperCase()
      const response = catResponses.termResponses[termKey]
      
      if (response) {
        const text = sassMode ? response.sass : response.plain
        const pose = sassMode ? 'sideeye' : 'neutral'
        
        setTimeout(() => {
          showPopup(`${term.term}: ${text}`, pose)
        }, 500)
      }
    }
    
    return onTermShow(handleTermShow)
  }, [onTermShow, sassMode, showPopup])
  
  const handleClose = useCallback(() => {
    setVisible(false)
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }
  }, [])
  
  if (!visible || !message) return null
  
  const displayName = isCustomMode ? (avatar.name || 'Your Avatar') : 'CryptoCat'
  const displayLabel = isCustomMode 
    ? `👤 ${displayName} says...` 
    : (sassMode ? '😾 CryptoCat says...' : '😺 CryptoCat says...')
  
  return (
    <div className="crypto-cat-popup" style={{
      position: 'fixed',
      bottom: 70,
      right: 20,
      zIndex: 9998,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      animation: 'catSlideIn 0.4s ease-out',
      maxWidth: 'calc(100vw - 40px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
        border: isCustomMode ? '1px solid rgba(0, 212, 255, 0.4)' : '1px solid rgba(255, 165, 0, 0.4)',
        borderRadius: 16,
        padding: 16,
        maxWidth: 260,
        boxShadow: isCustomMode 
          ? '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(0, 212, 255, 0.2)'
          : '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(255, 165, 0, 0.2)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 8
        }}>
          <div style={{ 
            fontSize: 10, 
            color: isCustomMode ? '#00D4FF' : '#FFA500', 
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            {displayLabel}
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: 16,
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{
          fontSize: 13,
          color: '#fff',
          lineHeight: 1.5
        }}>
          {message.text}
        </div>
      </div>
      
      {isCustomMode ? (
        <MiniAvatar size={60} showFallback={false} />
      ) : (
        <img 
          src={catPoses[message.pose] || catPoses.neutral}
          alt="CryptoCat"
          style={{
            width: 60,
            height: 60,
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
          }}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      )}
      
      <style>{`
        @keyframes catSlideIn {
          from { 
            opacity: 0; 
            transform: translateX(100px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @media (max-width: 480px) {
          .crypto-cat-popup {
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            bottom: 80px !important;
            max-width: calc(100vw - 24px) !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  )
}
