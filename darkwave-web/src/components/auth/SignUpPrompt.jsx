import { useAuth } from '../../context/AuthContext'

export default function SignUpPrompt() {
  const { showSignUpPrompt, signUpPromptFeature, dismissSignUpPrompt, loginWithGoogle, loginWithGithub, loading, error } = useAuth()

  if (!showSignUpPrompt) return null

  return (
    <div className="signup-prompt-overlay" onClick={dismissSignUpPrompt}>
      <div className="signup-prompt-modal" onClick={e => e.stopPropagation()}>
        <button className="signup-prompt-close" onClick={dismissSignUpPrompt}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="signup-prompt-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M12 16V12M12 8H12.01" />
          </svg>
        </div>

        <h2 className="signup-prompt-title">Sign Up to Continue</h2>
        <p className="signup-prompt-description">
          Create a free account to access <strong>{signUpPromptFeature}</strong> and unlock the full Pulse experience.
        </p>

        <div className="signup-prompt-benefits">
          <div className="signup-benefit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            <span>AI-powered trading signals</span>
          </div>
          <div className="signup-benefit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            <span>Personal portfolio tracking</span>
          </div>
          <div className="signup-benefit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            <span>Price alerts & notifications</span>
          </div>
          <div className="signup-benefit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            <span>Multi-chain wallet management</span>
          </div>
        </div>

        <button 
          className="signup-google-btn"
          onClick={loginWithGoogle}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <button 
          className="signup-github-btn"
          onClick={loginWithGithub}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with GitHub'}
        </button>

        {error && (
          <div className="signup-prompt-error">{error}</div>
        )}

        <p className="signup-prompt-free">100% free to create an account</p>

        <div className="signup-prompt-footer">
          By signing in, you agree to our <a href="/terms" style={{ color: '#00D4FF', textDecoration: 'none' }}>Terms of Service</a> and <a href="/privacy" style={{ color: '#00D4FF', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
      </div>

      <style>{`
        .signup-prompt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .signup-prompt-modal {
          width: 100%;
          max-width: 400px;
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 36px 32px;
          text-align: center;
          position: relative;
          animation: slideUp 0.3s ease;
        }

        .signup-prompt-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }

        .signup-prompt-close:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .signup-prompt-icon {
          margin-bottom: 16px;
        }

        .signup-prompt-title {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .signup-prompt-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .signup-prompt-description strong {
          color: #00D4FF;
        }

        .signup-prompt-benefits {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
          text-align: left;
        }

        .signup-benefit {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .signup-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 20px;
          background: #fff;
          border: none;
          border-radius: 10px;
          color: #333;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .signup-google-btn:hover:not(:disabled) {
          background: #f0f0f0;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.15);
        }

        .signup-google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .signup-github-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 20px;
          background: #24292e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }

        .signup-github-btn:hover:not(:disabled) {
          background: #2f363d;
          transform: translateY(-1px);
        }

        .signup-github-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .signup-prompt-error {
          margin-top: 12px;
          padding: 10px;
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: 8px;
          color: #ff6b6b;
          font-size: 13px;
        }

        .signup-prompt-free {
          margin: 16px 0 0 0;
          font-size: 12px;
          color: rgba(0, 212, 255, 0.7);
          font-weight: 500;
        }

        .signup-prompt-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          color: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 480px) {
          .signup-prompt-modal {
            padding: 28px 20px;
            border-radius: 16px;
          }

          .signup-prompt-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  )
}
