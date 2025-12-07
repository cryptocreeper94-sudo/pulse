import { useState, useCallback } from 'react'

const avatarOptions = {
  skinTone: [
    { id: 'light', label: 'Light', color: '#FFDFC4' },
    { id: 'light-tan', label: 'Light Tan', color: '#F0C08A' },
    { id: 'tan', label: 'Tan', color: '#D4A574' },
    { id: 'medium', label: 'Medium', color: '#C68642' },
    { id: 'olive', label: 'Olive', color: '#9F8170' },
    { id: 'brown', label: 'Brown', color: '#8D5524' },
    { id: 'dark-brown', label: 'Dark Brown', color: '#5C3D2E' },
    { id: 'dark', label: 'Dark', color: '#3B2219' },
  ],
  faceShape: [
    { id: 'oval', label: 'Oval', icon: '🥚' },
    { id: 'round', label: 'Round', icon: '⭕' },
    { id: 'square', label: 'Square', icon: '⬜' },
    { id: 'heart', label: 'Heart', icon: '💜' },
  ],
  hairStyle: [
    { id: 'short', label: 'Short', icon: '💇' },
    { id: 'medium', label: 'Medium', icon: '💇‍♀️' },
    { id: 'long', label: 'Long', icon: '👩‍🦱' },
    { id: 'curly', label: 'Curly', icon: '🌀' },
    { id: 'wavy', label: 'Wavy', icon: '🌊' },
    { id: 'braids', label: 'Braids', icon: '🪢' },
    { id: 'afro', label: 'Afro', icon: '🔴' },
    { id: 'bald', label: 'Bald', icon: '👴' },
    { id: 'buzzcut', label: 'Buzz Cut', icon: '✂️' },
    { id: 'ponytail', label: 'Ponytail', icon: '🎀' },
    { id: 'pigtails', label: 'Pigtails', icon: '🎀🎀' },
    { id: 'mohawk', label: 'Mohawk', icon: '🦔' },
    { id: 'dreads', label: 'Dreads', icon: '🔗' },
    { id: 'cornrows', label: 'Cornrows', icon: '〰️' },
    { id: 'man-bun', label: 'Man Bun', icon: '🔵' },
    { id: 'pixie', label: 'Pixie Cut', icon: '✨' },
    { id: 'bob', label: 'Bob', icon: '💁' },
  ],
  hairColor: [
    { id: 'black', label: 'Black', color: '#1a1a1a' },
    { id: 'dark-brown', label: 'Dark Brown', color: '#3b2417' },
    { id: 'brown', label: 'Brown', color: '#6a4e42' },
    { id: 'light-brown', label: 'Light Brown', color: '#a67c52' },
    { id: 'blonde', label: 'Blonde', color: '#d4a76a' },
    { id: 'platinum', label: 'Platinum', color: '#e8e4d9' },
    { id: 'red', label: 'Red', color: '#8b3a3a' },
    { id: 'ginger', label: 'Ginger', color: '#c65d3b' },
    { id: 'gray', label: 'Gray', color: '#888888' },
    { id: 'white', label: 'White', color: '#e0e0e0' },
    { id: 'blue', label: 'Blue', color: '#3498db' },
    { id: 'purple', label: 'Purple', color: '#9b59b6' },
    { id: 'pink', label: 'Pink', color: '#e91e8c' },
    { id: 'green', label: 'Green', color: '#27ae60' },
  ],
  eyeColor: [
    { id: 'brown', label: 'Brown', color: '#5D4037' },
    { id: 'blue', label: 'Blue', color: '#1976D2' },
    { id: 'green', label: 'Green', color: '#388E3C' },
    { id: 'hazel', label: 'Hazel', color: '#8D6E63' },
    { id: 'gray', label: 'Gray', color: '#607D8B' },
    { id: 'amber', label: 'Amber', color: '#FF8F00' },
  ],
  eyebrowStyle: [
    { id: 'thin', label: 'Thin', icon: '―' },
    { id: 'thick', label: 'Thick', icon: '━' },
    { id: 'arched', label: 'Arched', icon: '⌒' },
    { id: 'straight', label: 'Straight', icon: '—' },
  ],
  facialHair: [
    { id: 'none', label: 'None', icon: '😊' },
    { id: 'stubble', label: 'Stubble', icon: '🧔‍♂️' },
    { id: 'mustache', label: 'Mustache', icon: '👨' },
    { id: 'goatee', label: 'Goatee', icon: '🧔' },
    { id: 'full-beard', label: 'Full Beard', icon: '🧔‍♂️' },
    { id: 'soul-patch', label: 'Soul Patch', icon: '😎' },
  ],
  bodyType: [
    { id: 'slim', label: 'Slim', icon: '🧍' },
    { id: 'average', label: 'Average', icon: '🧍' },
    { id: 'athletic', label: 'Athletic', icon: '💪' },
    { id: 'curvy', label: 'Curvy', icon: '🧍‍♀️' },
    { id: 'plus', label: 'Plus Size', icon: '🧍' },
  ],
  clothing: [
    { id: 'suit', label: 'Business Suit', icon: '👔', color: '#2c3e50' },
    { id: 'casual', label: 'Casual', icon: '👕', color: '#3498db' },
    { id: 'hoodie', label: 'Hoodie', icon: '🧥', color: '#34495e' },
    { id: 'tshirt', label: 'T-Shirt', icon: '👕', color: '#e74c3c' },
    { id: 'dress', label: 'Dress', icon: '👗', color: '#9b59b6' },
    { id: 'blazer', label: 'Blazer', icon: '🧥', color: '#1abc9c' },
    { id: 'crypto', label: 'Crypto Merch', icon: '₿', color: '#f39c12' },
    { id: 'tank-top', label: 'Tank Top', icon: '🎽', color: '#e67e22' },
    { id: 'jacket', label: 'Jacket', icon: '🧥', color: '#2c3e50' },
    { id: 'vest', label: 'Vest', icon: '🦺', color: '#7f8c8d' },
    { id: 'polo', label: 'Polo', icon: '👕', color: '#16a085' },
    { id: 'sweater', label: 'Sweater', icon: '🧶', color: '#8e44ad' },
    { id: 'crop-top', label: 'Crop Top', icon: '👚', color: '#e91e63' },
  ],
  accessories: [
    { id: 'none', label: 'None', icon: '✖️' },
    { id: 'glasses', label: 'Glasses', icon: '👓' },
    { id: 'sunglasses', label: 'Sunglasses', icon: '🕶️' },
    { id: 'earrings', label: 'Earrings', icon: '💎' },
    { id: 'necklace', label: 'Necklace', icon: '📿' },
    { id: 'headphones', label: 'Headphones', icon: '🎧' },
    { id: 'hat', label: 'Hat', icon: '🧢' },
    { id: 'bandana', label: 'Bandana', icon: '🎀' },
    { id: 'beanie', label: 'Beanie', icon: '🧢' },
    { id: 'cap-backwards', label: 'Cap Backwards', icon: '🔄' },
    { id: 'chain-necklace', label: 'Chain', icon: '⛓️' },
    { id: 'watch', label: 'Watch', icon: '⌚' },
    { id: 'rings', label: 'Rings', icon: '💍' },
  ],
  background: [
    { id: 'dark', label: 'Dark', color: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)' },
    { id: 'space', label: 'Space', color: 'linear-gradient(135deg, #0B0C10, #1a1a3a)' },
    { id: 'ocean', label: 'Ocean', color: 'linear-gradient(180deg, #0d1b2a, #0a3d5c)' },
    { id: 'forest', label: 'Forest', color: 'linear-gradient(135deg, #0f1419, #1a4d2e)' },
    { id: 'sunset', label: 'Sunset', color: 'linear-gradient(180deg, #6BA3FF, #2A2416)' },
    { id: 'neon', label: 'Neon', color: 'linear-gradient(135deg, #9D4EDD, #00D4FF)' },
    { id: 'crypto', label: 'Crypto', color: 'linear-gradient(135deg, #f39c12, #9b59b6)' },
  ]
}

