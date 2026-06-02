import React from 'react'
import { R34Post } from '../types'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '340px',
    flexShrink: 0,
    padding: '20px',
    overflowY: 'auto',
    background: THEME.bgSecondary,
    borderLeft: `1px solid ${THEME.border}`,
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: THEME.text,
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${THEME.border}`,
  },
  card: {
    display: 'flex',
    gap: '10px',
    padding: '8px',
    borderRadius: THEME.radius,
    cursor: 'pointer',
    transition: `background ${THEME.transition}`,
    marginBottom: '4px',
  },
  thumb: {
    width: '120px',
    height: '68px',
    objectFit: 'cover',
    borderRadius: '2px',
    flexShrink: 0,
    background: THEME.bgCard,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  cardType: {
    fontSize: '10px',
    fontWeight: 600,
    color: THEME.accent,
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  cardTags: {
    fontSize: '12px',
    color: THEME.textSecondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '4px',
  },
  cardMeta: {
    fontSize: '11px',
    color: THEME.textSecondary,
  },
}

interface RelatedContentProps {
  posts: R34Post[]
  currentPost: R34Post
  onSelect: (post: R34Post) => void
}

export default function RelatedContent({ posts, currentPost, onSelect }: RelatedContentProps) {
  const related = posts.filter(p => p.id !== currentPost.id).slice(0, 30)

  return (
    <div style={styles.sidebar}>
      <div style={styles.title}>Related</div>
      {related.map(post => (
        <div
          key={post.id}
          style={styles.card}
          onClick={() => onSelect(post)}
          onMouseEnter={(e) => { e.currentTarget.style.background = THEME.bgHover }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <img src={post.preview_url} alt="" style={styles.thumb} loading="lazy" />
          <div style={styles.info}>
            <div style={styles.cardType}>{post.type}</div>
            <div style={styles.cardTags}>{post.tags.slice(0, 4).join(', ')}</div>
            <div style={styles.cardMeta}>
              Score: {post.score} · {post.rating}
            </div>
          </div>
        </div>
      ))}
      {related.length === 0 && (
        <div style={{ color: THEME.textSecondary, fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
          No related posts
        </div>
      )}
    </div>
  )
}
