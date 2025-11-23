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

      // Load banner system synchronously (must load in order)
      const bannerChart = document.createElement('script')
      bannerChart.src = '/banner-chart.js'
      bannerChart.async = false
      document.head.appendChild(bannerChart)

      const bannerInit = document.createElement('script')
      bannerInit.src = '/banner.js'
      bannerInit.async = false
      document.head.appendChild(bannerInit)

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
    <div id="app">
      {/* Banner Section - KEEP EXACT SAME */}
      <div className="app-banner">
        <div className="banner-wave"></div>
        <div className="banner-text">
          <h1 className="banner-title">DarkWave Pulse <span style={{fontSize: '12px', opacity: 0.7, fontWeight: 400, letterSpacing: '1px'}}>BETA V1</span></h1>
          <p className="banner-subtitle">Systematic Signal Detection in Dynamic Market Waves</p>
        </div>
      </div>

      {/* Banners */}
      <div id="softLaunchBanner" style={{background: 'rgba(245, 158, 11, 0.15)', padding: '6px 35px 6px 12px', textAlign: 'center', borderBottom: '1px solid rgba(245,158,11,0.2)', position: 'relative'}}>
        <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 500}}>
          🧪 <strong style={{fontWeight: 700}}>BETA V1</strong> - V2 launches Dec 25
          <button onClick={(e) => e.target.parentElement.parentElement.style.display='none'} style={{position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '16px', cursor: 'pointer', width: '20px', height: '20px', borderRadius: '50%', lineHeight: 1, padding: 0}}>×</button>
        </div>
      </div>

      {/* This is a minimal container - the rest of the HTML will be loaded by the JS utilities */}
      <div id="app-main" />
    </div>
  )
}

export default App
