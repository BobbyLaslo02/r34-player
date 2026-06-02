import React from 'react'
import { Favorite, Genre, ContentCategory } from '../types'
import { THEME, GENRES, DEFAULT_CATEGORIES } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding: '20px 40px 10px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: THEME.text,
    marginBottom: '14px',
  },
  row: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '20px',
    background: THEME.bgCard,
    border: `1px solid ${THEME.gold}`,
    cursor: 'pointer',
    flexShrink: 0,
    fontSize: '13px',
    color: THEME.text,
    transition: `background ${THEME.transition}`,
  },
  itemType: {
    fontSize: '9px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: THEME.gold,
    padding: '1px 5px',
    borderRadius: '8px',
    background: 'rgba(255,215,0,0.1)',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: THEME.textSecondary,
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0 2px',
    lineHeight: 1,
  },
  empty: {
    fontSize: '13px',
    color: THEME.textSecondary,
    padding: '10px 0',
  },
}

interface FavoritesSectionProps {
  favorites: Favorite[]
  onRemove: (id: string) => void
  onSelect: (value: string, name: string) => void
}

export default function FavoritesSection({ favorites, onRemove, onSelect }: FavoritesSectionProps) {
  if (favorites.length === 0) return null

  return (
    <div style={styles.section}>
      <h2 style={styles.title}>⭐ Favorites</h2>
      <div style={styles.row}>
        {favorites.map(fav => (
          <div
            key={fav.id}
            style={styles.item}
            onClick={() => onSelect(fav.value, fav.name)}
          >
            <span style={styles.itemType}>{fav.type}</span>
            <span>{fav.name}</span>
            <button
              style={styles.removeBtn}
              onClick={e => { e.stopPropagation(); onRemove(fav.id) }}
              title="Remove from favorites"
            >×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
