import { createContext, useContext, useState, useEffect } from 'react'
import { 
  initFirebase, 
  onAuthChange, 
  signInWithGoogle,
  signInWithGithub,
  signOut, 
  getIdToken,
  handleRedirectResult,
  setAnalyticsUserId
} from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userConfig, setUserConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initFirebase()
    
    // Handle redirect result from OAuth (runs on page load after Google redirect)
    console.log('[Auth] Initializing, checking for redirect result...')
    handleRedirectResult()
      .then((redirectUser) => {
        if (redirectUser) {
          console.log('[Auth] User from redirect:', redirectUser.email)
          // The onAuthChange callback will handle setting the user state
        } else {
          console.log('[Auth] No redirect user found')
        }
      })
      .catch((err) => {
        console.error('[Auth] Redirect error:', err.message, err)
        setError(err.message || 'Authentication failed. Please try again.')
        setLoading(false)
      })

    // Safety timeout - if loading takes more than 10 seconds, something is wrong
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Loading timeout - resetting state')
        setLoading(false)
      }
    }, 10000)

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        console.log('[Auth] User signed in:', firebaseUser.email)
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        })
        
        setAnalyticsUserId(firebaseUser.uid)
        
        try {
          const token = await getIdToken()
          if (token) {
            localStorage.setItem('firebaseToken', token)
            await syncUserWithBackend(firebaseUser, token)
          }
        } catch (err) {
          console.error('[Auth] Token sync error:', err)
        }
      } else {
        console.log('[Auth] User signed out')
        setUser(null)
        setUserConfig(null)
        localStorage.removeItem('firebaseToken')
      }
      setLoading(false)
    })

    return () => {
      unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  async function syncUserWithBackend(firebaseUser, token) {
    try {
      const response = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserConfig(data.userConfig || {})
        console.log('[Auth] Backend sync successful')
      } else {
        console.error('[Auth] Backend sync failed:', response.status)
      }
    } catch (err) {
      console.error('[Auth] Backend sync error:', err)
    }
  }

  async function loginWithGoogle() {
    setError(null)
    setLoading(true)
    console.log('[Auth] Starting Google login...')
    try {
      const result = await signInWithGoogle()
      console.log('[Auth] signInWithGoogle returned:', result ? 'user object' : 'null (redirect)')
      
      if (!result) {
        // Redirect flow - page will reload, keep loading true
        console.log('[Auth] Google redirect initiated, page will reload...')
      } else {
        // Popup succeeded - onAuthChange will fire and handle the user
        console.log('[Auth] Google popup sign-in completed for:', result.email)
        // Note: Don't setLoading(false) here - onAuthChange will do it after syncing
      }
    } catch (err) {
      console.error('[Auth] Google sign-in error:', err.code, err.message, err)
      setError(err.message || 'Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  async function loginWithGithub() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGithub()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  async function logout() {
    try {
      await signOut()
      setUser(null)
      setUserConfig(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function refreshToken() {
    const token = await getIdToken()
    if (token) {
      localStorage.setItem('firebaseToken', token)
    }
    return token
  }

  const value = {
    user,
    userConfig,
    setUserConfig,
    loading,
    error,
    loginWithGoogle,
    loginWithGithub,
    logout,
    refreshToken,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
