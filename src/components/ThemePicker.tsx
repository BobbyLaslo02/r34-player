import React, { useState } from 'react'
import { ThemeKey, THEMES, applyTheme } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  gearBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--r34-textSecondary)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    fontFamily: 'inherit',
  },
  popup: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: 'var(--r34-bgCard)',
    border: '1px solid var(--r34-border)',
    borderRadius: '8px',
    padding: '12px',
    width: '200px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    zIndex: 9999,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: 'var(--r34-text)',
    width: '100%',
    fontSize: '13px',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
  },
  swatch: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid var(--r34-border)',
    flexShrink: 0,
  },
}

const THEME_NAMES: Record<ThemeKey, string> = {
  dark: 'Netflix Dark',
  blue: 'Midnight Blue',
  forest: 'Forest',
  purple: 'Royal Purple',
  light: 'Light Mode',
}

interface ThemePickerProps {
  current: ThemeKey
  onChange: (key: ThemeKey) => void
}

export default function ThemePicker({ current, onChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        style={styles.gearBtn}
        onClick={() => setOpen(!open)}
        title="Theme"
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--r34-text)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--r34-textSecondary)' }}
      >
        ⚙
      </button>
      {open && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div style={styles.popup}>
            {(Object.keys(THEMES) as ThemeKey[]).map(key => {
              const t = THEMES[key]
              return (
                <button
                  key={key}
                  style={{
                    ...styles.option,
                    background: key === current ? 'var(--r34-bgHover)' : 'transparent',
                  }}
                  onClick={() => { onChange(key); setOpen(false) }}
                >
                  <span style={{ ...styles.swatch, background: t.accent }} />
                  {THEME_NAMES[key]}
                  {key === 'dark' && ' (default)'}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
