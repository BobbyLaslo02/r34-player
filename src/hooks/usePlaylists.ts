import { useState, useCallback, useEffect } from 'react'
import { Playlist } from '../types'

const STORAGE_KEY = 'r34-playlists'

function loadPlaylists(): Playlist[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>(loadPlaylists)

  useEffect(() => {
    const handler = () => setPlaylists(loadPlaylists())
    window.addEventListener('r34-storage-changed', handler)
    return () => window.removeEventListener('r34-storage-changed', handler)
  }, [])

  const save = useCallback((updated: Playlist[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setPlaylists(updated)
  }, [])

  const createPlaylist = useCallback((name: string): Playlist => {
    const pl: Playlist = { id: Date.now().toString(), name, postIds: [], createdAt: Date.now() }
    save([...playlists, pl])
    return pl
  }, [playlists, save])

  const deletePlaylist = useCallback((id: string) => {
    save(playlists.filter(p => p.id !== id))
  }, [playlists, save])

  const renamePlaylist = useCallback((id: string, name: string) => {
    save(playlists.map(p => p.id === id ? { ...p, name } : p))
  }, [playlists, save])

  const addToPlaylist = useCallback((playlistId: string, postId: number) => {
    save(playlists.map(p =>
      p.id === playlistId && !p.postIds.includes(postId)
        ? { ...p, postIds: [...p.postIds, postId] }
        : p
    ))
  }, [playlists, save])

  const removeFromPlaylist = useCallback((playlistId: string, postId: number) => {
    save(playlists.map(p =>
      p.id === playlistId
        ? { ...p, postIds: p.postIds.filter(id => id !== postId) }
        : p
    ))
  }, [playlists, save])

  const isInPlaylist = useCallback((playlistId: string, postId: number): boolean => {
    const pl = playlists.find(p => p.id === playlistId)
    return pl ? pl.postIds.includes(postId) : false
  }, [playlists])

  return { playlists, createPlaylist, deletePlaylist, renamePlaylist, addToPlaylist, removeFromPlaylist, isInPlaylist }
}
