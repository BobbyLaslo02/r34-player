import React, { useState, useCallback } from 'react'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  input: {
    background: 'rgba(0,0,0,0.7)',
    border: `1px solid ${THEME.border}`,
    borderRadius: THEME.radius,
    color: THEME.text,
    fontSize: '13px',
    padding: '7px 10px',
    outline: 'none',
    fontFamily: 'inherit',
    width: '180px',
    transition: `border-color ${THEME.transition}`,
  },
  btn: {
    background: THEME.accent,
    color: THEME.text,
    border: 'none',
    borderRadius: THEME.radius,
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
}

interface SimpleSearchProps {
  onSearch: (query: string) => void
}

export default function SimpleSearch({ onSearch }: SimpleSearchProps) {
  const [val, setVal] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSearch = useCallback(() => {
    const q = val.trim().replace(/\s+/g, '_')
    if (q) onSearch(q)
  }, [val, onSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }, [handleSearch])

  return (
    <div style={styles.wrapper}>
      <input
        style={{ ...styles.input, borderColor: focused ? THEME.accent : THEME.border }}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search by title..."
      />
      <button style={styles.btn} onClick={handleSearch}>Search</button>
    </div>
  )
}
