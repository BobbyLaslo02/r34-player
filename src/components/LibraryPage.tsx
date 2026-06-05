import React, { useCallback, useMemo, useState } from 'react'
import { R34Post, LibraryEntry, Playlist } from '../types'
import MediaCard from './MediaCard'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '20px 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: 700, color: THEME.text },
  count: { fontSize: '13px', color: THEME.textSecondary },
  empty: { textAlign: 'center', padding: '80px 20px', color: THEME.textSecondary, fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' },
  shuffleBar: {
    display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px',
    padding: '12px 16px', background: THEME.bgCard, borderRadius: THEME.radius,
  },
  shuffleBtn: {
    background: THEME.accent, color: THEME.text, border: 'none',
    borderRadius: THEME.radius, padding: '8px 20px', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  smallBtn: {
    background: 'transparent', color: THEME.textSecondary,
    border: `1px solid ${THEME.border}`, borderRadius: THEME.radius,
    padding: '8px 20px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  sectionLabel: {
    fontSize: '13px', fontWeight: 600, color: THEME.textSecondary,
    textTransform: 'uppercase' as const, letterSpacing: '0.5px',
    marginBottom: '10px', marginTop: '4px',
  },
  playlistRow: {
    display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px',
    marginBottom: '20px',
  },
  playlistChip: {
    padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
    fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const, flexShrink: 0,
    transition: `all ${THEME.transition}`,
  },
  playlistView: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '16px', padding: '12px 16px',
    background: THEME.bgCard, borderRadius: THEME.radius,
  },
  playlistName: { fontSize: '16px', fontWeight: 700, color: THEME.text },
}

interface LibraryPageProps {
  entries: LibraryEntry[]
  onPlay: (post: R34Post) => void
  onRemove: (postId: number) => void
  onShuffle: () => R34Post[]
  onStartPlaylist?: (posts: R34Post[], startIndex: number, reshuffleFn?: () => R34Post[]) => void
  playlists: Playlist[]
  onCreatePlaylist: (name: string) => Playlist
  onDeletePlaylist: (id: string) => void
  onRenamePlaylist: (id: string, name: string) => void
  onAddToPlaylist: (playlistId: string, postId: number) => void
  onRemoveFromPlaylist: (playlistId: string, postId: number) => void
  isInPlaylist: (playlistId: string, postId: number) => boolean
}

