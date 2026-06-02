import React, { useState, useEffect, useCallback } from 'react'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 99998,
    background: THEME.bgCard,
    border: `1px solid ${THEME.border}`,
    borderRadius: THEME.radius,
    padding: '20px',
    width: '340px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: THEME.text,
    marginBottom: '8px',
  },
  text: {
    fontSize: '13px',
    color: THEME.textSecondary,
    marginBottom: '16px',
    lineHeight: 1.5,
  },
  progressWrap: {
    height: '6px',
    background: THEME.bgSecondary,
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  progressBar: {
    height: '100%',
    background: THEME.accent,
    borderRadius: '3px',
    transition: 'width 0.3s',
  },
  buttons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  btnPrimary: {
    background: THEME.accent,
    color: THEME.text,
    border: 'none',
    padding: '8px 16px',
    borderRadius: THEME.radius,
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnSecondary: {
    background: 'transparent',
    color: THEME.textSecondary,
    border: `1px solid ${THEME.border}`,
    padding: '8px 16px',
    borderRadius: THEME.radius,
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  notes: {
    fontSize: '12px',
    color: THEME.textSecondary,
    marginBottom: '12px',
    maxHeight: '120px',
    overflowY: 'auto' as const,
    background: THEME.bgSecondary,
    padding: '8px',
    borderRadius: '4px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
  },
}

const SKIP_KEY = 'r34-skip-version'

export default function UpdateNotification() {
  const [state, setState] = useState<'idle' | 'available' | 'downloading' | 'downloaded'>('idle')
  const [version, setVersion] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const api = (window as any).electronAPI
    if (!api?.onUpdateAvailable) return

    api.onUpdateAvailable((v: string) => {
      try {
        const skipped = localStorage.getItem(SKIP_KEY)
        if (skipped === v) return
      } catch {}
      setVersion(v)
      setState('available')
    })

    api.onUpdateProgress((pct: number) => {
      setProgress(Math.round(pct))
    })

    api.onUpdateDownloaded(() => {
      setState('downloaded')
    })
  }, [])

  const handleInstall = useCallback(async () => {
    const api = (window as any).electronAPI
    if (!api) return
    setState('downloading')
    setProgress(0)
    try {
      await api.startUpdateDownload()
    } catch {
      setState('available')
    }
  }, [])

  const handleSkip = useCallback(() => {
    try { localStorage.setItem(SKIP_KEY, version) } catch {}
    setState('idle')
  }, [version])

  const handleRestart = useCallback(() => {
    const api = (window as any).electronAPI
    api?.restartAndUpdate()
  }, [])

  const patchNotes = state === 'downloaded'
    ? 'Update downloaded and ready to install.\n\nClose the app to apply the update automatically, or click Restart Now to apply immediately.'
    : ''

  if (state === 'idle') return null

  return (
    <div style={styles.overlay}>
      {state === 'available' && (
        <>
          <div style={styles.title}>Update Available</div>
          <div style={styles.text}>Version {version} is ready to install.</div>
          <div style={styles.notes}>See GitHub releases for full patch notes.</div>
          <div style={styles.buttons}>
            <button style={styles.btnSecondary} onClick={handleSkip}>Skip this version</button>
            <button style={styles.btnPrimary} onClick={handleInstall}>Install</button>
          </div>
        </>
      )}

      {state === 'downloading' && (
        <>
          <div style={styles.title}>Downloading Update</div>
          <div style={styles.progressWrap}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
          </div>
          <div style={styles.text}>{progress}% — v{version}</div>
        </>
      )}

      {state === 'downloaded' && (
        <>
          <div style={styles.title}>Update Ready</div>
          <div style={{ ...styles.notes, color: THEME.text }}>{patchNotes}</div>
          <div style={styles.buttons}>
            <button style={styles.btnSecondary} onClick={handleSkip}>Later</button>
            <button style={styles.btnPrimary} onClick={handleRestart}>Restart Now</button>
          </div>
        </>
      )}
    </div>
  )
}
