import React, { useCallback, useMemo } from 'react'
import { R34Post, LibraryEntry } from '../types'
import MediaCard from './MediaCard'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px 40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: THEME.text,
  },
  count: {
    fontSize: '13px',
    color: THEME.textSecondary,
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    color: THEME.textSecondary,
    fontSize: '15px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
  },
  shuffleBar: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '12px 16px',
    background: THEME.bgCard,
    borderRadius: THEME.radius,
  },
  shuffleBtn: {
    background: THEME.accent,
    color: THEME.text,
    border: 'none',
    borderRadius: THEME.radius,
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  clearBtn: {
    background: 'transparent',
    color: THEME.textSecondary,
    border: `1px solid ${THEME.border}`,
    borderRadius: THEME.radius,
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}

interface LibraryPageProps {
  entries: LibraryEntry[]
  onPlay: (post: R34Post) => void
  onRemove: (postId: number) => void
  onShuffle: () => R34Post[]
  onStartPlaylist?: (posts: R34Post[], startIndex: number, reshuffleFn?: () => R34Post[]) => void
}

export default function LibraryPage({ entries, onPlay, onRemove, onShuffle, onStartPlaylist }: LibraryPageProps) {
  const handleShuffle = useCallback(() => {
    const shuffled = onShuffle()
    if (shuffled.length > 0 && onStartPlaylist) {
      onStartPlaylist(shuffled, 0, onShuffle)
    }
  }, [onShuffle, onStartPlaylist])

  if (entries.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Library</h2>
          <span style={styles.count}>0 videos</span>
        </div>
        <div style={styles.empty}>
          Your library is empty. Browse and click the + on any video to add it.
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Library</h2>
        <span style={styles.count}>{entries.length} videos</span>
      </div>

      <div style={styles.shuffleBar}>
        <button style={styles.shuffleBtn} onClick={handleShuffle}>
          ▶ Shuffle Play
        </button>
        <span style={{ fontSize: '12px', color: THEME.textSecondary }}>
          Randomly plays all library videos in a different order each time
        </span>
      </div>

      <div style={styles.grid}>
        {entries.map(entry => (
          <MediaCard
            key={entry.post.id}
            post={entry.post}
            onPlay={onPlay}
            inLibrary
            onRemoveFromLibrary={onRemove}
          />
        ))}
      </div>
    </div>
  )
}
