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

export function useCloudSync() {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [user, setUser] = useState<AuthState['user']>(null)
  const pushTimer = useRef<ReturnType<typeof setTimeout>>()
  const ignoreNext = useRef(false)

  useEffect(() => {
    setStatus('connecting')
    return onAuthChange((s) => {
      setUser(s.user)
      setStatus(s.loading ? 'connecting' : s.user ? 'idle' : 'idle')
    })
  }, [])

  const push = useCallback(async () => {
    if (!getCurrentUser()) return
    if (ignoreNext.current) { ignoreNext.current = false; return }
    setStatus('syncing')
    const keys = Object.keys(localStorage).filter(k => k.startsWith('r34-'))
    const data: Record<string, string> = {}
    keys.forEach(k => { data[k] = localStorage.getItem(k) || '' })
    try {
      await pushData(data)
      setStatus('idle')
    } catch { setStatus('error') }
  }, [])

  const debouncedPush = useCallback(() => {
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(push, 2000)
  }, [push])

  function applyMerged(remote: Record<string, string>) {
    ignoreNext.current = true
    Object.entries(remote).forEach(([k, v]) => {
      const local = localStorage.getItem(k)
      const merged = mergeValues(local, v)
      if (merged !== null) localStorage.setItem(k, merged)
    })
    window.dispatchEvent(new Event('storage'))
  }

  useEffect(() => {
    if (!user) return
    const unsub = listenData((data) => {
      if (!data) return
      applyMerged(data)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!user) return
    const handler = () => debouncedPush()
    window.addEventListener('r34-data-changed', handler)
    return () => window.removeEventListener('r34-data-changed', handler)
  }, [user, debouncedPush])

  const doPull = useCallback(async () => {
    if (!getCurrentUser()) return
    setStatus('syncing')
    try {
      const data = await pullData()
      if (data) applyMerged(data)
      setStatus('idle')
    } catch { setStatus('error') }
  }, [])

  const doSync = useCallback(async () => {
    await push()
    await doPull()
  }, [push, doPull])

  return { status, user, doPull, doSync }
}
