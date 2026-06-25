import { R34Post, R34Response, TagSuggestion } from '../types'

const BASE_URL = 'https://rule34-api.netlify.app'
const AUTOCOMPLETE_URL = 'https://api.rule34.xxx/autocomplete.php'

export async function fetchPosts(
  tags: string,
  page: number = 0,
  limit: number = 100
): Promise<R34Response> {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  params.set('pid', String(page))
  if (tags) params.set('tags', tags)

  const url = `${BASE_URL}/posts?${params.toString()}`.replace(/\+/g, '%20')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status} for: ${url}`)
  let data: any[]
  try {
    data = await res.json()
  } catch {
    return { count: 0, posts: [] }
  }
  if (!Array.isArray(data)) return { count: 0, posts: [] }

  const posts = data.filter((p: any) => p.change && p.file_url).map(parsePost)

  let count = posts.length
  try {
    const countUrl = `${BASE_URL}/count${tags ? `?tags=${encodeURIComponent(tags)}` : ''}`
    const countRes = await fetch(countUrl)
    const countText = await countRes.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(countText, 'text/xml')
    const parsed = Number(xml.getElementsByTagName('posts')[0]?.getAttribute('count') || 0)
    if (parsed > count) count = parsed
  } catch {}

  return { count, posts }
}

export async function fetchRandomPost(): Promise<R34Post | null> {
  const randomPage = Math.floor(Math.random() * 50)
  try {
    const res = await fetchPosts('', randomPage, 100)
    if (res.posts.length > 0)
      return res.posts[Math.floor(Math.random() * res.posts.length)]
    const fallback = await fetchPosts('', 0, 100)
    if (fallback.posts.length > 0)
      return fallback.posts[Math.floor(Math.random() * fallback.posts.length)]
    return null
  } catch {
    return null
  }
}

export async function fetchTagSuggestions(query: string): Promise<TagSuggestion[]> {
  if (!query || query.length < 2) return []
  const url = `${AUTOCOMPLETE_URL}?q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.map((t: any) => {
    const label = t.label || t.value || ''
    const countMatch = label.match(/\(([\d,]+)\)/)
    return {
      value: t.value || '',
      label,
      count: countMatch ? parseInt(countMatch[1].replace(/,/g, ''), 10) : 0,
    }
  })
}

function parsePost(post: any): R34Post {
  const file_url = post.file_url || ''
  return {
    id: Number(post.id),
    parent_id: post.parent_id ? Number(post.parent_id) : null,
    type: file_url.endsWith('.webm') || file_url.endsWith('.mp4') ? 'video' : file_url.includes('.gif') ? 'gif' : 'image',
    score: Number(post.score),
    rating: post.rating || 'Explicit',
    source: post.source || '',
    tags: (post.tags || '').split(' ').filter((t: string) => t),
    file_url,
    width: Number(post.width),
    height: Number(post.height),
    sample_url: post.sample_url || file_url,
    sample_width: Number(post.sample_width),
    sample_height: Number(post.sample_height),
    preview_url: post.preview_url || file_url,
    preview_width: Number(post.preview_width),
    preview_height: Number(post.preview_height),
    change: Number(post.change),
    md5: post.md5 || '',
    creator_id: post.creator_id || '',
    has_children: post.has_children || 'false',
    created_at: post.created_at || '',
    status: post.status || 'active',
    has_notes: post.has_notes || 'false',
    has_comments: Boolean(Number(post.comment_count) > 0),
    comments_url: post.comments_url || '',
    creator_url: post.creator_url || '',
  }
}
