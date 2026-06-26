import { useState, useCallback, useEffect } from 'react'
import { Favorite } from '../types'

const STORAGE_KEY = 'r34-favorites'
const VIDEOS_KEY = 'r34-video-only'

function loadFavorites(): Favorite[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(loadFavorites)

  useEffect(() => {
    const handler = () => setFavorites(loadFavorites())
    window.addEventListener('r34-storage-changed', handler)
    return () => window.removeEventListener('r34-storage-changed', handler)
  }, [])

  const toggleFavorite = useCallback((fav: Favorite) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === fav.id)
      const updated = exists
        ? prev.filter(f => f.id !== fav.id)
        : [...prev, fav]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const isFavorite = useCallback((id: string) => {
    return favorites.some(f => f.id === id)
  }, [favorites])

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { favorites, toggleFavorite, isFavorite, removeFavorite }
}

export function useVideoOnly(): [boolean, (v: boolean) => void] {
  const [videoOnly, setVideoOnly] = useState<boolean>(() => {
    try {
      return localStorage.getItem(VIDEOS_KEY) === 'true'
    } catch {
      return false
    }
  })

  const toggle = useCallback((v: boolean) => {
    setVideoOnly(v)
    localStorage.setItem(VIDEOS_KEY, v ? 'true' : 'false')
  }, [])

  return [videoOnly, toggle]
}
