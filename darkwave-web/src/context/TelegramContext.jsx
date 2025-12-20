import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const TelegramContext = createContext({
  isTelegram: false,
  telegramUser: null,
  isReady: false,
  webApp: null,
  platform: null,
  themeParams: null,
  colorScheme: 'dark'
})

export function TelegramProvider({ children }) {
  const [isReady, setIsReady] = useState(false)
  const [telegramUser, setTelegramUser] = useState(null)
  const [themeParams, setThemeParams] = useState(null)
  const [platform, setPlatform] = useState(null)
  const [colorScheme, setColorScheme] = useState('dark')

  const webApp = useMemo(() => {
    if (typeof window === 'undefined') return null
    return window.Telegram?.WebApp || null
  }, [])

  const isTelegram = useMemo(() => {
    if (typeof window === 'undefined') return false
    
    const urlParams = new URLSearchParams(window.location.search)
    const testMode = urlParams.get('tg') === '1'
    
    if (testMode) return true
    
    return !!(window.Telegram?.WebApp?.initData)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const testMode = urlParams.get('tg') === '1'
    
    // Add telegram-mode class for high-contrast styling
    if (testMode || webApp?.initData) {
      document.body.classList.add('telegram-mode')
    }

    if (testMode && !webApp) {
      setTelegramUser({
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'en',
        is_premium: false
      })
      setPlatform('web')
      setThemeParams({
        bg_color: '#1a1a2e',
        text_color: '#ffffff',
        hint_color: '#aaaaaa',
        link_color: '#00d4ff',
        button_color: '#00d4ff',
        button_text_color: '#ffffff'
      })
      setColorScheme('dark')
      setIsReady(true)
      return
    }

    if (!webApp) {
      setIsReady(true)
      return
    }

    try {
      webApp.ready()
      webApp.expand()

      const initDataUnsafe = webApp.initDataUnsafe
      if (initDataUnsafe?.user) {
        setTelegramUser({
          id: initDataUnsafe.user.id,
          first_name: initDataUnsafe.user.first_name || '',
          last_name: initDataUnsafe.user.last_name || '',
          username: initDataUnsafe.user.username || '',
          language_code: initDataUnsafe.user.language_code || 'en',
          is_premium: initDataUnsafe.user.is_premium || false,
          photo_url: initDataUnsafe.user.photo_url || null
        })
      }

      const detectedPlatform = webApp.platform || 'unknown'
      setPlatform(detectedPlatform)

      if (webApp.themeParams) {
        setThemeParams(webApp.themeParams)
      }

      setColorScheme(webApp.colorScheme || 'dark')

      webApp.onEvent?.('themeChanged', () => {
        if (webApp.themeParams) {
          setThemeParams({ ...webApp.themeParams })
        }
        setColorScheme(webApp.colorScheme || 'dark')
      })

      setIsReady(true)
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error)
      setIsReady(true)
    }
  }, [webApp])

  const value = useMemo(() => ({
    isTelegram,
    telegramUser,
    isReady,
    webApp,
    platform,
    themeParams,
    colorScheme
  }), [isTelegram, telegramUser, isReady, webApp, platform, themeParams, colorScheme])

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider')
  }
  return context
}

export default TelegramContext
