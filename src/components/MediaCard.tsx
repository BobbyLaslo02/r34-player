import React from 'react'
import { R34Post } from '../types'
import { THEME } from '../styles/theme'
import { useFileSize } from '../hooks/useFileSize'
import GoFileButton from './GoFileButton'

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    minWidth: '200px',
    flexShrink: 0,
    cursor: 'pointer',
    borderRadius: THEME.radius,
    overflow: 'hidden',
    background: THEME.bgCard,
    transition: `transform ${THEME.transition}, box-shadow ${THEME.transition}`,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: '16/9',
    objectFit: 'cover',
    display: 'block',
    background: THEME.bgSecondary,
  },
  info: {
    padding: '10px 12px',
  },
  tags: {
    fontSize: '12px',
    color: THEME.textSecondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '4px',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    color: THEME.textSecondary,
  },
  typeBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(0,0,0,0.75)',
    color: THEME.text,
    padding: '2px 6px',
    borderRadius: '2px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  scoreBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: THEME.accent,
    color: THEME.text,
    padding: '2px 6px',
    borderRadius: '2px',
    fontSize: '10px',
    fontWeight: 600,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: `opacity ${THEME.transition}`,
  },
  playIcon: {
    fontSize: '40px',
    color: THEME.text,
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
}

interface MediaCardProps {
  post: R34Post
  onPlay: (post: R34Post) => void
  inLibrary?: boolean
  onAddToLibrary?: (post: R34Post) => void
  onRemoveFromLibrary?: (postId: number) => void
}

export default function MediaCard({ post, onPlay, inLibrary, onAddToLibrary, onRemoveFromLibrary }: MediaCardProps) {
  const [hover, setHover] = React.useState(false)
  const fileSize = useFileSize(post.file_url)

  const handleLibClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inLibrary && onRemoveFromLibrary) {
      onRemoveFromLibrary(post.id)
    } else if (!inLibrary && onAddToLibrary) {
      onAddToLibrary(post)
    }
  }

  return (
    <div
      style={{
        ...styles.card,
        transform: hover ? 'scale(1.05)' : 'scale(1)',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
        zIndex: hover ? 10 : 1,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onPlay(post)}
    >
      <img
        src={post.preview_url}
        alt=""
        style={styles.thumbnail}
        loading="lazy"
      />
      <span style={styles.typeBadge}>{post.type.toUpperCase()}</span>
      <span style={styles.scoreBadge}>{post.score}</span>
      <button
        onClick={handleLibClick}
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: inLibrary ? THEME.accent : 'rgba(0,0,0,0.6)',
          color: THEME.text,
          border: 'none',
          borderRadius: '50%',
          width: '26px',
          height: '26px',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          zIndex: 5,
        }}
        title={inLibrary ? 'Remove from library' : 'Add to library'}
      >
        {inLibrary ? '✓' : '+'}
      </button>
      <div style={{ ...styles.playOverlay, opacity: hover ? 1 : 0 }}>
        <span style={styles.playIcon}>▶</span>
      </div>
        <div style={styles.info}>
          <div style={styles.tags}>{post.tags.slice(0, 5).join(', ')}</div>
          <div style={styles.meta}>
            <span>{fileSize || post.rating}</span>
            <GoFileButton url={post.file_url} filename={post.id + '.' + post.file_url.split('.').pop()} />
          </div>
        </div>
    </div>
  )
}
