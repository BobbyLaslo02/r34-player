import React from 'react'
import { Genre } from '../types'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    minWidth: '130px',
    height: '100px',
    borderRadius: THEME.radius,
    cursor: 'pointer',
    border: `2px solid ${THEME.border}`,
    transition: `all ${THEME.transition}`,
    flexShrink: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
  },
  img: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
  },
  label: {
    position: 'relative',
    zIndex: 2,
    padding: '8px 10px',
    width: '100%',
  },
  name: {
    fontSize: '13px',
    fontWeight: 700,
    color: THEME.text,
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
  },
  desc: {
    fontSize: '10px',
    color: THEME.textSecondary,
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
    marginTop: '2px',
  },
  star: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'rgba(0,0,0,0.4)',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
    zIndex: 3,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 700,
    color: THEME.textSecondary,
    background: THEME.bgCard,
  },
}

interface GenreCardProps {
  genre: Genre
  isFavorite: boolean
  thumbnailUrl?: string
  onToggleFavorite: (genre: Genre) => void
  onClick: (genre: Genre) => void
}

export default function GenreCard({ genre, isFavorite, thumbnailUrl, onToggleFavorite, onClick }: GenreCardProps) {
  const [hover, setHover] = React.useState(false)

  return (
    <div
      style={{
        ...styles.card,
        borderColor: isFavorite ? THEME.gold : hover ? THEME.accent : THEME.border,
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? '0 4px 16px rgba(0,0,0,0.4)' : 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick(genre)}
    >
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="" style={styles.img} loading="lazy" />
      ) : (
        <div style={styles.placeholder}>{genre.icon}</div>
      )}
      <div style={styles.gradient} />
      <button
        style={{
          ...styles.star,
          color: isFavorite ? THEME.gold : 'rgba(255,255,255,0.5)',
        }}
        onClick={e => { e.stopPropagation(); onToggleFavorite(genre) }}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorite ? '★' : '☆'}
      </button>
      <div style={styles.label}>
        <div style={styles.name}>{genre.name}</div>
        <div style={styles.desc}>{genre.description}</div>
      </div>
    </div>
  )
}
