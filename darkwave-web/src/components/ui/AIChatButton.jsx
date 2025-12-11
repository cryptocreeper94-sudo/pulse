import React, { useState } from 'react'
import AgentSelector from '../AgentSelector'

export default function AIChatButton({ isSubscribed = false }) {
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const handleClick = () => {
    setShowChat(!showChat)
  }

  return (
    <>
      <button
        className="ai-chat-fab"
        onClick={handleClick}
        title="Chat with AI Agent"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
          <path d="M12 6C9.79 6 8 7.79 8 10C8 11.48 8.81 12.75 10 13.45V14C10 14.55 10.45 15 11 15H13C13.55 15 14 14.55 14 14V13.45C15.19 12.75 16 11.48 16 10C16 7.79 14.21 6 12 6Z" fill="currentColor"/>
          <circle cx="12" cy="17.5" r="1.5" fill="currentColor"/>
        </svg>
        <span className="ai-chat-fab-pulse"></span>
      </button>

      {showChat && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <div className="ai-chat-avatar-placeholder">AI</div>
              <span>DarkWave AI</span>
            </div>
            <button className="ai-chat-close" onClick={() => setShowChat(false)}>×</button>
          </div>
          <div className="ai-chat-body">
            <div className="ai-chat-welcome">
              <div className="ai-chat-icon-large">🤖</div>
              <h3>DarkWave AI Agent</h3>
              <p>Your personal trading assistant powered by advanced AI</p>
              <div className="ai-chat-features">
                <div className="ai-feature-item">📊 Market Analysis</div>
                <div className="ai-feature-item">🎯 Trade Signals</div>
                <div className="ai-feature-item">💡 Strategy Tips</div>
              </div>
              <button 
                className="ai-chat-select-agent"
                onClick={() => setShowAgentSelector(true)}
              >
                Select Your Agent
              </button>
              <p className="ai-chat-coming-soon">Voice Control Coming Soon</p>
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
          bottom: 80px;
          right: 20px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00d4ff, #0099ff);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
          z-index: 1000;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .ai-chat-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(0, 212, 255, 0.6);
        }

        .ai-chat-fab-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(0, 212, 255, 0.4);
          animation: pulse 2s infinite;
          pointer-events: none;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .ai-chat-panel {
          position: fixed;
          bottom: 150px;
          right: 20px;
          width: 360px;
          max-width: calc(100vw - 40px);
          height: 500px;
          max-height: calc(100vh - 200px);
          background: #1a1a1a;
          border-radius: 16px;
          border: 1px solid #333;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
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

        .ai-chat-avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00d4ff, #0099ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
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

        .ai-chat-icon-large {
          font-size: 48px;
          margin-bottom: 16px;
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
          margin-bottom: 12px;
        }

        .ai-chat-select-agent:hover {
          opacity: 0.9;
        }

        .ai-chat-coming-soon {
          font-size: 12px;
          color: #666;
          font-style: italic;
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
            bottom: 80px;
            right: 10px;
            left: 10px;
            width: auto;
            height: calc(100vh - 160px);
          }

          .ai-chat-fab {
            bottom: 20px;
            right: 16px;
          }
        }
      `}</style>
    </>
  )
}
