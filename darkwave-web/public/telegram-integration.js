// Telegram Mini App Integration
// Handles Telegram-specific features: authentication, back button, main button, theme

const TelegramApp = (() => {
  let tg = null;
  let isTelegramEnv = false;

  return {
    init() {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          tg = window.Telegram.WebApp;
          isTelegramEnv = true;
          
          console.log('✅ [Telegram] Mini App environment detected');
          
          tg.ready();
          tg.expand();
          
          this.setupFullscreenMode();
          this.forceMaximizeViewport();
          this.setupBackButton();
          this.applyTelegramTheme();
          this.setupClosingConfirmation();
          
          console.log('✅ [Telegram] Integration initialized');
          console.log('  - User ID:', tg.initDataUnsafe?.user?.id || 'N/A');
          console.log('  - Username:', tg.initDataUnsafe?.user?.username || 'N/A');
          console.log('  - Theme:', tg.colorScheme);
        } else {
          console.log('ℹ️ [Telegram] Not running in Telegram Mini App');
        }
      } catch (error) {
        console.error('❌ [Telegram] Initialization error:', error);
      }
    },

    setupFullscreenMode() {
      if (!isTelegramEnv || !tg) return;

      try {
        if (typeof tg.requestFullscreen === 'function') {
          tg.requestFullscreen();
          console.log('🖥️ [Telegram] Fullscreen mode requested');
        }

        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
          console.log('🔒 [Telegram] Vertical swipes disabled');
        }

        if (typeof tg.onEvent === 'function') {
          tg.onEvent('fullscreenChanged', () => {
            console.log('🖥️ [Telegram] Fullscreen state:', tg.isFullscreen);
          });

          tg.onEvent('fullscreenFailed', (error) => {
            console.warn('⚠️ [Telegram] Fullscreen request failed:', error);
          });
        }
      } catch (error) {
        console.warn('⚠️ [Telegram] Fullscreen setup error (old version?):', error);
      }
    },

    forceMaximizeViewport() {
      if (!isTelegramEnv || !tg) return;

      try {
        const viewportHeight = tg.viewportHeight || tg.viewportStableHeight || window.innerHeight;
        
        document.documentElement.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${viewportHeight}px`);
        
        document.body.style.minHeight = `${viewportHeight}px`;
        document.body.style.maxHeight = `${viewportHeight}px`;
        document.body.style.height = `${viewportHeight}px`;
        document.body.style.overflow = 'hidden';
        
        const container = document.querySelector('.container') || document.getElementById('app');
        if (container) {
          container.style.minHeight = `${viewportHeight}px`;
          container.style.maxHeight = `${viewportHeight}px`;
          container.style.overflowY = 'auto';
        }
        
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }
        
        if (typeof tg.onEvent === 'function') {
          tg.onEvent('viewportChanged', (e) => {
            const newHeight = e.isStateStable ? tg.viewportStableHeight : tg.viewportHeight;
            document.body.style.height = `${newHeight}px`;
            if (container) {
              container.style.minHeight = `${newHeight}px`;
              container.style.maxHeight = `${newHeight}px`;
            }
            console.log('📐 [Telegram] Viewport height updated:', newHeight);
          });
        }
        
        console.log('📏 [Telegram] Viewport maximized to:', viewportHeight, 'px');
      } catch (error) {
        console.warn('⚠️ [Telegram] Viewport maximization error:', error);
      }
    },

    isTelegram() {
      return isTelegramEnv;
    },

    getTelegramUser() {
      if (!isTelegramEnv || !tg) return null;
      return tg.initDataUnsafe?.user || null;
    },

    getInitData() {
      if (!isTelegramEnv || !tg) return null;
      return tg.initData || null;
    },

    async authenticateWithTelegram() {
      if (!isTelegramEnv || !tg) {
        console.warn('⚠️ [Telegram] Not in Telegram environment');
        return { success: false, error: 'Not in Telegram' };
      }

      try {
        const initData = tg.initData;
        const user = tg.initDataUnsafe?.user;

        if (!initData || !user) {
          console.error('❌ [Telegram] Missing init data or user');
          return { success: false, error: 'Missing Telegram data' };
        }

        console.log('🔐 [Telegram] Authenticating user:', user.id);

        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ [Telegram] Authentication successful');
          return { success: true, user: data.user, sessionId: data.sessionId };
        } else {
          const error = await response.json();
          console.error('❌ [Telegram] Authentication failed:', error);
          return { success: false, error: error.message || 'Auth failed' };
        }
      } catch (error) {
        console.error('❌ [Telegram] Authentication error:', error);
        return { success: false, error: 'Network error' };
      }
    },

    setupBackButton() {
      if (!isTelegramEnv || !tg) return;

      tg.BackButton.onClick(() => {
        console.log('⬅️ [Telegram] Back button clicked');
        
        const modal = document.querySelector('[id$="Modal"][style*="display: flex"]');
        if (modal) {
          const closeBtn = modal.querySelector('.close-modal');
          if (closeBtn) {
            closeBtn.click();
            return;
          }
        }

        if (window.history.length > 1) {
          window.history.back();
        } else {
          tg.close();
        }
      });

      this.updateBackButton();
    },

    updateBackButton() {
      if (!isTelegramEnv || !tg) return;

      const hasOpenModal = document.querySelector('[id$="Modal"][style*="display: flex"]') !== null;
      
      if (hasOpenModal) {
        tg.BackButton.show();
      } else {
        tg.BackButton.hide();
      }
    },

    applyTelegramTheme() {
      if (!isTelegramEnv || !tg) return;

      const isDark = tg.colorScheme === 'dark';
      console.log('🎨 [Telegram] Applying theme:', isDark ? 'dark' : 'light');

      if (!isDark) {
        document.body.style.setProperty('--bg-color', tg.themeParams.bg_color || '#ffffff');
        document.body.style.setProperty('--text-color', tg.themeParams.text_color || '#000000');
      }

      tg.setHeaderColor(tg.themeParams.bg_color || '#000000');
      tg.setBackgroundColor(tg.themeParams.bg_color || '#000000');
    },

    setupClosingConfirmation() {
      if (!isTelegramEnv || !tg) return;

      tg.enableClosingConfirmation();
      console.log('✅ [Telegram] Closing confirmation enabled');
    },

    showMainButton(text, onClick) {
      if (!isTelegramEnv || !tg) return;

      tg.MainButton.setText(text);
      tg.MainButton.onClick(onClick);
      tg.MainButton.show();
    },

    hideMainButton() {
      if (!isTelegramEnv || !tg) return;
      tg.MainButton.hide();
    },

    sendData(data) {
      if (!isTelegramEnv || !tg) return;
      tg.sendData(JSON.stringify(data));
    },

    close() {
      if (!isTelegramEnv || !tg) return;
      tg.close();
    },

    openLink(url) {
      if (!isTelegramEnv || !tg) return;
      tg.openLink(url);
    },

    openTelegramLink(url) {
      if (!isTelegramEnv || !tg) return;
      tg.openTelegramLink(url);
    },

    showAlert(message) {
      if (!isTelegramEnv || !tg) return Promise.resolve();
      return new Promise((resolve) => {
        tg.showAlert(message, resolve);
      });
    },

    showConfirm(message) {
      if (!isTelegramEnv || !tg) return Promise.resolve(false);
      return new Promise((resolve) => {
        tg.showConfirm(message, resolve);
      });
    },

    hapticFeedback(type = 'impact', style = 'medium') {
      if (!isTelegramEnv || !tg || !tg.HapticFeedback) return;
      
      if (type === 'impact') {
        tg.HapticFeedback.impactOccurred(style);
      } else if (type === 'notification') {
        tg.HapticFeedback.notificationOccurred(style);
      } else if (type === 'selection') {
        tg.HapticFeedback.selectionChanged();
      }
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TelegramApp = TelegramApp;
  console.log('🤖 [Telegram] Integration module loaded');
}
