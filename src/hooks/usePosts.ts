import { useState, useEffect, useCallback } from 'react'
import { R34Post } from '../types'
import { fetchPosts } from '../api/r34Client'

export function usePosts(tags: string = '', limit: number = 100) {
  const [posts, setPosts] = useState<R34Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const load = useCallback(async (pageNum: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPosts(tags, pageNum, limit)
      setPosts(data.posts)
      setTotalCount(data.count)
      setHasMore(data.posts.length >= limit)
      setPage(pageNum)
    } catch (e: any) {
      setError(e.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [tags, limit])

  useEffect(() => {
    setPage(0)
    load(0)
  }, [load])

  const goToPage = useCallback((pageNum: number) => {
    if (!loading) load(pageNum)
  }, [loading, load])

  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  return { posts, loading, error, page, totalCount, totalPages, hasMore, goToPage }
}
