// Telegram Mini-App Shell Controller
(function() {
  'use strict';

  const TelegramShell = {
    tg: null,
    user: null,
    isReady: false,

    // Initialize Telegram Mini-App
    async init() {
      console.log('🤖 [Telegram Shell] Initializing mini-app');

      // Verify we're in Telegram
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.error('❌ [Telegram Shell] Not running in Telegram environment');
        this.showError('This app must be opened from Telegram');
        return;
      }

      this.tg = window.Telegram.WebApp;
      this.tg.ready();
      this.tg.expand();

      // Get user data
      const initDataUnsafe = this.tg.initDataUnsafe;
      this.user = initDataUnsafe.user;

      console.log('✅ [Telegram Shell] Initialized', {
        userId: this.user?.id,
        username: this.user?.username,
        platform: this.tg.platform,
        version: this.tg.version
      });

      // Configure Telegram UI
      this.configureUI();

      // Authenticate user
      await this.authenticate();

      // Load main app
      await this.loadApp();
    },

    // Configure Telegram-specific UI
    configureUI() {
      // Set header color to match app
      this.tg.setHeaderColor('#000000');
      
      // Set background color
      this.tg.setBackgroundColor('#000000');

      // Enable closing confirmation
      this.tg.enableClosingConfirmation();

      // Configure back button (hide by default, show when in modals)
      this.tg.BackButton.hide();

      console.log('✅ [Telegram Shell] UI configured');
    },

    // Authenticate with backend
    async authenticate() {
      try {
        console.log('🔐 [Telegram Shell] Authenticating user...');

        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            initData: this.tg.initData
          })
        });

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ [Telegram Shell] Authenticated', {
          userId: data.user?.id,
          email: data.user?.email,
          tier: data.subscription?.tier
        });

        // Store user data globally
        window.TELEGRAM_USER = data.user;
        window.TELEGRAM_SUBSCRIPTION = data.subscription;

        return data;
      } catch (error) {
        console.error('❌ [Telegram Shell] Auth failed:', error);
        this.showError('Authentication failed. Please try again.');
        throw error;
      }
    },

    // Load main DarkWave Pulse app
    async loadApp() {
      try {
        console.log('📦 [Telegram Shell] Loading main app...');

        // Fetch the main app HTML
        const response = await fetch('/app');
        if (!response.ok) {
          throw new Error('Failed to load app');
        }

        const html = await response.text();

        // Parse and inject into telegram-app container
        const appContainer = document.getElementById('telegram-app');
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract body content
        const appContent = doc.querySelector('body').innerHTML;
        appContainer.innerHTML = appContent;

        // Execute scripts
        const scripts = doc.querySelectorAll('script');
        for (const script of scripts) {
          if (script.src) {
            await this.loadScript(script.src);
          } else if (script.textContent) {
            eval(script.textContent);
          }
        }

        // Load stylesheets
        const styles = doc.querySelectorAll('link[rel="stylesheet"]');
        for (const style of styles) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = style.href;
          document.head.appendChild(link);
        }

        // Mark as Telegram environment globally
        window.IS_TELEGRAM = true;

        // Hide loading, show app
        document.getElementById('loadingScreen').style.display = 'none';
        appContainer.style.display = 'block';

        // Configure Telegram-specific behaviors
        this.configureTelegramBehaviors();

        console.log('✅ [Telegram Shell] App loaded successfully');
        this.isReady = true;

      } catch (error) {
        console.error('❌ [Telegram Shell] Failed to load app:', error);
        this.showError('Failed to load app. Please try again.');
      }
    },

    // Load external script
    loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    // Configure Telegram-specific app behaviors
    configureTelegramBehaviors() {
      // Hide desktop-only elements
      const hideElements = [
        '.app-banner', // Hide top banner in Telegram
        '#softLaunchBanner', // Hide beta banner
        '#founderProgramBanner' // Hide founder banner
      ];

      hideElements.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.classList.add('telegram-hide');
      });

      // Map back button to close modals
      this.tg.BackButton.onClick(() => {
        // Check if modal is open
        const modal = document.querySelector('.modal-overlay[style*="display: flex"]');
        if (modal) {
          modal.style.display = 'none';
          this.tg.BackButton.hide();
        }
      });

      // Show back button when modals open
      const observer = new MutationObserver(() => {
        const modal = document.querySelector('.modal-overlay[style*="display: flex"]');
        if (modal) {
          this.tg.BackButton.show();
        } else {
          this.tg.BackButton.hide();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });

      // Haptic feedback on important actions
      document.addEventListener('click', (e) => {
        if (e.target.matches('button, .clickable')) {
          this.tg.HapticFeedback.impactOccurred('light');
        }
      });

      console.log('✅ [Telegram Shell] Telegram behaviors configured');
    },

    // Show error message
    showError(message) {
      const loadingScreen = document.getElementById('loadingScreen');
      loadingScreen.innerHTML = `
        <img src="/darkwave-coin.png" alt="DarkWave Pulse" class="loading-logo" style="opacity:0.5">
        <div style="color: #ff4444; font-size: 16px; margin-bottom: 12px;">Error</div>
        <div style="color: rgba(255,255,255,0.6); font-size: 14px; max-width: 280px; text-align: center;">${message}</div>
        <button onclick="location.reload()" style="margin-top: 24px; padding: 12px 24px; background: #8B1538; border: none; border-radius: 8px; color: white; font-size: 14px; cursor: pointer;">
          Retry
        </button>
      `;
    }
  };

  // Auto-initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TelegramShell.init());
  } else {
    TelegramShell.init();
  }

  // Expose globally
  window.TelegramShell = TelegramShell;
})();