const defaultAvatar = {
  skinTone: 'medium',
  faceShape: 'oval',
  hairStyle: 'short',
  hairColor: 'black',
  eyeColor: 'brown',
  eyebrowStyle: 'thick',
  facialHair: 'none',
  bodyType: 'average',
  clothing: 'casual',
  accessories: 'none',
  background: 'dark',
  name: 'My Avatar'
}

function AvatarPreview({ avatar }) {
  const skin = avatarOptions.skinTone.find(s => s.id === avatar.skinTone) || avatarOptions.skinTone[3]
  const hair = avatarOptions.hairColor.find(h => h.id === avatar.hairColor) || avatarOptions.hairColor[0]
  const bg = avatarOptions.background.find(b => b.id === avatar.background) || avatarOptions.background[0]
  const clothing = avatarOptions.clothing.find(c => c.id === avatar.clothing) || avatarOptions.clothing[1]
  const eyeColorOpt = avatarOptions.eyeColor.find(e => e.id === avatar.eyeColor) || avatarOptions.eyeColor[0]
  const isBald = avatar.hairStyle === 'bald' || avatar.hairStyle === 'buzzcut'
  
  const getFaceShapeParams = () => {
    switch (avatar.faceShape) {
      case 'round':
        return { rx: 30, ry: 30, cy: 47 }
      case 'square':
        return { rx: 26, ry: 30, cy: 45 }
      case 'heart':
        return { rx: 28, ry: 34, cy: 44 }
      default:
        return { rx: 28, ry: 32, cy: 45 }
    }
  }
  
  const faceParams = getFaceShapeParams()
  
  const getEyebrowPath = () => {
    switch (avatar.eyebrowStyle) {
      case 'thin':
        return { strokeWidth: 1, d1: 'M30 38 Q38 36 46 38', d2: 'M54 38 Q62 36 70 38' }
      case 'thick':
        return { strokeWidth: 3, d1: 'M30 38 Q38 35 46 38', d2: 'M54 38 Q62 35 70 38' }
      case 'arched':
        return { strokeWidth: 2, d1: 'M30 40 Q38 32 46 38', d2: 'M54 38 Q62 32 70 40' }
      default:
        return { strokeWidth: 2, d1: 'M30 38 L46 38', d2: 'M54 38 L70 38' }
    }
  }
  
  const eyebrowParams = getEyebrowPath()
  
  return (
    <div style={{
      width: 200,
      height: 260,
      background: bg.color,
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(157, 78, 221, 0.2)'
    }}>
      <svg viewBox="0 0 100 140" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <clipPath id="headClip">
            <ellipse cx="50" cy={faceParams.cy} rx={faceParams.rx} ry={faceParams.ry} />
          </clipPath>
        </defs>
        
        <ellipse cx="50" cy="120" rx="35" ry="25" fill={clothing.color} />
        <rect x="15" y="95" width="70" height="45" rx="10" fill={clothing.color} />
        
        {(avatar.clothing === 'tank-top' || avatar.clothing === 'crop-top') && (
          <>
            <ellipse cx="35" cy="95" rx="8" ry="5" fill={skin.color} />
            <ellipse cx="65" cy="95" rx="8" ry="5" fill={skin.color} />
          </>
        )}
        
        {avatar.clothing === 'vest' && (
          <rect x="35" y="95" width="30" height="35" fill="#ecf0f1" />
        )}
        
        {avatar.clothing === 'jacket' && (
          <>
            <rect x="15" y="95" width="15" height="45" rx="5" fill="#1a252f" />
            <rect x="70" y="95" width="15" height="45" rx="5" fill="#1a252f" />
          </>
        )}
        
        {avatar.accessories === 'watch' && (
          <rect x="8" y="115" width="8" height="10" rx="2" fill="#c0c0c0" stroke="#888" strokeWidth="1" />
        )}
        
        {avatar.accessories === 'chain-necklace' && (
          <path d="M30 92 Q50 100 70 92" stroke="#FFD700" strokeWidth="2" fill="none" />
        )}
        
        <ellipse cx="50" cy={faceParams.cy} rx={faceParams.rx} ry={faceParams.ry} fill={skin.color} />
        
        {avatar.faceShape === 'heart' && (
          <path d={`M50 ${faceParams.cy + faceParams.ry - 5} L42 ${faceParams.cy + faceParams.ry - 12} L58 ${faceParams.cy + faceParams.ry - 12} Z`} fill={skin.color} />
        )}
        
        {!isBald && (
          <g>
            {avatar.hairStyle === 'short' && (
              <path d="M22 35 Q50 5 78 35 Q78 20 50 15 Q22 20 22 35" fill={hair.color} />
            )}
            {avatar.hairStyle === 'medium' && (
              <path d="M20 40 Q50 0 80 40 Q85 55 80 70 L75 50 Q50 5 25 50 L20 70 Q15 55 20 40" fill={hair.color} />
            )}
            {avatar.hairStyle === 'long' && (
              <path d="M18 45 Q50 -5 82 45 Q90 80 85 110 L80 80 Q80 50 50 10 Q20 50 20 80 L15 110 Q10 80 18 45" fill={hair.color} />
            )}
            {avatar.hairStyle === 'curly' && (
              <>
                <circle cx="25" cy="30" r="12" fill={hair.color} />
                <circle cx="40" cy="20" r="10" fill={hair.color} />
                <circle cx="55" cy="18" r="11" fill={hair.color} />
                <circle cx="70" cy="25" r="10" fill={hair.color} />
                <circle cx="78" cy="38" r="8" fill={hair.color} />
                <circle cx="22" cy="45" r="9" fill={hair.color} />
              </>
            )}
            {avatar.hairStyle === 'afro' && (
              <ellipse cx="50" cy="35" rx="40" ry="35" fill={hair.color} />
            )}
            {avatar.hairStyle === 'braids' && (
              <>
                <path d="M22 30 Q50 5 78 30" fill={hair.color} stroke={hair.color} strokeWidth="4" />
                <path d="M18 45 L15 85 M20 45 L17 85" stroke={hair.color} strokeWidth="3" />
                <path d="M82 45 L85 85 M80 45 L83 85" stroke={hair.color} strokeWidth="3" />
              </>
            )}
            {avatar.hairStyle === 'wavy' && (
              <path d="M20 35 Q35 10 50 15 Q65 10 80 35 Q85 50 80 65 Q70 45 50 20 Q30 45 20 65 Q15 50 20 35" fill={hair.color} />
            )}
            {avatar.hairStyle === 'ponytail' && (
              <>
                <path d="M22 35 Q50 5 78 35 Q78 20 50 15 Q22 20 22 35" fill={hair.color} />
                <ellipse cx="50" cy="8" rx="8" ry="6" fill={hair.color} />
                <path d="M50 14 L50 -5" stroke={hair.color} strokeWidth="6" />
              </>
            )}
            {avatar.hairStyle === 'pigtails' && (
              <>
                <path d="M22 35 Q50 5 78 35 Q78 20 50 15 Q22 20 22 35" fill={hair.color} />
                <circle cx="18" cy="45" r="8" fill={hair.color} />
                <circle cx="82" cy="45" r="8" fill={hair.color} />
                <path d="M18 53 L15 80" stroke={hair.color} strokeWidth="5" />
                <path d="M82 53 L85 80" stroke={hair.color} strokeWidth="5" />
              </>
            )}
            {avatar.hairStyle === 'mohawk' && (
              <path d="M45 35 L50 0 L55 35 Q55 25 50 20 Q45 25 45 35" fill={hair.color} />
            )}
            {avatar.hairStyle === 'dreads' && (
              <>
                <path d="M22 30 Q50 5 78 30" fill={hair.color} />
                {[20, 30, 40, 50, 60, 70, 80].map((x, i) => (
                  <path key={i} d={`M${x} 30 L${x + (i % 2 === 0 ? 3 : -3)} 75`} stroke={hair.color} strokeWidth="4" />
                ))}
              </>
            )}
            {avatar.hairStyle === 'cornrows' && (
              <>
                <path d="M22 30 Q50 5 78 30" fill={hair.color} />
                {[30, 40, 50, 60, 70].map((x, i) => (
                  <path key={i} d={`M${x} 15 L${x} 35`} stroke={hair.color} strokeWidth="2" strokeDasharray="2,2" />
                ))}
              </>
            )}
            {avatar.hairStyle === 'man-bun' && (
              <>
                <path d="M22 35 Q50 10 78 35 Q78 25 50 20 Q22 25 22 35" fill={hair.color} />
                <circle cx="50" cy="10" r="10" fill={hair.color} />
              </>
            )}
            {avatar.hairStyle === 'pixie' && (
              <path d="M22 38 Q40 15 60 20 Q75 25 78 40 Q70 30 50 25 Q30 30 22 38" fill={hair.color} />
            )}
            {avatar.hairStyle === 'bob' && (
              <path d="M18 40 Q50 5 82 40 Q85 60 80 70 L75 55 Q50 10 25 55 L20 70 Q15 60 18 40" fill={hair.color} />
            )}
          </g>
        )}
        {avatar.hairStyle === 'buzzcut' && (
          <ellipse cx="50" cy="30" rx="26" ry="18" fill={hair.color} opacity="0.5" />
        )}
        
        <path d={eyebrowParams.d1} stroke={hair.color} strokeWidth={eyebrowParams.strokeWidth} fill="none" strokeLinecap="round" />
        <path d={eyebrowParams.d2} stroke={hair.color} strokeWidth={eyebrowParams.strokeWidth} fill="none" strokeLinecap="round" />
        
        <ellipse cx="38" cy="45" rx="4" ry="3" fill={eyeColorOpt.color} />
        <ellipse cx="62" cy="45" rx="4" ry="3" fill={eyeColorOpt.color} />
        <ellipse cx="38" cy="45" rx="2" ry="2" fill="#1a1a1a" />
        <ellipse cx="62" cy="45" rx="2" ry="2" fill="#1a1a1a" />
        <ellipse cx="39" cy="44" rx="1" ry="1" fill="white" />
        <ellipse cx="63" cy="44" rx="1" ry="1" fill="white" />
        
        <ellipse cx="50" cy="55" rx="3" ry="2" fill={`color-mix(in srgb, ${skin.color} 70%, #8b4513)`} />
        
        <path d="M43 65 Q50 70 57 65" stroke="#c0392b" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {avatar.facialHair !== 'none' && (
          <g fill={hair.color} opacity="0.8">
            {avatar.facialHair === 'stubble' && (
              <ellipse cx="50" cy="68" rx="15" ry="8" opacity="0.3" />
            )}
            {avatar.facialHair === 'mustache' && (
              <path d="M35 60 Q50 65 65 60 Q50 68 35 60" />
            )}
            {avatar.facialHair === 'goatee' && (
              <>
                <path d="M35 60 Q50 65 65 60 Q50 68 35 60" />
                <ellipse cx="50" cy="75" rx="8" ry="6" />
              </>
            )}
            {avatar.facialHair === 'full-beard' && (
              <path d="M25 55 Q25 80 50 85 Q75 80 75 55 Q60 60 50 58 Q40 60 25 55" />
            )}
            {avatar.facialHair === 'soul-patch' && (
              <ellipse cx="50" cy="72" rx="4" ry="4" />
            )}
          </g>
        )}
        
        {avatar.accessories === 'glasses' && (
          <g stroke="#333" strokeWidth="1.5" fill="none">
            <circle cx="38" cy="45" r="8" fill="rgba(200,200,255,0.2)" />
            <circle cx="62" cy="45" r="8" fill="rgba(200,200,255,0.2)" />
            <path d="M46 45 L54 45" />
            <path d="M30 45 L22 42" />
            <path d="M70 45 L78 42" />
          </g>
        )}
        {avatar.accessories === 'sunglasses' && (
          <g>
            <rect x="28" y="40" width="16" height="10" rx="2" fill="#1a1a1a" />
            <rect x="56" y="40" width="16" height="10" rx="2" fill="#1a1a1a" />
            <path d="M44 45 L56 45" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M28 45 L20 42" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M72 45 L80 42" stroke="#1a1a1a" strokeWidth="2" />
          </g>
        )}
        {avatar.accessories === 'headphones' && (
          <g stroke="#333" strokeWidth="3" fill="none">
            <path d="M20 50 Q20 20 50 15 Q80 20 80 50" />
            <rect x="14" y="45" width="10" height="15" rx="3" fill="#333" />
            <rect x="76" y="45" width="10" height="15" rx="3" fill="#333" />
          </g>
        )}
        {avatar.accessories === 'hat' && (
          <g>
            <ellipse cx="50" cy="18" rx="32" ry="8" fill="#2c3e50" />
            <rect x="25" y="8" width="50" height="12" rx="4" fill="#2c3e50" />
          </g>
        )}
        {avatar.accessories === 'bandana' && (
          <g>
            <path d="M20 30 Q50 20 80 30 L78 38 Q50 28 22 38 Z" fill="#e74c3c" />
            <path d="M78 30 L85 40" stroke="#e74c3c" strokeWidth="3" />
          </g>
        )}
        {avatar.accessories === 'beanie' && (
          <g>
            <path d="M18 40 Q50 10 82 40 L80 32 Q50 5 20 32 Z" fill="#34495e" />
            <ellipse cx="50" cy="10" rx="5" ry="5" fill="#34495e" />
          </g>
        )}
        {avatar.accessories === 'cap-backwards' && (
          <g>
            <path d="M22 35 Q50 15 78 35 L75 28 Q50 10 25 28 Z" fill="#2c3e50" />
            <rect x="20" y="30" width="15" height="8" rx="2" fill="#2c3e50" />
          </g>
        )}
        {avatar.accessories === 'earrings' && (
          <g>
            <circle cx="20" cy="55" r="3" fill="#f1c40f" />
            <circle cx="80" cy="55" r="3" fill="#f1c40f" />
          </g>
        )}
        {avatar.accessories === 'necklace' && (
          <path d="M35 88 Q50 95 65 88" stroke="#f1c40f" strokeWidth="2" fill="none" />
        )}
        {avatar.accessories === 'rings' && (
          <>
            <circle cx="25" cy="125" r="2" fill="#f1c40f" stroke="#c0392b" strokeWidth="0.5" />
            <circle cx="75" cy="125" r="2" fill="#c0c0c0" stroke="#3498db" strokeWidth="0.5" />
          </>
        )}
      </svg>
      
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'white',
        fontSize: 12,
        fontWeight: 600,
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        {avatar.name}
      </div>
    </div>
  )
}