export default function LibraryPage({
  entries, onPlay, onRemove, onShuffle, onStartPlaylist,
  playlists, onCreatePlaylist, onDeletePlaylist, onRenamePlaylist,
  onAddToPlaylist, onRemoveFromPlaylist, isInPlaylist,
}: LibraryPageProps) {
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')

  const activePlaylist = useMemo(
    () => playlists.find(p => p.id === activePlaylistId) || null,
    [playlists, activePlaylistId]
  )

  const filteredEntries = useMemo(() => {
    if (!activePlaylist) return entries
    return entries.filter(e => activePlaylist.postIds.includes(e.post.id))
  }, [entries, activePlaylist])

  const handleShuffleAll = useCallback(() => {
    const shuffled = onShuffle()
    if (shuffled.length > 0 && onStartPlaylist) onStartPlaylist(shuffled, 0, onShuffle)
  }, [onShuffle, onStartPlaylist])

  const handleShufflePlaylist = useCallback(() => {
    if (!activePlaylist) return
    const posts = activePlaylist.postIds
      .map(id => entries.find(e => e.post.id === id)?.post)
      .filter(Boolean) as R34Post[]
    if (posts.length === 0) return
    const shuffled = [...posts]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    if (onStartPlaylist) onStartPlaylist(shuffled, 0, () => {
      const reshuffled = [...posts]
      for (let i = reshuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [reshuffled[i], reshuffled[j]] = [reshuffled[j], reshuffled[i]]
      }
      return reshuffled
    })
  }, [activePlaylist, entries, onStartPlaylist])

  const handleNewPlaylist = useCallback(() => {
    const name = prompt('Playlist name:')
    if (name && name.trim()) {
      const pl = onCreatePlaylist(name.trim())
      setActivePlaylistId(pl.id)
    }
  }, [onCreatePlaylist])

  const handleDeletePlaylist = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const pl = playlists.find(p => p.id === id)
    if (pl && confirm(`Delete "${pl.name}"?`)) {
      onDeletePlaylist(id)
      if (activePlaylistId === id) setActivePlaylistId(null)
    }
  }, [playlists, onDeletePlaylist, activePlaylistId])

  const handleRenameStart = useCallback((e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    setRenaming(id)
    setRenameVal(name)
  }, [])

  const handleRenameDone = useCallback((id: string) => {
    if (renameVal.trim()) onRenamePlaylist(id, renameVal.trim())
    setRenaming(null)
  }, [renameVal, onRenamePlaylist])

  const playlistPosts = activePlaylist
    ? activePlaylist.postIds.map(id => entries.find(e => e.post.id === id)?.post).filter(Boolean) as R34Post[]
    : []

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
        <h2 style={styles.title}>{activePlaylist ? activePlaylist.name : 'Library'}</h2>
        <span style={styles.count}>
          {activePlaylist
            ? `${activePlaylist.postIds.length} videos`
            : `${entries.length} videos`}
        </span>
      </div>

      <div style={styles.shuffleBar}>
        {activePlaylist ? (
          <>
            <button style={styles.shuffleBtn} onClick={handleShufflePlaylist}>
              ▶ Shuffle Playlist
            </button>
            <button style={styles.smallBtn} onClick={() => setActivePlaylistId(null)}>
              ← All Videos
            </button>
            <span style={{ fontSize: '12px', color: THEME.textSecondary }}>
              {activePlaylist.postIds.length} videos in this playlist
            </span>
          </>
        ) : (
          <>
            <button style={styles.shuffleBtn} onClick={handleShuffleAll}>
              ▶ Shuffle All
            </button>
            <span style={{ fontSize: '12px', color: THEME.textSecondary }}>
              Randomly plays all library videos in a different order each time
            </span>
          </>
        )}
      </div>

      {!activePlaylist && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={styles.sectionLabel}>Playlists</div>
            <button onClick={handleNewPlaylist} style={{
              background: 'none', border: 'none', color: THEME.accent,
              cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              padding: '4px 8px', fontFamily: 'inherit',
            }}>
              + New
            </button>
          </div>
          <div style={styles.playlistRow}>
            {playlists.length === 0 && (
              <div style={{ fontSize: '12px', color: THEME.textSecondary, padding: '6px 0' }}>
                No playlists yet. Click "+ New" to create one.
              </div>
            )}
            {playlists.map(pl => (
              <div key={pl.id} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setActivePlaylistId(pl.id)}
                  style={{
                    ...styles.playlistChip,
                    background: THEME.bgCard,
                    color: THEME.text,
                    border: `1px solid ${THEME.border}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--r34-bgHover)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = THEME.bgCard as string }}
                >
                  {pl.name} ({pl.postIds.length})
                </button>
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', display: 'flex', gap: '2px' }}>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      const newName = prompt('Rename:', pl.name)
                      if (newName && newName.trim()) onRenamePlaylist(pl.id, newName.trim())
                    }}
                    style={{
                      background: 'rgba(0,0,0,0.6)', border: 'none', color: THEME.textSecondary,
                      borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0, lineHeight: 1,
                    }}
                    title="Rename"
                  >✎</button>
                  <button
                    onClick={e => handleDeletePlaylist(e, pl.id)}
                    style={{
                      background: 'rgba(0,0,0,0.6)', border: 'none', color: '#f55',
                      borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0, lineHeight: 1,
                    }}
                    title="Delete"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {filteredEntries.map(entry => (
          <MediaCard
            key={entry.post.id}
            post={entry.post}
            onPlay={onPlay}
            inLibrary
            onRemoveFromLibrary={onRemove}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
            onRemoveFromPlaylist={onRemoveFromPlaylist}
            isInPlaylist={isInPlaylist}
            onCreatePlaylist={handleNewPlaylist}
          />
        ))}
      </div>
    </div>
  )
}
