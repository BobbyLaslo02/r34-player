import { useState, useEffect } from 'react'

const cache = new Map<string, string>()

async function getFileSize(url: string): Promise<string> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const bytes = Number(res.headers.get('content-length') || 0)
    if (bytes <= 0) return ''
    const mb = bytes / (1024 * 1024)
    return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`
  } catch {
    return ''
  }
}

export function useFileSize(fileUrl: string) {
  const [size, setSize] = useState(() => cache.get(fileUrl) || '')

  useEffect(() => {
    if (cache.has(fileUrl)) {
      setSize(cache.get(fileUrl)!)
      return
    }
    let cancelled = false
    getFileSize(fileUrl).then(s => {
      if (!cancelled) {
        cache.set(fileUrl, s)
        setSize(s)
      }
    })
    return () => { cancelled = true }
  }, [fileUrl])

  return size
}
