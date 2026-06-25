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
import { fetchRandomPost } from './api/r34Client'
import { usePlaylists } from './hooks/usePlaylists'
import { useCloudSync } from './hooks/useCloudSync'

const _origSetItem = localStorage.setItem.bind(localStorage)
localStorage.setItem = (key, value) => {
  _origSetItem(key, value)
  if (key.startsWith('r34-')) window.dispatchEvent(new Event('r34-data-changed'))
}

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
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist, addToPlaylist, removeFromPlaylist, isInPlaylist } = usePlaylists()
  const [theme, setTheme] = useState<ThemeKey>(getStoredTheme)

  const [playlist, setPlaylist] = useState<R34Post[]>([])
  const [playlistIndex, setPlaylistIndex] = useState(0)
  const reshuffleRef = useRef<(() => R34Post[]) | null>(null)
  const sync = useCloudSync()

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

  const handleSurpriseMe = useCallback(() => {
    fetchRandomPost().then(post => {
      if (post) {
        setPlaylist([])
        reshuffleRef.current = null
        setSelectedPost(post)
        setView('player')
      }
    })
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const t = (e.target as HTMLElement).tagName
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return
      switch (e.key) {
        case 'ArrowLeft':
          if (view === 'player' && playlist.length > 1) { e.preventDefault(); prevInPlaylist() }
          break
        case 'ArrowRight':
          if (view === 'player' && playlist.length > 1) { e.preventDefault(); nextInPlaylist() }
          break
        case ' ':
          if (view === 'player') {
            e.preventDefault()
            const v = document.querySelector('video')
            if (v) { v.paused ? v.play() : v.pause() }
          }
          break
        case 'f': case 'F':
          if (view === 'player') {
            document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
          }
          break
        case 'r': case 'R':
          handleSurpriseMe()
          break
        case 'Escape':
          if (view === 'player' && !document.fullscreenElement) handleBack()
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [view, playlist.length, prevInPlaylist, nextInPlaylist, handleSurpriseMe, handleBack])

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
          onSurpriseMe={handleSurpriseMe}
          syncStatus={sync.status}
          syncUid={sync.uid}
          syncPairCode={sync.pairCode}
          onSyncPull={sync.doPull}
          onSyncGenerateCode={sync.doGenerateCode}
          onSyncEnterCode={sync.doEnterCode}
          onSync={sync.doSync}
        />
        <div style={{ paddingTop: '68px' }}>
          <div style={{ display: view === 'browse' ? '' : 'none' }}>
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
          </div>
          <div style={{ display: view === 'library' ? '' : 'none' }}>
            <LibraryPage
              entries={entries}
              onPlay={handlePlay}
              onRemove={removeFromLibrary}
              onShuffle={shuffle}
              onStartPlaylist={startPlaylist}
              playlists={playlists}
              onCreatePlaylist={createPlaylist}
              onDeletePlaylist={deletePlaylist}
              onRenamePlaylist={renamePlaylist}
              onAddToPlaylist={addToPlaylist}
              onRemoveFromPlaylist={removeFromPlaylist}
              isInPlaylist={isInPlaylist}
            />
          </div>
          <div style={{ display: view === 'player' && selectedPost ? '' : 'none' }}>
            {selectedPost && (
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
            )}
          </div>
        </div>
      </div>
    </VpnGate>
  )
}
