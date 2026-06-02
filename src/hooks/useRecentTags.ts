import { useState, useCallback } from 'react'

const STORAGE_KEY = 'r34-recent-tags'
const MAX_RECENT = 20

export interface RecentTag {
  tag: string
  lastUsed: number
}

export function useRecentTags() {
  const [recentTags, setRecentTags] = useState<RecentTag[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const addRecentTag = useCallback((tag: string) => {
    setRecentTags(prev => {
      const filtered = prev.filter(t => t.tag !== tag)
      const updated = [{ tag, lastUsed: Date.now() }, ...filtered].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearRecent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setRecentTags([])
  }, [])

  return { recentTags, addRecentTag, clearRecent }
}
