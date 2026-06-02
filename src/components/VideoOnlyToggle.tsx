import React from 'react'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '4px 0',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: THEME.accent,
    cursor: 'pointer',
  },
  label: {
    fontSize: '13px',
    color: THEME.textSecondary,
    whiteSpace: 'nowrap',
  },
  count: {
    fontSize: '11px',
    color: THEME.textSecondary,
    background: THEME.bgCard,
    padding: '1px 6px',
    borderRadius: '8px',
    marginLeft: '2px',
  },
}

interface VideoOnlyToggleProps {
  videoOnly: boolean
  onChange: (v: boolean) => void
  videoCount?: number
  totalCount?: number
}

export default function VideoOnlyToggle({ videoOnly, onChange, videoCount, totalCount }: VideoOnlyToggleProps) {
  return (
    <label style={styles.wrapper} title="Show videos only">
      <input
        type="checkbox"
        checked={videoOnly}
        onChange={e => onChange(e.target.checked)}
        style={styles.checkbox}
      />
      <span style={styles.label}>Videos only</span>
      {totalCount !== undefined && videoCount !== undefined && (
        <span style={styles.count}>{videoCount}/{totalCount}</span>
      )}
    </label>
  )
}
