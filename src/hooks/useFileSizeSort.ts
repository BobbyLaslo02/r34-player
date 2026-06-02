import { useState, useEffect, useMemo, useRef } from 'react'
import { R34Post } from '../types'

export function useFileSizeSort(posts: R34Post[], enabled: boolean) {
  const [sizes, setSizes] = useState<Map<number, number>>(new Map())
  const [loading, setLoading] = useState(false)
  const cache = useRef(new Map<string, number>())

  useEffect(() => {
    if (!enabled || posts.length === 0) {
      setSizes(new Map())
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all(
      posts.map(async post => {
        const cached = cache.current.get(post.file_url)
        if (cached !== undefined) return { id: post.id, bytes: cached }
        try {
          const res = await fetch(post.file_url, { method: 'HEAD' })
          const bytes = Number(res.headers.get('content-length') || 0)
          cache.current.set(post.file_url, bytes)
          return { id: post.id, bytes }
        } catch {
          return { id: post.id, bytes: 0 }
        }
      })
    ).then(results => {
      const map = new Map(results.map(r => [r.id, r.bytes]))
      setSizes(map)
      setLoading(false)
    })
  }, [enabled, posts])

  const sorted = useMemo(() => {
    if (!enabled || sizes.size === 0) return posts
    return [...posts].sort((a, b) => (sizes.get(b.id) || 0) - (sizes.get(a.id) || 0))
  }, [posts, sizes, enabled])

  return { sorted, loading }
}