function OptionSection({ title, options, selected, onSelect, type = 'icon' }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ 
        fontSize: 11, 
        color: '#888', 
        marginBottom: 8, 
        textTransform: 'uppercase',
        fontWeight: 600 
      }}>
        {title}
      </div>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 6 
      }}>
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            style={{
              width: type === 'color' ? 28 : 'auto',
              height: type === 'color' ? 28 : 32,
              minWidth: type === 'color' ? 28 : 50,
              padding: type === 'color' ? 0 : '4px 10px',
              borderRadius: type === 'color' ? '50%' : 6,
              border: selected === opt.id 
                ? '2px solid #00D4FF' 
                : '1px solid rgba(255,255,255,0.2)',
              background: type === 'color' ? opt.color : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: type === 'color' ? 12 : 11,
              transition: 'all 0.2s',
              boxShadow: selected === opt.id ? '0 0 10px rgba(0,212,255,0.5)' : 'none'
            }}
          >
            {type !== 'color' && (opt.icon ? `${opt.icon}` : opt.label)}
          </button>
        ))}
      </div>
    </div>
  )
}

export { avatarOptions, defaultAvatar, AvatarPreview }

export default function AvatarCreator({ isOpen, onClose, onSave, isPremium = false }) {
  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem('pulse-user-avatar')
    return saved ? JSON.parse(saved) : defaultAvatar
  })
  const [activeTab, setActiveTab] = useState('appearance')
  
  const updateAvatar = useCallback((key, value) => {
    setAvatar(prev => ({ ...prev, [key]: value }))
  }, [])
  
  const handleSave = useCallback(() => {
    localStorage.setItem('pulse-user-avatar', JSON.stringify(avatar))
    onSave?.(avatar)
    onClose?.()
  }, [avatar, onSave, onClose])
  
  const handleRandomize = useCallback(() => {
    const random = {
      skinTone: avatarOptions.skinTone[Math.floor(Math.random() * avatarOptions.skinTone.length)].id,
      faceShape: avatarOptions.faceShape[Math.floor(Math.random() * avatarOptions.faceShape.length)].id,
      hairStyle: avatarOptions.hairStyle[Math.floor(Math.random() * avatarOptions.hairStyle.length)].id,
      hairColor: avatarOptions.hairColor[Math.floor(Math.random() * avatarOptions.hairColor.length)].id,
      eyeColor: avatarOptions.eyeColor[Math.floor(Math.random() * avatarOptions.eyeColor.length)].id,
      eyebrowStyle: avatarOptions.eyebrowStyle[Math.floor(Math.random() * avatarOptions.eyebrowStyle.length)].id,
      facialHair: avatarOptions.facialHair[Math.floor(Math.random() * avatarOptions.facialHair.length)].id,
      bodyType: avatarOptions.bodyType[Math.floor(Math.random() * avatarOptions.bodyType.length)].id,
      clothing: avatarOptions.clothing[Math.floor(Math.random() * avatarOptions.clothing.length)].id,
      accessories: avatarOptions.accessories[Math.floor(Math.random() * avatarOptions.accessories.length)].id,
      background: avatarOptions.background[Math.floor(Math.random() * avatarOptions.background.length)].id,
      name: avatar.name
    }
    setAvatar(random)
  }, [avatar.name])
  
  if (!isOpen) return null
  
  const tabs = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'features', label: 'Features' },
    { id: 'style', label: 'Style' },
    { id: 'extras', label: 'Extras' }
  ]
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }} onClick={onClose}>
      <div style={{
        background: '#141414',
        borderRadius: 16,
        border: '1px solid rgba(157, 78, 221, 0.3)',
        width: '100%',
        maxWidth: 600,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#00D4FF', 
            fontSize: 18,
            fontFamily: 'Orbitron, sans-serif'
          }}>
            Avatar Creator
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 24,
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.3)'
          }}>
            <AvatarPreview avatar={avatar} />
            
            <input
              type="text"
              value={avatar.name}
              onChange={e => updateAvatar('name', e.target.value)}
              placeholder="Avatar Name"
              style={{
                marginTop: 12,
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6,
                color: 'white',
                fontSize: 12,
                textAlign: 'center'
              }}
            />
            
            <button
              onClick={handleRandomize}
              style={{
                marginTop: 12,
                padding: '8px 16px',
                background: 'rgba(157, 78, 221, 0.2)',
                border: '1px solid rgba(157, 78, 221, 0.4)',
                borderRadius: 6,
                color: '#c084fc',
                fontSize: 12,
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🎲 Randomize
            </button>
          </div>
          
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: activeTab === tab.id ? 'rgba(0,212,255,0.1)' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #00D4FF' : '2px solid transparent',
                    color: activeTab === tab.id ? '#00D4FF' : '#888',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: 16 
            }}>
              {activeTab === 'appearance' && (
                <>
                  <OptionSection
                    title="Skin Tone"
                    options={avatarOptions.skinTone}
                    selected={avatar.skinTone}
                    onSelect={v => updateAvatar('skinTone', v)}
                    type="color"
                  />
                  <OptionSection
                    title="Face Shape"
                    options={avatarOptions.faceShape}
                    selected={avatar.faceShape}
                    onSelect={v => updateAvatar('faceShape', v)}
                  />
                  <OptionSection
                    title="Hair Style"
                    options={avatarOptions.hairStyle}
                    selected={avatar.hairStyle}
                    onSelect={v => updateAvatar('hairStyle', v)}
                  />
                  <OptionSection
                    title="Hair Color"
                    options={avatarOptions.hairColor}
                    selected={avatar.hairColor}
                    onSelect={v => updateAvatar('hairColor', v)}
                    type="color"
                  />
                </>
              )}
              
              {activeTab === 'features' && (
                <>
                  <OptionSection
                    title="Eye Color"
                    options={avatarOptions.eyeColor}
                    selected={avatar.eyeColor}
                    onSelect={v => updateAvatar('eyeColor', v)}
                    type="color"
                  />
                  <OptionSection
                    title="Eyebrow Style"
                    options={avatarOptions.eyebrowStyle}
                    selected={avatar.eyebrowStyle}
                    onSelect={v => updateAvatar('eyebrowStyle', v)}
                  />
                  <OptionSection
                    title="Facial Hair"
                    options={avatarOptions.facialHair}
                    selected={avatar.facialHair}
                    onSelect={v => updateAvatar('facialHair', v)}
                  />
                </>
              )}
              
              {activeTab === 'style' && (
                <>
                  <OptionSection
                    title="Body Type"
                    options={avatarOptions.bodyType}
                    selected={avatar.bodyType}
                    onSelect={v => updateAvatar('bodyType', v)}
                  />
                  <OptionSection
                    title="Clothing"
                    options={avatarOptions.clothing}
                    selected={avatar.clothing}
                    onSelect={v => updateAvatar('clothing', v)}
                  />
                </>
              )}
              
              {activeTab === 'extras' && (
                <>
                  <OptionSection
                    title="Accessories"
                    options={avatarOptions.accessories}
                    selected={avatar.accessories}
                    onSelect={v => updateAvatar('accessories', v)}
                  />
                  <OptionSection
                    title="Background"
                    options={avatarOptions.background}
                    selected={avatar.background}
                    onSelect={v => updateAvatar('background', v)}
                  />
                </>
              )}
              
              {!isPremium && (
                <div style={{
                  marginTop: 16,
                  padding: 12,
                  background: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  borderRadius: 8,
                  fontSize: 11,
                  color: '#f97316'
                }}>
                  Upgrade to Premium to unlock all customization options and save unlimited avatars!
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: 12,
          padding: 16,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: '#888',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #00D4FF, #9D4EDD)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  )
}
