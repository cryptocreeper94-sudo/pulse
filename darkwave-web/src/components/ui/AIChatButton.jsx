import React, { useState, useEffect } from 'react'
import AgentSelector from '../AgentSelector'
import PIXAR_AGENTS from '../../data/agents'

export default function AIChatButton({ isSubscribed = false, selectedAgentId = 1 }) {
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [agent, setAgent] = useState(null)

  useEffect(() => {
    const selectedAgent = PIXAR_AGENTS.find(a => a.id === selectedAgentId) || PIXAR_AGENTS[0]
    setAgent(selectedAgent)
  }, [selectedAgentId])

  const handleClick = () => {
    setShowChat(!showChat)
  }

  return (
    <>
      <button
        className="ai-chat-fab"
        onClick={handleClick}
        title={agent ? `Chat with ${agent.name}` : 'Chat with AI Agent'}
      >
        {agent ? (
          <img 
            src={agent.image} 
            alt={agent.name}
            className="ai-fab-agent-image"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="ai-fab-fallback" style={{ display: agent ? 'none' : 'flex' }}>AI</div>
        <span className="ai-chat-fab-glow"></span>
        <span className="ai-chat-fab-pulse"></span>
      </button>

      {showChat && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              {agent && (
                <img 
                  src={agent.image} 
                  alt={agent.name}
                  className="ai-chat-header-avatar"
                />
              )}
              <span>{agent?.name || 'DarkWave AI'}</span>
            </div>
            <button className="ai-chat-close" onClick={() => setShowChat(false)}>×</button>
          </div>
          <div className="ai-chat-body">
            <div className="ai-chat-welcome">
              {agent && (
                <div className="ai-chat-agent-preview">
                  <div className="ai-chat-agent-glow"></div>
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="ai-chat-agent-image"
                  />
                </div>
              )}
              <h3>{agent?.name || 'DarkWave AI Agent'}</h3>
              <p>Your personal trading assistant powered by advanced AI</p>
              <div className="ai-chat-features">
                <div className="ai-feature-item">📊 Market Analysis</div>
                <div className="ai-feature-item">🎯 Trade Signals</div>
                <div className="ai-feature-item">🎤 Voice Control (Coming Soon)</div>
              </div>
              <button 
                className="ai-chat-select-agent"
                onClick={() => setShowAgentSelector(true)}
              >
                Choose Different Agent
              </button>
            </div>
          </div>
          <div className="ai-chat-input-area">
            <input 
              type="text" 
              placeholder="Ask me anything about trading..."
              className="ai-chat-input"
            />
            <button className="ai-chat-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <AgentSelector 
        isOpen={showAgentSelector} 
        onClose={() => setShowAgentSelector(false)}
        isSubscribed={isSubscribed}
      />

      <style>{`
        .ai-chat-fab {
          position: fixed;
          bottom: 70px;
          right: 20px;
          width: 100px;
          height: 140px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: visible;
          z-index: 1000;
          transition: transform 0.2s;
          padding: 0;
        }

        .ai-chat-fab:hover {
          transform: scale(1.1);
        }

        .ai-fab-agent-image {
          width: 100px;
          height: 140px;
          object-fit: contain;
          object-position: center bottom;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6));
          position: relative;
          z-index: 2;
          animation: agentFloat 3s ease-in-out infinite;
        }

        @keyframes agentFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .ai-fab-fallback {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #00d4ff, #0099ff);
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }

        .ai-chat-fab-glow {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 40px;
          background: radial-gradient(ellipse, rgba(0, 212, 255, 0.7) 0%, rgba(0, 153, 255, 0.3) 40%, transparent 70%);
          filter: blur(12px);
          pointer-events: none;
          z-index: 1;
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.8; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
        }

        .ai-chat-fab-pulse {
          display: none;
        }

        .ai-chat-panel {
          position: fixed;
          bottom: 160px;
          right: 20px;
          width: 360px;
          max-width: calc(100vw - 40px);
          height: 520px;
          max-height: calc(100vh - 200px);
          background: #1a1a1a;
          border-radius: 16px;
          border: 1px solid #333;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 1001;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ai-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #333;
        }

        .ai-chat-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          color: #fff;
        }

        .ai-chat-header-avatar {
          width: 40px;
          height: 50px;
          object-fit: contain;
          object-position: bottom;
        }

        .ai-chat-close {
          background: none;
          border: none;
          color: #888;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 8px;
        }

        .ai-chat-close:hover {
          color: #fff;
        }

        .ai-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .ai-chat-welcome {
          text-align: center;
          color: #888;
        }

        .ai-chat-agent-preview {
          position: relative;
          width: 150px;
          height: 180px;
          margin: 0 auto 16px;
        }

        .ai-chat-agent-glow {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 50px;
          background: radial-gradient(ellipse, rgba(0, 212, 255, 0.5) 0%, transparent 70%);
          filter: blur(15px);
        }

        .ai-chat-agent-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom;
          position: relative;
          z-index: 2;
        }

        .ai-chat-welcome h3 {
          color: #fff;
          margin: 0 0 8px;
        }

        .ai-chat-welcome p {
          margin: 0 0 20px;
          font-size: 14px;
        }

        .ai-chat-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .ai-feature-item {
          background: #252525;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          color: #ccc;
        }

        .ai-chat-select-agent {
          background: linear-gradient(135deg, #00d4ff, #0099ff);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .ai-chat-select-agent:hover {
          opacity: 0.9;
        }

        .ai-chat-input-area {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid #333;
        }

        .ai-chat-input {
          flex: 1;
          background: #252525;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px 16px;
          color: #fff;
          font-size: 14px;
        }

        .ai-chat-input::placeholder {
          color: #666;
        }

        .ai-chat-input:focus {
          outline: none;
          border-color: #00d4ff;
        }

        .ai-chat-send {
          background: linear-gradient(135deg, #00d4ff, #0099ff);
          border: none;
          border-radius: 8px;
          width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
        }

        .ai-chat-send:hover {
          opacity: 0.9;
        }

        @media (max-width: 480px) {
          .ai-chat-panel {
            bottom: 90px;
            right: 10px;
            left: 10px;
            width: auto;
            height: calc(100vh - 160px);
          }

          .ai-chat-fab {
            bottom: 20px;
            right: 16px;
            width: 60px;
            height: 60px;
          }

          .ai-fab-agent-image {
            width: 75px;
            height: 95px;
          }
        }
      `}</style>
    </>
  )
}
