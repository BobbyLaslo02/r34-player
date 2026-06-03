import React from 'react'
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
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
}

interface Props {
  url: string
  filename: string
}

export default function DownloadButton({ url, filename }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(url, '_blank')
  }

  return (
    <button style={styles.btn} onClick={handleClick} title={`Download ${filename}`}>
      ⬇ Download
    </button>
  )
}
