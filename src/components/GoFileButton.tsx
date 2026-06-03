import React, { useState, useCallback, useEffect, useRef } from 'react'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  btn: {
    background: THEME.bgSecondary,
    color: THEME.textSecondary,
    border: `1px solid ${THEME.border}`,
    borderRadius: THEME.radius,
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  overlay: {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    zIndex: 99999,
    background: THEME.bgCard,
    border: `1px solid ${THEME.border}`,
    borderRadius: '8px',
    padding: '16px',
    width: '300px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  title: { fontSize: '14px', fontWeight: 700, color: THEME.text, marginBottom: '8px' },
  bar: { height: '6px', background: THEME.bgSecondary, borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' },
  fill: { height: '100%', background: THEME.accent, borderRadius: '3px', transition: 'width 0.3s' },
  text: { fontSize: '12px', color: THEME.textSecondary, marginBottom: '8px' },
  link: { fontSize: '12px', color: THEME.accent, wordBreak: 'break-all' },
}

interface Props {
  url: string
  filename: string
}

export default function GoFileButton({ url, filename }: Props) {
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [percent, setPercent] = useState(0)
  const [link, setLink] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    const api = (window as any).electronAPI
    if (!api?.onGoFileProgress) return
    const cleanup = api.onGoFileProgress((data: { phase: string; percent: number }) => {
      if (!mountedRef.current) return
      if (data.phase === 'download') {
        setMsg(`Downloading from CDN... (${data.percent}%)`)
        setPercent(data.percent)
      } else if (data.phase === 'upload') {
        setMsg('Uploading to GoFile...')
        setPercent(0)
      }
    })
    return () => { mountedRef.current = false }
  }, [])

  const handleUpload = useCallback(async () => {
    const api = (window as any).electronAPI
    if (!api?.uploadToGoFile) return

    const token = localStorage.getItem('gofile-token') || ''
    if (!token) {
      setState('error')
      setMsg('No GoFile token set. Go to Settings (⚙) to add one.')
      return
    }

    setState('uploading')
    setPercent(0)
    setMsg('Downloading from CDN...')
    setLink('')

    const result = await api.uploadToGoFile({ url, filename, token })

    if (!mountedRef.current) return
    if (result.error) {
      setState('error')
      setMsg(result.error)
    } else {
      setState('done')
      setMsg('Uploaded to GoFile!')
      setLink(result.link)
    }
  }, [url, filename])

  if (state === 'idle') {
    return <button style={styles.btn} onClick={handleUpload} title="Upload to GoFile">☁ GoFile</button>
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.title}>
        {state === 'uploading' && 'Uploading...'}
        {state === 'done' && 'Upload Complete'}
        {state === 'error' && 'Upload Failed'}
      </div>
      {state === 'uploading' && (
        <>
          <div style={styles.bar}><div style={{ ...styles.fill, width: `${percent}%` }} /></div>
          <div style={styles.text}>{msg}</div>
        </>
      )}
      {state === 'done' && (
        <>
          <div style={styles.text}>{msg}</div>
          <div style={styles.link}>
            <a href={link} target="_blank" rel="noreferrer" style={{ color: THEME.accent }}>{link}</a>
          </div>
          <div style={{ marginTop: '8px' }}>
            <button style={styles.btn} onClick={() => setState('idle')}>Dismiss</button>
          </div>
        </>
      )}
      {state === 'error' && (
        <>
          <div style={{ ...styles.text, color: '#ff6b6b' }}>{msg}</div>
          <button style={styles.btn} onClick={() => setState('idle')}>Dismiss</button>
        </>
      )}
    </div>
  )
}
