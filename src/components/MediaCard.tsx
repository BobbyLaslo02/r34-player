import React from 'react'
import { R34Post, Playlist } from '../types'
import { THEME } from '../styles/theme'
import { useFileSize } from '../hooks/useFileSize'

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    minWidth: '200px',
    flexShrink: 0,
    cursor: 'pointer',
    borderRadius: THEME.radius,
    background: THEME.bgCard,
    transition: `transform ${THEME.transition}, box-shadow ${THEME.transition}`,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: '16/9',
    objectFit: 'cover',
    display: 'block',
    background: THEME.bgSecondary,
    borderRadius: `${THEME.radius} ${THEME.radius} 0 0`,
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
    top: 0, left: 0, right: 0, bottom: 0,
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
  plBtn: {
    position: 'absolute',
    bottom: '40px',
    right: '8px',
    background: 'rgba(0,0,0,0.6)',
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
  },
  plDropdown: {
    position: 'absolute',
    bottom: '70px',
    right: '8px',
    background: THEME.bgCard,
    border: `1px solid ${THEME.border}`,
    borderRadius: '8px',
    padding: '6px 0',
    minWidth: '160px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    zIndex: 999,
  },
  plItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    color: THEME.text,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  plCreate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    color: THEME.accent,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
    borderTop: `1px solid ${THEME.border}`,
    marginTop: '4px',
    paddingTop: '10px',
  },
}

interface MediaCardProps {
  post: R34Post
  onPlay: (post: R34Post) => void
  inLibrary?: boolean
  onAddToLibrary?: (post: R34Post) => void
  onRemoveFromLibrary?: (postId: number) => void
  playlists?: Playlist[]
  onAddToPlaylist?: (playlistId: string, postId: number) => void
  onRemoveFromPlaylist?: (playlistId: string, postId: number) => void
  isInPlaylist?: (playlistId: string, postId: number) => boolean
  onCreatePlaylist?: () => void
}

export default function MediaCard({ post, onPlay, inLibrary, onAddToLibrary, onRemoveFromLibrary, playlists, onAddToPlaylist, onRemoveFromPlaylist, isInPlaylist, onCreatePlaylist }: MediaCardProps) {
  const [hover, setHover] = React.useState(false)
  const [plOpen, setPlOpen] = React.useState(false)
  const plRef = React.useRef<HTMLDivElement>(null)
  const fileSize = useFileSize(post.file_url)

  React.useEffect(() => {
    if (!plOpen) return
    const handler = (e: MouseEvent) => {
      if (plRef.current && !plRef.current.contains(e.target as Node)) setPlOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [plOpen])

  const handleLibClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inLibrary && onRemoveFromLibrary) onRemoveFromLibrary(post.id)
    else if (!inLibrary && onAddToLibrary) onAddToLibrary(post)
  }

  const handlePlToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPlOpen(!plOpen)
  }

  const handlePlItem = (e: React.MouseEvent, plId: string) => {
    e.stopPropagation()
    if (isInPlaylist && isInPlaylist(plId, post.id)) {
      onRemoveFromPlaylist?.(plId, post.id)
    } else {
      onAddToPlaylist?.(plId, post.id)
    }
  }

  const hasPlaylistProps = playlists && onAddToPlaylist && onRemoveFromPlaylist && isInPlaylist

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
      <img src={post.preview_url} alt="" style={styles.thumbnail} loading="lazy" />
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
      {hasPlaylistProps && (
        <div ref={plRef}>
          <button onClick={handlePlToggle} style={styles.plBtn} title="Add to playlist">
            ⋮
          </button>
          {plOpen && (
            <div style={styles.plDropdown}>
              {playlists.length === 0 && (
                <div style={{ padding: '6px 12px', fontSize: '11px', color: THEME.textSecondary }}>
                  No playlists yet
                </div>
              )}
              {playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={e => handlePlItem(e, pl.id)}
                  style={styles.plItem}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--r34-bgHover)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: '12px' }}>{isInPlaylist?.(pl.id, post.id) ? '☑' : '☐'}</span>
                  {pl.name}
                </button>
              ))}
              {onCreatePlaylist && (
                <button
                  onClick={e => { e.stopPropagation(); onCreatePlaylist(); setPlOpen(false) }}
                  style={styles.plCreate}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--r34-bgHover)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  + New Playlist
                </button>
              )}
            </div>
          )}
        </div>
      )}
      <div style={{ ...styles.playOverlay, opacity: hover ? 1 : 0 }}>
        <span style={styles.playIcon}>▶</span>
      </div>
      <div style={styles.info}>
        <div style={styles.tags}>{post.tags.slice(0, 5).join(', ')}</div>
        <div style={styles.meta}>
          <span>{fileSize || post.rating}</span>
        </div>
      </div>
    </div>
  )
}
