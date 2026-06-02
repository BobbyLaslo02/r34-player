import { useState, useEffect } from 'react'
import { fetchPosts } from '../api/r34Client'
import { GENRES } from '../styles/theme'

const THUMB_CACHE_KEY = 'r34-genre-thumbnails'
const THUMB_CACHE_TTL = 24 * 60 * 60 * 1000

function loadCached(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(THUMB_CACHE_KEY)
    if (!raw) return null
    const { timestamp, data } = JSON.parse(raw)
    if (Date.now() - timestamp > THUMB_CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function saveCache(data: Record<string, string>) {
  try {
    localStorage.setItem(THUMB_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }))
  } catch {}
}

export function useGenreThumbnails() {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>(() => {
    return loadCached() || {}
  })

  useEffect(() => {
    const cached = loadCached()
    if (cached) {
      setThumbnails(cached)
      return
    }

    let cancelled = false
    const load = async () => {
      const results = await Promise.all(
        GENRES.map(async (genre) => {
          try {
            const data = await fetchPosts(genre.tags, 0, 5)
            return { genre: genre.name, posts: data.posts }
          } catch {
            return { genre: genre.name, posts: [] }
          }
        })
      )

      if (cancelled) return
      const map: Record<string, string> = {}
      const usedIds = new Set<number>()

      for (const { genre, posts } of results) {
        for (const post of posts) {
          if (!usedIds.has(post.id)) {
            map[genre] = post.preview_url
            usedIds.add(post.id)
            break
          }
        }
        if (!map[genre] && posts.length > 0) {
          map[genre] = posts[0].preview_url
        }
      }

      if (!cancelled) {
        setThumbnails(map)
        saveCache(map)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return thumbnails
}
