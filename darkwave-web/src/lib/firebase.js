import { initializeApp } from 'firebase/app'
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

let app = null
let analytics = null

export function initFirebase() {
  if (typeof window === 'undefined') return null
  
  if (!app) {
    try {
      app = initializeApp(firebaseConfig)
      analytics = getAnalytics(app)
      console.log('[Firebase] Analytics initialized')
    } catch (error) {
      console.error('[Firebase] Initialization error:', error)
    }
  }
  
  return { app, analytics }
}

export function trackEvent(eventName, params = {}) {
  if (!analytics) {
    initFirebase()
  }
  
  if (analytics) {
    try {
      logEvent(analytics, eventName, params)
    } catch (error) {
      console.error('[Firebase] Event tracking error:', error)
    }
  }
}

export function trackPageView(pageName) {
  trackEvent('page_view', { page_title: pageName })
}

export function setAnalyticsUserId(userId) {
  if (!analytics) {
    initFirebase()
  }
  
  if (analytics && userId) {
    try {
      setUserId(analytics, userId)
    } catch (error) {
      console.error('[Firebase] Set user ID error:', error)
    }
  }
}

export function setAnalyticsUserProperties(properties) {
  if (!analytics) {
    initFirebase()
  }
  
  if (analytics && properties) {
    try {
      setUserProperties(analytics, properties)
    } catch (error) {
      console.error('[Firebase] Set user properties error:', error)
    }
  }
}

export { app, analytics }
