import { useEffect, useRef, useState, useCallback } from 'react'
import { onAuthChange, getCurrentUser, pushData, pullData, listenData, AuthState } from '../firebase'

type SyncStatus = 'idle' | 'connecting' | 'syncing' | 'error'

function mergeValues(local: string | null, remote: string | null): string | null {
  if (local === null) return remote
  if (remote === null) return local
  if (local === remote) return local
  try {
    const lArr = JSON.parse(local)
    const rArr = JSON.parse(remote)
    if (Array.isArray(lArr) && Array.isArray(rArr)) {
      const merged = lArr.concat(rArr.filter((x: any) => !lArr.includes(x)))
      return JSON.stringify(merged)
    }
  } catch {}
  return local.length >= remote.length ? local : remote
}

function push() {
  if (!getCurrentUser()) return Promise.resolve()
  const keys = Object.keys(localStorage).filter(k => k.startsWith('r34-'))
  if (keys.length === 0) return Promise.resolve()
  const data: Record<string, string> = {}
  keys.forEach(k => { data[k] = localStorage.getItem(k) || '' })
  return pushData(data)
}

export function useCloudSync() {
  const [status, setStatus] = useState<SyncStatus>('connecting')
  const [user, setUser] = useState<AuthState['user']>(null)
  const pushTimer = useRef<ReturnType<typeof setTimeout>>()
  const skipCount = useRef(0)
  const didInitialSync = useRef(false)

  useEffect(() => {
    setStatus('connecting')
    return onAuthChange((s) => {
      setUser(s.user)
      if (!s.loading) setStatus(s.user ? 'idle' : 'idle')
    })
  }, [])

  useEffect(() => {
    if (!user || didInitialSync.current) return
    didInitialSync.current = true
    if (Object.keys(localStorage).some(k => k.startsWith('r34-'))) {
      setStatus('syncing')
      push().then(() => setStatus('idle')).catch(() => setStatus('error'))
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsub = listenData((data) => {
      if (!data) return
      Object.entries(data).forEach(([k, v]) => {
        const local = localStorage.getItem(k)
        const merged = mergeValues(local, v)
        if (merged !== null) localStorage.setItem(k, merged)
      })
      window.dispatchEvent(new Event('r34-storage-changed'))
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!user) return
    const handler = () => {
      clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(() => {
        if (skipCount.current > 0) { skipCount.current--; return }
        setStatus('syncing')
        push().then(() => setStatus('idle')).catch(() => setStatus('error'))
      }, 2000)
    }
    window.addEventListener('r34-data-changed', handler)
    return () => window.removeEventListener('r34-data-changed', handler)
  }, [user])

  const doPull = useCallback(async () => {
    if (!getCurrentUser()) return
    setStatus('syncing')
    try {
      const data = await pullData()
      if (data) {
        skipCount.current += Object.keys(data).length
        Object.entries(data).forEach(([k, v]) => {
          const local = localStorage.getItem(k)
          const merged = mergeValues(local, v)
          if (merged !== null) localStorage.setItem(k, merged)
        })
        window.dispatchEvent(new Event('r34-storage-changed'))
      }
      setStatus('idle')
    } catch { setStatus('error') }
  }, [])

  const doSync = useCallback(async () => {
    if (!getCurrentUser()) return
    setStatus('syncing')
    try {
      await push()
      const data = await pullData()
      if (data) {
        skipCount.current += Object.keys(data).length
        Object.entries(data).forEach(([k, v]) => {
          const local = localStorage.getItem(k)
          const merged = mergeValues(local, v)
          if (merged !== null) localStorage.setItem(k, merged)
        })
        window.dispatchEvent(new Event('r34-storage-changed'))
      }
      setStatus('idle')
    } catch { setStatus('error') }
  }, [])

  return { status, user, doPull, doSync }
}
