export interface R34Post {
  id: number
  parent_id: number | null
  type: 'image' | 'video' | 'gif'
  score: number
  rating: string
  source: string
  tags: string[]
  file_url: string
  width: number
  height: number
  sample_url: string
  sample_width: number
  sample_height: number
  preview_url: string
  preview_width: number
  preview_height: number
  change: number
  md5: string
  creator_id: string
  has_children: string
  created_at: string
  status: string
  has_notes: string
  has_comments: boolean
  comments_url: string
  creator_url: string
}

export interface R34Response {
  count: number
  posts: R34Post[]
}

export interface TagSuggestion {
  value: string
  label: string
  count: number
}

export interface ContentCategory {
  title: string
  tags: string
  description: string
}

export interface Genre {
  name: string
  tags: string
  description: string
  icon: string
}

export interface Favorite {
  id: string
  name: string
  type: 'tag' | 'genre' | 'category'
  value: string
}

export interface LibraryEntry {
  post: R34Post
  addedAt: number
}

export interface Playlist {
  id: string
  name: string
  postIds: number[]
  createdAt: number
}
