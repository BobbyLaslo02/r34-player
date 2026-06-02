import React, { useRef } from 'react'
import { R34Post, ContentCategory } from '../types'
import MediaCard from './MediaCard'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  section: {
    marginBottom: '40px',
    padding: '0 40px',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: THEME.text,
  },
  description: {
    fontSize: '13px',
    color: THEME.textSecondary,
  },
  row: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollBehavior: 'smooth',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  scrollBtn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40px',
    background: 'rgba(20,20,20,0.85)',
    border: 'none',
    color: THEME.text,
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    position: 'relative',
  },
}

interface ContentRowProps {
  category: ContentCategory
  posts: R34Post[]
  onPlay: (post: R34Post) => void
}

export default function ContentRow({ category, posts, onPlay }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (rowRef.current) {
      const amount = dir === 'left' ? -600 : 600
      rowRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  if (posts.length === 0) return null

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>{category.title}</h2>
        <span style={styles.description}>{category.description}</span>
      </div>
      <div style={styles.wrapper}>
        <button
          style={{ ...styles.scrollBtn, left: 0 }}
          onClick={() => scroll('left')}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(20,20,20,0.95)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,20,20,0.85)' }}
        >‹</button>
        <div
          ref={rowRef}
          style={styles.row}
        >
          {posts.map(post => (
            <MediaCard key={post.id} post={post} onPlay={onPlay} />
          ))}
        </div>
        <button
          style={{ ...styles.scrollBtn, right: 0 }}
          onClick={() => scroll('right')}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(20,20,20,0.95)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,20,20,0.85)' }}
        >›</button>
      </div>
    </div>
  )
}
