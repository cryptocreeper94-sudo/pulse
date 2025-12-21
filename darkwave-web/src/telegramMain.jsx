import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TelegramApp from './TelegramApp.jsx'
import { WalletProvider } from './context/WalletContext'

if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name)
      console.log('[Telegram] Cleared cache:', name)
    })
  })
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister()
      console.log('[Telegram] Unregistered service worker')
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <TelegramApp />
    </WalletProvider>
  </StrictMode>,
)
