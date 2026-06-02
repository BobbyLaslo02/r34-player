import React from 'react'
import { THEME } from '../styles/theme'
import VideoOnlyToggle from './VideoOnlyToggle'
import VpnStatus from './VpnStatus'
import TagChipInput from './TagChipInput'
import SimpleSearch from './SimpleSearch'

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: THEME.navbarHeight,
    background: 'linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.85) 100%)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 40px',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${THEME.border}`,
  },
  logo: {
    fontSize: '24px',
    fontWeight: 800,
    color: THEME.accent,
    cursor: 'pointer',
    letterSpacing: '-0.5px',
    marginRight: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  navLinks: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    flex: 1,
  },
  link: {
    color: THEME.textSecondary,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: `color ${THEME.transition}`,
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: '0 1 auto',
  },
  separator: {
    width: '1px',
    height: '24px',
    background: THEME.border,
    flexShrink: 0,
  },
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
}

export default function Navbar({ onSearch, searchQuery, onHome, onLibrary, videoOnly, onVideoOnlyChange, searchTags, onTagsChange, recentTags, onAddRecent, onClearRecent, libraryCount }: NavbarProps) {
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
      </div>
      <div style={styles.rightSection}>
        <VpnStatus />
        <div style={styles.separator} />
        <VideoOnlyToggle videoOnly={videoOnly} onChange={onVideoOnlyChange} />
        <div style={styles.separator} />
        <TagChipInput
          tags={searchTags}
          onTagsChange={onTagsChange}
          onSearch={onSearch}
          placeholder="Tag search..."
          recentTags={recentTags}
          onAddRecent={onAddRecent}
          onClearRecent={onClearRecent}
        />
        <div style={styles.separator} />
        <SimpleSearch onSearch={onSearch} />
      </div>
    </nav>
  )
}
