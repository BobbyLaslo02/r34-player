import React, { useState } from 'react'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  popup: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: THEME.bgCard,
    border: `1px solid ${THEME.border}`,
    borderRadius: '8px',
    padding: '16px',
    width: '320px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    zIndex: 9999,
  },
  label: { fontSize: '12px', color: THEME.textSecondary, marginBottom: '4px', display: 'block' },
  input: {
    width: '100%',
    padding: '8px',
    background: THEME.bgSecondary,
    border: `1px solid ${THEME.border}`,
    borderRadius: '4px',
    color: THEME.text,
    fontSize: '13px',
    fontFamily: 'monospace',
    boxSizing: 'border-box' as const,
    marginBottom: '12px',
  },
  btn: {
    background: THEME.accent,
    color: THEME.text,
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600,
  },
  saved: { fontSize: '12px', color: '#4caf50', marginTop: '8px' },
}

export default function GoFileSettings() {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('gofile-token') || '' } catch { return '' }
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    try {
      localStorage.setItem('gofile-token', token)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  return (
    <div style={styles.popup}>
      <label style={styles.label}>GoFile API Token</label>
      <input
        style={styles.input}
        type="password"
        placeholder="Paste your token here"
        value={token}
        onChange={e => setToken(e.target.value)}
      />
      <label style={styles.label}>
        Get it from <a href="https://gofile.io" target="_blank" rel="noreferrer" style={{ color: THEME.accent }}>gofile.io</a> → Profile → API Token
      </label>
      <button style={styles.btn} onClick={handleSave}>Save Token</button>
      {saved && <div style={styles.saved}>✓ Token saved</div>}
    </div>
  )
}
