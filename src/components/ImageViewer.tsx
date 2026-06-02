import React from 'react'
import { R34Post } from '../types'
import { THEME } from '../styles/theme'

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    cursor: 'pointer',
  },
  tagBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '10px 16px',
    background: 'linear-gradient(rgba(0,0,0,0.8), transparent)',
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const,
    transition: 'opacity 0.3s ease',
  },
  tag: {
    fontSize: '11px',
    color: THEME.textSecondary,
    background: 'rgba(255,255,255,0.1)',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  info: {
    position: 'absolute',
    bottom: '14px',
    left: '16px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    fontSize: '12px',
    transition: 'opacity 0.3s ease',
  },
  rating: {
    color: '#ffd700',
    fontWeight: 600,
    border: '1px solid #ffd700',
    padding: '1px 5px',
    borderRadius: '2px',
    fontSize: '10px',
  },
  fsBtn: {
    position: 'absolute',
    bottom: '14px',
    right: '16px',
    background: 'rgba(0,0,0,0.5)',
    border: 'none',
    color: THEME.textSecondary,
    fontSize: '14px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: THEME.radius,
    transition: 'opacity 0.3s ease',
    zIndex: 2,
  },
}

interface ImageViewerProps {
  post: R34Post
  height: number
  onEnded?: () => void
}

export default function ImageViewer({ post, height, onEnded }: ImageViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [showInfo, setShowInfo] = React.useState(true)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>()

  React.useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  React.useEffect(() => {
    if (!onEnded) return
    const t = setTimeout(onEnded, 5000)
    return () => clearTimeout(t)
  }, [post.id, onEnded])

  const handleMouseMove = React.useCallback(() => {
    setShowInfo(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShowInfo(false), 3000)
  }, [])

  const toggleFullscreen = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, height: `${height}px` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowInfo(false)}
    >
      <img src={post.file_url} alt="" style={styles.img} draggable={false} />
      <div style={{ ...styles.tagBanner, opacity: showInfo ? 1 : 0 }}>
        {post.tags.slice(0, 15).map(tag => (
          <span key={tag} style={styles.tag}>{tag}</span>
        ))}
      </div>
      <div style={{ ...styles.info, opacity: showInfo ? 1 : 0 }}>
        <span style={styles.rating}>{post.rating}</span>
        <span style={{ color: THEME.textSecondary }}>Score: {post.score}</span>
        <span style={{ color: THEME.textSecondary }}>{post.width}×{post.height}</span>
      </div>
      <button style={{ ...styles.fsBtn, opacity: showInfo ? 1 : 0 }} onClick={toggleFullscreen} title="Fullscreen (F11)">
        {isFullscreen ? '⛶' : '⛶'}
      </button>
    </div>
  )
}
