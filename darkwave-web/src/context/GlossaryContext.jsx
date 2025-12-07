import { createContext, useContext, useState, useCallback } from 'react'
import { getGlossaryTerm } from '../data/glossary'

const GlossaryContext = createContext(null)

export function GlossaryProvider({ children }) {
  const [activeTerm, setActiveTerm] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [sassMode, setSassMode] = useState(() => {
    return localStorage.getItem('pulse-sass-mode') !== 'false'
  })
  
  const showDefinition = useCallback((term, event) => {
    const termData = getGlossaryTerm(term)
    if (!termData) return
    
    let x = 0, y = 0
    if (event) {
      const rect = event.target.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.bottom + 8
      
      if (x > window.innerWidth - 180) x = window.innerWidth - 180
      if (x < 20) x = 20
      if (y > window.innerHeight - 200) y = rect.top - 8
    }
    
    setPosition({ x, y })
    setActiveTerm(termData)
  }, [])
  
  const hideDefinition = useCallback(() => {
    setActiveTerm(null)
  }, [])
  
  const toggleSassMode = useCallback(() => {
    setSassMode(prev => {
      const newValue = !prev
      localStorage.setItem('pulse-sass-mode', String(newValue))
      return newValue
    })
  }, [])
  
  return (
    <GlossaryContext.Provider value={{
      activeTerm,
      position,
      sassMode,
      showDefinition,
      hideDefinition,
      toggleSassMode
    }}>
      {children}
    </GlossaryContext.Provider>
  )
}

export function useGlossary() {
  const context = useContext(GlossaryContext)
  if (!context) {
    throw new Error('useGlossary must be used within a GlossaryProvider')
  }
  return context
}
