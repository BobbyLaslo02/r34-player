import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'r34-recent-tags'
const MAX_RECENT = 20

export interface RecentTag {
  tag: string
  lastUsed: number
}

function loadTags(): RecentTag[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useRecentTags() {
  const [recentTags, setRecentTags] = useState<RecentTag[]>(loadTags)

  useEffect(() => {
    const handler = () => setRecentTags(loadTags())
    window.addEventListener('r34-storage-changed', handler)
    return () => window.removeEventListener('r34-storage-changed', handler)
  }, [])

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
