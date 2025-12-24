import { initializeApp } from 'firebase/app'
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics'
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'

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
let auth = null

export function initFirebase() {
  if (typeof window === 'undefined') return null
  
  if (!app) {
    try {
      app = initializeApp(firebaseConfig)
      auth = getAuth(app)
      console.log('[Firebase] Initialized with Auth')
      
      // Analytics is optional - don't let it block auth
      try {
        analytics = getAnalytics(app)
      } catch (analyticsError) {
        // Analytics may fail on unauthorized domains - that's OK
        console.log('[Firebase] Analytics not available (domain not authorized)')
      }
    } catch (error) {
      console.error('[Firebase] Initialization error:', error)
    }
  }
  
  return { app, analytics, auth }
}

export function getFirebaseAuth() {
  if (!auth) {
    initFirebase()
  }
  return auth
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not initialized')
  
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  
  // IMPORTANT: Always use popup flow - redirect doesn't work in:
  // - Iframes (like Replit preview)
  // - Storage-partitioned browsers (Safari ITP, Chrome with 3rd party cookie blocking)
  // - Mobile browsers with strict privacy settings
  
  try {
    console.log('[Firebase] Starting Google popup sign-in...')
    const result = await signInWithPopup(auth, provider)
    console.log('[Firebase] Google sign-in successful:', result.user.email)
    return result.user
  } catch (error) {
    console.error('[Firebase] Google sign-in error:', error.code, error.message)
    
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site and try again.')
    }
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.')
    }
    
    if (error.code === 'auth/cancelled-popup-request') {
      // User clicked button multiple times - ignore
      return null
    }
    
    throw error
  }
}

export async function signInWithGithub() {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not initialized')
  
  const provider = new GithubAuthProvider()
  provider.addScope('user:email')
  
  try {
    console.log('[Firebase] Starting GitHub popup sign-in...')
    const result = await signInWithPopup(auth, provider)
    console.log('[Firebase] GitHub sign-in successful:', result.user.email)
    return result.user
  } catch (error) {
    console.error('[Firebase] GitHub sign-in error:', error.code, error.message)
    
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site and try again.')
    }
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.')
    }
    
    if (error.code === 'auth/cancelled-popup-request') {
      return null
    }
    
    throw error
  }
}

export async function signOut() {
  const auth = getFirebaseAuth()
  if (!auth) return
  
  try {
    await firebaseSignOut(auth)
    localStorage.removeItem('dwp_user')
    localStorage.removeItem('sessionToken')
    console.log('[Firebase] Signed out')
  } catch (error) {
    console.error('[Firebase] Sign out error:', error)
    throw error
  }
}

export function onAuthChange(callback) {
  const auth = getFirebaseAuth()
  if (!auth) return () => {}
  
  return onAuthStateChanged(auth, callback)
}

export async function getIdToken() {
  const auth = getFirebaseAuth()
  if (!auth || !auth.currentUser) return null
  
  try {
    return await auth.currentUser.getIdToken()
  } catch (error) {
    console.error('[Firebase] Get ID token error:', error)
    return null
  }
}

export function getCurrentUser() {
  const auth = getFirebaseAuth()
  return auth?.currentUser || null
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

export { app, analytics, auth }
