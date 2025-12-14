import { useState } from 'react'
import VerificationModal from '../modals/VerificationModal'

export default function VerificationBadge({ 
  hallmarkId = '000000000-01',
  walletAddress = null 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        className="verification-badge"
        onClick={() => setIsModalOpen(true)}
        title="Solana Verification Badge"
      >
        <span className="verification-shield">🛡️</span>
        <span className="verification-id">{hallmarkId}</span>
      </button>

      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hallmarkId={hallmarkId}
        walletAddress={walletAddress}
      />

      <style>{`
        .verification-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          height: 32px;
          background: linear-gradient(135deg, #9945FF, #14F195);
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .verification-badge:hover {
          box-shadow: 0 0 15px rgba(153, 69, 255, 0.5), 0 0 25px rgba(20, 241, 149, 0.3);
          transform: scale(1.05);
        }

        .verification-badge:active {
          transform: scale(0.98);
        }

        .verification-shield {
          font-size: 14px;
          line-height: 1;
        }

        .verification-id {
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 480px) {
          .verification-badge {
            padding: 5px 8px;
            height: 28px;
            gap: 0;
            border-radius: 50%;
            width: 28px;
            justify-content: center;
          }

          .verification-shield {
            font-size: 12px;
          }

          .verification-id {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
