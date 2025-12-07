import { useAvatar } from '../../context/AvatarContext'

export default function MiniAvatar({ size = 32, onClick = null, showFallback = true }) {
  const { avatar, isCustomMode, AvatarComponent, avatarOptions } = useAvatar()
  
  const skin = avatarOptions.skinTone.find(s => s.id === avatar.skinTone) || avatarOptions.skinTone[3]
  const hair = avatarOptions.hairColor.find(h => h.id === avatar.hairColor) || avatarOptions.hairColor[0]
  const bg = avatarOptions.background.find(b => b.id === avatar.background) || avatarOptions.background[0]
  const eyeColorOpt = avatarOptions.eyeColor.find(e => e.id === avatar.eyeColor) || avatarOptions.eyeColor[0]
  
  const hasCustomAvatar = avatar && avatar.name !== 'My Avatar'
  
  if (!isCustomMode && showFallback) {
    return (
      <div 
        onClick={onClick}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFA500, #FF6B00)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: '0 2px 8px rgba(255, 165, 0, 0.3)',
          fontSize: size * 0.5
        }}
      >
        🐱
      </div>
    )
  }
  
  return (
    <div 
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255, 255, 255, 0.1)'
      }}
    >
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
    </div>
  )
}
