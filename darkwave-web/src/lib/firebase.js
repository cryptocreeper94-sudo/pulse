import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

let app = null
let auth = null

export function initFirebase() {
  if (typeof window === 'undefined') return null
  
  if (!app) {
    try {
      app = initializeApp(firebaseConfig)
      auth = getAuth(app)
      console.log('[Firebase] Initialized with Auth')
    } catch (error) {
      console.error('[Firebase] Initialization error:', error)
    }
  }
  
  return { app, auth }
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
  
  // Set persistence to local (survives browser restarts)
  try {
    await setPersistence(auth, browserLocalPersistence)
  } catch (e) {
    console.warn('[Firebase] Could not set persistence:', e)
  }
  
  // Check if mobile - use redirect for mobile (popups don't work well on mobile Safari)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  
  if (isMobile) {
    console.log('[Firebase] Using redirect flow for mobile...')
    await signInWithRedirect(auth, provider)
    return null // Page will redirect
  }
  
  // Desktop: use popup
  try {
    console.log('[Firebase] Starting Google popup sign-in...')
    const result = await signInWithPopup(auth, provider)
    console.log('[Firebase] Google sign-in successful:', result.user.email)
    return result.user
  } catch (error) {
    console.error('[Firebase] Google sign-in error:', error.code, error.message)
    
    if (error.code === 'auth/popup-blocked') {
      // Try redirect as fallback
      console.log('[Firebase] Popup blocked, trying redirect...')
      await signInWithRedirect(auth, provider)
      return null
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

// Handle redirect result on page load
export async function handleRedirectResult() {
  const auth = getFirebaseAuth()
  if (!auth) return null
  
  try {
    console.log('[Firebase] Checking for redirect result...')
    const result = await getRedirectResult(auth)
    if (result && result.user) {
      console.log('[Firebase] Redirect sign-in successful:', result.user.email)
      return result.user
    }
    console.log('[Firebase] No redirect result')
    return null
  } catch (error) {
    console.error('[Firebase] Redirect result error:', error.code, error.message)
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
  // Analytics disabled - no-op
}

export function trackPageView(pageName) {
  // Analytics disabled - no-op
}

export function setAnalyticsUserId(userId) {
  // Analytics disabled - no-op
}

export function setAnalyticsUserProperties(properties) {
  // Analytics disabled - no-op
}

export { app, auth }
