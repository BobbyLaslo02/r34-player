import { useState, useCallback } from 'react'
import { R34Post, LibraryEntry } from '../types'

const STORAGE_KEY = 'r34-library'

export function useLibrary() {
  const [entries, setEntries] = useState<LibraryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const addToLibrary = useCallback((post: R34Post) => {
    setEntries(prev => {
      if (prev.some(e => e.post.id === post.id)) return prev
      const updated = [...prev, { post, addedAt: Date.now() }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeFromLibrary = useCallback((postId: number) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.post.id !== postId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const isInLibrary = useCallback((postId: number) => {
    return entries.some(e => e.post.id === postId)
  }, [entries])

  const shuffle = useCallback(() => {
    const copy = [...entries]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy.map(e => e.post)
  }, [entries])

  return { entries, addToLibrary, removeFromLibrary, isInLibrary, shuffle }
}
