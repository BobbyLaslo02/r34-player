import React, { useState, useCallback } from 'react'
import { R34Post, Favorite } from '../types'
import VideoPlayer from './VideoPlayer'
import ImageViewer from './ImageViewer'
import RelatedContent from './RelatedContent'
import { usePosts } from '../hooks/usePosts'
import GoFileButton from './GoFileButton'
import { useFileSize } from '../hooks/useFileSize'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    height: 'calc(100vh - 68px)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  playerWrap: {
    flex: '0 0 auto',
  },
  details: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 28px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '16px',
  },
  tag: {
    fontSize: '12px',
    color: THEME.textSecondary,
    background: THEME.bgCard,
    padding: '4px 10px',
    borderRadius: '14px',
    cursor: 'pointer',
    border: `1px solid ${THEME.border}`,
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '16px',
  },
  postId: {
    fontSize: '13px',
    color: THEME.textSecondary,
    whiteSpace: 'nowrap',
  },
  stats: {
    display: 'flex',
    gap: '14px',
    fontSize: '13px',
    color: THEME.textSecondary,
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: THEME.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: THEME.textSecondary,
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 0',
    marginBottom: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'inherit',
  },
  actionBtn: {
    background: 'none',
    border: `1px solid ${THEME.border}`,
    color: THEME.textSecondary,
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: THEME.radius,
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'inherit',
    transition: `all ${THEME.transition}`,
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
}

interface PlayerPageProps {
  post: R34Post
  onBack: () => void
  onSelectPost: (post: R34Post) => void
  isFavorite: (id: string) => boolean
  onToggleFavorite: (fav: Favorite) => void
  playlist?: R34Post[]
  playlistIndex?: number
  onNext?: () => void
  onPrev?: () => void
  onStartPlaylist?: (posts: R34Post[], index: number, reshuffleFn?: () => R34Post[]) => void
  onAddToLibrary?: (post: R34Post) => void
  onRemoveFromLibrary?: (postId: number) => void
  isInLibrary?: (postId: number) => boolean
}

export default function PlayerPage({ post, onBack, onSelectPost, isFavorite, onToggleFavorite, playlist, playlistIndex, onNext, onPrev, onStartPlaylist, onAddToLibrary, onRemoveFromLibrary, isInLibrary: isInLib }: PlayerPageProps) {
  const playerHeight = 480
  const tagQuery = post.tags.slice(0, 3).join(' ')
  const { posts: related } = usePosts(tagQuery, 60)

  const inLibrary = isInLib ? isInLib(post.id) : false
  const fileSize = useFileSize(post.file_url)

  const postTagsFavId = `tags-post-${post.id}`
  const isPostFavorited = isFavorite(postTagsFavId)

  const handleFavTags = useCallback(() => {
    onToggleFavorite({
      id: postTagsFavId,
      name: post.tags.slice(0, 3).join(', ') || `Post #${post.id}`,
      type: 'tag',
      value: post.tags.slice(0, 5).join(' '),
    })
  }, [onToggleFavorite, postTagsFavId, post.tags, post.id])

  const handleFullscreen = useCallback(() => {
    const el = document.documentElement
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }, [])

  return (
    <div style={styles.layout}>
      <div style={styles.main}>
        <div style={styles.playerWrap}>
          {post.type === 'video' ? (
            <VideoPlayer post={post} height={playerHeight} onEnded={playlist && playlist.length > 1 ? onNext : undefined} />
          ) : (
            <ImageViewer post={post} height={playerHeight} onEnded={playlist && playlist.length > 1 ? onNext : undefined} />
          )}
        </div>

        <div style={styles.details}>
          {playlist && playlist.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '8px 12px', background: THEME.bgCard, borderRadius: THEME.radius }}>
              <button style={{ ...styles.actionBtn, borderColor: THEME.border }} onClick={onPrev} disabled={playlistIndex === 0}>
                ← Prev
              </button>
              <span style={{ fontSize: '12px', color: THEME.textSecondary }}>
                {playlistIndex! + 1} / {playlist.length}
              </span>
              <button style={{ ...styles.actionBtn, borderColor: THEME.border }} onClick={onNext} disabled={playlistIndex === playlist.length - 1}>
                Next →
              </button>
              <span style={{ fontSize: '11px', color: THEME.textSecondary, marginLeft: '8px' }}>
                Playlist mode — auto-advances on end
              </span>
            </div>
          )}
          <div style={styles.topBar}>
            <button style={styles.backBtn} onClick={onBack}>
              ← Back to Browse
            </button>
            <div style={styles.actionRow}>
              <button style={styles.actionBtn} onClick={handleFullscreen} title="Toggle fullscreen (F11)">
                ⛶ Fullscreen
              </button>
              <button
                  style={{
                    ...styles.actionBtn,
                    borderColor: inLibrary ? THEME.accent : THEME.border,
                    color: inLibrary ? THEME.accent : THEME.textSecondary,
                  }}
                  onClick={() => inLibrary ? onRemoveFromLibrary?.(post.id) : onAddToLibrary?.(post)}
                  title={inLibrary ? 'Remove from library' : 'Save to library'}
                >
                  {inLibrary ? '✓' : '+📁'} Library
                </button>
              <button
                  style={{
                    ...styles.actionBtn,
                    borderColor: isPostFavorited ? THEME.gold : THEME.border,
                    color: isPostFavorited ? THEME.gold : THEME.textSecondary,
                  }}
                  onClick={handleFavTags}
                  title="Favorite this post's tags"
                >
                  {isPostFavorited ? '★' : '☆'} Favorite Tags
                </button>
                <GoFileButton url={post.file_url} filename={post.id + '.' + post.file_url.split('.').pop()} />
            </div>
          </div>

          <div style={styles.titleRow}>
            <div>
              <div style={{ ...styles.stats, marginBottom: 0 }}>
                <span style={styles.statItem}>Score: {post.score}</span>
                <span style={styles.statItem}>{post.rating}</span>
                <span style={styles.statItem}>{post.width}×{post.height}</span>
                <span style={styles.statItem}>{post.type.toUpperCase()}</span>
                {fileSize && <span style={styles.statItem}>{fileSize}</span>}
              </div>
            </div>
            <div style={styles.postId}>#{post.id}</div>
          </div>

          <div style={styles.label}>Tags ({post.tags.length})</div>
          <div style={styles.tags}>
            {post.tags.map(tag => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <RelatedContent posts={related} currentPost={post} onSelect={onSelectPost} />
    </div>
  )
}
