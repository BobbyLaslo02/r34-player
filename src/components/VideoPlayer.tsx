import React, { useState, useCallback, useRef, useEffect } from 'react'
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
    cursor: 'pointer',
  },
  media: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '40px 20px 14px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
    transition: 'opacity 0.3s ease',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  controlBtn: {
    background: 'none',
    border: 'none',
    color: THEME.text,
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: THEME.radius,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  fsBtn: {
    background: 'none',
    border: 'none',
    color: THEME.textSecondary,
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 6px',
    flexShrink: 0,
  },
  progressBar: {
    flex: 1,
    height: '4px',
    WebkitAppearance: 'none',
    appearance: 'none',
    borderRadius: '2px',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '40px',
  },
  time: {
    fontSize: '11px',
    color: THEME.textSecondary,
    minWidth: '72px',
    textAlign: 'right' as const,
    whiteSpace: 'nowrap',
    flexShrink: 0,
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
  },
  tag: {
    fontSize: '11px',
    color: THEME.textSecondary,
    background: 'rgba(255,255,255,0.1)',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  infoStrip: {
    position: 'absolute',
    bottom: '50px',
    left: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    fontSize: '11px',
  },
  rating: {
    color: '#ffd700',
    fontWeight: 600,
    border: '1px solid #ffd700',
    padding: '1px 5px',
    borderRadius: '2px',
    fontSize: '10px',
  },
  volBtn: {
    background: 'none',
    border: 'none',
    color: THEME.textSecondary,
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 4px',
    flexShrink: 0,
  },
  volSlider: {
    width: '60px',
    height: '4px',
    WebkitAppearance: 'none',
    appearance: 'none',
    borderRadius: '2px',
    outline: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
}

interface VideoPlayerProps {
  post: R34Post
  height: number
  onEnded?: () => void
}

function getMasterVolume(): number {
  try { return parseFloat(localStorage.getItem('r34-master-volume') || '') || 1 } catch { return 1 }
}
function setMasterVolume(v: number) {
  try { localStorage.setItem('r34-master-volume', String(v)) } catch {}
}
function getVideoVolume(postId: number): number | null {
  try { const v = localStorage.getItem('r34-vol-' + postId); return v !== null ? parseFloat(v) : null } catch { return null }
}
function setVideoVolume(postId: number, v: number) {
  try { localStorage.setItem('r34-vol-' + postId, String(v)) } catch {}
}

export default function VideoPlayer({ post, height, onEnded }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const gainRef = useRef<GainNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const [paused, setPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(() => getVideoVolume(post.id) ?? getMasterVolume())
  const [muted, setMuted] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()

  const setupAudio = useCallback(() => {
    const vid = videoRef.current
    if (!vid || ctxRef.current) return
    try {
      const ctx = new AudioContext()
      const gain = ctx.createGain()
      const source = ctx.createMediaElementSource(vid)
      source.connect(gain)
      gain.connect(ctx.destination)
      ctxRef.current = ctx
      gainRef.current = gain
    } catch {}
  }, [])

  const applyVolume = useCallback((v: number, m: boolean) => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.value = m ? 0 : v
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    }
  }, [])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    const onTime = () => setCurrentTime(vid.currentTime)
    const onDur = () => setDuration(vid.duration)
    vid.addEventListener('timeupdate', onTime)
    vid.addEventListener('loadedmetadata', onDur)
    return () => {
      vid.removeEventListener('timeupdate', onTime)
      vid.removeEventListener('loadedmetadata', onDur)
    }
  }, [post])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    if (volume > 1) setupAudio()
  }, [volume, setupAudio])

  useEffect(() => {
    applyVolume(volume, muted)
  }, [volume, muted, applyVolume])

  useEffect(() => {
    return () => {
      if (ctxRef.current) ctxRef.current.close()
      ctxRef.current = null
      gainRef.current = null
    }
  }, [post])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPaused(false)
    } else {
      videoRef.current.pause()
      setPaused(true)
    }
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const val = Number(e.target.value)
      videoRef.current.currentTime = val
      setCurrentTime(val)
    }
  }, [])

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    setMuted(val === 0)
    setVideoVolume(post.id, val)
    if (videoRef.current) {
      videoRef.current.volume = Math.min(val, 1)
      videoRef.current.muted = val === 0
    }
    if (val > 1) setupAudio()
    applyVolume(val, val === 0)
  }, [post.id, setupAudio, applyVolume])

  const toggleMuted = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted
      videoRef.current.muted = newMuted
      setMuted(newMuted)
    }
  }, [])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  const toggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }, [])

  const formatTime = (t: number) => {
    if (!t || !isFinite(t)) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const volPercent = muted ? 0 : Math.round(volume * 100)

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, height: `${height}px` }}
      onDoubleClick={togglePlay}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={post.file_url}
        style={styles.media}
        autoPlay
        loop={!onEnded}
        playsInline
        onClick={togglePlay}
        onEnded={onEnded}
        onPlay={e => { const v = e.currentTarget; v.volume = Math.min(volume, 1); v.muted = muted; if (volume > 1) { setupAudio(); applyVolume(volume, muted) } }}
      >
        Your browser does not support the video tag.
      </video>

      <div style={{ ...styles.tagBanner, opacity: showControls ? 1 : 0, transition: 'opacity 0.3s' }}>
        {post.tags.slice(0, 15).map(tag => (
          <span key={tag} style={styles.tag}>{tag}</span>
        ))}
      </div>

      <div style={{ ...styles.infoStrip, opacity: showControls ? 1 : 0, transition: 'opacity 0.3s' }}>
        <span style={styles.rating}>{post.rating}</span>
        <span style={{ color: THEME.textSecondary }}>Score: {post.score}</span>
        <span style={{ color: THEME.textSecondary }}>{post.width}×{post.height}</span>
      </div>

      <div style={{ ...styles.overlay, opacity: showControls ? 1 : 0 }}>
        <div style={styles.controls}>
          <button style={styles.controlBtn} onClick={togglePlay}>
            {paused ? '▶' : '⏸'}
          </button>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            onClick={e => e.stopPropagation()}
            style={{
              ...styles.progressBar,
              background: `linear-gradient(90deg, ${THEME.accent} ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%)`,
            }}
          />
          <span style={styles.time}>{formatTime(currentTime)}</span>
          <button style={styles.volBtn} onClick={toggleMuted} title={muted ? 'Unmute' : 'Mute'}>
            {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : volume <= 1 ? '🔊' : '🔊+'}
          </button>
          <            input
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={handleVolume}
            onClick={e => e.stopPropagation()}
            style={{
              ...styles.volSlider,
              background: `linear-gradient(90deg, ${THEME.textSecondary} ${(muted ? 0 : volume) / 2 * 100}%, rgba(255,255,255,0.15) ${(muted ? 0 : volume) / 2 * 100}%)`,
            }}
          />
          <button style={styles.fsBtn} onClick={toggleFullscreen} title="Fullscreen (F11)">
            ⛶
          </button>
        </div>
      </div>
    </div>
  )
}
