import React, { useState, useCallback, useRef, useEffect } from 'react'
import Navbar from './components/Navbar'
import BrowsePage from './components/BrowsePage'
import PlayerPage from './components/PlayerPage'
import LibraryPage from './components/LibraryPage'
import VpnGate from './components/VpnGate'
import UpdateNotification from './components/UpdateNotification'
import { R34Post } from './types'
import { useFavorites, useVideoOnly } from './hooks/useFavorites'
import { useRecentTags } from './hooks/useRecentTags'
import { useLibrary } from './hooks/useLibrary'
import { ThemeKey, applyTheme, getStoredTheme } from './styles/theme'

type View = 'browse' | 'player' | 'library'

export default function App() {
  const [view, setView] = useState<View>('browse')
  const [selectedPost, setSelectedPost] = useState<R34Post | null>(null)
  const [searchTags, setSearchTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const { favorites, toggleFavorite, isFavorite, removeFavorite } = useFavorites()
  const [videoOnly, setVideoOnly] = useVideoOnly()
  const { recentTags, addRecentTag, clearRecent } = useRecentTags()
  const { entries, addToLibrary, removeFromLibrary, isInLibrary, shuffle } = useLibrary()
  const [theme, setTheme] = useState<ThemeKey>(getStoredTheme)

  const [playlist, setPlaylist] = useState<R34Post[]>([])
  const [playlistIndex, setPlaylistIndex] = useState(0)
  const reshuffleRef = useRef<(() => R34Post[]) | null>(null)

  useEffect(() => { applyTheme(theme) }, [theme])

  const handleThemeChange = useCallback((key: ThemeKey) => {
    setTheme(key)
    applyTheme(key)
  }, [])

  const handlePlay = useCallback((post: R34Post) => {
    setPlaylist([])
    reshuffleRef.current = null
    setSelectedPost(post)
    setView('player')
  }, [])

  const startPlaylist = useCallback((posts: R34Post[], startIndex: number = 0, reshuffleFn?: () => R34Post[]) => {
    reshuffleRef.current = reshuffleFn || null
    setPlaylist(posts)
    setPlaylistIndex(startIndex)
    setSelectedPost(posts[startIndex])
    setView('player')
  }, [])

  const nextInPlaylist = useCallback(() => {
    setPlaylistIndex(prev => {
      const next = prev + 1
      if (next >= playlist.length) {
        const fn = reshuffleRef.current
        if (fn) {
          const reshuffled = fn()
          if (reshuffled.length > 0) {
            setPlaylist(reshuffled)
            setSelectedPost(reshuffled[0])
            return 0
          }
        }
        setSelectedPost(playlist[0])
        return 0
      }
      setSelectedPost(playlist[next])
      return next
    })
  }, [playlist])

  const prevInPlaylist = useCallback(() => {
    setPlaylistIndex(prev => {
      const prevIdx = Math.max(0, prev - 1)
      setSelectedPost(playlist[prevIdx])
      return prevIdx
    })
  }, [playlist])

  const handleBack = useCallback(() => {
    setPlaylist([])
    setView('browse')
    setSelectedPost(null)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setSearchTags([])
    setView('browse')
    setSelectedPost(null)
    setPlaylist([])
  }, [])

  const handleTagsChange = useCallback((tags: string[]) => {
    setSearchTags(tags)
  }, [])

  const handleHome = useCallback(() => {
    setSearchQuery('')
    setSearchTags([])
    setView('browse')
    setSelectedPost(null)
    setPlaylist([])
  }, [])

  const handleLibrary = useCallback(() => {
    setView('library')
    setSelectedPost(null)
    setPlaylist([])
  }, [])

  return (
    <VpnGate>
      <div style={{ minHeight: '100vh', background: '#141414', color: '#fff' }}>
        <UpdateNotification />
        <Navbar
          onSearch={handleSearch}
          searchQuery={searchQuery}
          onHome={handleHome}
          onLibrary={handleLibrary}
          videoOnly={videoOnly}
          onVideoOnlyChange={setVideoOnly}
          searchTags={searchTags}
          onTagsChange={handleTagsChange}
          recentTags={recentTags}
          onAddRecent={addRecentTag}
          onClearRecent={clearRecent}
          libraryCount={entries.length}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
        <div style={{ paddingTop: '68px' }}>
          {view === 'browse' ? (
            <BrowsePage
              onPlay={handlePlay}
              searchQuery={searchQuery}
              searchTags={searchTags}
              videoOnly={videoOnly}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              onRemoveFavorite={removeFavorite}
              onSearch={handleSearch}
              onAddToLibrary={addToLibrary}
              isInLibrary={isInLibrary}
              onRemoveFromLibrary={removeFromLibrary}
            />
          ) : view === 'library' ? (
            <LibraryPage
              entries={entries}
              onPlay={handlePlay}
              onRemove={removeFromLibrary}
              onShuffle={shuffle}
              onStartPlaylist={startPlaylist}
            />
          ) : selectedPost ? (
            <PlayerPage
              post={selectedPost}
              onBack={handleBack}
              onSelectPost={handlePlay}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              playlist={playlist}
              playlistIndex={playlistIndex}
              onNext={nextInPlaylist}
              onPrev={prevInPlaylist}
              onStartPlaylist={startPlaylist}
              onAddToLibrary={addToLibrary}
              onRemoveFromLibrary={removeFromLibrary}
              isInLibrary={isInLibrary}
            />
          ) : null}
        </div>
      </div>
    </VpnGate>
  )
}
