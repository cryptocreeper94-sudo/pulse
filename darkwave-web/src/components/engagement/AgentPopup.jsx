import { useState, useEffect, useCallback } from 'react'
import { getRandomTip } from '../../data/agentTips'
import PIXAR_AGENTS from '../../data/agents'

const DIRECTIONS = ['left', 'right', 'bottom-left', 'bottom-right']

export default function AgentPopup({ enabled = true, interval = 90000, selectedAgentId = 1 }) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTip, setCurrentTip] = useState(null)
  const [direction, setDirection] = useState('right')
  const [agent, setAgent] = useState(null)

  useEffect(() => {
    const selectedAgent = PIXAR_AGENTS.find(a => a.id === selectedAgentId) || PIXAR_AGENTS[0]
    setAgent(selectedAgent)
  }, [selectedAgentId])

  const showPopup = useCallback(() => {
    if (!enabled) return
    
    const tip = getRandomTip()
    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
    
    setCurrentTip(tip)
    setDirection(dir)
    setIsVisible(true)
    
    setTimeout(() => {
      setIsVisible(false)
    }, 8000)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const initialDelay = setTimeout(() => {
      showPopup()
    }, 15000)

    const intervalId = setInterval(() => {
      if (Math.random() < 0.4) {
        showPopup()
      }
    }, interval)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(intervalId)
    }
  }, [enabled, interval, showPopup])

  if (!isVisible || !agent || !currentTip) return null

  const getAnimationClass = () => {
    switch (direction) {
      case 'left': return 'agent-sweep-from-left'
      case 'right': return 'agent-sweep-from-right'
      case 'bottom-left': return 'agent-sweep-from-bottom-left'
      case 'bottom-right': return 'agent-sweep-from-bottom-right'
      default: return 'agent-sweep-from-right'
    }
  }

  const getPositionStyle = () => {
    switch (direction) {
      case 'left': return { left: '20px', bottom: '100px' }
      case 'right': return { right: '20px', bottom: '100px' }
      case 'bottom-left': return { left: '40px', bottom: '80px' }
      case 'bottom-right': return { right: '40px', bottom: '80px' }
      default: return { right: '20px', bottom: '100px' }
    }
  }

  const getBubblePosition = () => {
    if (direction.includes('left')) {
      return { left: '80px', right: 'auto' }
    }
    return { right: '80px', left: 'auto' }
  }

  return (
    <>
      <div 
        className={`agent-popup-container ${getAnimationClass()}`}
        style={getPositionStyle()}
        onClick={() => setIsVisible(false)}
      >
        <div className="agent-speech-bubble" style={getBubblePosition()}>
          <p>{currentTip.tip}</p>
          <div className={`bubble-tail ${direction.includes('left') ? 'tail-left' : 'tail-right'}`}></div>
        </div>
        
        <div className="agent-character">
          <div className="agent-glow"></div>
          <img 
            src={agent.image} 
            alt={agent.name}
            className="agent-image"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <div className="agent-name-tag">{agent.name}</div>
        </div>
      </div>

      <style>{`
        .agent-popup-container {
          position: fixed;
          z-index: 1500;
          display: flex;
          align-items: flex-end;
          gap: 16px;
          cursor: pointer;
          pointer-events: auto;
        }

        .agent-sweep-from-right {
          animation: sweepFromRight 0.6s ease-out forwards;
        }

        .agent-sweep-from-left {
          animation: sweepFromLeft 0.6s ease-out forwards;
          flex-direction: row-reverse;
        }

        .agent-sweep-from-bottom-right {
          animation: sweepFromBottomRight 0.6s ease-out forwards;
        }

        .agent-sweep-from-bottom-left {
          animation: sweepFromBottomLeft 0.6s ease-out forwards;
          flex-direction: row-reverse;
        }

        @keyframes sweepFromRight {
          0% { transform: translateX(200px) scale(0.8); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }

        @keyframes sweepFromLeft {
          0% { transform: translateX(-200px) scale(0.8); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }

        @keyframes sweepFromBottomRight {
          0% { transform: translate(100px, 100px) scale(0.8); opacity: 0; }
          100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }

        @keyframes sweepFromBottomLeft {
          0% { transform: translate(-100px, 100px) scale(0.8); opacity: 0; }
          100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }

        .agent-character {
          position: relative;
          width: 180px;
          height: 280px;
          flex-shrink: 0;
        }

        .agent-glow {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 120px;
          background: radial-gradient(ellipse, rgba(0, 212, 255, 0.4) 0%, transparent 70%);
          filter: blur(20px);
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }

        .agent-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5));
        }

        .agent-name-tag {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #00d4ff, #0099ff);
          color: #000;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 12px;
          white-space: nowrap;
          z-index: 3;
        }

        .agent-speech-bubble {
          position: relative;
          background: #1a1a1a;
          border: 2px solid #00d4ff;
          border-radius: 16px;
          padding: 16px 20px;
          max-width: 280px;
          box-shadow: 0 4px 30px rgba(0, 212, 255, 0.2);
          animation: bubbleBounce 0.4s ease-out 0.3s both;
        }

        @keyframes bubbleBounce {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }

        .agent-speech-bubble p {
          margin: 0;
          color: #fff;
          font-size: 14px;
          line-height: 1.5;
        }

        .bubble-tail {
          position: absolute;
          bottom: 20px;
          width: 0;
          height: 0;
          border: 12px solid transparent;
        }

        .bubble-tail.tail-right {
          right: -22px;
          border-left-color: #00d4ff;
        }

        .bubble-tail.tail-left {
          left: -22px;
          border-right-color: #00d4ff;
        }

        @media (max-width: 600px) {
          .agent-popup-container {
            flex-direction: column !important;
            align-items: center;
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            animation: none !important;
            bottom: 80px !important;
            width: calc(100vw - 24px);
            max-width: 320px;
          }

          .agent-speech-bubble {
            max-width: 100%;
            margin-bottom: 10px;
          }

          .bubble-tail {
            display: none;
          }

          .agent-character {
            width: 120px;
            height: 180px;
          }
        }
      `}</style>
    </>
  )
}
