import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children, userId }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`/api/users/${userId}/favorites`)
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const addFavorite = async (coin) => {
    if (!userId) return false
    
    try {
      const response = await fetch(`/api/users/${userId}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: coin.id || coin.symbol.toLowerCase(),
          assetType: coin.assetType || 'crypto',
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setFavorites(prev => [...prev, data.favorite])
        return true
      }
    } catch (err) {
      console.error('Failed to add favorite:', err)
    }
    return false
  }

  const removeFavorite = async (favoriteId) => {
    if (!userId) return false
    
    try {
      const response = await fetch(`/api/users/${userId}/favorites/${favoriteId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setFavorites(prev => prev.filter(f => f.id !== favoriteId))
        return true
      }
    } catch (err) {
      console.error('Failed to remove favorite:', err)
    }
    return false
  }

  const isFavorite = (symbol) => {
    return favorites.some(f => f.symbol.toUpperCase() === symbol.toUpperCase())
  }

  const getFavoriteId = (symbol) => {
    const fav = favorites.find(f => f.symbol.toUpperCase() === symbol.toUpperCase())
    return fav?.id
  }

  const toggleFavorite = async (coin) => {
    const favId = getFavoriteId(coin.symbol)
    if (favId) {
      return await removeFavorite(favId)
    } else {
      return await addFavorite(coin)
    }
  }

  const updateFavoriteOrder = async (favoriteId, newOrder) => {
    if (!userId) return false
    
    try {
      const response = await fetch(`/api/users/${userId}/favorites/${favoriteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayOrder: newOrder })
      })
      
      if (response.ok) {
        await fetchFavorites()
        return true
      }
    } catch (err) {
      console.error('Failed to update favorite order:', err)
    }
    return false
  }

  const value = {
    favorites,
    loading,
    showFavoritesOnly,
    setShowFavoritesOnly,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteId,
    updateFavoriteOrder,
    refreshFavorites: fetchFavorites,
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

export default FavoritesContext
