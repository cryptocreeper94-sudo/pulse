import { useState } from 'react'
import './DisclaimerBanner.css'

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false)
  
  if (dismissed) return null
  
  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-banner-content">
        <span className="disclaimer-banner-icon">⚠️</span>
        <span className="disclaimer-banner-text">
          <strong>Risk Warning:</strong> This is not financial advice. Cryptocurrency trading involves substantial risk. 
          Only invest what you can afford to lose. Past performance does not guarantee future results. 
          <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('openDisclaimer')); }}>
            Read full disclaimer
          </a>
        </span>
        <button 
          className="disclaimer-banner-close" 
          onClick={() => setDismissed(true)}
          aria-label="Dismiss warning"
        >
          ×
        </button>
      </div>
    </div>
  )
}
