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
    
    handleRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        console.log('[Auth] User from redirect:', redirectUser.email)
      }
    })

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

    return () => unsubscribe()
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
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
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
