import { useAuth } from '../../context/AuthContext'

export default function LoginScreen() {
  const { loginWithGoogle, loginWithGithub, loading, error } = useAuth()

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-logo">
          <span className="logo-pulse">PULSE</span>
          <span className="logo-subtitle">by DarkWave Studios</span>
        </div>

        <div className="login-content">
          <h1 className="login-title">Welcome to Pulse</h1>
          <p className="login-description">
            AI-powered trading signals and institutional-grade analysis for cryptocurrency
          </p>

          <button 
            className="google-signin-btn"
            onClick={loginWithGoogle}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <button 
            className="github-signin-btn"
            onClick={loginWithGithub}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with GitHub'}
          </button>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-features">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>StrikeAgent AI Trading Bot</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Real-time Market Analysis</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <span>Blockchain-verified Predictions</span>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>

      <style>{`
        .login-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f0f 100%);
          padding: 20px;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
          background: rgba(20, 20, 20, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
        }

        .login-logo {
          margin-bottom: 32px;
        }

        .logo-pulse {
          display: block;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 8px;
          background: linear-gradient(135deg, #00D4FF, #00A0CC);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-subtitle {
          display: block;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 4px;
          letter-spacing: 2px;
        }

        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 12px 0;
        }

        .login-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 32px 0;
          line-height: 1.5;
        }

        .google-signin-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 24px;
          background: #fff;
          border: none;
          border-radius: 12px;
          color: #333;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .google-signin-btn:hover:not(:disabled) {
          background: #f5f5f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
        }

        .google-signin-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .github-signin-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 24px;
          background: #24292e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 12px;
        }

        .github-signin-btn:hover:not(:disabled) {
          background: #2f363d;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .github-signin-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-error {
          margin-top: 16px;
          padding: 12px;
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: 8px;
          color: #ff6b6b;
          font-size: 13px;
        }

        .login-features {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .feature-icon {
          font-size: 20px;
          min-width: 28px;
          text-align: center;
        }

        .login-footer {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .login-footer p {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
        }

        @media (max-width: 768px) {
          .login-screen {
            padding: 16px;
          }

          .login-container {
            max-width: 100%;
            padding: 32px 24px;
            border-radius: 20px;
          }

          .logo-pulse {
            font-size: 32px;
            letter-spacing: 6px;
          }

          .login-title {
            font-size: 22px;
          }

          .login-description {
            font-size: 15px;
          }

          .google-signin-btn,
          .github-signin-btn {
            padding: 16px 24px;
            font-size: 17px;
          }

          .feature-item {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .login-screen {
            padding: 12px;
          }

          .login-container {
            padding: 28px 20px;
            border-radius: 16px;
          }

          .login-logo {
            margin-bottom: 24px;
          }

          .logo-pulse {
            font-size: 28px;
            letter-spacing: 5px;
          }

          .login-title {
            font-size: 20px;
          }

          .login-description {
            font-size: 14px;
            margin-bottom: 24px;
          }

          .google-signin-btn,
          .github-signin-btn {
            padding: 14px 20px;
            font-size: 16px;
            border-radius: 10px;
          }

          .login-features {
            margin-top: 32px;
            gap: 12px;
          }

          .feature-item {
            font-size: 14px;
          }

          .login-footer {
            margin-top: 24px;
            padding-top: 16px;
          }
        }

        @media (max-width: 360px) {
          .login-container {
            padding: 24px 16px;
          }

          .logo-pulse {
            font-size: 24px;
            letter-spacing: 4px;
          }

          .login-title {
            font-size: 18px;
          }

          .google-signin-btn,
          .github-signin-btn {
            padding: 12px 16px;
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  )
}
