import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { AvatarPreview, defaultAvatar, avatarOptions } from '../components/ui/AvatarCreator'

const STORAGE_KEY = 'pulse-user-avatar'
const MODE_KEY = 'pulse-avatar-mode'

const AvatarContext = createContext(null)

export function AvatarProvider({ children }) {
  const [avatar, setAvatar] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : defaultAvatar
    } catch {
      return defaultAvatar
    }
  })
  
  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem(MODE_KEY)
      return savedMode === 'agent' ? 'agent' : 'custom'
    } catch {
      return 'custom'
    }
  })
  
  const updateAvatar = useCallback((newAvatar) => {
    setAvatar(newAvatar)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAvatar))
    } catch (e) {
      console.error('Failed to save avatar to localStorage:', e)
    }
  }, [])
  
  const updateAvatarField = useCallback((key, value) => {
    setAvatar(prev => {
      const updated = { ...prev, [key]: value }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save avatar to localStorage:', e)
      }
      return updated
    })
  }, [])
  
  const toggleMode = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'custom' ? 'agent' : 'custom'
      try {
        localStorage.setItem(MODE_KEY, newMode)
      } catch (e) {
        console.error('Failed to save avatar mode to localStorage:', e)
      }
      return newMode
    })
  }, [])
  
  const setAvatarMode = useCallback((newMode) => {
    if (newMode === 'custom' || newMode === 'agent') {
      setMode(newMode)
      try {
        localStorage.setItem(MODE_KEY, newMode)
      } catch (e) {
        console.error('Failed to save avatar mode to localStorage:', e)
      }
    }
  }, [])
  
  const getAvatarPreview = useCallback((size = 200) => {
    return (
      <div style={{ width: size, height: size * 1.3 }}>
        <AvatarPreview avatar={avatar} />
      </div>
    )
  }, [avatar])
  
  const AvatarComponent = useMemo(() => {
    return function Avatar({ size = 40, showName = false }) {
      const skin = avatarOptions.skinTone.find(s => s.id === avatar.skinTone) || avatarOptions.skinTone[3]
      const hair = avatarOptions.hairColor.find(h => h.id === avatar.hairColor) || avatarOptions.hairColor[0]
      const bg = avatarOptions.background.find(b => b.id === avatar.background) || avatarOptions.background[0]
      const eyeColorOpt = avatarOptions.eyeColor.find(e => e.id === avatar.eyeColor) || avatarOptions.eyeColor[0]
      
      return (
        <div style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: bg.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          <svg viewBox="20 15 60 60" style={{ width: '90%', height: '90%' }}>
            <ellipse cx="50" cy="45" rx="22" ry="24" fill={skin.color} />
            <ellipse cx="42" cy="42" rx="3" ry="2.5" fill={eyeColorOpt.color} />
            <ellipse cx="58" cy="42" rx="3" ry="2.5" fill={eyeColorOpt.color} />
            <ellipse cx="42" cy="42" rx="1.5" ry="1.5" fill="#1a1a1a" />
            <ellipse cx="58" cy="42" rx="1.5" ry="1.5" fill="#1a1a1a" />
            <path d="M45 55 Q50 58 55 55" stroke="#c0392b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {avatar.hairStyle !== 'bald' && avatar.hairStyle !== 'buzzcut' && (
              <path d="M28 35 Q50 15 72 35 Q70 25 50 22 Q30 25 28 35" fill={hair.color} />
            )}
          </svg>
          {showName && (
            <div style={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: 'white',
              whiteSpace: 'nowrap'
            }}>
              {avatar.name}
            </div>
          )}
        </div>
      )
    }
  }, [avatar])
  
  const resetAvatar = useCallback(() => {
    setAvatar(defaultAvatar)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAvatar))
    } catch (e) {
      console.error('Failed to reset avatar in localStorage:', e)
    }
  }, [])
  
  const value = useMemo(() => ({
    avatar,
    mode,
    isCustomMode: mode === 'custom',
    isAgentMode: mode === 'agent',
    updateAvatar,
    updateAvatarField,
    toggleMode,
    setAvatarMode,
    getAvatarPreview,
    AvatarComponent,
    resetAvatar,
    avatarOptions,
    defaultAvatar
  }), [avatar, mode, updateAvatar, updateAvatarField, toggleMode, setAvatarMode, getAvatarPreview, AvatarComponent, resetAvatar])
  
  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  )
}

export function useAvatar() {
  const context = useContext(AvatarContext)
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider')
  }
  return context
}

export { defaultAvatar, avatarOptions }
