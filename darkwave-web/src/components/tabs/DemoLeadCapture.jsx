import { useState } from 'react'
import './SniperBotTab.css'

const API_BASE = ''

export default function DemoLeadCapture({ onClose, onSuccess }) {
  const [email, setEmail] = useState('')
  const [telegram, setTelegram] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email && !telegram) {
      setError('Please enter your email or Telegram username')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/api/demo/capture-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, telegram })
      })
      const data = await res.json()
      
      if (data.success) {
        setSuccess(true)
        sessionStorage.setItem('dwp_lead_captured', 'true')
        if (onSuccess) onSuccess()
        setTimeout(() => {
          if (onClose) onClose()
        }, 2000)
      } else {
        setError(data.error || 'Failed to submit. Please try again.')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="demo-lead-capture">
        <div className="lead-success">
          <div className="lead-success-icon">✅</div>
          <h3>You're on the list!</h3>
          <p>We'll notify you when StrikeAgent goes live.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="demo-lead-capture">
      <div className="lead-header">
        <h3 className="lead-title">🚀 Get Early Access</h3>
        <p className="lead-subtitle">Be first to know when StrikeAgent launches with live trading</p>
        {onClose && (
          <button className="lead-close" onClick={onClose}>×</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="lead-form">
        <div className="lead-input-group">
          <label className="lead-label">Email</label>
          <input
            type="email"
            className="lead-input"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="lead-divider">
          <span>or</span>
        </div>

        <div className="lead-input-group">
          <label className="lead-label">Telegram Username</label>
          <input
            type="text"
            className="lead-input"
            placeholder="@yourusername"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
        </div>

        {error && <div className="lead-error">{error}</div>}

        <button 
          type="submit" 
          className="lead-submit-btn"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Notify Me'}
        </button>

        <p className="lead-privacy">
          We'll only use this to notify you about launch. No spam.
        </p>
      </form>
    </div>
  )
}
