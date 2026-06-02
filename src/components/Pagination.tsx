import React from 'react'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    padding: '20px 0',
  },
  btn: {
    background: THEME.bgCard,
    color: THEME.text,
    border: `1px solid ${THEME.border}`,
    borderRadius: THEME.radius,
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: `all ${THEME.transition}`,
    minWidth: '36px',
    textAlign: 'center' as const,
  },
  activeBtn: {
    background: THEME.accent,
    borderColor: THEME.accent,
    color: THEME.text,
  },
  info: {
    fontSize: '12px',
    color: THEME.textSecondary,
    padding: '0 12px',
  },
  disabled: {
    opacity: 0.4,
    cursor: 'default',
  },
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, totalCount, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | '...')[] = []
    const start = Math.max(0, currentPage - 2)
    const end = Math.min(totalPages - 1, currentPage + 2)

    if (start > 0) {
      pages.push(0)
      if (start > 1) pages.push('...')
    }
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) {
      if (end < totalPages - 2) pages.push('...')
      pages.push(totalPages - 1)
    }
    return pages
  }

  return (
    <div style={styles.wrapper}>
      <button
        style={{ ...styles.btn, ...(currentPage === 0 ? styles.disabled : {}) }}
        onClick={() => currentPage > 0 && onPageChange(0)}
        disabled={currentPage === 0}
      >«</button>
      <button
        style={{ ...styles.btn, ...(currentPage === 0 ? styles.disabled : {}) }}
        onClick={() => currentPage > 0 && onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >‹</button>

      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ color: THEME.textSecondary, padding: '0 4px' }}>...</span>
        ) : (
          <button
            key={p}
            style={{ ...styles.btn, ...(p === currentPage ? styles.activeBtn : {}) }}
            onClick={() => onPageChange(p as number)}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        style={{ ...styles.btn, ...(currentPage >= totalPages - 1 ? styles.disabled : {}) }}
        onClick={() => currentPage < totalPages - 1 && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >›</button>
      <button
        style={{ ...styles.btn, ...(currentPage >= totalPages - 1 ? styles.disabled : {}) }}
        onClick={() => currentPage < totalPages - 1 && onPageChange(totalPages - 1)}
        disabled={currentPage >= totalPages - 1}
      >»</button>

      <span style={styles.info}>{totalCount.toLocaleString()} total</span>
    </div>
  )
}
