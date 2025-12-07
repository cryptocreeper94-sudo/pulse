import { useState } from 'react'
import { Accordion, AccordionItem } from '../ui'
import { useAvatar } from '../../context/AvatarContext'
import MiniAvatar from '../ui/MiniAvatar'
import AvatarCreator from '../ui/AvatarCreator'

export default function SettingsTab() {
  const { avatar, mode, isCustomMode, toggleMode, setAvatarMode } = useAvatar()
  const [showAvatarCreator, setShowAvatarCreator] = useState(false)
  
  return (
    <div className="settings-tab">
      <div className="section-box mb-md">
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <MiniAvatar size={60} onClick={() => setShowAvatarCreator(true)} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {isCustomMode ? avatar.name || 'My Avatar' : 'Founder Account'}
            </div>
            <div style={{ fontSize: 12, color: '#39FF14' }}>✓ Beta V1 Access</div>
            <div style={{ fontSize: 11, color: '#888' }}>Member since 2025</div>
          </div>
        </div>
      </div>
      
      <Accordion singleOpen={false}>
        <AccordionItem title="Avatar Settings" icon="🎭" defaultOpen={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              padding: 16,
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 12
            }}>
              <MiniAvatar size={80} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Avatar Mode</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {isCustomMode ? 'Using custom avatar' : 'Using AI agent (CryptoCat)'}
                </div>
              </div>
              <button
                onClick={toggleMode}
                style={{ 
                  width: 52, 
                  height: 28, 
                  background: isCustomMode ? '#00D4FF' : '#FFA500', 
                  borderRadius: 14,
                  position: 'relative',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background 0.3s ease'
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: isCustomMode ? 26 : 4,
                  top: 4,
                  width: 20,
                  height: 20,
                  background: '#fff',
                  borderRadius: '50%',
                  transition: 'left 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12
                }}>
                  {isCustomMode ? '👤' : '🐱'}
                </span>
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: 8 
            }}>
              <button 
                onClick={() => setAvatarMode('custom')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: isCustomMode ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isCustomMode ? '1px solid #00D4FF' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  color: isCustomMode ? '#00D4FF' : '#888',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                👤 Custom Avatar
              </button>
              <button 
                onClick={() => setAvatarMode('agent')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: !isCustomMode ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: !isCustomMode ? '1px solid #FFA500' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  color: !isCustomMode ? '#FFA500' : '#888',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                🐱 AI Agents
              </button>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => setShowAvatarCreator(true)}
              style={{ width: '100%' }}
            >
              ✏️ Edit Avatar
            </button>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Account Settings" icon="👤">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Email Notifications</span>
              <label style={{ 
                width: 44, 
                height: 24, 
                background: '#39FF14', 
                borderRadius: 12,
                position: 'relative',
                cursor: 'pointer'
              }}>
                <span style={{
                  position: 'absolute',
                  right: 4,
                  top: 4,
                  width: 16,
                  height: 16,
                  background: '#fff',
                  borderRadius: '50%'
                }} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Push Notifications</span>
              <label style={{ 
                width: 44, 
                height: 24, 
                background: '#333', 
                borderRadius: 12,
                position: 'relative',
                cursor: 'pointer'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 4,
                  top: 4,
                  width: 16,
                  height: 16,
                  background: '#888',
                  borderRadius: '50%'
                }} />
              </label>
            </div>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Display Settings" icon="🎨">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🌙 Dark Theme (Active)
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🐱 Crypto Cat Mode
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              👔 Business Mode
            </button>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Subscription" icon="💎">
          <div style={{ 
            padding: 16, 
            background: 'rgba(57, 255, 20, 0.1)', 
            border: '1px solid rgba(57, 255, 20, 0.3)',
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ color: '#39FF14', fontWeight: 700, marginBottom: 4 }}>
              ✓ Legacy Founder
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>$4/month</div>
            <div style={{ fontSize: 11, color: '#888' }}>Locked in forever</div>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Security" icon="🔒">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-secondary">Change Password</button>
            <button className="btn btn-secondary">Enable 2FA</button>
            <button className="btn btn-secondary">View Login History</button>
          </div>
        </AccordionItem>
        
        <AccordionItem title="About" icon="ℹ️">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>
              <span style={{ color: '#00D4FF' }}>PULSE</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Version 2.0.6</div>
            <div style={{ fontSize: 11, color: '#666' }}>
              Powered by DarkWave Studios, LLC © 2025
            </div>
          </div>
        </AccordionItem>
      </Accordion>
      
      {showAvatarCreator && (
        <AvatarCreator 
          isOpen={showAvatarCreator}
          onClose={() => setShowAvatarCreator(false)}
        />
      )}
    </div>
  )
}
