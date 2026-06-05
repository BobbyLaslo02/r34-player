import React, { useState, useCallback } from 'react'
import { THEME, ThemeKey } from '../styles/theme'
import VideoOnlyToggle from './VideoOnlyToggle'
import VpnStatus from './VpnStatus'
import TagChipInput from './TagChipInput'
import SimpleSearch from './SimpleSearch'
import ThemePicker from './ThemePicker'

const btnBase: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--r34-textSecondary)',
  cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px',
  padding: '6px 10px', borderRadius: '4px', display: 'flex',
  alignItems: 'center', gap: '6px', width: '100%', textAlign: 'left',
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: THEME.navbarHeight,
    background: 'linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.85) 100%)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 40px',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${THEME.border}`,
    gap: '16px',
  },
  logo: {
    fontSize: '24px', fontWeight: 800, color: THEME.accent,
    cursor: 'pointer', letterSpacing: '-0.5px',
    display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
  },
  link: {
    color: THEME.textSecondary, cursor: 'pointer', fontSize: '14px',
    fontWeight: 500, transition: `color ${THEME.transition}`,
    background: 'none', border: 'none', padding: 0, fontFamily: 'inherit',
  },
  navLinks: { display: 'flex', gap: '24px', alignItems: 'center', flexShrink: 0 },
  searchWrap: { flex: 1, minWidth: 0, display: 'flex', gap: '8px', alignItems: 'center' },
  moreBtn: {
    background: 'none', border: `1px solid ${THEME.border}`,
    color: THEME.textSecondary, cursor: 'pointer', fontFamily: 'inherit',
    fontSize: '20px', padding: '4px 10px', borderRadius: '4px', flexShrink: 0,
    lineHeight: 1,
  },
  dropdown: {
    position: 'absolute', top: '100%', right: 0, marginTop: '8px',
    background: THEME.bgCard, border: `1px solid ${THEME.border}`,
    borderRadius: '8px', padding: '8px', width: '220px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 9999,
  },
  section: {
    padding: '8px 10px', fontSize: '11px', fontWeight: 600,
    color: THEME.textSecondary, textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  separator: { height: '1px', background: THEME.border, margin: '6px 0' },
  version: { fontSize: '11px', color: THEME.textSecondary, fontFamily: 'monospace', padding: '6px 10px' },
}

interface NavbarProps {
  onSearch: (query: string) => void
  searchQuery: string
  onHome: () => void
  onLibrary: () => void
  videoOnly: boolean
  onVideoOnlyChange: (v: boolean) => void
  searchTags: string[]
  onTagsChange: (tags: string[]) => void
  recentTags?: { tag: string; lastUsed: number }[]
  onAddRecent?: (tag: string) => void
  onClearRecent?: () => void
  libraryCount?: number
  theme?: ThemeKey
  onThemeChange?: (key: ThemeKey) => void
  onSurpriseMe?: () => void
}

export default function Navbar({ onSearch, searchQuery, onHome, onLibrary, videoOnly, onVideoOnlyChange, searchTags, onTagsChange, recentTags, onAddRecent, onClearRecent, libraryCount, theme, onThemeChange, onSurpriseMe }: NavbarProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [version, setVersion] = useState('')
  const [checking, setChecking] = useState(false)

  React.useEffect(() => {
    const api = (window as any).electronAPI
    api?.getAppVersion?.().then(setVersion).catch(() => {})
  }, [])

  const handleCheckUpdates = () => {
    const api = (window as any).electronAPI
    if (api?.checkForUpdatesNow) {
      setChecking(true)
      api.checkForUpdatesNow()
      setTimeout(() => setChecking(false), 5000)
    }
  }

  const handleExport = useCallback(async () => {
    const api = (window as any).electronAPI
    if (!api?.exportData) return
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (k.startsWith('r34-') || k === 'gofile-token')) keys.push(k)
    }
    const data: Record<string, string> = {}
    keys.forEach(k => { try { data[k] = localStorage.getItem(k) || '' } catch {} })
    await api.exportData(data)
  }, [])

  const handleImport = useCallback(async () => {
    const api = (window as any).electronAPI
    if (!api?.importData) return
    const result = await api.importData()
    if (result?.canceled) return
    if (result?.error) { alert('Import failed: ' + result.error); return }
    if (result?.data) {
      Object.entries(result.data).forEach(([k, v]: [string, any]) => {
        try { localStorage.setItem(k, String(v)) } catch {}
      })
      alert('Data imported! The page will now reload to apply changes.')
      window.location.reload()
    }
  }, [])

  return (
    <nav style={styles.nav}>
      <div style={styles.logo} onClick={onHome}>
        <span>▶ R34 Player</span>
      </div>
      <div style={styles.navLinks}>
        <button style={styles.link} onClick={onHome}>Browse</button>
        <button style={styles.link} onClick={onLibrary}>
          Library{libraryCount ? ` (${libraryCount})` : ''}
        </button>
        {onSurpriseMe && (
          <button
            onClick={onSurpriseMe}
            style={{
              ...styles.link,
              color: 'var(--r34-accent)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Surprise me (R)"
          >
            🎲 Surprise
          </button>
        )}
      </div>
      <div style={styles.searchWrap}>
        <TagChipInput
          tags={searchTags}
          onTagsChange={onTagsChange}
          onSearch={onSearch}
          placeholder="Tag search..."
          recentTags={recentTags}
          onAddRecent={onAddRecent}
          onClearRecent={onClearRecent}
        />
        <SimpleSearch onSearch={onSearch} />
      </div>
      <div style={{ position: 'relative' }}>
        <button style={styles.moreBtn} onClick={() => setMoreOpen(!moreOpen)} title="More">
          ⋮
        </button>
        {moreOpen && (
          <>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} onClick={() => setMoreOpen(false)} />
            <div style={styles.dropdown}>
              <div style={styles.section}>Privacy</div>
              <VpnStatus />
              <div style={styles.separator} />
              <div style={styles.section}>Filters</div>
              <div style={{ padding: '4px 10px' }}>
                <VideoOnlyToggle videoOnly={videoOnly} onChange={onVideoOnlyChange} />
              </div>
              <div style={styles.separator} />
              <div style={styles.section}>Settings</div>
              <div style={{ position: 'relative' }}>
                <button
                  style={btnBase}
                  onClick={() => { setThemeOpen(!themeOpen) }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--r34-bgHover)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  🎨 Theme
                </button>
                {themeOpen && theme && onThemeChange && (
                  <div style={{ marginTop: '4px' }}>
                    <ThemePicker current={theme} onChange={onThemeChange} />
                  </div>
                )}
              </div>
              <div style={styles.separator} />
              <div style={styles.section}>Data</div>
              <button
                style={btnBase}
                onClick={handleExport}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--r34-bgHover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                ⬆ Export Data
              </button>
              <button
                style={btnBase}
                onClick={handleImport}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--r34-bgHover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                ⬇ Import Data
              </button>
              <div style={styles.separator} />
              <button
                style={btnBase}
                onClick={handleCheckUpdates}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--r34-bgHover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {checking ? '⋯' : '⟳'} Check for Updates
              </button>
              <div style={styles.version}>v{version || '?'}</div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
