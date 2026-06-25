import { useEffect, useRef, useState, useCallback } from 'react'
import { ensureSignedIn, getUid, pushData, pullData, listenData, generateCode, findByCode } from '../firebase'

type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error'

export function useCloudSync() {
  const [status, setStatus] = useState<SyncStatus>('disconnected')
  const [uid, setUid] = useState<string | null>(null)
  const [pairCode, setPairCode] = useState<string | null>(null)
  const [partnerUid, setPartnerUid] = useState<string | null>(null)
  const pushTimer = useRef<ReturnType<typeof setTimeout>>()
  const ignoreNext = useRef(false)

  useEffect(() => {
    setStatus('connecting')
    ensureSignedIn().then((user) => {
      setUid(user.uid)
      setStatus('connected')
    }).catch(() => {
      setUid(null)
      setStatus('error')
    })
  }, [])

  const push = useCallback(async () => {
    if (ignoreNext.current) { ignoreNext.current = false; return }
    setStatus('syncing')
    const keys = Object.keys(localStorage).filter(k => k.startsWith('r34-'))
    const data: Record<string, string> = {}
    keys.forEach(k => { data[k] = localStorage.getItem(k) || '' })
    try {
      await pushData(data)
      setStatus('connected')
    } catch { setStatus('error') }
  }, [])

  const debouncedPush = useCallback(() => {
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(push, 2000)
  }, [push])

  useEffect(() => {
    if (!uid) return
    const unsub = listenData((data) => {
      if (!data) return
      ignoreNext.current = true
      Object.entries(data).forEach(([k, v]) => {
        if (k !== localStorage.getItem(k)) localStorage.setItem(k, v)
      })
      window.dispatchEvent(new Event('storage'))
    })
    return unsub
  }, [uid])

  useEffect(() => {
    const handler = () => debouncedPush()
    window.addEventListener('r34-data-changed', handler)
    return () => window.removeEventListener('r34-data-changed', handler)
  }, [debouncedPush])

  const doPull = useCallback(async () => {
    setStatus('syncing')
    try {
      const data = await pullData()
      if (data) {
        Object.entries(data).forEach(([k, v]) => {
          if (k.startsWith('r34-')) localStorage.setItem(k, v)
        })
        window.dispatchEvent(new Event('storage'))
      }
      setStatus('connected')
    } catch { setStatus('error') }
  }, [])

  const doGenerateCode = useCallback(async () => {
    try {
      const code = await generateCode()
      setPairCode(code)
      return code
    } catch { return null }
  }, [])

  const doEnterCode = useCallback(async (code: string) => {
    try {
      const partner = await findByCode(code)
      if (partner && partner !== uid) {
        setPartnerUid(partner)
        return true
      }
      return false
    } catch { return false }
  }, [uid])

  const doSync = useCallback(async () => {
    await push()
    await doPull()
  }, [push, doPull])

  return { status, uid, pairCode, doPull, doSync, doGenerateCode, doEnterCode, partnerUid }
}
