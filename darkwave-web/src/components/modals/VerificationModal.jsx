import { QRCodeSVG } from 'qrcode.react'

export default function VerificationModal({ 
  isOpen, 
  onClose, 
  hallmarkId = '000000000-01',
  walletAddress = null 
}) {
  if (!isOpen) return null

  const solscanUrl = walletAddress 
    ? `https://solscan.io/account/${walletAddress}`
    : 'https://solscan.io'

  const handleQRClick = () => {
    window.open(solscanUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="verification-modal-overlay" onClick={onClose}>
      <div className="verification-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="verification-modal-close" onClick={onClose}>×</button>
        
        <div className="verification-modal-header">
          <div className="verification-solana-badge">
            <span className="verification-shield-large">🛡️</span>
          </div>
          <h2 className="verification-modal-title">Solana Verified</h2>
        </div>

        <div className="verification-hallmark-display">
          <span className="hallmark-label">Hallmark ID</span>
          <span className="hallmark-value">{hallmarkId}</span>
        </div>

        <div className="verification-qr-section" onClick={handleQRClick}>
          <div className="qr-wrapper">
            <QRCodeSVG
              value={solscanUrl}
              size={160}
              bgColor="#1a1a1a"
              fgColor="#14F195"
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="qr-hint">Tap to view on SolScan</p>
        </div>

        <div className="verification-info-section">
          <div className="info-item">
            <span className="info-icon">✓</span>
            <span className="info-text">Verified on Solana Blockchain</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🔐</span>
            <span className="info-text">Hallmark system protects your data with cryptographic signatures</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⛓️</span>
            <span className="info-text">All transactions are cryptographically stamped and immutable</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🌊</span>
            <span className="info-text">Part of the DarkWave ecosystem</span>
          </div>
        </div>

        <button className="verification-solscan-btn" onClick={handleQRClick}>
          View on SolScan
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>

      <style>{`
        .verification-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .verification-modal-container {
          width: 100%;
          max-width: 380px;
          max-height: 90vh;
          overflow-y: auto;
          background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
          border: 1px solid rgba(153, 69, 255, 0.3);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          box-shadow: 0 0 40px rgba(153, 69, 255, 0.2), 0 0 60px rgba(20, 241, 149, 0.1);
        }

        .verification-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .verification-modal-close:hover {
          background: rgba(255, 68, 68, 0.3);
          border-color: #ff4444;
          color: #ff4444;
        }

        .verification-modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .verification-solana-badge {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #9945FF, #14F195);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 0 20px rgba(153, 69, 255, 0.4);
        }

        .verification-shield-large {
          font-size: 28px;
        }

        .verification-modal-title {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #9945FF, #14F195);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .verification-hallmark-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(153, 69, 255, 0.3);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .hallmark-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .hallmark-value {
          font-size: 22px;
          font-weight: 800;
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          background: linear-gradient(135deg, #9945FF, #14F195);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 2px;
        }

        .verification-qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
          cursor: pointer;
        }

        .qr-wrapper {
          background: #1a1a1a;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(20, 241, 149, 0.3);
          transition: all 0.3s ease;
        }

        .qr-wrapper:hover {
          border-color: #14F195;
          box-shadow: 0 0 20px rgba(20, 241, 149, 0.3);
        }

        .qr-hint {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 8px;
        }

        .verification-info-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .info-icon {
          flex-shrink: 0;
          width: 20px;
          text-align: center;
        }

        .info-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.4;
        }

        .verification-solscan-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #9945FF, #14F195);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .verification-solscan-btn:hover {
          box-shadow: 0 0 20px rgba(153, 69, 255, 0.5), 0 0 30px rgba(20, 241, 149, 0.3);
          transform: translateY(-2px);
        }

        .verification-solscan-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .verification-modal-overlay {
            padding: 10px;
          }

          .verification-modal-container {
            padding: 16px;
            max-height: 85vh;
          }

          .verification-modal-title {
            font-size: 18px;
          }

          .hallmark-value {
            font-size: 16px;
            letter-spacing: 1px;
          }

          .qr-wrapper {
            padding: 12px;
          }

          .info-text {
            font-size: 11px;
          }

          .verification-solana-badge {
            width: 50px;
            height: 50px;
          }

          .verification-shield-large {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  )
}
