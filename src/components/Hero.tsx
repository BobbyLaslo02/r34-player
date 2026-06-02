import React from 'react'
import { R34Post } from '../types'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  hero: {
    position: 'relative',
    height: '380px',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '0 40px 40px',
    overflow: 'hidden',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    transition: `transform ${THEME.transition}`,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(transparent, rgba(20,20,20,0.9) 50%, #141414)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '500px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: THEME.text,
    marginBottom: '8px',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  meta: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '13px',
  },
  score: {
    color: THEME.textSecondary,
  },
  tags: {
    color: THEME.textSecondary,
    fontSize: '12px',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  playBtn: {
    background: THEME.accent,
    color: THEME.text,
    border: 'none',
    padding: '8px 22px',
    borderRadius: THEME.radius,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'inherit',
  },
  badges: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  },
  badge: {
    padding: '2px 8px',
    borderRadius: '2px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
}

interface HeroProps {
  post: R34Post
  onPlay: (post: R34Post) => void
}

export default function Hero({ post, onPlay }: HeroProps) {
  const [hover, setHover] = React.useState(false)

  return (
    <div
      style={styles.hero}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          ...styles.backdrop,
          transform: hover ? 'scale(1.05)' : 'scale(1)',
          backgroundImage: `url(${post.file_url})`,
        }}
      />
      <div style={styles.gradient} />
      <div style={styles.content}>
        <div style={styles.badges}>
          <span style={{ ...styles.badge, background: THEME.accent }}>
            {post.type === 'video' ? 'HD Video' : post.type === 'gif' ? 'GIF' : 'Image'}
          </span>
          {post.rating && (
            <span style={{ ...styles.badge, background: 'rgba(255,255,255,0.15)' }}>
              {post.rating}
            </span>
          )}
        </div>
        <div style={styles.title}>
          {post.tags.slice(0, 3).join(' · ') || `Post #${post.id}`}
        </div>
        <div style={styles.meta}>
          <span style={styles.score}>Score: {post.score}</span>
          <span>{post.width}×{post.height}</span>
        </div>
        <button
          style={styles.playBtn}
          onClick={(e) => { e.stopPropagation(); onPlay(post) }}
        >
          ▶ Play
        </button>
        <div style={styles.tags}>
          {post.tags.join(', ')}
        </div>
      </div>
    </div>
  )
}
