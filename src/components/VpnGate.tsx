import React, { useState, useEffect, useCallback } from 'react'
import { THEME } from '../styles/theme'

const BYPASS_KEY = 'r34-vpn-bypass'

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '40px',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: THEME.accent,
    marginBottom: '12px',
  },
  message: {
    fontSize: '16px',
    color: THEME.textSecondary,
    textAlign: 'center',
    maxWidth: '500px',
    lineHeight: 1.6,
    marginBottom: '32px',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    borderRadius: THEME.radius,
    border: `1px solid ${THEME.border}`,
    background: THEME.bgSecondary,
    marginBottom: '16px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusText: {
    fontSize: '14px',
    color: THEME.textSecondary,
  },
  checkBtn: {
    background: THEME.accent,
    color: THEME.text,
    border: 'none',
    padding: '10px 28px',
    borderRadius: THEME.radius,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  bypassBtn: {
    background: '#880e0e',
    color: THEME.text,
    border: 'none',
    padding: '10px 28px',
    borderRadius: THEME.radius,
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '12px',
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },
  checking: {
    color: '#888',
    fontSize: '13px',
    marginTop: '8px',
  },
}

interface VpnGateProps {
  children: React.ReactNode
}

export default function VpnGate({ children }: VpnGateProps) {
  const [vpnConnected, setVpnConnected] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const [bypassed, setBypassed] = useState(() => {
    try { return localStorage.getItem(BYPASS_KEY) === 'true' } catch { return false }
  })

  const check = useCallback(async () => {
    setChecking(true)
    try {
      const api = (window as any).electronAPI
      if (api?.checkVPN) {
        const result = await api.checkVPN()
        console.log('[VpnGate] check result:', JSON.stringify(result))
        setVpnConnected(result.connected)
      } else {
        setVpnConnected(true)
      }
    } catch {
      setVpnConnected(false)
    }
    setChecking(false)
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, 3000)
    return () => clearInterval(interval)
  }, [check])

  if (bypassed || vpnConnected === true) {
    return <>{children}</>
  }

  const handleBypass = () => {
    const confirmed = window.confirm(
      '⚠️ Your ISP/WiFi provider WILL be able to see every site you visit.\n\n' +
      'Your traffic is NOT encrypted through a VPN tunnel.\n\n' +
      'Are you sure you want to proceed?'
    )
    if (confirmed) {
      try { localStorage.setItem(BYPASS_KEY, 'true') } catch {}
      setBypassed(true)
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.icon}>🛡️</div>
      <h1 style={styles.title}>VPN Required</h1>
      <p style={styles.message}>
        This application requires an active VPN connection for privacy and security.
        Please connect a VPN before proceeding.
      </p>
      <div style={styles.statusBox}>
        <span style={{ ...styles.dot, background: checking ? '#666' : '#f44336' }} />
        <span style={styles.statusText}>
          {checking ? 'Checking connection...' : 'VPN: Not connected'}
        </span>
      </div>
      <button style={styles.checkBtn} onClick={check}>
        Retry Connection Check
      </button>
      {checking && <div style={styles.checking}>Checking every 3 seconds...</div>}
      <button
        style={styles.bypassBtn}
        onClick={handleBypass}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
      >
        Proceed anyway — ur wifi will watch u goon
      </button>
    </div>
  )
}
