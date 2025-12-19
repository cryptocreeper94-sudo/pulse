import React from 'react'
import ReactDOM from 'react-dom/client'
import StrikeAgentApp from './StrikeAgentApp'
import './index.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-strikeagent.js')
      .then(registration => {
        console.log('[StrikeAgent] SW registered:', registration.scope)
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[StrikeAgent] New version available')
                if (confirm('A new version of StrikeAgent is available. Reload to update?')) {
                  newWorker.postMessage('skipWaiting')
                  window.location.reload()
                }
              }
            })
          }
        })
      })
      .catch(err => console.log('[StrikeAgent] SW registration failed:', err))
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StrikeAgentApp />
  </React.StrictMode>
)
