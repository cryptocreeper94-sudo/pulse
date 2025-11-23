import { useEffect } from 'react'

// Import all CSS
import '../public/styles.css'
import '../public/themes.css'

function App() {
  useEffect(() => {
    // Load all external JS utilities as global window objects
    const loadScripts = async () => {
      // Load chart indicator manager
      const chartIndicator = document.createElement('script')
      chartIndicator.src = '/chartIndicatorManager.js'
      document.head.appendChild(chartIndicator)

      // Load chart enhancer
      const chartEnhancer = document.createElement('script')
      chartEnhancer.src = '/chartEnhancer.js'
      document.head.appendChild(chartEnhancer)

      // Load theme system
      const themesConfig = document.createElement('script')
      themesConfig.src = '/themes-config.js'
      document.head.appendChild(themesConfig)

      const themeManager = document.createElement('script')
      themeManager.src = '/theme-manager.js'
      document.head.appendChild(themeManager)

      const themeSelector = document.createElement('script')
      themeSelector.src = '/theme-selector.js'
      document.head.appendChild(themeSelector)

      // Load agents system
      const agentsConfig = document.createElement('script')
      agentsConfig.src = '/agents-config.js'
      document.head.appendChild(agentsConfig)

      const agentSelector = document.createElement('script')
      agentSelector.src = '/agent-selector.js'
      document.head.appendChild(agentSelector)

      const agentCards = document.createElement('script')
      agentCards.src = '/agent-cards.js'
      document.head.appendChild(agentCards)

      // Banner scripts are already loaded in index.html - no need to load again
      
      // Load all other utility scripts
      const scripts = [
        '/analysisDataService.js',
        '/analysisIndicators.js',
        '/analysisModalController.js',
        '/chatIndicatorManager.js',
        '/chartManager.js',
        '/checkCookie.js',
        '/communityChat.js',
        '/cryptoCatSystem.js',
        '/dashboard.js',
        '/darkwaveGauges.js',
        '/email-service.js',
        '/fear-greed-gauge.js',
        '/fullscreenChartController.js',
        '/gauges-clean.js',
        '/guide.js',
        '/interactiveChartManager.js',
        '/landscapeChartController.js',
        '/lockscreen.js',
        '/missionTracker.js',
        '/notepad.js',
        '/personaManager.js',
        '/portfolioCalculator.js',
        '/pricingSystem.js',
        '/subscription-system.js',
        '/telegram-integration.js',
        '/theme-manager.js',
        '/upgrade.js',
        '/wallet.js'
      ]

      scripts.forEach(src => {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        document.head.appendChild(script)
      })
    }

    // Initialize Sentry
    if (window.Sentry) {
      window.Sentry.init({
        dsn: "https://af182e08e68116962092ad16eed5608c@o4510381737181184.ingest.us.sentry.io/4510381739540480",
        environment: window.location.hostname.includes('replit.dev') ? 'development' : 'production',
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      })
    }

    loadScripts()
  }, [])

  return (
    <>
      {/* Banner and banners are rendered directly in index.html - React only renders app-main */}
      <div id="app-main" />
    </>
  )
}

export default App
